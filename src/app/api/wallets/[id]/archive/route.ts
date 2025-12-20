import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const wallet = await db.wallet.update({
      where: { id: id },
      data: {
        isArchived: true,
        archivedAt: new Date()
      }
    })

    return Response.json(wallet)
  } catch (error) {
    console.error('Error archiving wallet:', error)
    return Response.json({ error: 'Failed to archive wallet' }, { status: 500 })
  }
}