import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Get all counts with optimized queries
    const [
      totalTenants,
      totalCompanies,
      totalBranches,
      totalUsers,
      totalWallets,
      totalTransactions,
      totalCategories,
      totalPartners,
      freeTenantsCount,
      merchantTenantsCount,
      activeTenantsCount,
      inactiveTenantsCount,
      totalBalanceResult,
      totalIncomeResult,
      totalExpenseResult
    ] = await Promise.all([
      // Total counts
      db.tenant.count(),
      db.company.count(),
      db.branch.count(),
      db.user.count(),
      db.wallet.count(),
      db.transaction.count(),
      db.category.count(),
      db.partner.count(),
      
      // Plan counts
      db.tenant.count({ where: { plan: 'FREE' } }),
      db.tenant.count({ where: { plan: 'MERCHANT' } }),
      db.tenant.count({ where: { isActive: true } }),
      db.tenant.count({ where: { isActive: false } }),
      
      // Financial summary with proper null handling
      db.wallet.aggregate({
        _sum: { balance: true },
        where: { isActive: true }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'income', status: 'completed' }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'expense', status: 'completed' }
      })
    ])

    // Get financial metrics per plan
    const [freeBalance, merchantBalance] = await Promise.all([
      db.wallet.aggregate({
        _sum: { balance: true },
        where: { 
          isActive: true,
          tenant: { plan: 'FREE', isActive: true }
        }
      }),
      db.wallet.aggregate({
        _sum: { balance: true },
        where: { 
          isActive: true,
          tenant: { plan: 'MERCHANT', isActive: true }
        }
      })
    ])

    // Get recent activity with more details
    const recentTenants = await db.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        plan: true,
        isActive: true,
        createdAt: true
      }
    })

    const recentTransactions = await db.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            balance: true,
            currency: true,
            tenant: {
              select: {
                id: true,
                name: true,
                plan: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // User role distribution with percentage
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    // Wallet distribution by type
    const walletsByType = await db.wallet.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      where: { isActive: true }
    })

    // Wallet distribution by currency
    const walletsByCurrency = await db.wallet.groupBy({
      by: ['currency'],
      _count: {
        currency: true
      },
      where: { isActive: true }
    })

    // Transaction distribution by type and status
    const transactionsByType = await db.transaction.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })

    const transactionsByStatus = await db.transaction.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Calculate averages
    const avgWalletBalance = totalWallets > 0 
      ? (totalBalanceResult._sum.balance || 0) / totalWallets 
      : 0
    
    const avgTransactionsPerWallet = totalWallets > 0
      ? (totalTransactions / totalWallets)
      : 0

    // Calculate growth metrics (this month vs all time)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [thisMonthTransactions, thisMonthIncome, thisMonthExpense] = await Promise.all([
      db.transaction.count({ 
        where: { 
          createdAt: { gte: startOfMonth }
        }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { 
          type: 'income',
          status: 'completed',
          createdAt: { gte: startOfMonth }
        }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { 
          type: 'expense',
          status: 'completed',
          createdAt: { gte: startOfMonth }
        }
      })
    ])

    const responseTime = Date.now() - startTime

    // Build comprehensive response
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      responseTime,
      system: {
        name: 'محافظي SaaS',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      counts: {
        tenants: totalTenants,
        companies: totalCompanies,
        branches: totalBranches,
        users: totalUsers,
        wallets: totalWallets,
        transactions: totalTransactions,
        categories: totalCategories,
        partners: totalPartners
      },
      countsDetails: {
        avgWalletBalance: avgWalletBalance,
        avgTransactionsPerWallet: avgTransactionsPerWallet.toFixed(2),
        activeTenantsPercentage: totalTenants > 0 
          ? ((activeTenantsCount / totalTenants) * 100).toFixed(1) 
          : '0',
        thisMonthTransactions: thisMonthTransactions
      },
      plans: {
        free: freeTenantsCount,
        merchant: merchantTenantsCount,
        active: activeTenantsCount,
        inactive: inactiveTenantsCount,
        freePercentage: totalTenants > 0 
          ? ((freeTenantsCount / totalTenants) * 100).toFixed(1) 
          : '0',
        merchantPercentage: totalTenants > 0 
          ? ((merchantTenantsCount / totalTenants) * 100).toFixed(1) 
          : '0'
      },
      financials: {
        totalBalance: totalBalanceResult._sum.balance || 0,
        totalIncome: totalIncomeResult._sum.amount || 0,
        totalExpense: totalExpenseResult._sum.amount || 0,
        netFlow: (totalIncomeResult._sum.amount || 0) - (totalExpenseResult._sum.amount || 0),
        profitMargin: totalIncomeResult._sum.amount > 0
          ? ((totalIncomeResult._sum.amount - totalExpenseResult._sum.amount) / totalIncomeResult._sum.amount * 100).toFixed(1)
          : '0',
        freePlanBalance: freeBalance._sum.balance || 0,
        merchantPlanBalance: merchantBalance._sum.balance || 0
      },
      financialsThisMonth: {
        income: thisMonthIncome._sum.amount || 0,
        expense: thisMonthExpense._sum.amount || 0,
        netFlow: (thisMonthIncome._sum.amount || 0) - (thisMonthExpense._sum.amount || 0)
      },
      distributions: {
        usersByRole: usersByRole
          .sort((a, b) => b._count.role - a._count.role)
          .map(item => ({
            role: item.role,
            count: item._count.role,
            percentage: totalUsers > 0 ? ((item._count.role / totalUsers) * 100).toFixed(1) : '0'
          })),
        walletsByType: walletsByType
          .sort((a, b) => b._count.type - a._count.type)
          .map(item => ({
            type: item.type,
            count: item._count.type,
            percentage: totalWallets > 0 ? ((item._count.type / totalWallets) * 100).toFixed(1) : '0'
          })),
        walletsByCurrency: walletsByCurrency
          .sort((a, b) => b._count.currency - a._count.currency)
          .map(item => ({
            currency: item.currency,
            count: item._count.currency,
            percentage: totalWallets > 0 ? ((item._count.currency / totalWallets) * 100).toFixed(1) : '0'
          })),
        transactionsByType: transactionsByType
          .sort((a, b) => b._count.type - a._count.type)
          .map(item => ({
            type: item.type,
            count: item._count.type,
            percentage: totalTransactions > 0 ? ((item._count.type / totalTransactions) * 100).toFixed(1) : '0'
          })),
        transactionsByStatus: transactionsByStatus
          .sort((a, b) => b._count.status - a._count.status)
          .map(item => ({
            status: item.status,
            count: item._count.status,
            percentage: totalTransactions > 0 ? ((item._count.status / totalTransactions) * 100).toFixed(1) : '0'
          }))
      },
      recentActivity: {
        recentTenants: recentTenants.map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          plan: tenant.plan,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
          daysSinceCreation: Math.floor((Date.now() - new Date(tenant.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        })),
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          amount: t.amount,
          type: t.type,
          status: t.status,
          date: t.date,
          walletId: t.wallet.id,
          walletName: t.wallet.name,
          walletBalance: t.wallet.balance,
          walletCurrency: t.wallet.currency,
          tenantId: t.wallet.tenant.id,
          tenantName: t.wallet.tenant.name,
          tenantPlan: t.wallet.tenant.plan,
          categoryId: t.category?.id,
          categoryName: t.category?.name,
          categoryType: t.category?.type,
          createdById: t.createdBy?.id,
          createdByName: t.createdBy?.name,
          createdByEmail: t.createdBy?.email,
          createdByRole: t.createdBy?.role,
          createdAt: t.createdAt
        }))
      },
      metrics: {
        tenantsPerDay: totalTenants > 0 ? (totalTenants / 30).toFixed(2) : '0',
        transactionsPerDay: totalTransactions > 0 ? (totalTransactions / 30).toFixed(2) : '0',
        avgWalletsPerTenant: totalTenants > 0 ? (totalWallets / totalTenants).toFixed(2) : '0',
        avgUsersPerTenant: totalTenants > 0 ? (totalUsers / totalTenants).toFixed(2) : '0',
        avgCompaniesPerTenant: totalTenants > 0 ? (totalCompanies / totalTenants).toFixed(2) : '0'
      }
    })
  } catch (error) {
    console.error('Error fetching developer stats:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch system statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
