import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Get total businesses
    const totalBusinesses = await db.businessAccount.count()
    
    // Get active subscriptions
    const activeSubscriptions = await db.subscription.count({
      where: {
        status: 'active'
      }
    })
    
    // Calculate total monthly revenue
    const subscriptions = await db.subscription.findMany({
      where: {
        status: 'active'
      }
    })
    
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.monthlyPrice, 0)
    
    // Get new subscriptions this month
    const newSubscriptionsThisMonth = await db.subscription.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })
    
    // Get plans distribution
    const plansDistribution = await db.subscription.groupBy({
      by: ['plan'],
      where: {
        status: 'active'
      },
      _count: {
        plan: true
      }
    })
    
    const distribution = {
      basic: 0,
      premium: 0,
      enterprise: 0
    }
    
    plansDistribution.forEach(item => {
      distribution[item.plan as keyof typeof distribution] = item._count.plan
    })

    const stats = {
      totalBusinesses,
      activeSubscriptions,
      totalRevenue,
      newSubscriptionsThisMonth,
      plansDistribution: distribution
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}