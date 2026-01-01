import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { CustomerStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/customers/[id]
 * Get a specific customer by ID
 */
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            package: true,
            invoices: {
              select: {
                id: true,
                uuid: true,
                total: true,
                status: true,
                issueDate: true,
                dueDate: true,
                paymentDate: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: {
            package: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            subscriptions: true,
            invoices: true,
            notifications: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    // Calculate customer metrics
    const paidInvoices = customer.invoices.filter(inv => inv.status === 'PAID');
    const pendingInvoices = customer.invoices.filter(inv => inv.status === 'PENDING');
    const overdueInvoices = customer.invoices.filter(inv => inv.status === 'OVERDUE');
    
    const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const customerWithMetrics = {
      ...customer,
      metrics: {
        totalSpent,
        totalPending,
        totalOverdue,
        paidInvoicesCount: paidInvoices.length,
        pendingInvoicesCount: pendingInvoices.length,
        overdueInvoicesCount: overdueInvoices.length,
        averageInvoiceValue: paidInvoices.length > 0 ? totalSpent / paidInvoices.length : 0,
      },
    };

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'CUSTOMER',
      id,
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
      customerId: (await params).id,
      endpoint: '/api/admin/customers/[id]',
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
 * PUT /api/admin/customers/[id]
 * Update a customer
 */
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: RouteParams) => {
  try {
    const { id } = await params;
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
      status,
    } = body;

    // Get existing customer
    const existingCustomer = await db.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundError('Customer');
    }

    // Check if new email already exists (if changing)
    if (email && email !== existingCustomer.email) {
      const emailExists = await db.customer.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailExists) {
        throw new ValidationError('Email already exists');
      }
    }

    // Check if new mobile already exists (if changing)
    if (mobile && mobile !== existingCustomer.mobile) {
      const mobileExists = await db.customer.findUnique({
        where: { mobile },
      });

      if (mobileExists) {
        throw new ValidationError('Mobile number already exists');
      }
    }

    // Validate status change restrictions
    if (status === 'ARCHIVED') {
      // Check if customer has active subscriptions or unpaid invoices
      const activeSubscriptions = await db.subscription.count({
        where: {
          customerId: id,
          status: { in: ['TRIAL', 'ACTIVE'] },
        },
      });

      const unpaidInvoices = await db.invoice.count({
        where: {
          customerId: id,
          status: { in: ['PENDING', 'OVERDUE'] },
        },
      });

      if (activeSubscriptions > 0 || unpaidInvoices > 0) {
        throw new ValidationError('Cannot archive customer with active subscriptions or unpaid invoices');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (businessName !== undefined) updateData.businessName = businessName?.trim();
    if (customerType !== undefined) updateData.customerType = customerType;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (mobile !== undefined) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (street !== undefined) updateData.street = street;
    if (currency !== undefined) updateData.currency = currency;
    if (status !== undefined) updateData.status = status;

    // Update customer
    const updatedCustomer = await db.customer.update({
      where: { id },
      data: updateData,
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
      id,
      { customer: existingCustomer },
      { customer: updatedCustomer },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Customer updated successfully', {
      adminId: admin.id,
      customerId: id,
      changes: Object.keys(updateData),
    });

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to update customer'), {
      adminId: admin.id,
      customerId: (await params).id,
      endpoint: '/api/admin/customers/[id]',
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
 * DELETE /api/admin/customers/[id]
 * Archive/delete a customer (Super Admin only)
 */
export const DELETE = withAdminAuth(
  async (request: NextRequest, admin, { params }: RouteParams) => {
    try {
      const { id } = await params;

      // Get existing customer
      const existingCustomer = await db.customer.findUnique({
        where: { id },
        include: {
          subscriptions: true,
          invoices: true,
        },
      });

      if (!existingCustomer) {
        throw new NotFoundError('Customer');
      }

      // Check if customer can be archived
      const activeSubscriptions = existingCustomer.subscriptions.filter(
        sub => ['TRIAL', 'ACTIVE'].includes(sub.status)
      );
      const unpaidInvoices = existingCustomer.invoices.filter(
        inv => ['PENDING', 'OVERDUE'].includes(inv.status)
      );

      if (activeSubscriptions.length > 0 || unpaidInvoices.length > 0) {
        throw new ValidationError('Cannot archive customer with active subscriptions or unpaid invoices');
      }

      // Archive customer (soft delete)
      const archivedCustomer = await db.customer.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          email: `archived_${Date.now()}_${existingCustomer.email}`, // Make email unique
          mobile: `archived_${Date.now()}_${existingCustomer.mobile}`, // Make mobile unique
        },
      });

      // Log deletion
      await AdminMiddleware.logAction(
        admin.id,
        'DELETE',
        'CUSTOMER',
        id,
        { customer: existingCustomer },
        { customer: archivedCustomer },
        AdminMiddleware.getClientInfo(request)
      );

      ErrorLogger.info('Customer archived successfully', {
        adminId: admin.id,
        customerId: id,
        customerEmail: existingCustomer.email,
      });

      return NextResponse.json({
        success: true,
        message: 'Customer archived successfully',
      });

    } catch (error) {
      ErrorLogger.log(error instanceof Error ? error : new Error('Failed to archive customer'), {
        adminId: admin.id,
        customerId: (await params).id,
        endpoint: '/api/admin/customers/[id]',
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
  },
  { requiredRole: 'SUPER_ADMIN' }
);