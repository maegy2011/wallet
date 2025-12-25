import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'مطلوب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
    }
    
    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { mobileNumber: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }
    
    if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'].includes(status)) {
      where.status = status
    }
    
    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          accounts: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              accountType: true,
              balance: true,
              currency: true
            }
          },
          _count: {
            select: {
              accounts: true,
              transactions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المستخدمين' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'مطلوب تسجيل الدخول' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { userId, status, role } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }
    
    // Find the user to update
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(status && { status }),
        ...(role && { role })
      },
      select: {
        id: true,
        mobileNumber: true,
        name: true,
        email: true,
        status: true,
        role: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المستخدم' },
      { status: 500 }
    )
  }
}