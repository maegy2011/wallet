import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE() {
  try {
    // Delete all transactions first (due to foreign key constraint)
    await db.transaction.deleteMany()
    
    // Delete all wallets
    await db.wallet.deleteMany()
    
    return NextResponse.json({ message: 'All data cleared successfully' })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}