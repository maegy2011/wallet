import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, getQuarter } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    const dateParam = searchParams.get('date');
    
    if (!walletId || !dateParam) {
      return NextResponse.json({ error: 'Wallet ID and date are required' }, { status: 400 });
    }

    const targetDate = new Date(dateParam);
    const quarter = getQuarter(targetDate);
    const year = targetDate.getFullYear();
    
    // Calculate quarter start and end dates
    const quarterStartMonth = (quarter - 1) * 3;
    const startDate = startOfDay(startOfMonth(new Date(year, quarterStartMonth)));
    const endDate = endOfDay(endOfMonth(new Date(year, quarterStartMonth + 2)));

    // Get wallet info
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get all transactions up to the start of the quarter for opening balance
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
    }, 0) - previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get transactions for the quarter
    const quarterTransactions = await db.transaction.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get expenses for the quarter
    const quarterExpenses = await db.expense.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate totals
    const totalDeposits = quarterTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = quarterTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = quarterTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
    const totalExpenses = quarterExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netChange = totalDeposits - totalWithdrawals - totalFees - totalExpenses;
    const closingBalance = openingBalance + netChange;

    // Calculate monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 0; month < 3; month++) {
      const monthDate = new Date(year, quarterStartMonth + month);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = quarterTransactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      const monthExpenses = quarterExpenses.filter(e => 
        e.date >= monthStart && e.date <= monthEnd
      );

      const monthDeposits = monthTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthWithdrawals = monthTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthFees = monthTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
      const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      monthlyBreakdown.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        totalDeposits: monthDeposits,
        totalWithdrawals: monthWithdrawals,
        totalFees: monthFees,
        totalExpenses: monthExpenseTotal,
        netChange: monthDeposits - monthWithdrawals - monthFees - monthExpenseTotal,
        transactionCount: monthTransactions.length,
        expenseCount: monthExpenses.length
      });
    }

    const summary = {
      quarter,
      year,
      startDate,
      endDate,
      openingBalance,
      closingBalance,
      totalDeposits,
      totalWithdrawals,
      totalFees,
      totalExpenses,
      netChange,
      transactionCount: quarterTransactions.length,
      expenseCount: quarterExpenses.length,
      monthlyBreakdown
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating quarterly summary:', error);
    return NextResponse.json({ error: 'Failed to generate quarterly summary' }, { status: 500 });
  }
}