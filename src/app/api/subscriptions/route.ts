import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { SubscriptionStatus, PackageType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/subscriptions
 * List all subscriptions
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as SubscriptionStatus | null;
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

    // Get subscriptions with pagination
    const [subscriptions, totalCount] = await Promise.all([
      db.subscription.findMany({
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
              duration: true,
            },
          },
          invoices: {
            select: {
              id: true,
              uuid: true,
              status: true,
              total: true,
              paidAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.subscription.count({ where }),
    ]);

    // Calculate additional metrics for each subscription
    const subscriptionsWithMetrics = subscriptions.map(subscription => {
      const paidInvoices = subscription.invoices.filter(inv => inv.status === 'PAID');
      const pendingInvoices = subscription.invoices.filter(inv => inv.status === 'PENDING');
      const overdueInvoices = subscription.invoices.filter(inv => inv.status === 'OVERDUE');
      
      const totalPaid = paidInvoices.reduce((sum, inv) => Number(inv.total), 0);
      const totalPending = pendingInvoices.reduce((sum, inv) => Number(inv.total), 0);
      const totalOverdue = overdueInvoices.reduce((sum, inv) => Number(inv.total), 0);

      // Check if subscription is expiring soon (within 7 days)
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const isExpiringSoon = subscription.endDate <= sevenDaysFromNow && subscription.endDate > today;

      return {
        ...subscription,
        metrics: {
          totalPaid,
          totalPending,
          totalOverdue,
          paidInvoicesCount: paidInvoices.length,
          pendingInvoicesCount: pendingInvoices.length,
          overdueInvoicesCount: overdueInvoices.length,
          isExpiringSoon,
          daysUntilExpiry: Math.ceil((subscription.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        },
      };
    });

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'SUBSCRIPTION',
      undefined,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: subscriptionsWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get subscriptions'), {
      adminId: admin.id,
      endpoint: '/api/subscriptions',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscriptions',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/subscriptions
 * Create a new subscription for a customer
 */
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json();
    const {
      customerId,
      packageId,
      startDate,
      endDate,
      autoRenew,
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

    // Check if customer has an active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        customerId,
        status: {
          in: ['TRIAL', 'ACTIVE']
        },
      },
    });

    if (existingSubscription) {
      throw new ValidationError('Customer already has an active subscription');
    }

    // Set default dates if not provided
    const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
    let subscriptionEndDate = endDate ? new Date(endDate) : null;

    if (!subscriptionEndDate) {
      subscriptionEndDate = new Date(subscriptionStartDate);
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + packageData.duration);
    }

    // Set auto-renew based on package type
    const subscriptionAutoRenew = autoRenew !== undefined ? autoRenew : packageData.type === 'PAID';

    // Determine subscription status
    let subscriptionStatus = SubscriptionStatus.ACTIVE;
    if (packageData.type === 'FREE' && packageData.freeTrialDuration > 0) {
      subscriptionStatus = SubscriptionStatus.TRIAL;
    }

    // Generate subscription UUID
    const subscriptionUuid = `SUB-${uuidv4().toUpperCase().substring(0, 8)}`;

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        uuid: subscriptionUuid,
        customerId,
        packageId,
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        autoRenew: subscriptionAutoRenew,
        status: subscriptionStatus,
      },
      include: {
        customer: true,
        package: true,
      },
    });

    // Log creation
    await AdminMiddleware.logAction(
      admin.id,
      'CREATE',
      'SUBSCRIPTION',
      subscription.id,
      undefined,
      { subscription },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Subscription created successfully', {
      adminId: admin.id,
      subscriptionId: subscription.id,
      customerId,
      packageId,
    });

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to create subscription'), {
      adminId: admin.id,
      endpoint: '/api/subscriptions',
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
        message: 'Failed to create subscription',
      },
    }, { status: 500 });
  }
});