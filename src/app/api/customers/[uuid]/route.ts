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
 * GET /api/customers/[uuid]
 * Get customer details by UUID
 */
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

    const customer = await db.customer.findUnique({
      where: { uuid },
      include: {
        subscriptions: {
          include: {
            package: true,
            invoices: {
              select: {
                id: true,
                uuid: true,
                issueDate: true,
                dueDate: true,
                subtotal: true,
                tax: true,
                total: true,
                status: true,
                paidAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: {
            package: {
              select: {
                name: true,
                type: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            subscriptions: true,
            invoices: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Calculate metrics
    const paidInvoices = customer.invoices.filter(inv => inv.status === 'PAID');
    const pendingInvoices = customer.invoices.filter(inv => inv.status === 'PENDING');
    const overdueInvoices = customer.invoices.filter(inv => inv.status === 'OVERDUE');
    
    const totalSpent = paidInvoices.reduce((sum, inv) => Number(inv.total), 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => Number(inv.total), 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => Number(inv.total), 0);

    const customerWithMetrics = {
      ...customer,
      metrics: {
        totalSpent,
        totalPending,
        totalOverdue,
        paidInvoicesCount: paidInvoices.length,
        pendingInvoicesCount: pendingInvoices.length,
        overdueInvoicesCount: overdueInvoices.length,
        currentSubscription: customer.subscriptions[0] || null,
      },
    };

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'CUSTOMER',
      customer.id,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: customerWithMetrics,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get customer'), {
      adminId: admin.id,
      endpoint: `/api/customers/${params.uuid}`,
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
        message: 'Failed to retrieve customer',
      },
    }, { status: 500 });
  }
});

/**
 * PUT /api/customers/[uuid]
 * Update customer data
 */
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;
    const body = await request.json();
    const {
      name,
      businessName,
      customerType,
      email,
      mobile,
      address,
      province,
      city,
      street,
      currency,
    } = body;

    // Check if customer exists
    const existingCustomer = await db.customer.findUnique({
      where: { uuid },
    });

    if (!existingCustomer) {
      throw new NotFoundError('Customer not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingCustomer.email) {
      const emailExists = await db.customer.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailExists) {
        throw new ValidationError('Email already exists');
      }
    }

    // Check if mobile is being changed and if it's already taken
    if (mobile && mobile !== existingCustomer.mobile) {
      const mobileExists = await db.customer.findUnique({
        where: { mobile },
      });

      if (mobileExists) {
        throw new ValidationError('Mobile number already exists');
      }
    }

    // Store old values for audit log
    const oldValues = {
      name: existingCustomer.name,
      businessName: existingCustomer.businessName,
      customerType: existingCustomer.customerType,
      email: existingCustomer.email,
      mobile: existingCustomer.mobile,
      address: existingCustomer.address,
      province: existingCustomer.province,
      city: existingCustomer.city,
      street: existingCustomer.street,
      currency: existingCustomer.currency,
    };

    // Update customer
    const updatedCustomer = await db.customer.update({
      where: { uuid },
      data: {
        ...(name && { name: name.trim() }),
        ...(businessName !== undefined && { businessName: businessName?.trim() }),
        ...(customerType && { customerType }),
        ...(email && { email: email.toLowerCase() }),
        ...(mobile && { mobile }),
        ...(address !== undefined && { address }),
        ...(province !== undefined && { province }),
        ...(city !== undefined && { city }),
        ...(street !== undefined && { street }),
        ...(currency && { currency }),
      },
      include: {
        subscriptions: {
          include: {
            package: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Log update
    await AdminMiddleware.logAction(
      admin.id,
      'UPDATE',
      'CUSTOMER',
      updatedCustomer.id,
      oldValues,
      { customer: updatedCustomer },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Customer updated successfully', {
      adminId: admin.id,
      customerId: updatedCustomer.id,
      customerEmail: updatedCustomer.email,
    });

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to update customer'), {
      adminId: admin.id,
      endpoint: `/api/customers/${params.uuid}`,
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
        message: 'Failed to update customer',
      },
    }, { status: 500 });
  }
});

/**
 * DELETE /api/customers/[uuid]
 * Delete customer (soft delete by archiving)
 */
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

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
    if (customer.subscriptions.length > 0) {
      throw new ValidationError('Cannot archive customer with active subscriptions');
    }

    if (customer.invoices.length > 0) {
      throw new ValidationError('Cannot archive customer with unpaid invoices');
    }

    // Archive customer (soft delete)
    const archivedCustomer = await db.customer.update({
      where: { uuid },
      data: {
        status: 'ARCHIVED',
      },
    });

    // Log deletion
    await AdminMiddleware.logAction(
      admin.id,
      'DELETE',
      'CUSTOMER',
      archivedCustomer.id,
      { status: 'ACTIVE' },
      { status: 'ARCHIVED' },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Customer archived successfully', {
      adminId: admin.id,
      customerId: archivedCustomer.id,
      customerEmail: archivedCustomer.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer archived successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to archive customer'), {
      adminId: admin.id,
      endpoint: `/api/customers/${params.uuid}`,
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
        message: 'Failed to archive customer',
      },
    }, { status: 500 });
  }
});