import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfWeek, endOfWeek, addDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    const dateParam = searchParams.get('date');
    
    if (!walletId || !dateParam) {
      return NextResponse.json({ error: 'Wallet ID and date are required' }, { status: 400 });
    }

    const targetDate = new Date(dateParam);
    
    // Start week on Saturday (6) and end on Friday (5)
    const startOfWeekDate = startOfDay(addDays(targetDate, -((targetDate.getDay() + 1) % 7)));
    const endOfWeekDate = endOfDay(addDays(startOfWeekDate, 6));

    // Get wallet info
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get all transactions up to the start of the week for opening balance
    const previousTransactions = await db.transaction.findMany({
      where: {
        walletId: walletId,
        date: {
          lt: startOfWeekDate
        }
      }
    });

    const previousExpenses = await db.expense.findMany({
      where: {
        walletId: walletId,
        date: {
          lt: startOfWeekDate
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
    }, 0) - previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get transactions for the week
    const weekTransactions = await db.transaction.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startOfWeekDate,
          lte: endOfWeekDate
        }
      }
    });

    // Get expenses for the week
    const weekExpenses = await db.expense.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startOfWeekDate,
          lte: endOfWeekDate
        }
      }
    });

    // Calculate totals
    const totalDeposits = weekTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = weekTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = weekTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
    const totalExpenses = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

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
      transactionCount: weekTransactions.length,
      expenseCount: weekExpenses.length
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return NextResponse.json({ error: 'Failed to generate weekly summary' }, { status: 500 });
  }
}