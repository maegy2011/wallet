import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  identifier: z.string().min(1, 'الرجاء إدخال اسم المستخدم أو رقم الهاتف أو الرقم القومي أو البريد الإلكتروني'),
})

const confirmPasswordSchema = z.object({
  token: z.string().min(1, 'الرمز غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'request') {
      const validatedData = resetPasswordSchema.parse(body)
      const { identifier } = validatedData
      
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
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
      }
      
      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      )
      
      // Set expiration time (1 hour from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)
      
      // Save reset token
      await db.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        }
      })
      
      return NextResponse.json({
        message: 'تم إرسال رمز استعادة كلمة المرور',
        token: resetToken, // In production, send via email/SMS
      })
      
    } else if (action === 'confirm') {
      const validatedData = confirmPasswordSchema.parse(body)
      const { token, password } = validatedData
      
      // Verify reset token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      if (decoded.type !== 'password_reset') {
        return NextResponse.json({ error: 'الرمز غير صحيح' }, { status: 400 })
      }
      
      // Check if token exists and is not used
      const resetRecord = await db.passwordReset.findFirst({
        where: {
          token: token,
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        }
      })
      
      if (!resetRecord) {
        return NextResponse.json({ error: 'الرمز غير صحيح أو منتهي الصلاحية' }, { status: 400 })
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Update user password
      await db.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      })
      
      // Mark token as used
      await db.passwordReset.update({
        where: { id: resetRecord.id },
        data: { isUsed: true }
      })
      
      // Deactivate all user sessions
      await db.userSession.updateMany({
        where: { userId: decoded.userId },
        data: { isActive: false }
      })
      
      return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' })
      
    } else {
      return NextResponse.json({ error: 'العملية غير صحيحة' }, { status: 400 })
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.errors.map(err => err.message)
      }, { status: 400 })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'الرمز غير صحيح' }, { status: 400 })
    }
    
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'حدث خطأ في استعادة كلمة المرور' }, { status: 500 })
  }
}