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

    // Restore branch (un-soft delete)
    const restoredBranch = await db.branch.update({
      where: { id },
      data: {
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'تم استعادة الفرع بنجاح',
      branch: restoredBranch
    })
  } catch (error) {
    console.error('Error restoring branch:', error)
    return NextResponse.json({ error: 'فشل في استعادة الفرع' }, { status: 500 })
  }
}