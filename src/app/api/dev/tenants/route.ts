import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const plan = searchParams.get('plan')
    const active = searchParams.get('active')

    const where: any = {}
    if (plan) where.plan = plan
    if (active) where.isActive = active === 'true'

    const tenants = await db.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            companies: true,
            users: true,
            wallets: true,
            branches: true,
            transactions: true
          }
        },
        companies: {
          select: {
            id: true,
            name: true
          }
        },
        wallets: {
          select: {
            id: true,
            name: true,
            balance: true,
            currency: true
          },
          orderBy: { balance: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error fetching tenants for dev:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isActive, plan } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (plan) updateData.plan = plan

    const tenant = await db.tenant.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    await db.tenant.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}
