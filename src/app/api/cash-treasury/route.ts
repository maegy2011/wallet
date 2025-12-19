import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let cashTreasury = await db.cashTreasury.findFirst()
    
    if (!cashTreasury) {
      cashTreasury = await db.cashTreasury.create({
        data: {
          balance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0
        }
      })
    }

    return NextResponse.json(cashTreasury)
  } catch (error) {
    console.error('Error fetching cash treasury:', error)
    return NextResponse.json({ error: 'Failed to fetch cash treasury' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, amount, description } = await request.json()

    if (!type || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transaction data' }, { status: 400 })
    }

    let cashTreasury = await db.cashTreasury.findFirst()
    
    if (!cashTreasury) {
      cashTreasury = await db.cashTreasury.create({
        data: {
          balance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0
        }
      })
    }

    const transactionType = type === 'deposit' ? 'deposit' : 'withdrawal'
    
    if (transactionType === 'withdrawal' && cashTreasury.balance < amount) {
      return NextResponse.json({ error: 'Insufficient cash treasury balance' }, { status: 400 })
    }

    const newBalance = transactionType === 'deposit' 
      ? cashTreasury.balance + amount 
      : cashTreasury.balance - amount

    const updatedCashTreasury = await db.cashTreasury.update({
      where: { id: cashTreasury.id },
      data: {
        balance: newBalance,
        totalDeposits: transactionType === 'deposit' 
          ? cashTreasury.totalDeposits + amount 
          : cashTreasury.totalDeposits,
        totalWithdrawals: transactionType === 'withdrawal' 
          ? cashTreasury.totalWithdrawals + amount 
          : cashTreasury.totalWithdrawals
      }
    })

    await db.cashTreasuryTransaction.create({
      data: {
        type: transactionType,
        amount,
        description: description || `${transactionType === 'deposit' ? 'إيداع' : 'سحب'} في خزينة الكاش`,
        cashTreasuryId: cashTreasury.id
      }
    })

    return NextResponse.json(updatedCashTreasury)
  } catch (error) {
    console.error('Error updating cash treasury:', error)
    return NextResponse.json({ error: 'Failed to update cash treasury' }, { status: 500 })
  }
}