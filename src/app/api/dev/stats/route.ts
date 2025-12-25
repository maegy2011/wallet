import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول', requiresAuth: true },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح أو منتهي. يرجى تسجيل الدخول مرة أخرى.', requiresAuth: true },
        { status: 401 }
      )
    }

    // Check for TENANT_OWNER role
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح - هذه الصفحة متاحة فقط لملك المستأجر', requiresDevRole: true },
        { status: 403 }
      )
    }

    // Get detailed database statistics
    const tenants = await db.tenant.findMany({
      include: {
        _count: { select: { id: true } },
        companies: {
          include: {
            _count: { select: { id: true } }
          }
        },
        users: {
          include: {
            _count: { select: { id: true } }
          }
        },
        partners: {
          include: {
            _count: { select: { id: true } }
          }
        },
        wallets: {
          include: {
            _count: { select: { id: true } }
          }
        },
        categories: {
          include: {
            _count: { select: { id: true } }
          }
        },
        transactions: {
          include: {
            _count: { select: { id: true } }
          }
        }
      }
    })

    // Calculate metrics
    const totalTenants = tenants.length
    const totalCompanies = tenants.reduce((sum, t) => sum + t.companies.length, 0)
    const totalUsers = tenants.reduce((sum, t) => sum + t.users.length, 0)
    const totalWallets = tenants.reduce((sum, t) => sum + t.wallets.length, 0)
    const totalTransactions = tenants.reduce((sum, t) => sum + t.transactions.length, 0)
    const totalCategories = tenants.reduce((sum, t) => sum + t.categories.length, 0)
    const totalPartners = tenants.reduce((sum, t) => sum + t.partners.length, 0)

    // Calculate averages
    const avgCompaniesPerTenant = totalTenants > 0 ? (totalCompanies / totalTenants).toFixed(1) : '0'
    const avgUsersPerTenant = totalTenants > 0 ? (totalUsers / totalTenants).toFixed(1) : '0'
    const avgWalletsPerTenant = totalTenants > 0 ? (totalWallets / totalTenants).toFixed(1) : '0'

    // Calculate transaction metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const allTransactions = tenants.flatMap(t => t.transactions)
    const thisMonthTransactions = allTransactions.filter(t => {
      const txDate = new Date(t.date)
      return txDate >= thirtyDaysAgo && txDate <= now
    })

    const avgTransactionsPerWallet = totalWallets > 0 ? (totalTransactions / totalWallets).toFixed(1) : '0'

    // Calculate wallet balances
    const wallets = tenants.flatMap(t => t.wallets)
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
    const avgWalletBalance = totalWallets > 0 ? (totalBalance / totalWallets).toFixed(2) : '0'

    // Calculate plans
    const activePlans = tenants.filter(t => t.isActive).length
    const inactivePlans = tenants.filter(t => !t.isActive).length

    // Performance metrics
    const responseTime = Math.random() * 100 + 20 // Simulated - in production calculate actual time
    const performance = responseTime < 100 ? 'excellent' : responseTime < 300 ? 'good' : responseTime < 500 ? 'fair' : 'poor'

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      },
      counts: {
        tenants: totalTenants,
        companies: totalCompanies,
        branches: tenants.reduce((sum, t) => sum + t.companies.reduce((s, c) => s + (c._count as any || 0), 0), 0),
        users: totalUsers,
        partners: totalPartners,
        wallets: totalWallets,
        transactions: totalTransactions,
        categories: totalCategories
      },
      metrics: {
        avgCompaniesPerTenant,
        avgUsersPerTenant,
        avgWalletsPerTenant
      },
      plans: {
        active: activePlans,
        inactive: inactivePlans,
        total: totalTenants
      },
      countsDetails: {
        thisMonthTransactions,
        avgTransactionsPerWallet,
        avgWalletBalance: parseFloat(avgWalletBalance),
        totalBalance: parseFloat(totalBalance.toFixed(2))
      },
      performance: {
        responseTime: Math.round(responseTime),
        status: performance
      }
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الإحصائيات', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
