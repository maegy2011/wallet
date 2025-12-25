import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const companyId = searchParams.get('companyId')

    const where: any = {}
    if (tenantId) {
      where.company = { tenantId }
    }
    if (companyId) {
      where.companyId = companyId
    }

    const branches = await db.branch.findMany({
      where,
      include: {
        company: {
          include: {
            tenant: true
          }
        },
        users: true,
        wallets: true,
        _count: {
          select: {
            users: true,
            wallets: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, companyId } = body

    // Validate required fields
    if (!name || !companyId) {
      return NextResponse.json(
        { error: 'Name and companyId are required' },
        { status: 400 }
      )
    }

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: { tenant: true }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Create branch
    const branch = await db.branch.create({
      data: {
        name,
        address,
        phone,
        companyId
      }
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    )
  }
}
