import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createProjectSchema = z.object({
  name: z.string().min(1, "اسم المشروع مطلوب").max(100, "اسم المشروع طويل جداً"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Check if user has permission to create projects
    const userRole = session.user.role
    if (userRole !== "OWNER" && userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "ليست لديك صلاحية إنشاء مشاريع جديدة" },
        { status: 403 }
      )
    }

    // Check tenant project limits
    const tenant = await db.tenant.findUnique({
      where: { id: session.user.tenantId },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: "المؤسسة غير موجودة" },
        { status: 404 }
      )
    }

    // Check project limits based on plan
    const maxProjects = {
      FREE: 3,
      PRO: 999999, // Unlimited for practical purposes
      ENTERPRISE: 999999,
    }

    const currentProjects = tenant._count.projects
    const maxAllowedProjects = maxProjects[tenant.plan as keyof typeof maxProjects]

    if (currentProjects >= maxAllowedProjects) {
      return NextResponse.json(
        { error: `لقد وصلت إلى الحد الأقصى للمشاريع (${maxAllowedProjects}) في خطتك الحالية` },
        { status: 400 }
      )
    }

    // Get the tenant user ID for the creator
    const tenantUser = await db.tenantUser.findUnique({
      where: {
        userId_tenantId: {
          userId: session.user.id,
          tenantId: session.user.tenantId,
        },
      },
    })

    if (!tenantUser) {
      return NextResponse.json(
        { error: "المستخدم غير موجود في المؤسسة" },
        { status: 404 }
      )
    }

    // Create the project
    const project = await db.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        tenantId: session.user.tenantId,
        createdById: tenantUser.id,
      },
      include: {
        createdBy: {
          include: {
            user: true,
          },
        },
      },
    })

    // Record usage analytics
    await db.usageStats.create({
      data: {
        tenantId: session.user.tenantId,
        metric: "projects_created",
        value: 1,
        date: new Date(),
      },
    })

    return NextResponse.json({
      message: "تم إنشاء المشروع بنجاح",
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        createdBy: {
          name: project.createdBy.user.name,
        },
      },
    })
  } catch (error) {
    console.error("Create project error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إنشاء المشروع" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "ACTIVE"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const projects = await db.project.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: status as any,
      },
      include: {
        createdBy: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    const total = await db.project.count({
      where: {
        tenantId: session.user.tenantId,
        status: status as any,
      },
    })

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء جلب المشاريع" },
      { status: 500 }
    )
  }
}