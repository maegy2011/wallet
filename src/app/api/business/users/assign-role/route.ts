import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const assignRoleSchema = z.object({
  userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  businessAccountId: z.string().min(1, 'معرف المنشأة التجارية مطلوب'),
  roleId: z.string().min(1, 'معرف الدور مطلوب'),
  branchId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = assignRoleSchema.parse(body)
    
    const { userId, businessAccountId, roleId, branchId } = validatedData

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Check if role exists
    const existingRole = await db.role.findFirst({
      where: { id: roleId }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'الدور غير موجود' }, { status: 404 })
    }

    // Check if user is linked to business
    const userBusinessAccount = await db.userBusinessAccount.findFirst({
      where: {
        userId,
        businessAccountId,
        isActive: true
      }
    })

    if (!userBusinessAccount) {
      return NextResponse.json({ error: 'المستخدم غير مرتبط بهذه المنشأة' }, { status: 400 })
    }

    // Check if branch exists and belongs to business
    if (branchId) {
      const branch = await db.branch.findFirst({
        where: { 
          id: branchId,
          businessAccountId,
          isActive: true
        }
      })

      if (!branch) {
        return NextResponse.json({ error: 'الفرع غير موجود أو لا ينتم لهذه المنشأة' }, { status: 400 })
      }
    }

    // Remove existing roles for this user/business/branch combination
    await db.userRole.deleteMany({
      where: {
        userId,
        businessAccountId,
        ...(branchId ? { branchId } : {})
      }
    })

    // Create new role assignment
    const userRole = await db.userRole.create({
      data: {
        userId,
        roleId,
        businessAccountId,
        branchId: branchId || null,
        isActive: true,
        assignedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'تم تعيين الصلاحيات بنجاح',
      userRole: {
        id: userRole.id,
        userId: userRole.userId,
        roleId: userRole.roleId,
        businessAccountId: userRole.businessAccountId,
        branchId: userRole.branchId,
        role: existingRole,
        branch: branchId ? await db.branch.findFirst({ where: { id: branchId } }) : null
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.issues.map(err => err.message)
      }, { status: 400 })
    }
    
    console.error('Error assigning role:', error)
    return NextResponse.json({ error: 'فشل في تعيين الصلاحيات' }, { status: 500 })
  }
}