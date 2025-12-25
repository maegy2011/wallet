import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get detailed database information
    const modelCounts = await Promise.all([
      { model: 'Tenant', count: await db.tenant.count() },
      { model: 'Company', count: await db.company.count() },
      { model: 'Branch', count: await db.branch.count() },
      { model: 'User', count: await db.user.count() },
      { model: 'Partner', count: await db.partner.count() },
      { model: 'Wallet', count: await db.wallet.count() },
      { model: 'Category', count: await db.category.count() },
      { model: 'Transaction', count: await db.transaction.count() }
    ])

    // Get connection pool info
    const connectionInfo = {
      provider: 'sqlite',
      url: 'file:./prisma/dev.db',
      poolStatus: 'active',
      connections: 1 // SQLite is single-file, so 1 connection
    }

    return NextResponse.json({
      provider: 'sqlite',
      version: '3.x',
      models: modelCounts,
      totalRecords: modelCounts.reduce((sum, m) => sum + m.count, 0),
      connection: connectionInfo,
      lastChecked: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching database info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { confirm } = await request.json()
    
    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { error: 'Confirmation required. Set confirm to "DELETE_ALL_DATA"' },
        { status: 400 }
      )
    }

    // Delete all data in CORRECT ORDER to respect foreign key constraints
    // The order is based on relationships in Prisma schema
    const deleteResults = {
      transactions: 0,
      categories: 0,
      partners: 0,
      users: 0,
      wallets: 0,
      branches: 0,
      companies: 0,
      tenants: 0
    }

    try {
      // Step 1: Delete all transactions (no dependencies)
      deleteResults.transactions = await db.transaction.deleteMany({})
      
      // Step 2: Delete all categories (no dependencies)
      deleteResults.categories = await db.category.deleteMany({})
      
      // Step 3: Delete all partners (no dependencies)
      deleteResults.partners = await db.partner.deleteMany({})
      
      // Step 4: Delete all users (depends on companies/branches/tenants)
      try {
        deleteResults.users = await db.user.deleteMany({})
      } catch (error) {
        console.warn('Error deleting users:', error)
      }
      
      // Step 5: Delete all wallets (depends on companies/branches/tenants)
      try {
        deleteResults.wallets = await db.wallet.deleteMany({})
      } catch (error) {
        console.warn('Error deleting wallets:', error)
      }
      
      // Step 6: Delete all branches (depends on companies/tenants)
      try {
        deleteResults.branches = await db.branch.deleteMany({})
      } catch (error) {
        console.warn('Error deleting branches:', error)
      }
      
      // Step 7: Delete all companies (depends on tenants)
      try {
        deleteResults.companies = await db.company.deleteMany({})
      } catch (error) {
        console.warn('Error deleting companies:', error)
      }
      
      // Step 8: Delete all tenants (no dependencies now)
      try {
        deleteResults.tenants = await db.tenant.deleteMany({})
      } catch (error) {
        console.warn('Error deleting tenants:', error)
      }
      
    } catch (error) {
      console.error('Error during deletion process:', error)
      return NextResponse.json(
        { 
          error: 'Failed to delete data', 
          details: error instanceof Error ? error.message : 'Unknown error',
          deleteResults,
          message: 'Some data may have been deleted. Please check the database.' 
        },
        { status: 500 }
      )
    }

    // Calculate total deleted records
    const totalDeleted = Object.values(deleteResults).reduce((sum, count) => sum + count, 0)

    return NextResponse.json({
      success: true,
      message: 'All data deleted successfully',
      timestamp: new Date().toISOString(),
      deleteResults,
      totalDeleted,
      breakdown: {
        transactions: deleteResults.transactions,
        categories: deleteResults.categories,
        partners: deleteResults.partners,
        users: deleteResults.users,
        wallets: deleteResults.wallets,
        branches: deleteResults.branches,
        companies: deleteResults.companies,
        tenants: deleteResults.tenants
      }
    })
  } catch (error) {
    console.error('Error clearing database:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear database', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
