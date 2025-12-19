import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'الرجاء تسجيل الدخول أولاً' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Deactivate the session
    await db.userSession.updateMany({
      where: {
        userId: decoded.userId,
        token: token,
        isActive: true
      },
      data: {
        isActive: false
      }
    })
    
    return NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'حدث خطأ في تسجيل الخروج' }, { status: 500 })
  }
}