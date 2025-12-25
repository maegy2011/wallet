import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const type = searchParams.get('type')

    const where: any = { isActive: true }
    if (tenantId) where.tenantId = tenantId
    if (type) where.type = type

    const categories = await db.category.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, icon, color, tenantId } = body

    // Validate required fields
    if (!name || !type || !tenantId) {
      return NextResponse.json(
        { error: 'Name, type, and tenantId are required' },
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

    // Create category
    const category = await db.category.create({
      data: {
        name,
        description,
        type,
        icon,
        color,
        tenantId
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
