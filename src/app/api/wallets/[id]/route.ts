import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, mobileNumber, logo, feeType, feePercentage, feePerThousand, maxFeeAmount } = await request.json()

    if (!name || !mobileNumber) {
      return Response.json({ error: 'Name and mobile number are required' }, { status: 400 })
    }

    // Check if mobile number already exists for other non-archived wallets
    const existingWallet = await db.wallet.findFirst({
      where: {
        mobileNumber,
        isArchived: false,
        NOT: {
          id: params.id
        }
      }
    })

    if (existingWallet) {
      return Response.json({ error: 'Mobile number already exists' }, { status: 400 })
    }

    const wallet = await db.wallet.update({
      where: { id: params.id },
      data: {
        name,
        mobileNumber,
        logo: logo || null,
        feeType: feeType || 'percentage',
        feePercentage: feePercentage || 0,
        feePerThousand: feePerThousand || 0,
        maxFeeAmount: maxFeeAmount || 0
      }
    })

    return Response.json(wallet)
  } catch (error) {
    console.error('Error updating wallet:', error)
    return Response.json({ error: 'Failed to update wallet' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if wallet has transactions
    const wallet = await db.wallet.findUnique({
      where: { id: params.id },
      include: {
        transactions: true
      }
    })

    if (!wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (wallet.transactions.length > 0) {
      return Response.json({ error: 'Cannot delete wallet with transactions' }, { status: 400 })
    }

    // Delete the wallet
    await db.wallet.delete({
      where: { id: params.id }
    })

    return Response.json({ message: 'Wallet deleted successfully' })
  } catch (error) {
    console.error('Error deleting wallet:', error)
    return Response.json({ error: 'Failed to delete wallet' }, { status: 500 })
  }
}