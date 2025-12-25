import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper function to check tenant's plan limits
async function checkTenantPlanLimit(tenantId: string): Promise<{ allowed: boolean; limit?: number; current?: number; plan?: string }> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId }
  })

  if (!tenant) {
    return { allowed: false }
  }

  // Count current wallets
  const currentWallets = await db.wallet.count({
    where: { tenantId, isActive: true }
  })

  // Free plan: max 2 wallets
  if (tenant.plan === 'FREE' && currentWallets >= 2) {
    return {
      allowed: false,
      limit: 2,
      current: currentWallets,
      plan: 'FREE'
    }
  }

  // Merchant plan: unlimited
  return {
    allowed: true,
    plan: tenant.plan,
    current: currentWallets
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const branchId = searchParams.get('branchId')

    const where: any = { isActive: true }
    if (tenantId) where.tenantId = tenantId
    if (branchId) where.branchId = branchId

    const wallets = await db.wallet.findMany({
      where,
      include: {
        tenant: true,
        branch: true,
        company: {
          include: {
            tenant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(wallets)
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, balance, currency, type, icon, color, tenantId, branchId } = body

    // Validate required fields
    if (!name || !tenantId) {
      return NextResponse.json(
        { error: 'Name and tenantId are required' },
        { status: 400 }
      )
    }

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Verify branch exists if provided
    if (branchId) {
      const branch = await db.branch.findUnique({
        where: { id: branchId },
        include: { company: true }
      })

      if (!branch) {
        return NextResponse.json(
          { error: 'Branch not found' },
          { status: 404 }
        )
      }

      // Verify branch belongs to the same tenant
      if (branch.company.tenantId !== tenantId) {
        return NextResponse.json(
          { error: 'Branch does not belong to this tenant' },
          { status: 403 }
        )
      }
    }

    // Check plan limits
    const planCheck = await checkTenantPlanLimit(tenantId)

    if (!planCheck.allowed) {
      return NextResponse.json(
        {
          error: `Plan limit exceeded. Free plan allows maximum ${planCheck.limit} wallets.`,
          plan: planCheck.plan,
          limit: planCheck.limit,
          current: planCheck.current,
          suggestion: 'Upgrade to Merchant plan for unlimited wallets'
        },
        { status: 403 }
      )
    }

    // Create wallet
    const wallet = await db.wallet.create({
      data: {
        name,
        description,
        balance: balance || 0,
        currency: currency || 'USD',
        type: type || 'general',
        icon: icon || 'wallet',
        color: color || 'primary',
        tenantId,
        branchId
      }
    })

    return NextResponse.json({
      ...wallet,
      planInfo: {
        plan: planCheck.plan,
        currentWallets: planCheck.current! + 1
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}
