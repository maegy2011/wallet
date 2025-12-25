import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth/jwt'

// GET /api/dev/tenants - List all tenants (TENANT_OWNER only)
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول', requiresAuth: true },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح. يرجى تسجيل الدخول مرة أخرى.', requiresAuth: true },
        { status: 401 }
      )
    }

    // Check for TENANT_OWNER role
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح - هذه الصفحة متاحة فقط لملك المستأجر', requiresDevRole: true },
        { status: 403 }
      )
    }

    // Fetch all tenants with detailed info
    const tenants = await db.tenant.findMany({
      include: {
        _count: { select: { id: true } },
        companies: {
          include: {
            _count: { select: { id: true } },
            branches: {
              include: {
                _count: { select: { id: true } },
                users: {
                  select: {
                    _count: { select: { id: true } }
                  }
                }
              }
            }
          }
        },
        users: {
          include: {
            _count: { select: { id: true } }
          }
        },
        wallets: {
          include: {
            _count: { select: { id: true } }
          }
        },
        partners: {
          include: {
            _count: { select: { id: true } }
          }
        },
        categories: {
          include: {
            _count: { select: { id: true } }
          }
        },
        transactions: {
          include: {
            _count: { select: { id: true } }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate aggregate statistics
    const totalCompanies = tenants.reduce((sum, t) => sum + t._count.companies, 0)
    const totalBranches = tenants.reduce((sum, t) => sum + t._count.branches, 0)
    const totalUsers = tenants.reduce((sum, t) => sum + t._count.users, 0)
    const totalWallets = tenants.reduce((sum, t) => sum + t._count.wallets, 0)
    const totalPartners = tenants.reduce((sum, t) => sum + t._count.partners, 0)
    const totalTransactions = tenants.reduce((sum, t) => sum + t._count.transactions, 0)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      authenticatedUser: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      },
      tenants,
      counts: {
        total: tenants.length,
        companies: totalCompanies,
        branches: totalBranches,
        users: totalUsers,
        wallets: totalWallets,
        partners: totalPartners,
        transactions: totalTransactions,
        categories: tenants.reduce((sum, t) => sum + t._count.categories, 0)
      },
      metrics: {
        avgCompaniesPerTenant: tenants.length > 0 ? (totalCompanies / tenants.length).toFixed(1) : '0',
        avgUsersPerTenant: tenants.length > 0 ? (totalUsers / tenants.length).toFixed(1) : '0',
        avgWalletsPerTenant: tenants.length > 0 ? (totalWallets / tenants.length).toFixed(1) : '0',
        avgPartnersPerTenant: tenants.length > 0 ? (totalPartners / tenants.length).toFixed(1) : '0',
        avgTransactionsPerTenant: tenants.length > 0 ? (totalTransactions / tenants.length).toFixed(1) : '0'
      },
      plans: {
        free: tenants.filter(t => t.plan === 'FREE').length,
        merchant: tenants.filter(t => t.plan === 'MERCHANT').length,
        active: tenants.filter(t => t.isActive).length,
        inactive: tenants.filter(t => !t.isActive).length
      }
    })
  } catch (error) {
    console.error('Tenants API error:', error)
    return NextResponse.json(
      { 
        error: 'فشل في تحميل قائمة المستأجرين', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// PATCH /api/dev/tenants/[id] - Toggle tenant status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول', requiresAuth: true },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح. يرجى تسجيل الدخول مرة أخرى.', requiresAuth: true },
        { status: 401 }
      )
    }

    // Check for TENANT_OWNER role
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح - هذه العملية متاحة فقط لملك المستأجر', requiresDevRole: true },
        { status: 403 }
      )
    }

    const { action } = await request.json()

    if (action === 'toggle') {
      // Toggle tenant active status
      const tenant = await db.tenant.findUnique({
        where: { id: params.id }
      })

      if (!tenant) {
        return NextResponse.json(
          { error: 'المستأجر غير موجود' },
          { status: 404 }
        )
      }

      const updatedTenant = await db.tenant.update({
        where: { id: params.id },
        data: {
          isActive: !tenant.isActive
        }
      })

      return NextResponse.json({
        success: true,
        message: updatedTenant.isActive ? 'تم تفعيل المستأجر بنجاح' : 'تم تعطيل المستأجر بنجاح',
        tenant: updatedTenant
      })
    }

    return NextResponse.json(
      { error: 'إجراء غير صالح', validActions: ['toggle'] },
      { status: 400 }
    )
  } catch (error) {
    console.error('Tenant update error:', error)
    return NextResponse.json(
      { 
        error: 'فشل في تحديث المستأجر', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// DELETE /api/dev/tenants/[id] - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول', requiresAuth: true },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح. يرجى تسجيل الدخول مرة أخرى.', requiresAuth: true },
        { status: 401 }
      )
    }

    // Check for TENANT_OWNER role
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح - هذه العملية متاحة فقط لملك المستأجر', requiresDevRole: true },
        { status: 403 }
      )
    }

    // Check if tenant exists
    const tenant = await db.tenant.findUnique({
      where: { id: params.id }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'المستأجر غير موجود' },
        { status: 404 }
      )
    }

    // Delete tenant with all related data (cascade)
    await db.tenant.delete({
      where: { id: params.id }
    })

    // Log the deletion
    console.log(`Tenant deleted by user ${payload.userId} (${payload.email})`, {
      tenantId: params.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستأجر وكل بياناته بنجاح',
      timestamp: new Date().toISOString(),
      deletedTenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email
      },
      deletedBy: {
        id: payload.userId,
        email: payload.email
      }
    })
  } catch (error) {
    console.error('Tenant deletion error:', error)
    return NextResponse.json(
      { 
        error: 'فشل في حذف المستأجر', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
