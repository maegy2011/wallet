import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if branch exists
    const existingBranch = await db.branch.findFirst({
      where: { id }
    })

    if (!existingBranch) {
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
    console.error('Error archiving branch:', error)
    return NextResponse.json({ error: 'فشل في أرشفة الفرع' }, { status: 500 })
  }
}