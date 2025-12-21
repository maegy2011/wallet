import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, roleId, businessAccountId, branchId } = await request.json()

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'User ID and Role ID are required' },
        { status: 400 }
      )
    }

    // Check if user and role exist
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    const role = await db.role.findUnique({
      where: { id: roleId }
    })

    if (!user || !role) {
      return NextResponse.json(
        { error: 'User or Role not found' },
        { status: 404 }
      )
    }

    // Create user role assignment
    const userRole = await db.userRole.create({
      data: {
        userId,
        roleId,
        businessAccountId,
        branchId,
        assignedBy: 'system' // This would normally be the current user ID
      }
    })

    return NextResponse.json(userRole)
  } catch (error) {
    console.error('Failed to assign role:', error)
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    )
  }
}