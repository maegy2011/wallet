import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface PlanConfig {
  basic: {
    monthlyPrice: number
    maxWallets: number
    maxBranches: number
    maxUsers: number
  }
  premium: {
    monthlyPrice: number
    maxWallets: number
    maxBranches: number
    maxUsers: number
  }
  enterprise: {
    monthlyPrice: number
    maxWallets: number
    maxBranches: number
    maxUsers: number
  }
}

const planConfigs: PlanConfig = {
  basic: {
    monthlyPrice: 50,
    maxWallets: 10,
    maxBranches: 5,
    maxUsers: 20
  },
  premium: {
    monthlyPrice: 150,
    maxWallets: 50,
    maxBranches: 20,
    maxUsers: 100
  },
  enterprise: {
    monthlyPrice: 500,
    maxWallets: 999999,
    maxBranches: 999999,
    maxUsers: 999999
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params
    const { plan } = await request.json()

    if (!plan || !planConfigs[plan as keyof PlanConfig]) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      )
    }

    const planConfig = planConfigs[plan as keyof PlanConfig]

    // Update or create subscription
    const subscription = await db.subscription.upsert({
      where: {
        businessAccountId: businessId
      },
      update: {
        plan,
        monthlyPrice: planConfig.monthlyPrice,
        maxWallets: planConfig.maxWallets,
        maxBranches: planConfig.maxBranches,
        maxUsers: planConfig.maxUsers,
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        updatedAt: new Date()
      },
      create: {
        businessAccountId: businessId,
        plan,
        monthlyPrice: planConfig.monthlyPrice,
        maxWallets: planConfig.maxWallets,
        maxBranches: planConfig.maxBranches,
        maxUsers: planConfig.maxUsers,
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Failed to update subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}