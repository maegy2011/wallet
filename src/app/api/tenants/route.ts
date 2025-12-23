import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createTenantSchema = z.object({
  tenantName: z.string().min(2, "اسم المؤسسة يجب أن يكون حرفين على الأقل").max(100, "اسم المؤسسة طويل جداً"),
  tenantSlug: z.string()
    .min(2, "معرف المؤسسة يجب أن يكون حرفين على الأقل")
    .max(50, "معرف المؤسسة طويل جداً")
    .regex(/^[a-z0-9-]+$/, "يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createTenantSchema.parse(body)

    // Check if tenant slug already exists
    const existingTenant = await db.tenant.findUnique({
      where: { slug: validatedData.tenantSlug },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: "معرف المؤسسة هذا مستخدم بالفعل. اختر معرفاً آخر" },
        { status: 400 }
      )
    }

    // Check if user already has a tenant
    const existingMembership = await db.tenantUser.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "لديك مؤسسة بالفعل. يمكنك الانضمام إلى مؤسسات أخرى أو إنشاء حساب جديد" },
        { status: 400 }
      )
    }

    // Create tenant and user membership in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.tenantName,
          slug: validatedData.tenantSlug,
          plan: "FREE",
          status: "ACTIVE",
          maxUsers: 5,
        },
      })

      // Create user membership as owner
      const tenantUser = await tx.tenantUser.create({
        data: {
          userId: session.user.id,
          tenantId: tenant.id,
          role: "OWNER",
          isActive: true,
        },
      })

      // Record usage analytics
      await tx.usageStats.create({
        data: {
          tenantId: tenant.id,
          metric: "tenant_created",
          value: 1,
          date: new Date(),
        },
      })

      return { tenant, tenantUser }
    })

    return NextResponse.json({
      message: "تم إنشاء المؤسسة بنجاح",
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        plan: result.tenant.plan,
      },
    })
  } catch (error) {
    console.error("Create tenant error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إنشاء المؤسسة" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    // Get all tenants the user is a member of
    const tenantUsers = await db.tenantUser.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        tenant: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    })

    const tenants = tenantUsers.map(tu => ({
      id: tu.tenant.id,
      name: tu.tenant.name,
      slug: tu.tenant.slug,
      plan: tu.tenant.plan,
      role: tu.role,
      joinedAt: tu.joinedAt,
    }))

    return NextResponse.json({ tenants })
  } catch (error) {
    console.error("Get tenants error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء جلب المؤسسات" },
      { status: 500 }
    )
  }
}