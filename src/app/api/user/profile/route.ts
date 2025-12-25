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
    
    // Find user with related data
    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        accounts: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    // Check user status
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'الحساب غير نشط' },
        { status: 403 }
      )
    }
    
    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات المستخدم' },
      { status: 500 }
    )
  }
}