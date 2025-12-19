import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

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
    const { name, mobileNumber, logo, monthlyLimit, dailyLimit, minBalanceAlert, feeType, feePercentage, feePerThousand, maxFeeAmount, minFeeAmount } = await request.json()

    if (!name || !mobileNumber) {
      return Response.json({ error: 'Name and mobile number are required' }, { status: 400 })
    }

    // Check if mobile number already exists for non-archived wallets
    const existingWallet = await db.wallet.findFirst({
      where: {
        mobileNumber,
        isArchived: false
      }
    })

    if (existingWallet) {
      return Response.json({ error: 'Mobile number already exists' }, { status: 400 })
    }

    const wallet = await db.wallet.create({
      data: {
        uuid: uuidv4(),
        name,
        mobileNumber,
        logo: logo || null,
        monthlyLimit: monthlyLimit || 200000,
        dailyLimit: dailyLimit || 60000,
        minBalanceAlert: minBalanceAlert || 1000,
        feeType: feeType || 'percentage',
        feePercentage: feePercentage || 0,
        feePerThousand: feePerThousand || 0,
        maxFeeAmount: maxFeeAmount || 0,
        minFeeAmount: minFeeAmount || 0
      }
    })

    return Response.json(wallet)
  } catch (error) {
    console.error('Error creating wallet:', error)
    return Response.json({ error: 'Failed to create wallet' }, { status: 500 })
  }
}