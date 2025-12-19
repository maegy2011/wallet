import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  identifier: z.string().min(1, 'الرجاء إدخال اسم المستخدم أو رقم الهاتف أو الرقم القومي أو البريد الإلكتروني'),
  password: z.string().min(1, 'الرجاء إدخال كلمة المرور'),
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    const { identifier, password } = validatedData
    
    // Find user by username, phone, nationalId, or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { phone: identifier },
          { nationalId: identifier },
          { email: identifier }
        ],
        isActive: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }
    
    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    await db.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })
    
    // Get user roles and permissions
    const userRoles = await db.userRole.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        role: true,
        businessAccount: true,
        branch: true,
      }
    })
    
    // Get user business accounts
    const businessAccounts = await db.userBusinessAccount.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        businessAccount: true,
      }
    })
    
    // Get user branches
    const branches = await db.userBranch.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        branch: true,
      }
    })
    
    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLoginAt: user.lastLoginAt,
      },
      roles: userRoles,
      businessAccounts: businessAccounts.map(ba => ba.businessAccount),
      branches: branches.map(b => b.branch),
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.errors.map(err => err.message)
      }, { status: 400 })
    }
    
    console.error('Login error:', error)
    return NextResponse.json({ error: 'حدث خطأ في تسجيل الدخول' }, { status: 500 })
  }
}