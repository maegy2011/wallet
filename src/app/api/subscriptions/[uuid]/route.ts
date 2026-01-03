import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { SubscriptionStatus } from '@prisma/client';

interface Params {
  params: {
    uuid: string;
  };
}

/**
 * GET /api/subscriptions/[uuid]
 * Get subscription details by UUID
 */
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

    const subscription = await db.subscription.findUnique({
      where: { uuid },
      include: {
        customer: {
          select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            mobile: true,
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
            taxIncluded: true,
            taxRate: true,
          },
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
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Calculate metrics
    const paidInvoices = subscription.invoices.filter(inv => inv.status === 'PAID');
    const pendingInvoices = subscription.invoices.filter(inv => inv.status === 'PENDING');
    const overdueInvoices = subscription.invoices.filter(inv => inv.status === 'OVERDUE');
    
    const totalPaid = paidInvoices.reduce((sum, inv) => Number(inv.total), 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => Number(inv.total), 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => Number(inv.total), 0);

    // Check if subscription is expiring soon
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isExpiringSoon = subscription.endDate <= sevenDaysFromNow && subscription.endDate > today;

    const subscriptionWithMetrics = {
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
        totalRevenue: totalPaid + totalPending + totalOverdue,
      },
    };

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'SUBSCRIPTION',
      subscription.id,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: subscriptionWithMetrics,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get subscription'), {
      adminId: admin.id,
      endpoint: `/api/subscriptions/${params.uuid}`,
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
        message: 'Failed to retrieve subscription',
      },
    }, { status: 500 });
  }
});

/**
 * PATCH /api/subscriptions/[uuid]/cancel
 * Cancel a subscription
 */
export const PATCH = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;
    const body = await request.json();
    const { reason } = body;

    // Check if subscription exists
    const subscription = await db.subscription.findUnique({
      where: { uuid },
      include: {
        customer: true,
        package: true,
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Check if subscription is already cancelled
    if (subscription.status === 'CANCELLED') {
      throw new ValidationError('Subscription is already cancelled');
    }

    // Update subscription status to cancelled
    const cancelledSubscription = await db.subscription.update({
      where: { uuid },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        autoRenew: false,
      },
    });

    // Log cancellation
    await AdminMiddleware.logAction(
      admin.id,
      'CANCEL',
      'SUBSCRIPTION',
      cancelledSubscription.id,
      { 
        status: subscription.status,
        autoRenew: subscription.autoRenew,
        cancelledAt: null
      },
      { 
        status: 'CANCELLED',
        autoRenew: false,
        cancelledAt: new Date(),
        reason
      },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Subscription cancelled successfully', {
      adminId: admin.id,
      subscriptionId: cancelledSubscription.id,
      customerId: cancelledSubscription.customerId,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: cancelledSubscription,
      message: 'Subscription cancelled successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to cancel subscription'), {
      adminId: admin.id,
      endpoint: `/api/subscriptions/${params.uuid}/cancel`,
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
        message: 'Failed to cancel subscription',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/subscriptions/[uuid]/renew
 * Renew a subscription manually
 */
export const POST = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;
    const body = await request.json();
    const { duration } = body;

    // Check if subscription exists
    const subscription = await db.subscription.findUnique({
      where: { uuid },
      include: {
        customer: true,
        package: true,
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Check if subscription is cancelled
    if (subscription.status === 'CANCELLED') {
      throw new ValidationError('Cannot renew cancelled subscription');
    }

    // Calculate new end date
    const newEndDate = new Date(subscription.endDate);
    const renewalDuration = duration || subscription.package.duration;
    newEndDate.setDate(newEndDate.getDate() + renewalDuration);

    // Update subscription
    const renewedSubscription = await db.subscription.update({
      where: { uuid },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE',
        cancelledAt: null,
        autoRenew: subscription.package.type === 'PAID',
      },
    });

    // Log renewal
    await AdminMiddleware.logAction(
      admin.id,
      'RENEW',
      'SUBSCRIPTION',
      renewedSubscription.id,
      { 
        endDate: subscription.endDate,
        status: subscription.status
      },
      { 
        endDate: newEndDate,
        status: 'ACTIVE',
        renewalDuration
      },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Subscription renewed successfully', {
      adminId: admin.id,
      subscriptionId: renewedSubscription.id,
      customerId: renewedSubscription.customerId,
      renewalDuration,
    });

    return NextResponse.json({
      success: true,
      data: renewedSubscription,
      message: 'Subscription renewed successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to renew subscription'), {
      adminId: admin.id,
      endpoint: `/api/subscriptions/${params.uuid}/renew`,
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
        message: 'Failed to renew subscription',
      },
    }, { status: 500 });
  }
});