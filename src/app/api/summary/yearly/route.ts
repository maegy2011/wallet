import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    const dateParam = searchParams.get('date');
    
    if (!walletId || !dateParam) {
      return NextResponse.json({ error: 'Wallet ID and date are required' }, { status: 400 });
    }

    const targetDate = new Date(dateParam);
    const year = targetDate.getFullYear();
    
    // Calculate year start and end dates
    const startDate = startOfDay(startOfMonth(new Date(year, 0, 1)));
    const endDate = endOfDay(endOfMonth(new Date(year, 11, 31)));

    // Get wallet info
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get all transactions up to the start of the year for opening balance
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

    // Get transactions for the year
    const yearTransactions = await db.transaction.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get expenses for the year
    const yearExpenses = await db.expense.findMany({
      where: {
        walletId: walletId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate totals
    const totalDeposits = yearTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = yearTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = yearTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
    const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netChange = totalDeposits - totalWithdrawals - totalFees - totalExpenses;
    const closingBalance = openingBalance + netChange;

    // Calculate monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = yearTransactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      const monthExpenses = yearExpenses.filter(e => 
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
        month: monthDate.toLocaleString('default', { month: 'short' }),
        totalDeposits: monthDeposits,
        totalWithdrawals: monthWithdrawals,
        totalFees: monthFees,
        totalExpenses: monthExpenseTotal,
        netChange: monthDeposits - monthWithdrawals - monthFees - monthExpenseTotal,
        transactionCount: monthTransactions.length,
        expenseCount: monthExpenses.length
      });
    }

    // Calculate quarterly breakdown
    const quarterlyBreakdown = [];
    for (let quarter = 0; quarter < 4; quarter++) {
      const quarterStartMonth = quarter * 3;
      const quarterStart = startOfMonth(new Date(year, quarterStartMonth));
      const quarterEnd = endOfMonth(new Date(year, quarterStartMonth + 2));

      const quarterTransactions = yearTransactions.filter(t => 
        t.date >= quarterStart && t.date <= quarterEnd
      );
      const quarterExpenses = yearExpenses.filter(e => 
        e.date >= quarterStart && e.date <= quarterEnd
      );

      const quarterDeposits = quarterTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      const quarterWithdrawals = quarterTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      const quarterFees = quarterTransactions.reduce((sum, t) => sum + t.feeAmount, 0);
      const quarterExpenseTotal = quarterExpenses.reduce((sum, e) => sum + e.amount, 0);

      quarterlyBreakdown.push({
        quarter: quarter + 1,
        totalDeposits: quarterDeposits,
        totalWithdrawals: quarterWithdrawals,
        totalFees: quarterFees,
        totalExpenses: quarterExpenseTotal,
        netChange: quarterDeposits - quarterWithdrawals - quarterFees - quarterExpenseTotal,
        transactionCount: quarterTransactions.length,
        expenseCount: quarterExpenses.length
      });
    }

    const summary = {
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
      transactionCount: yearTransactions.length,
      expenseCount: yearExpenses.length,
      monthlyBreakdown,
      quarterlyBreakdown
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating yearly summary:', error);
    return NextResponse.json({ error: 'Failed to generate yearly summary' }, { status: 500 });
  }
}