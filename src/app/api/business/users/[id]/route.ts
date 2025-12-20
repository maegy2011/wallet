import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateUserSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  nationalId: z.string().min(14, 'الرقم القومي يجب أن يكون 14 رقم').max(14, 'الرقم القومي يجب أن يكون 14 رقم'),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)
    
    const { username, email, phone, nationalId } = validatedData

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: { id }
    })

    if (!existingUser) {
    const { id } = await params
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Check for duplicates (excluding current user)
    const duplicateUser = await db.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { username },
              { email: email || undefined },
              { phone },
              { nationalId }
            ]
          }
        ]
      }
    })

    if (duplicateUser) {
    const { id } = await params
      return NextResponse.json({ error: 'البيانات المدخلة مستخدمة بالفعل' }, { status: 400 })
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        username,
        email: email || null,
        phone,
        nationalId
      }
    })

    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح',
      user: updatedUser
    })
  } catch (error) {
    const { id } = await params
    if (error instanceof z.ZodError) {
    const { id } = await params
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.issues.map(err => err.message)
      }, { status: 400 })
    }
    
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'فشل في تحديث المستخدم' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: { id }
    })

    if (!existingUser) {
    const { id } = await params
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Delete user (hard delete)
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'تم حذف المستخدم بنجاح'
    })
  } catch (error) {
    const { id } = await params
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'فشل في حذف المستخدم' }, { status: 500 })
  }
}