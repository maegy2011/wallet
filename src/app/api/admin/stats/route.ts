import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'مطلوب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
    }
    
    // Get current date and start of day
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Get statistics
    const [
      totalUsers,
      activeUsers,
      totalAccounts,
      activeAccounts,
      totalBalance,
      todayTransactions,
      totalTransactions
    ] = await Promise.all([
      // Total users
      db.user.count(),
      
      // Active users
      db.user.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Total accounts
      db.account.count(),
      
      // Active accounts
      db.account.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Total balance across all active accounts
      db.account.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { balance: true }
      }),
      
      // Today's transactions
      db.transaction.count({
        where: {
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      
      // Total transactions
      db.transaction.count()
    ])
    
    // Get user growth for the last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const userGrowth = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // Get transaction stats by type
    const transactionStats = await db.transaction.groupBy({
      by: ['type'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })
    
    // Get account stats by type
    const accountStats = await db.account.groupBy({
      by: ['accountType'],
      _count: {
        id: true
      },
      where: {
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          growth: userGrowth
        },
        accounts: {
          total: totalAccounts,
          active: activeAccounts,
          byType: accountStats
        },
        balance: {
          total: totalBalance._sum.balance || 0,
          average: totalAccounts > 0 ? (totalBalance._sum.balance || 0) / activeAccounts : 0
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions,
          byType: transactionStats
        }
      }
    })
    
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    )
  }
}