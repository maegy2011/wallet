import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if wallet has transactions
    const transactions = await db.transaction.findMany({
      where: { walletId: params.id }
    })

    if (transactions.length > 0) {
      return Response.json({ 
        error: 'Cannot archive wallet with existing transactions' 
      }, { status: 400 })
    }

    const wallet = await db.wallet.update({
      where: { id: params.id },
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