import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { InvoiceStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/invoices
 * List all invoices
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as InvoiceStatus | null;
    const customerId = searchParams.get('customerId');
    const packageId = searchParams.get('packageId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { uuid: { contains: search, mode: 'insensitive' } },
        { paymentReference: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { package: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (packageId) {
      where.packageId = packageId;
    }

    // Get invoices with pagination
    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              uuid: true,
              name: true,
              email: true,
              status: true,
            },
          },
          package: {
            select: {
              id: true,
              uuid: true,
              name: true,
              type: true,
              price: true,
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.invoice.count({ where }),
    ]);

    // Calculate additional metrics for each invoice
    const invoicesWithMetrics = invoices.map(invoice => {
      const isOverdue = invoice.status === 'PENDING' && new Date() > invoice.dueDate;
      const daysOverdue = isOverdue ? Math.ceil((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        ...invoice,
        metrics: {
          isOverdue,
          daysOverdue,
          daysUntilDue: invoice.status === 'PENDING' ? Math.ceil((invoice.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
        },
      };
    });

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'INVOICE',
      undefined,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: {
        invoices: invoicesWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get invoices'), {
      adminId: admin.id,
      endpoint: '/api/invoices',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve invoices',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/invoices
 * Create an invoice for a subscription
 */
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json();
    const {
      customerId,
      packageId,
      subscriptionId,
      issueDate,
      dueDate,
      paymentMethod = 'WALLET_TRANSFER',
      paymentReference,
    } = body;

    // Validation
    if (!customerId || !packageId) {
      throw new ValidationError('Customer ID and Package ID are required');
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Check if package exists
    const packageData = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!packageData) {
      throw new NotFoundError('Package not found');
    }

    // Check if subscription exists (if provided)
    let subscription = null;
    if (subscriptionId) {
      subscription = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new NotFoundError('Subscription not found');
      }
    }

    // Calculate amounts
    const subtotal = packageData.price;
    const tax = packageData.taxIncluded ? (subtotal * packageData.taxRate) / 100 : 0;
    const total = subtotal + tax;

    // Set dates
    const invoiceIssueDate = issueDate ? new Date(issueDate) : new Date();
    const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(invoiceIssueDate);
    
    if (!dueDate) {
      invoiceDueDate.setDate(invoiceDueDate.getDate() + packageData.duration);
    }

    // Generate invoice UUID
    const invoiceUuid = `INV-${uuidv4().toUpperCase().substring(0, 8)}`;

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        uuid: invoiceUuid,
        customerId,
        packageId,
        subscriptionId,
        issueDate: invoiceIssueDate,
        dueDate: invoiceDueDate,
        subtotal,
        tax,
        total,
        paymentMethod,
        paymentReference,
        status: 'PENDING',
      },
      include: {
        customer: true,
        package: true,
        subscription: true,
      },
    });

    // Log creation
    await AdminMiddleware.logAction(
      admin.id,
      'CREATE',
      'INVOICE',
      invoice.id,
      undefined,
      { invoice },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Invoice created successfully', {
      adminId: admin.id,
      invoiceId: invoice.id,
      customerId,
      packageId,
      total,
    });

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to create invoice'), {
      adminId: admin.id,
      endpoint: '/api/invoices',
      requestBody: body,
    });

    if (error instanceof ValidationError || 
        error instanceof NotFoundError) {
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
        message: 'Failed to create invoice',
      },
    }, { status: 500 });
  }
});