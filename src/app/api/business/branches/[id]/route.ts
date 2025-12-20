import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateBranchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const body = await request.json()
    const validatedData = updateBranchSchema.parse(body)
    
    const { name, address, phone, email } = validatedData

    // Check if branch exists
    const existingBranch = await db.branch.findFirst({
      where: { id }
    })

    if (!existingBranch) {
    const { id } = await params
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
    }

    // Update branch
    const updatedBranch = await db.branch.update({
      where: { id },
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
      },
      include: {
        businessAccount: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'تم تحديث الفرع بنجاح',
      branch: updatedBranch
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
    
    console.error('Error updating branch:', error)
    return NextResponse.json({ error: 'فشل في تحديث الفرع' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {

    // Check if branch exists
    const existingBranch = await db.branch.findFirst({
      where: { id }
    })

    if (!existingBranch) {
    const { id } = await params
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 })
    }

    // Archive branch (soft delete)
    const archivedBranch = await db.branch.update({
      where: { id },
      data: {
        isActive: false
      }
    })

    return NextResponse.json({
      message: 'تم أرشفة الفرع بنجاح',
      branch: archivedBranch
    })
  } catch (error) {
    const { id } = await params
    console.error('Error archiving branch:', error)
    return NextResponse.json({ error: 'فشل في أرشفة الفرع' }, { status: 500 })
  }
}