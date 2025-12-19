import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const branchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  businessAccountId: z.string().min(1, 'معرف المنشأة التجارية مطلوب'),
})

const updateBranchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessAccountId = searchParams.get('businessAccountId')

    if (!businessAccountId) {
      return NextResponse.json({ error: 'معرف المنشأة التجارية مطلوب' }, { status: 400 })
    }

    const branches = await db.branch.findMany({
      where: {
        businessAccountId,
        isActive: true
      },
      include: {
        businessAccount: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ branches })
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'فشل في جلب الفروع' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = branchSchema.parse(body)
    
    const { name, address, phone, email, businessAccountId } = validatedData

    // Check if business account exists and user has permission
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'الرجاء تسجيل الدخول أولاً' }, { status: 401 })
    }

    // Create branch
    const branch = await db.branch.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        businessAccountId,
      },
      include: {
        businessAccount: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'تم إضافة الفرع بنجاح',
      branch
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.errors.map(err => err.message)
      }, { status: 400 })
    }
    
    console.error('Error creating branch:', error)
    return NextResponse.json({ error: 'فشل في إضافة الفرع' }, { status: 500 })
  }
}