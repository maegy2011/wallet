import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const companyId = searchParams.get('companyId')
    const branchId = searchParams.get('branchId')
    const role = searchParams.get('role')

    const where: any = {}
    if (tenantId) where.tenantId = tenantId
    if (companyId) where.companyId = companyId
    if (branchId) where.branchId = branchId
    if (role) where.role = role

    const users = await db.user.findMany({
      where,
      include: {
        tenant: true,
        company: true,
        branch: true,
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, role, tenantId, companyId, branchId } = body

    // Validate required fields
    if (!email || !tenantId || !role) {
      return NextResponse.json(
        { error: 'Email, tenantId, and role are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
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

    // Verify company exists if provided
    if (companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId }
      })
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }
    }

    // Verify branch exists if provided
    if (branchId) {
      const branch = await db.branch.findUnique({
        where: { id: branchId }
      })
      if (!branch) {
        return NextResponse.json(
          { error: 'Branch not found' },
          { status: 404 }
        )
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        role,
        tenantId,
        companyId,
        branchId
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
