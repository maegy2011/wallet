import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, ConflictError, NotFoundError } from '@/lib/errors';
import { PackageType, PackageStatus, RenewalPolicy } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/admin/packages
 * Get all packages
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as PackageType | null;
    const status = searchParams.get('status') as PackageStatus | null;

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const packages = await db.package.findMany({
      where,
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: { in: ['TRIAL', 'ACTIVE'] }
              }
            },
            invoices: {
              where: {
                status: 'PAID'
              }
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate metrics for each package
    const packagesWithMetrics = packages.map(pkg => ({
      ...pkg,
      metrics: {
        activeSubscriptions: pkg._count.subscriptions,
        paidInvoices: pkg._count.invoices,
        totalRevenue: pkg._count.invoices * pkg.price, // Approximate
        trialConversionRate: pkg.type === 'FREE' ? 0 : null, // Would need more complex calculation
      },
    }));

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'PACKAGE',
      undefined,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: packagesWithMetrics,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get packages'), {
      adminId: admin.id,
      endpoint: '/api/admin/packages',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve packages',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/admin/packages
 * Create a new package (Super Admin only)
 */
export const POST = withAdminAuth(
  async (request: NextRequest, admin) => {
    try {
      const body = await request.json();
      const {
        name,
        description,
        type,
        price,
        duration,
        currency = 'EGP',
        taxIncluded = false,
        taxType,
        taxRate = 0.14,
        renewalPolicy = 'MONTHLY',
        freeTrialDuration,
        status = 'ACTIVE',
        maxWallets = 2,
        features,
      } = body;

      // Validation
      if (!name || !type || duration === undefined) {
        throw new ValidationError('Name, type, and duration are required');
      }

      if (type === 'PAID' && (!price || price <= 0)) {
        throw new ValidationError('Price is required for paid packages');
      }

      if (taxIncluded && !taxType) {
        throw new ValidationError('Tax type is required when tax is included');
      }

      // Generate package UUID
      const packageUuid = `PKG-${uuidv4().toUpperCase().substring(0, 8)}`;

      // Create package
      const newPackage = await db.package.create({
        data: {
          uuid: packageUuid,
          name: name.trim(),
          description: description?.trim(),
          type,
          price: price || 0,
          duration,
          currency,
          taxIncluded,
          taxType,
          taxRate,
          renewalPolicy,
          freeTrialDuration,
          status,
          maxWallets,
          features: features ? JSON.stringify(features) : null,
        },
      });

      // Log creation
      await AdminMiddleware.logAction(
        admin.id,
        'CREATE',
        'PACKAGE',
        newPackage.id,
        undefined,
        { package: newPackage },
        AdminMiddleware.getClientInfo(request)
      );

      ErrorLogger.info('Package created successfully', {
        adminId: admin.id,
        packageId: newPackage.id,
        packageName: newPackage.name,
      });

      return NextResponse.json({
        success: true,
        data: newPackage,
        message: 'Package created successfully',
      });

    } catch (error) {
      ErrorLogger.log(error instanceof Error ? error : new Error('Failed to create package'), {
        adminId: admin.id,
        endpoint: '/api/admin/packages',
        requestBody: body,
      });

      if (error instanceof ValidationError) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create package',
        },
      }, { status: 500 });
    }
  },
  { requiredRole: 'SUPER_ADMIN' }
);