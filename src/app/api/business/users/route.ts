import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessAccountId = searchParams.get('businessAccountId')

    if (!businessAccountId) {
      return NextResponse.json({ error: 'معرف المنشأة التجارية مطلوب' }, { status: 400 })
    }

    const users = await db.user.findMany({
      where: {
        userBusinessAccounts: {
          some: {
            businessAccountId: businessAccountId,
            isActive: true
          }
        }
      },
      include: {
        userRoles: {
          include: {
            role: true,
            businessAccount: {
              select: {
                id: true,
                name: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'فشل في جلب المستخدمين' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, phone, nationalId, password } = body

    if (!username || !phone || !nationalId || !password) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة مطلوبة' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || undefined },
          { phone },
          { nationalId }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'المستخدم موجود بالفعل' }, { status: 400 })
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        username,
        email: email || null,
        phone,
        nationalId,
        password: hashedPassword,
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false
      }
    })

    return NextResponse.json({
      message: 'تم إنشاء المستخدم بنجاح',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'فشل في إنشاء المستخدم' }, { status: 500 })
  }
}