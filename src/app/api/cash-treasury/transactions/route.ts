import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const transactions = await db.cashTreasuryTransaction.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching cash treasury transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch cash treasury transactions' }, { status: 500 })
  }
}