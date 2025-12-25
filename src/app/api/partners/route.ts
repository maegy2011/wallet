import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')

    const where = tenantId ? { tenantId } : {}

    const partners = await db.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(partners)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, role, notes, tenantId } = body

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

    // Create partner
    const partner = await db.partner.create({
      data: {
        name,
        email,
        phone,
        company,
        role,
        notes,
        tenantId
      }
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}
