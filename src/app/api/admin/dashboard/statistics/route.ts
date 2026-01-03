import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger } from '@/lib/errors';

/**
 * GET /api/admin/dashboard/statistics
 * Get comprehensive dashboard statistics
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Customer Statistics
    const [
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      newCustomersThisMonth,
    ] = await Promise.all([
      db.customer.count(),
      db.customer.count({ where: { status: 'ACTIVE' } }),
      db.customer.count({ where: { status: 'DISABLED' } }),
      db.customer.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Financial Statistics
    const [
      totalInvoices,
      totalInvoiceValue,
      paidInvoices,
      paidInvoiceValue,
      overdueInvoices,
      overdueInvoiceValue,
      invoicesThisMonth,
    ] = await Promise.all([
      db.invoice.count(),
      db.invoice.aggregate({ _sum: { total: true } }),
      db.invoice.count({ where: { status: 'PAID' } }),
      db.invoice.aggregate({ 
        where: { status: 'PAID' },
        _sum: { total: true } 
      }),
      db.invoice.count({ 
        where: { 
          status: 'PENDING',
          dueDate: { lt: now }
        } 
      }),
      db.invoice.aggregate({ 
        where: { 
          status: 'PENDING',
          dueDate: { lt: now }
        },
        _sum: { total: true } 
      }),
      db.invoice.count({
        where: {
          issueDate: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Subscription Statistics
    const [
      totalSubscriptions,
      trialSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      newSubscriptionsThisMonth,
    ] = await Promise.all([
      db.subscription.count(),
      db.subscription.count({ where: { status: 'TRIAL' } }),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.subscription.count({ where: { status: 'EXPIRED' } }),
      db.subscription.count({ where: { status: 'CANCELLED' } }),
      db.subscription.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Package Statistics
    const packageStats = await db.package.groupBy({
      by: ['type', 'status'],
      _count: true,
    });

    // System Activity Statistics
    const [
      totalLogins,
      recentLogins,
      totalAuditLogs,
      recentAuditLogs,
    ] = await Promise.all([
      db.auditLog.count({ where: { action: 'LOGIN' } }),
      db.auditLog.count({
        where: {
          action: 'LOGIN',
          timestamp: { gte: sevenDaysAgo },
        },
      }),
      db.auditLog.count(),
      db.auditLog.count({
        where: {
          timestamp: { gte: sevenDaysAgo },
        },
      }),
    ]);

    // Revenue Statistics (monthly trend for last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const monthlyRevenue = await db.$queryRaw`
      SELECT 
        strftime('%Y-%m', issueDate) as month,
        COUNT(*) as invoiceCount,
        SUM(total) as revenue
      FROM invoices 
      WHERE issueDate >= ${sixMonthsAgo.toISOString()}
        AND status = 'PAID'
      GROUP BY strftime('%Y-%m', issueDate)
      ORDER BY month DESC
    ` as Array<{
      month: string;
      invoiceCount: number;
      revenue: number;
    }>;

    // Customer Growth Trend
    const customerGrowth = await db.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as newCustomers
      FROM customers 
      WHERE createdAt >= ${sixMonthsAgo.toISOString()}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
    ` as Array<{
      month: string;
      newCustomers: number;
    }>;

    // Top performing packages
    const topPackages = await db.package.findMany({
      include: {
        _count: {
          select: { subscriptions: true }
        }
      },
      orderBy: {
        subscriptions: {
          _count: 'desc'
        }
      },
      take: 5,
    });

      // Recent Activities
      const recentActivities = await db.auditLog.findMany({
        include: {
          admin: {
            select: {
              email: true,
              role: true,
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      const statistics = {
        // Customer Statistics (لوحة العملاء)
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          inactive: inactiveCustomers,
          newThisMonth: newCustomersThisMonth,
          growthRate: totalCustomers > 0 ? (newCustomersThisMonth / totalCustomers) * 100 : 0,
        },

        // Financial Statistics (لوحة المالية)
        financial: {
          totalInvoices: totalInvoices,
          totalInvoiceValue: totalInvoiceValue._sum.total || 0,
          paidInvoices: paidInvoices,
          paidInvoiceValue: paidInvoiceValue._sum.total || 0,
          overdueInvoices: overdueInvoices,
          overdueInvoiceValue: overdueInvoiceValue._sum.total || 0,
          invoicesThisMonth: invoicesThisMonth,
          collectionRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
        },

        // Subscription Statistics (لوحة الاشتراكات)
        subscriptions: {
          total: totalSubscriptions,
          trial: trialSubscriptions,
          active: activeSubscriptions,
          expired: expiredSubscriptions,
          cancelled: cancelledSubscriptions,
          newThisMonth: newSubscriptionsThisMonth,
          conversionRate: trialSubscriptions > 0 ? (activeSubscriptions / (trialSubscriptions + activeSubscriptions)) * 100 : 0,
        },

        // Package Statistics
        packages: {
          free: packageStats.find(p => p.type === 'FREE' && p.status === 'ACTIVE')?._count || 0,
          paid: packageStats.find(p => p.type === 'PAID' && p.status === 'ACTIVE')?._count || 0,
          inactive: packageStats.filter(p => p.status === 'INACTIVE').reduce((sum, p) => sum + p._count, 0),
          topPerforming: topPackages.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            type: pkg.type,
            subscribers: pkg._count.subscriptions,
          })),
        },

        // System Activity Statistics (لوحة النظام)
        system: {
          totalLogins: totalLogins,
          recentLogins: recentLogins,
          totalAuditLogs: totalAuditLogs,
          recentAuditLogs: recentAuditLogs,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },

        // Trends and Analytics
        trends: {
          monthlyRevenue: monthlyRevenue.map(item => ({
            month: item.month,
            revenue: Number(item.revenue),
            invoiceCount: Number(item.invoiceCount),
          })),
          customerGrowth: customerGrowth.map(item => ({
            month: item.month,
            newCustomers: Number(item.newCustomers),
          })),
        },

        // Recent Activities
        recentActivities: recentActivities.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          timestamp: log.timestamp,
          admin: log.admin.email,
          details: {
            entityId: log.entityId,
            oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
            newValue: log.newValue ? JSON.parse(log.newValue) : null,
          },
        })),
      };

    // Log dashboard access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'DASHBOARD',
      undefined,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Dashboard statistics accessed', {
      adminId: admin.id,
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      data: statistics,
      meta: {
        timestamp: new Date().toISOString(),
        generatedBy: admin.email,
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get dashboard statistics'), {
      adminId: admin.id,
      endpoint: '/api/admin/dashboard/statistics',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve dashboard statistics',
      },
    }, { status: 500 });
  }
});