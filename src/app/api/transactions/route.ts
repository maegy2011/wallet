import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId')
    const walletId = searchParams.get('walletId')
    const branchId = searchParams.get('branchId')

    const where: any = {}
    if (tenantId) where.tenantId = tenantId
    if (walletId) where.walletId = walletId

    // If filtering by branch, get wallet IDs for that branch
    if (branchId) {
      const branchWallets = await db.wallet.findMany({
        where: { branchId },
        select: { id: true }
      })
      const walletIds = branchWallets.map(w => w.id)
      where.walletId = { in: walletIds }
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        wallet: {
          include: {
            tenant: true,
            branch: true
          }
        },
        category: true,
        createdBy: {
          include: {
            tenant: true,
            company: true,
            branch: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Format transactions
    const formattedTransactions = transactions.map(trans => ({
      ...trans,
      categoryName: trans.category?.name,
      walletName: trans.wallet?.name,
      branchName: trans.wallet?.branch?.name,
      createdByName: trans.createdBy?.name
    }))

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, type, date, walletId, categoryId, status, tags, tenantId, createdById } = body

    // Validate required fields
    if (!title || !amount || !type || !walletId || !tenantId) {
      return NextResponse.json(
        { error: 'Title, amount, type, walletId, and tenantId are required' },
        { status: 400 }
      )
    }

    // Get the wallet
    const wallet = await db.wallet.findUnique({
      where: { id: walletId },
      include: { tenant: true, branch: true }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Verify wallet belongs to the tenant
    if (wallet.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Wallet does not belong to this tenant' },
        { status: 403 }
      )
    }

    // Verify category exists and belongs to tenant if provided
    if (categoryId) {
      const category = await db.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }

      if (category.tenantId !== tenantId) {
        return NextResponse.json(
          { error: 'Category does not belong to this tenant' },
          { status: 403 }
        )
      }
    }

    // Verify user exists and belongs to tenant if provided
    if (createdById) {
      const user = await db.user.findUnique({
        where: { id: createdById }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      if (user.tenantId !== tenantId) {
        return NextResponse.json(
          { error: 'User does not belong to this tenant' },
          { status: 403 }
        )
      }
    }

    // Calculate new balance
    const amountValue = parseFloat(amount.toString())
    let newBalance = wallet.balance

    if (type === 'income') {
      newBalance += amountValue
    } else {
      newBalance -= amountValue
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        title,
        description,
        amount: amountValue,
        type,
        date: date ? new Date(date) : new Date(),
        walletId,
        categoryId,
        status: status || 'completed',
        tags,
        tenantId,
        createdById
      }
    })

    // Update wallet balance
    await db.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance }
    })

    // Return transaction with full info
    const formattedTransaction = await db.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        wallet: {
          include: {
            tenant: true,
            branch: true
          }
        },
        category: true,
        createdBy: {
          include: {
            tenant: true,
            company: true,
            branch: true
          }
        }
      }
    })

    return NextResponse.json({
      ...formattedTransaction,
      categoryName: formattedTransaction?.category?.name,
      walletName: formattedTransaction?.wallet?.name,
      branchName: formattedTransaction?.wallet?.branch?.name,
      createdByName: formattedTransaction?.createdBy?.name
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
