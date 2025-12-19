import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');
    
    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    const expenses = await db.expense.findMany({
      where: {
        walletId: walletId
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletId, category, amount, description, date } = body;

    if (!walletId || !category || !amount || !description || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the wallet to update its balance
    const wallet = await db.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Create expense and update wallet balance in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the expense
      const expense = await tx.expense.create({
        data: {
          walletId,
          category,
          amount: parseFloat(amount),
          description,
          date: new Date(date)
        }
      });

      // Update wallet balance (subtract expense amount)
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: wallet.balance - parseFloat(amount)
        }
      });

      return expense;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}