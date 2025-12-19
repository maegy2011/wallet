import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = await db.wallet.findUnique({
      where: {
        id: params.id
      }
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      mobileNumber,
      logo,
      feeType,
      feePercentage,
      feePerThousand,
      maxFeeAmount
    } = body

    // Check if wallet exists
    const existingWallet = await db.wallet.findUnique({
      where: { id: params.id }
    })

    if (!existingWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Check for duplicate mobile number (excluding current wallet)
    const duplicateWallet = await db.wallet.findFirst({
      where: {
        mobileNumber,
        id: { not: params.id },
        isArchived: false
      }
    })

    if (duplicateWallet) {
      return NextResponse.json({ error: 'Mobile number already exists' }, { status: 400 })
    }

    const updatedWallet = await db.wallet.update({
      where: {
        id: params.id
      },
      data: {
        name,
        mobileNumber,
        logo,
        feeType,
        feePercentage: feePercentage || 0,
        feePerThousand: feePerThousand || 0,
        maxFeeAmount: maxFeeAmount || 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedWallet)
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if wallet exists
    const existingWallet = await db.wallet.findUnique({
      where: { id: params.id }
    })

    if (!existingWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Soft delete by archiving
    const archivedWallet = await db.wallet.update({
      where: {
        id: params.id
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(archivedWallet)
  } catch (error) {
    console.error('Error archiving wallet:', error)
    return NextResponse.json({ error: 'Failed to archive wallet' }, { status: 500 })
  }
}