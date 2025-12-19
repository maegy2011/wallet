import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { fromWalletId, toWalletId, amount, description, fromCashTreasury, toCashTreasury } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transfer amount' }, { status: 400 })
    }

    if (!fromWalletId && !fromCashTreasury) {
      return NextResponse.json({ error: 'Transfer source is required' }, { status: 400 })
    }

    if (!toWalletId && !toCashTreasury) {
      return NextResponse.json({ error: 'Transfer destination is required' }, { status: 400 })
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

    if (fromCashTreasury && cashTreasury.balance < amount) {
      return NextResponse.json({ error: 'Insufficient cash treasury balance' }, { status: 400 })
    }

    if (fromWalletId) {
      const fromWallet = await db.wallet.findUnique({
        where: { id: fromWalletId }
      })
      
      if (!fromWallet || fromWallet.balance < amount) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
      }
    }

    const transfer = await db.transfer.create({
      data: {
        fromWalletId,
        toWalletId,
        fromCashTreasury: !!fromCashTreasury,
        toCashTreasury: !!toCashTreasury,
        amount,
        description: description || 'تحويل أموال',
        cashTreasuryId: cashTreasury.id
      }
    })

    if (fromWalletId) {
      await db.wallet.update({
        where: { id: fromWalletId },
        data: {
          balance: {
            decrement: amount
          }
        }
      })
    }

    if (toWalletId) {
      await db.wallet.update({
        where: { id: toWalletId },
        data: {
          balance: {
            increment: amount
          }
        }
      })
    }

    let newCashTreasuryBalance = cashTreasury.balance
    
    if (fromCashTreasury) {
      newCashTreasuryBalance -= amount
      await db.cashTreasuryTransaction.create({
        data: {
          type: 'transfer_out',
          amount,
          description: description || 'تحويل من خزينة الكاش',
          referenceId: toWalletId,
          cashTreasuryId: cashTreasury.id
        }
      })
    }

    if (toCashTreasury) {
      newCashTreasuryBalance += amount
      await db.cashTreasuryTransaction.create({
        data: {
          type: 'transfer_in',
          amount,
          description: description || 'تحويل إلى خزينة الكاش',
          referenceId: fromWalletId,
          cashTreasuryId: cashTreasury.id
        }
      })
    }

    if (newCashTreasuryBalance !== cashTreasury.balance) {
      await db.cashTreasury.update({
        where: { id: cashTreasury.id },
        data: {
          balance: newCashTreasuryBalance,
          totalDeposits: toCashTreasury ? cashTreasury.totalDeposits + amount : cashTreasury.totalDeposits,
          totalWithdrawals: fromCashTreasury ? cashTreasury.totalWithdrawals + amount : cashTreasury.totalWithdrawals
        }
      })
    }

    return NextResponse.json(transfer)
  } catch (error) {
    console.error('Error processing transfer:', error)
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const transfers = await db.transfer.findMany({
      include: {
        fromWallet: {
          select: {
            id: true,
            name: true,
            mobileNumber: true
          }
        },
        toWallet: {
          select: {
            id: true,
            name: true,
            mobileNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
  }
}