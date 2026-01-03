import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { CustomerStatus } from '@prisma/client';

interface Params {
  params: {
    uuid: string;
  };
}

/**
 * PATCH /api/customers/[uuid]/status
 * Change customer status (active/disabled/archived)
 */
export const PATCH = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !Object.values(CustomerStatus).includes(status)) {
      throw new ValidationError('Invalid status. Must be one of: ACTIVE, DISABLED, ARCHIVED');
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { uuid },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['TRIAL', 'ACTIVE']
            }
          },
        },
        invoices: {
          where: {
            status: 'PENDING'
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Business rule: Cannot archive customers with active subscriptions or unpaid invoices
    if (status === 'ARCHIVED') {
      if (customer.subscriptions.length > 0) {
        throw new ValidationError('Cannot archive customer with active subscriptions');
      }

      if (customer.invoices.length > 0) {
        throw new ValidationError('Cannot archive customer with unpaid invoices');
      }
    }

    // Store old status for audit log
    const oldStatus = customer.status;

    // Update customer status
    const updatedCustomer = await db.customer.update({
      where: { uuid },
      data: {
        status,
      },
    });

    // Log status change
    await AdminMiddleware.logAction(
      admin.id,
      'UPDATE_STATUS',
      'CUSTOMER',
      updatedCustomer.id,
      { status: oldStatus },
      { status },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Customer status updated successfully', {
      adminId: admin.id,
      customerId: updatedCustomer.id,
      customerEmail: updatedCustomer.email,
      oldStatus,
      newStatus: status,
    });

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: `Customer status updated to ${status}`,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to update customer status'), {
      adminId: admin.id,
      endpoint: `/api/customers/${params.uuid}/status`,
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
        message: 'Failed to update customer status',
      },
    }, { status: 500 });
  }
});