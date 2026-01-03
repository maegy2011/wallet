import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { InvoiceStatus } from '@prisma/client';

interface Params {
  params: {
    uuid: string;
  };
}

/**
 * GET /api/invoices/[uuid]
 * Get invoice details by UUID
 */
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

    const invoice = await db.invoice.findUnique({
      where: { uuid },
      include: {
        customer: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            mobile: true,
            address: true,
            city: true,
            province: true,
          },
        },
        package: {
          select: {
            id: true,
            uuid: true,
            name: true,
            type: true,
            price: true,
            duration: true,
            taxIncluded: true,
            taxRate: true,
          },
        },
        subscription: {
          select: {
            id: true,
            uuid: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Calculate metrics
    const isOverdue = invoice.status === 'PENDING' && new Date() > invoice.dueDate;
    const daysOverdue = isOverdue ? Math.ceil((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const daysUntilDue = invoice.status === 'PENDING' ? Math.ceil((invoice.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const invoiceWithMetrics = {
      ...invoice,
      metrics: {
        isOverdue,
        daysOverdue,
        daysUntilDue,
        daysSinceIssue: Math.ceil((new Date().getTime() - invoice.issueDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
    };

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'INVOICE',
      invoice.id,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: invoiceWithMetrics,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get invoice'), {
      adminId: admin.id,
      endpoint: `/api/invoices/${params.uuid}`,
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
        message: 'Failed to retrieve invoice',
      },
    }, { status: 500 });
  }
});

/**
 * PATCH /api/invoices/[uuid]/status
 * Update invoice status (paid/overdue/cancelled)
 */
export const PATCH = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;
    const body = await request.json();
    const { status, paymentDate, paymentReference } = body;

    // Validate status
    if (!status || !Object.values(InvoiceStatus).includes(status)) {
      throw new ValidationError('Invalid status. Must be one of: PENDING, PAID, OVERDUE, CANCELLED');
    }

    // Check if invoice exists
    const invoice = await db.invoice.findUnique({
      where: { uuid },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Business rule: Cannot change status from PAID to PENDING
    if (invoice.status === 'PAID' && status === 'PENDING') {
      throw new ValidationError('Cannot change status from PAID to PENDING');
    }

    // Prepare update data
    const updateData: any = { status };

    if (status === 'PAID') {
      updateData.paidAt = paymentDate ? new Date(paymentDate) : new Date();
      if (paymentReference) {
        updateData.paymentReference = paymentReference;
      }
    }

    // Update invoice status
    const updatedInvoice = await db.invoice.update({
      where: { uuid },
      data: updateData,
    });

    // Log status change
    await AdminMiddleware.logAction(
      admin.id,
      'UPDATE_STATUS',
      'INVOICE',
      updatedInvoice.id,
      { status: invoice.status },
      { status, paidAt: updateData.paidAt, paymentReference: updateData.paymentReference },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Invoice status updated successfully', {
      adminId: admin.id,
      invoiceId: updatedInvoice.id,
      oldStatus: invoice.status,
      newStatus: status,
    });

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: `Invoice status updated to ${status}`,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to update invoice status'), {
      adminId: admin.id,
      endpoint: `/api/invoices/${params.uuid}/status`,
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
        message: 'Failed to update invoice status',
      },
    }, { status: 500 });
  }
});