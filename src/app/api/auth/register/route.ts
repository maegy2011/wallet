import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  mobileNumber: z.string().regex(/^01[0-9]{9}$/, 'رقم الموبايل المصري غير صالح'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        mobileNumber: validatedData.mobileNumber
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'رقم الموبايل مسجل بالفعل' },
        { status: 400 }
      )
    }
    
    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingEmail = await db.user.findUnique({
        where: {
          email: validatedData.email
        }
      })
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مسجل بالفعل' },
          { status: 400 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user
    const user = await db.user.create({
      data: {
        mobileNumber: validatedData.mobileNumber,
        name: validatedData.name,
        email: validatedData.email || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        mobileNumber: true,
        name: true,
        email: true,
        mobileVerified: true,
        createdAt: true
      }
    })
    
    // Create default wallet account for the user
    const account = await db.account.create({
      data: {
        userId: user.id,
        accountType: 'WALLET',
        accountNumber: generateAccountNumber(),
        balance: 0,
        currency: 'EGP'
      }
    })
    
    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        ...user,
        account: {
          accountNumber: account.accountNumber,
          balance: account.balance,
          currency: account.currency
        }
      }
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}

// Helper function to generate account number
function generateAccountNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${timestamp.slice(-8)}${random}`
}