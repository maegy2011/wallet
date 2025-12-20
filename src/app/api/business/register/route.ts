import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const businessRegisterSchema = z.object({
  name: z.string().min(3, 'اسم المنشأة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  commercialId: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().min(1, 'رقم هاتف المنشأة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  branches: z.array(z.object({
    name: z.string().min(1, 'اسم الفرع مطلوب'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  })).optional(),
})

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
    
    const body = await request.json()
    const validatedData = businessRegisterSchema.parse(body)
    
    const { name, description, commercialId, taxId, address, phone, email, branches } = validatedData
    
    // Check if business account already exists
    const existingBusiness = await db.businessAccount.findFirst({
      where: {
        OR: [
          { commercialId: commercialId || undefined },
          { taxId: taxId || undefined }
        ]
      }
    })
    
    if (existingBusiness) {
      let errorMessage = 'المنشأة التجارية موجودة بالفعل'
      if (existingBusiness.commercialId === commercialId) {
        errorMessage = 'السجل التجاري موجود بالفعل'
      } else if (existingBusiness.taxId === taxId) {
        errorMessage = 'الرقم الضريبي موجود بالفعل'
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    
    // Create business account
    const businessAccount = await db.businessAccount.create({
      data: {
        name,
        description,
        commercialId,
        taxId,
        address,
        phone,
        email: email || null,
      }
    })
    
    // Create default role for business account (merchant)
    const merchantRole = await db.role.create({
      data: {
        name: `${name}_merchant`,
        description: 'تاجر - صلاحيات كاملة على المنشأة',
        permissions: JSON.stringify({
          can_manage_wallets: true,
          can_manage_transactions: true,
          can_manage_expenses: true,
          can_manage_reports: true,
          can_manage_branches: true,
          can_manage_users: true,
          can_view_all_data: true,
        }),
      }
    })
    
    // Create seller role for business account
    const sellerRole = await db.role.create({
      data: {
        name: `${name}_seller`,
        description: 'بائع - صلاحيات محدودة',
        permissions: JSON.stringify({
          can_manage_wallets: false,
          can_manage_transactions: true,
          can_manage_expenses: false,
          can_manage_reports: false,
          can_manage_branches: false,
          can_manage_users: false,
          can_view_all_data: false,
        }),
      }
    })
    
    // Assign merchant role to user for this business account
    await db.userRole.create({
      data: {
        userId: decoded.userId,
        roleId: merchantRole.id,
        businessAccountId: businessAccount.id,
      }
    })
    
    // Link user to business account
    await db.userBusinessAccount.create({
      data: {
        userId: decoded.userId,
        businessAccountId: businessAccount.id,
      }
    })
    
    // Create branches if provided
    const createdBranches: any[] = []
    if (branches && branches.length > 0) {
      for (const branchData of branches) {
        const branch = await db.branch.create({
          data: {
            businessAccountId: businessAccount.id,
            name: branchData.name,
            address: branchData.address,
            phone: branchData.phone,
            email: branchData.email || null,
          }
        })
        
        // Link user to branch
        await db.userBranch.create({
          data: {
            userId: decoded.userId,
            branchId: branch.id,
          }
        })
        
        createdBranches.push({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          email: branch.email,
          isActive: branch.isActive,
          createdAt: branch.createdAt
        })
      }
    }
    
    return NextResponse.json({
      message: 'تم إنشاء المنشأة التجارية بنجاح',
      businessAccount,
      roles: [merchantRole, sellerRole],
      branches: createdBranches,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'بيانات غير صحيحة',
        details: error.issues.map(err => err.message)
      }, { status: 400 })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'الرجاء تسجيل الدخول أولاً' }, { status: 401 })
    }
    
    console.error('Business registration error:', error)
    return NextResponse.json({ error: 'حدث خطأ في إنشاء المنشأة التجارية' }, { status: 500 })
  }
}