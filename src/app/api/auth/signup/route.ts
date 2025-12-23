import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { createTenant } from "@/lib/tenant"

const signupSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  tenantName: z.string().min(2, "اسم المؤسسة يجب أن يكون حرفين على الأقل"),
  tenantSlug: z.string().min(2, "معرف المؤسسة يجب أن يكون حرفين على الأقل")
    .regex(/^[a-z0-9-]+$/, "يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط"),
  plan: z.enum(["free", "pro", "enterprise"]).default("free"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        throw new Error("البريد الإلكتروني مسجل بالفعل")
      }

      // Check if tenant slug already exists
      const existingTenant = await tx.tenant.findUnique({
        where: { slug: validatedData.tenantSlug },
      })

      if (existingTenant) {
        throw new Error("معرف المؤسسة هذا مستخدم بالفعل. اختر معرفاً آخر")
      }

      // Create user first
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
        },
      })

      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.tenantName,
          slug: validatedData.tenantSlug,
          plan: validatedData.plan.toUpperCase() as any,
          status: "ACTIVE",
          maxUsers: 5,
        },
      })

      // Create user membership as owner
      const tenantUser = await tx.tenantUser.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: "OWNER",
          isActive: true,
        },
      })

      // Create subscription if not free
      if (validatedData.plan !== "free") {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            plan: validatedData.plan.toUpperCase() as any,
            status: "ACTIVE",
            startDate: new Date(),
          },
        })
      }

      return {
        user,
        tenant,
        tenantUser,
      }
    })

    return NextResponse.json({
      message: "تم إنشاء الحساب بنجاح",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Handle custom error messages
    if (error instanceof Error && (
      error.message.includes("البريد الإلكتروني مسجل بالفعل") ||
      error.message.includes("معرف المؤسسة هذا مستخدم بالفعل")
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إنشاء الحساب" },
      { status: 500 }
    )
  }
}