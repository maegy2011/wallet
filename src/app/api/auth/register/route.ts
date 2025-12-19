import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().regex(/^01[0-2,5]\d{8}$/, 'رقم الهاتف غير صحيح'),
  nationalId: z.string().regex(/^\d{14}$/, 'الرقم القومي يجب أن يكون 14 رقم'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    const { username, email, phone, nationalId, password } = validatedData
    
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
      let errorMessage = 'المستخدم موجود بالفعل'
      if (existingUser.username === username) {
        errorMessage = 'اسم المستخدم موجود بالفعل'
      } else if (existingUser.email === email) {
        errorMessage = 'البريد الإلكتروني موجود بالفعل'
      } else if (existingUser.phone === phone) {
        errorMessage = 'رقم الهاتف موجود بالفعل'
      } else if (existingUser.nationalId === nationalId) {
        errorMessage = 'الرقم القومي موجود بالفعل'
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await db.user.create({
      data: {
        username,
        email: email || null,
        phone,
        nationalId,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        nationalId: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.errors.map(err => err.message)
      }, { status: 400 })
    }
    
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'حدث خطأ في إنشاء الحساب' }, { status: 500 })
  }
}