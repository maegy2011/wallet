import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')

    const where = tenantId ? { tenantId } : {}

    const companies = await db.company.findMany({
      where,
      include: {
        tenant: true,
        branches: true,
        users: true,
        _count: {
          select: {
            branches: true,
            users: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, taxId, tenantId } = body

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

    // Create company
    const company = await db.company.create({
      data: {
        name,
        description,
        taxId,
        tenantId
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
