import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { PackageType, PackageStatus, RenewalPolicy } from '@prisma/client';

interface Params {
  params: {
    uuid: string;
  };
}

/**
 * GET /api/packages/[uuid]
 * Get package details by UUID
 */
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

    const packageData = await db.package.findUnique({
      where: { uuid },
      include: {
        _count: {
          select: {
            subscriptions: true,
            invoices: true,
          },
        },
        subscriptions: {
          include: {
            customer: {
              select: {
                uuid: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!packageData) {
      throw new NotFoundError('Package not found');
    }

    // Calculate metrics
    const activeSubscriptions = packageData.subscriptions.filter(sub => 
      sub.status === 'ACTIVE' || sub.status === 'TRIAL'
    );

    const packageWithMetrics = {
      ...packageData,
      metrics: {
        totalSubscriptions: packageData._count.subscriptions,
        totalInvoices: packageData._count.invoices,
        activeSubscriptions: activeSubscriptions.length,
        recentCustomers: activeSubscriptions.map(sub => sub.customer),
      },
    };

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'PACKAGE',
      packageData.id,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: packageWithMetrics,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get package'), {
      adminId: admin.id,
      endpoint: `/api/packages/${params.uuid}`,
    });

    if (error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve package',
      },
    }, { status: 500 });
  }
});

/**
 * PUT /api/packages/[uuid]
 * Update package details
 */
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;
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
      status,
    } = body;

    // Check if package exists
    const existingPackage = await db.package.findUnique({
      where: { uuid },
    });

    if (!existingPackage) {
      throw new NotFoundError('Package not found');
    }

    // Validation
    if (type === 'PAID' && (!price || price <= 0)) {
      throw new ValidationError('Price is required for paid packages and must be greater than 0');
    }

    if (type === 'FREE' && price > 0) {
      throw new ValidationError('Price must be 0 for free packages');
    }

    // Check if name is being changed and if it's already taken
    if (name && name !== existingPackage.name) {
      const nameExists = await db.package.findFirst({
        where: { name: name.trim() },
      });

      if (nameExists) {
        throw new ValidationError('Package name already exists');
      }
    }

    // Store old values for audit log
    const oldValues = {
      name: existingPackage.name,
      type: existingPackage.type,
      price: existingPackage.price,
      duration: existingPackage.duration,
      taxIncluded: existingPackage.taxIncluded,
      taxType: existingPackage.taxType,
      taxRate: existingPackage.taxRate,
      renewalPolicy: existingPackage.renewalPolicy,
      freeTrialDuration: existingPackage.freeTrialDuration,
      status: existingPackage.status,
    };

    // Update package
    const updatedPackage = await db.package.update({
      where: { uuid },
      data: {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(price !== undefined && { price }),
        ...(duration && { duration }),
        ...(taxIncluded !== undefined && { taxIncluded }),
        ...(taxType !== undefined && { taxType }),
        ...(taxRate !== undefined && { taxRate }),
        ...(renewalPolicy && { renewalPolicy }),
        ...(freeTrialDuration !== undefined && { freeTrialDuration }),
        ...(status && { status }),
      },
    });

    // Log update
    await AdminMiddleware.logAction(
      admin.id,
      'UPDATE',
      'PACKAGE',
      updatedPackage.id,
      oldValues,
      { package: updatedPackage },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Package updated successfully', {
      adminId: admin.id,
      packageId: updatedPackage.id,
      packageName: updatedPackage.name,
    });

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: 'Package updated successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to update package'), {
      adminId: admin.id,
      endpoint: `/api/packages/${params.uuid}`,
      requestBody: body,
    });

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'NOT_FOUND',
          message: error.message,
        },
      }, { status: error instanceof ValidationError ? 400 : 404 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update package',
      },
    }, { status: 500 });
  }
});

/**
 * DELETE /api/packages/[uuid]
 * Delete package (soft delete by setting status to INACTIVE)
 */
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

    // Check if package exists
    const packageData = await db.package.findUnique({
      where: { uuid },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['TRIAL', 'ACTIVE']
            }
          },
        },
      },
    });

    if (!packageData) {
      throw new NotFoundError('Package not found');
    }

    // Business rule: Cannot delete packages with active subscriptions
    if (packageData.subscriptions.length > 0) {
      throw new ValidationError('Cannot delete package with active subscriptions');
    }

    // Soft delete package by setting status to INACTIVE
    const deletedPackage = await db.package.update({
      where: { uuid },
      data: {
        status: 'INACTIVE',
      },
    });

    // Log deletion
    await AdminMiddleware.logAction(
      admin.id,
      'DELETE',
      'PACKAGE',
      deletedPackage.id,
      { status: packageData.status },
      { status: 'INACTIVE' },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Package deleted successfully', {
      adminId: admin.id,
      packageId: deletedPackage.id,
      packageName: deletedPackage.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to delete package'), {
      adminId: admin.id,
      endpoint: `/api/packages/${params.uuid}`,
    });

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'NOT_FOUND',
          message: error.message,
        },
      }, { status: error instanceof ValidationError ? 400 : 404 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete package',
      },
    }, { status: 500 });
  }
});