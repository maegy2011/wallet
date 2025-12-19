import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Toggle user status
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        isActive: !existingUser.isActive
      }
    })

    return NextResponse.json({
      message: `تم ${existingUser.isActive ? 'تعطيل' : 'تفعيل'} المستخدم بنجاح`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json({ error: 'فشل في تحديث حالة المستخدم' }, { status: 500 })
  }
}