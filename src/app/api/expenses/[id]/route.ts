import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;

    // Get the expense to refund the amount
    const expense = await db.expense.findUnique({
      where: { id: expenseId }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Get the wallet to update its balance
    const wallet = await db.wallet.findUnique({
      where: { id: expense.walletId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Delete expense and update wallet balance in a transaction
    await db.$transaction(async (tx) => {
      // Delete the expense
      await tx.expense.delete({
        where: { id: expenseId }
      });

      // Update wallet balance (add back the expense amount)
      await tx.wallet.update({
        where: { id: expense.walletId },
        data: {
          balance: wallet.balance + expense.amount
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}