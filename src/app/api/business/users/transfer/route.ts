import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const transferUserSchema = z.object({
  userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  fromBranchId: z.string().optional(),
  toBranchId: z.string().min(1, 'معرف الفرع المستهدف مطلوب'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = transferUserSchema.parse(body)
    
    const { userId, fromBranchId, toBranchId } = validatedData

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Check if target branch exists
    const targetBranch = await db.branch.findFirst({
      where: { 
        id: toBranchId,
        isActive: true
      }
    })

    if (!targetBranch) {
      return NextResponse.json({ error: 'الفرع المستهدف غير موجود' }, { status: 404 })
    }

    // Check if target branch belongs to same business as user's current role
    const userRole = await db.userRole.findFirst({
      where: {
        userId,
        isActive: true
      },
      include: {
        businessAccount: true,
        branch: true
      }
    })

    if (!userRole || userRole.businessAccount.id !== targetBranch.businessAccountId) {
      return NextResponse.json({ error: 'لا يمكن نقل المستخدم إلى فرع منشأة مختلفة' }, { status: 400 })
    }

    // Remove existing role assignment for old branch
    if (fromBranchId) {
      await db.userRole.deleteMany({
        where: {
          userId,
          branchId: fromBranchId
        }
      })
    }

    // Create new role assignment for target branch
    const newUserRole = await db.userRole.create({
      data: {
        userId,
        roleId: userRole.roleId,
        businessAccountId: userRole.businessAccountId,
        branchId: toBranchId,
        isActive: true,
        assignedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'تم نقل المستخدم بنجاح',
      transfer: {
        userId,
        fromBranchId,
        toBranchId,
        fromBranch: fromBranchId ? await db.branch.findFirst({ where: { id: fromBranchId } }) : null,
        toBranch: targetBranch
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.errors.map(err => err.message)
      }, { status: 400 })
    }
    
    console.error('Error transferring user:', error)
    return NextResponse.json({ error: 'فشل في نقل المستخدم' }, { status: 500 })
  }
}