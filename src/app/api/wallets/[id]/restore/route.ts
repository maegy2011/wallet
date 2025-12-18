import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = await db.wallet.update({
      where: { id: params.id },
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