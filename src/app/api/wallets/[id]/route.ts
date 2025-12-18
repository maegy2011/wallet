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