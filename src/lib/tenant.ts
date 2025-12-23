import { db } from "@/lib/db"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const createTenantSchema = z.object({
  name: z.string().min(2, "اسم المؤسسة يجب أن يكون حرفين على الأقل").max(100, "اسم المؤسسة طويل جداً"),
  slug: z.string().min(2, "معرف المؤسسة يجب أن يكون حرفين على الأقل").max(50, "معرف المؤسسة طويل جداً").regex(/^[a-z0-9-]+$/, "يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط"),
  userId: z.string(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
})

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    throw new Error("Authentication required")
  }
  
  return session.user
}

export async function getCurrentTenant() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return null
    }

    const tenant = await db.tenant.findUnique({
      where: { id: session.user.tenantId },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          }
        }
      }
    })

    return tenant
  } catch (error) {
    console.error("Get current tenant error:", error)
    return null
  }
}

export async function createTenant(data: {
  name: string
  slug: string
  userId: string
  plan?: "FREE" | "PRO" | "ENTERPRISE"
}) {
  try {
    const validatedData = createTenantSchema.parse(data)

    // Check if tenant slug already exists
    const existingTenant = await db.tenant.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingTenant) {
      throw new Error("Tenant with this slug already exists")
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create tenant first
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          plan: validatedData.plan || "FREE",
          status: "ACTIVE",
          maxUsers: 5,
        },
      })

      // Create user membership as owner
      const tenantUser = await tx.tenantUser.create({
        data: {
          userId: validatedData.userId,
          tenantId: tenant.id,
          role: "OWNER",
          isActive: true,
        },
      })

      return { tenant, tenantUser }
    })

    return result
  } catch (error) {
    console.error("Create tenant error:", error)
    throw error
  }
}