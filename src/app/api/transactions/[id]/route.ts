import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { walletId, type, amount, description } = await request.json()

    if (!walletId || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون رقماً موجباً' },
        { status: 400 }
      )
    }

    // Get the transaction to be updated
    const existingTransaction = await db.transaction.findUnique({
      where: { id: id }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'الحركة غير موجودة' },
        { status: 404 }
      )
    }

    // Get wallet to calculate fees
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'المحفظة غير موجودة' },
        { status: 404 }
      )
    }

    // Calculate fee based on wallet fee type
    let calculatedFee = 0
    switch (wallet.feeType) {
      case 'percentage':
        const feePercentage = wallet.feePercentage || 0
        calculatedFee = (amountNum * feePercentage) / 100
        break
      case 'perThousand':
        const feePerThousand = wallet.feePerThousand || 0
        calculatedFee = Math.ceil(amountNum / 1000) * feePerThousand
        break
      case 'fixed':
        calculatedFee = wallet.feePercentage || 0
        break
      default:
        calculatedFee = 0
    }
    
    const maxFeeAmount = wallet.maxFeeAmount || 0
    const feeAmount = maxFeeAmount > 0 ? Math.min(calculatedFee, maxFeeAmount) : calculatedFee

    // Update transaction
    const updatedTransaction = await db.transaction.update({
      where: { id: id },
      data: {
        walletId,
        type,
        amount: amountNum,
        feeAmount,
        description,
        date: existingTransaction.date // Keep original date
      }
    })

    // Recalculate wallet balance and total fees
    const allTransactions = await db.transaction.findMany({
      where: { walletId }
    })

    const newBalance = allTransactions.reduce((balance, t) => {
      return t.type === 'deposit' 
        ? balance + t.amount 
        : balance - t.amount
    }, 0)

    const totalFees = allTransactions.reduce((fees, t) => fees + t.feeAmount, 0)

    // Update wallet
    await db.wallet.update({
      where: { id: walletId },
      data: {
        balance: newBalance,
        totalFeesEarned: totalFees
      }
    })

    // If wallet changed, update old wallet balance
    if (existingTransaction.walletId !== walletId) {
      const oldWalletTransactions = await db.transaction.findMany({
        where: { walletId: existingTransaction.walletId }
      })

      const oldWalletBalance = oldWalletTransactions.reduce((balance, t) => {
        return t.type === 'deposit' 
          ? balance + t.amount 
          : balance - t.amount
      }, 0)

      const oldWalletFees = oldWalletTransactions.reduce((fees, t) => fees + t.feeAmount, 0)

      await db.wallet.update({
        where: { id: existingTransaction.walletId },
        data: {
          balance: oldWalletBalance,
          totalFeesEarned: oldWalletFees
        }
      })
    }

    // Get wallet name for response
    const updatedWallet = await db.wallet.findUnique({
      where: { id: walletId },
      select: { name: true }
    })

    const response = {
      ...updatedTransaction,
      walletName: updatedWallet?.name || 'غير معروف'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الحركة' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if transaction exists
    const existingTransaction = await db.transaction.findUnique({
      where: { id: id }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'الحركة غير موجودة' },
        { status: 404 }
      )
    }

    // Delete transaction
    await db.transaction.delete({
      where: { id: id }
    })

    // Recalculate wallet balance and total fees
    const allTransactions = await db.transaction.findMany({
      where: { walletId: existingTransaction.walletId }
    })

    const newBalance = allTransactions.reduce((balance, t) => {
      return t.type === 'deposit' 
        ? balance + t.amount 
        : balance - t.amount
    }, 0)

    const totalFees = allTransactions.reduce((fees, t) => fees + t.feeAmount, 0)

    // Update wallet
    await db.wallet.update({
      where: { id: existingTransaction.walletId },
      data: {
        balance: newBalance,
        totalFeesEarned: totalFees
      }
    })

    return NextResponse.json({ message: 'تم حذف الحركة بنجاح' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الحركة' },
      { status: 500 }
    )
  }
}