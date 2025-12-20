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
        isArchived: false,
        archivedAt: null
      }
    })

    return Response.json(wallet)
  } catch (error) {
    console.error('Error restoring wallet:', error)
    return Response.json({ error: 'Failed to restore wallet' }, { status: 500 })
  }
}