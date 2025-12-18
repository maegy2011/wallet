import { db } from '@/lib/db'

export async function GET() {
  try {
    const wallets = await db.wallet.findMany({
      include: {
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json(wallets)
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return Response.json({ error: 'Failed to fetch wallets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, mobileNumber, logo, feeType, feePercentage, feePerThousand, maxFeeAmount } = await request.json()

    if (!name || !mobileNumber) {
      return Response.json({ error: 'Name and mobile number are required' }, { status: 400 })
    }

    const wallet = await db.wallet.create({
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
    console.error('Error creating wallet:', error)
    return Response.json({ error: 'Failed to create wallet' }, { status: 500 })
  }
}