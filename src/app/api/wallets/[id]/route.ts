import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const wallet = await db.wallet.findUnique({
      where: {
        id: id
      }
    })

    if (!wallet) {
    const { id } = await params
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    return NextResponse.json(wallet)
  } catch (error) {
    const { id } = await params
    console.error('Error fetching wallet:', error)
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const body = await request.json()
    const {
      name,
      mobileNumber,
      logo,
      monthlyLimit,
      dailyLimit,
      minBalanceAlert,
      feeType,
      feePercentage,
      feePerThousand,
      maxFeeAmount,
      minFeeAmount
    } = body

    // Check if wallet exists
    const existingWallet = await db.wallet.findUnique({
      where: { id: id }
    })

    if (!existingWallet) {
    const { id } = await params
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Check for duplicate mobile number (excluding current wallet)
    const duplicateWallet = await db.wallet.findFirst({
      where: {
        mobileNumber,
        id: { not: id },
        isArchived: false
      }
    })

    if (duplicateWallet) {
    const { id } = await params
      return NextResponse.json({ error: 'Mobile number already exists' }, { status: 400 })
    }

    const updatedWallet = await db.wallet.update({
      where: {
        id: id
      },
      data: {
        name,
        mobileNumber,
        logo,
        monthlyLimit: monthlyLimit || 200000,
        dailyLimit: dailyLimit || 60000,
        minBalanceAlert: minBalanceAlert || 1000,
        feeType,
        feePercentage: feePercentage || 0,
        feePerThousand: feePerThousand || 0,
        maxFeeAmount: maxFeeAmount || 0,
        minFeeAmount: minFeeAmount || 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedWallet)
  } catch (error) {
    const { id } = await params
    console.error('Error updating wallet:', error)
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    // Check if wallet exists
    const existingWallet = await db.wallet.findUnique({
      where: { id: id }
    })

    if (!existingWallet) {
    const { id } = await params
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Soft delete by archiving
    const archivedWallet = await db.wallet.update({
      where: {
        id: id
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(archivedWallet)
  } catch (error) {
    const { id } = await params
    console.error('Error archiving wallet:', error)
    return NextResponse.json({ error: 'Failed to archive wallet' }, { status: 500 })
  }
}