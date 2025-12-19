import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessAccountId = searchParams.get('businessAccountId')

    if (!businessAccountId) {
      return NextResponse.json({ error: 'معرف المنشأة التجارية مطلوب' }, { status: 400 })
    }

    const roles = await db.role.findMany({
      where: {
        userRoles: {
          some: {
            businessAccountId: businessAccountId,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'فشل في جلب الأدوار' }, { status: 500 })
  }
}