import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth/jwt'

export async function DELETE(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول', requiresAuth: true },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح. يرجى تسجيل الدخول مرة أخرى.', requiresAuth: true },
        { status: 401 }
      )
    }

    // Verify TENANT_OWNER role
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح - هذه العملية متاحة فقط لملك المستأجر', requiresDevRole: true },
        { status: 403 }
      )
    }

    const { confirm } = await request.json()
    
    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { error: 'تأكيد مطلوب. قم بتعيين confirm إلى "DELETE_ALL_DATA"' },
        { status: 400 }
      )
    }

    // Delete all data in CORRECT ORDER
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
      // Step 1: Delete all transactions
      deleteResults.transactions = await db.transaction.deleteMany({})
      
      // Step 2: Delete all categories
      deleteResults.categories = await db.category.deleteMany({})
      
      // Step 3: Delete all partners
      deleteResults.partners = await db.partner.deleteMany({})
      
      // Step 4: Delete all users
      try {
        deleteResults.users = await db.user.deleteMany({})
      } catch (error) {
        console.warn('Error deleting users:', error)
      }
      
      // Step 5: Delete all wallets
      try {
        deleteResults.wallets = await db.wallet.deleteMany({})
      } catch (error) {
        console.warn('Error deleting wallets:', error)
      }
      
      // Step 6: Delete all branches
      try {
        deleteResults.branches = await db.branch.deleteMany({})
      } catch (error) {
        console.warn('Error deleting branches:', error)
      }
      
      // Step 7: Delete all companies
      try {
        deleteResults.companies = await db.company.deleteMany({})
      } catch (error) {
        console.warn('Error deleting companies:', error)
      }
      
      // Step 8: Delete all tenants
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
          message: 'بعض البيانات قد تم حذفها. يرجى مراجعة قاعدة البيانات.' 
        },
        { status: 500 }
      )
    }

    // Calculate total deleted records
    const totalDeleted = Object.values(deleteResults).reduce((sum, count) => sum + count, 0)

    // Log the operation
    console.log(`Data deleted by user ${payload.userId} (${payload.email})`, deleteResults)

    return NextResponse.json({
      success: true,
      message: 'تم حذف جميع البيانات بنجاح',
      timestamp: new Date().toISOString(),
      authenticatedUser: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      },
      deleteResults,
      totalDeleted,
      breakdown: deleteResults
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
