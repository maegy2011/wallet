import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to parse permissions
    const transformedUsers = users.map(user => ({
      ...user,
      roles: user.userRoles.map(userRole => ({
        ...userRole,
        role: {
          ...userRole.role,
          permissions: typeof userRole.role.permissions === 'string' 
            ? JSON.parse(userRole.role.permissions) 
            : userRole.role.permissions
        }
      }))
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}