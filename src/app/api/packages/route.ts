import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, ConflictError, NotFoundError } from '@/lib/errors';
import { PackageType, PackageStatus, RenewalPolicy } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/packages
 * List all packages
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as PackageType | null;
    const status = searchParams.get('status') as PackageStatus | null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { uuid: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // Get packages with pagination
    const [packages, totalCount] = await Promise.all([
      db.package.findMany({
        where,
        include: {
          _count: {
            select: {
              subscriptions: true,
              invoices: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.package.count({ where }),
    ]);

    // Calculate additional metrics for each package
    const packagesWithMetrics = packages.map(pkg => ({
      ...pkg,
      metrics: {
        totalSubscriptions: pkg._count.subscriptions,
        totalInvoices: pkg._count.invoices,
        activeSubscriptions: pkg._count.subscriptions, // This would need more complex query in real implementation
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
      data: {
        packages: packagesWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get packages'), {
      adminId: admin.id,
      endpoint: '/api/packages',
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
 * POST /api/packages
 * Create a new package
 */
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json();
    const {
      name,
      type,
      price,
      duration,
      taxIncluded,
      taxType,
      taxRate,
      renewalPolicy,
      freeTrialDuration,
      status = 'ACTIVE',
    } = body;

    // Validation
    if (!name || !type || !duration) {
      throw new ValidationError('Name, type, and duration are required');
    }

    if (type === 'PAID' && (!price || price <= 0)) {
      throw new ValidationError('Price is required for paid packages and must be greater than 0');
    }

    if (type === 'FREE' && price > 0) {
      throw new ValidationError('Price must be 0 for free packages');
    }

    // Check if package name already exists
    const existingPackage = await db.package.findFirst({
      where: { name: name.trim() },
    });

    if (existingPackage) {
      throw new ConflictError('Package name already exists');
    }

    // Generate package UUID
    const packageUuid = `PKG-${uuidv4().toUpperCase().substring(0, 8)}`;

    // Create package
    const createdPackage = await db.package.create({
      data: {
        uuid: packageUuid,
        name: name.trim(),
        type,
        price: price || 0,
        duration,
        taxIncluded: taxIncluded || false,
        taxType,
        taxRate: taxRate || 14,
        renewalPolicy: renewalPolicy || 'MONTHLY',
        freeTrialDuration: freeTrialDuration || 7,
        status,
      },
    });

    // Log creation
    await AdminMiddleware.logAction(
      admin.id,
      'CREATE',
      'PACKAGE',
      createdPackage.id,
      undefined,
      { package: createdPackage },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Package created successfully', {
      adminId: admin.id,
      packageId: createdPackage.id,
      packageName: createdPackage.name,
    });

    return NextResponse.json({
      success: true,
      data: createdPackage,
      message: 'Package created successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to create package'), {
      adminId: admin.id,
      endpoint: '/api/packages',
      requestBody: body,
    });

    if (error instanceof ValidationError || 
        error instanceof ConflictError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'CONFLICT_ERROR',
          message: error.message,
        },
      }, { status: error instanceof ValidationError ? 400 : 409 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create package',
      },
    }, { status: 500 });
  }
});