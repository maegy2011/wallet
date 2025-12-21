import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const businesses = await db.businessAccount.findMany({
      include: {
        subscription: true,
        branches: true,
        _count: {
          select: {
            branches: true,
            userBusinessAccounts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend interface
    const transformedBusinesses = businesses.map(business => ({
      ...business,
      _count: {
        branches: business._count.branches,
        users: business._count.userBusinessAccounts,
        wallets: 0 // Placeholder for now - will be implemented later
      }
    }))

    return NextResponse.json(transformedBusinesses)
  } catch (error) {
    console.error('Failed to fetch businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}