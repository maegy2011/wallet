import { db } from '@/lib/db'

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        wallet: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Transform the data to include walletName
    const transformedTransactions = transactions.map(transaction => ({
      ...transaction,
      walletName: transaction.wallet.name
    }))

    return Response.json(transformedTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { walletId, type, amount, description } = await request.json()

    if (!walletId || !type || !amount || !description) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
      return Response.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    // Get wallet details for fee calculation
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    })

    if (!wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Calculate transaction fee based on wallet fee type
    let calculatedFee = 0
    switch (wallet.feeType) {
      case 'percentage':
        const feePercentage = wallet.feePercentage || 0
        calculatedFee = (amount * feePercentage) / 100
        break
      case 'perThousand':
        const feePerThousand = wallet.feePerThousand || 0
        calculatedFee = Math.ceil(amount / 1000) * feePerThousand
        break
      case 'fixed':
        calculatedFee = wallet.feePercentage || 0
        break
      default:
        calculatedFee = 0
    }
    
    const maxFeeAmount = wallet.maxFeeAmount || 0
    const minFeeAmount = wallet.minFeeAmount || 0
    let feeAmount = calculatedFee
    
    // Apply maximum fee limit if set
    if (maxFeeAmount > 0 && feeAmount > maxFeeAmount) {
      feeAmount = maxFeeAmount
    }
    
    // Apply minimum fee if set and calculated fee is less than minimum
    if (minFeeAmount > 0 && feeAmount < minFeeAmount) {
      feeAmount = minFeeAmount
    }

    // Get current month and year
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate monthly total for this wallet
    const monthlyTransactions = await db.transaction.findMany({
      where: {
        walletId,
        date: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1)
        }
      }
    })

    const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0) + amount

    // Check if monthly limit would be exceeded (200,000 Egyptian Pounds)
    if (monthlyTotal > 200000) {
      return Response.json({ 
        error: 'Monthly transaction limit of 200,000 Egyptian Pounds would be exceeded' 
      }, { status: 400 })
    }

    // Create the transaction with fee
    const transaction = await db.transaction.create({
      data: {
        walletId,
        type,
        amount: parseFloat(amount),
        feeAmount,
        description
      },
      include: {
        wallet: {
          select: {
            name: true
          }
        }
      }
    })

    // Update wallet balance, totals, and fees earned
    const newBalance = type === 'deposit' 
      ? wallet.balance + amount 
      : wallet.balance - amount

    const newTotalDeposits = type === 'deposit' 
      ? wallet.totalDeposits + amount 
      : wallet.totalDeposits

    const newTotalWithdrawals = type === 'withdrawal' 
      ? wallet.totalWithdrawals + amount 
      : wallet.totalWithdrawals

    const newTotalFeesEarned = wallet.totalFeesEarned + feeAmount

    await db.wallet.update({
      where: { id: walletId },
      data: {
        balance: newBalance,
        totalDeposits: newTotalDeposits,
        totalWithdrawals: newTotalWithdrawals,
        monthlyTransactions: monthlyTotal,
        totalFeesEarned: newTotalFeesEarned
      }
    })

    // Transform response to include walletName
    const transformedTransaction = {
      ...transaction,
      walletName: transaction.wallet.name
    }

    return Response.json(transformedTransaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return Response.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}