import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    const dateParam = searchParams.get('date');
    
    if (!walletId || !dateParam) {
      return NextResponse.json({ error: 'Wallet ID and date are required' }, { status: 400 });
    }

    const targetDate = new Date(dateParam);
    const startDate = startOfDay(targetDate);
    const endDate = endOfDay(targetDate);

    // Get wallet info
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get all transactions up to the start of the day for opening balance
    const previousTransactions = await db.transaction.findMany({
      where: {
        walletId: walletId,
        date: {
          lt: startDate
        }
      }
    });

    const previousExpenses = await db.expense.findMany({
      where: {
        walletId: walletId,
        date: {
          lt: startDate
        }
      }
    });

    // Calculate opening balance
    const openingBalance = previousTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'deposit') {
        return sum + transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        return sum - transaction.amount;
      }
      return sum;
    }, wallet.balance) - previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get transactions for the day
    const dayTransactions = await db.transaction.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get expenses for the day
    const dayExpenses = await db.expense.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate totals
    const totalDeposits = dayTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = dayTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = dayTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netChange = totalDeposits - totalWithdrawals - totalFees - totalExpenses;
    const closingBalance = openingBalance + netChange;

    const summary = {
      openingBalance,
      closingBalance,
      totalDeposits,
      totalWithdrawals,
      totalFees,
      totalExpenses,
      netChange,
      transactionCount: dayTransactions.length,
      expenseCount: dayExpenses.length
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return NextResponse.json({ error: 'Failed to generate daily summary' }, { status: 500 });
  }
}