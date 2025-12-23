import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
    const periodStr = searchParams.get("period") || "30" // default to 30 days
    const metric = searchParams.get("metric") || "all"

    // Validate and parse period parameter
    const period = parseInt(periodStr)
    if (isNaN(period) || period < 1 || period > 365) {
      return NextResponse.json(
        { error: "الفترة يجب أن تكون بين 1 و 365 يوم" },
        { status: 400 }
      )
    }

    const tenantId = session.user.tenantId
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - period)

    // Get basic stats
    const [userCount, projectCount, taskCount] = await Promise.all([
      db.tenantUser.count({
        where: {
          tenantId,
          isActive: true,
        },
      }),
      db.project.count({
        where: {
          tenantId,
          status: "ACTIVE",
        },
      }),
      db.task.count({
        where: {
          project: {
            tenantId,
          },
        },
      }),
    ])

    // Get daily stats for the period
    const dailyStats = await db.usageStats.findMany({
      where: {
        tenantId,
        date: {
          gte: daysAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Get top users by task completion
    const topUsers = await db.tenantUser.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        assigned: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
          },
        },
        created: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        assigned: {
          _count: "desc",
        },
      },
      take: 5,
    })

    // Get project stats
    const projectStats = await db.project.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      include: {
        tasks: {
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    // Process project stats
    const processedProjectStats = projectStats.map(project => {
      const totalTasks = project._count.tasks
      const completedTasks = project.tasks.filter(task => task.status === "COMPLETED").length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        id: project.id,
        name: project.name,
        totalTasks,
        completedTasks,
        progress,
      }
    })

    // Calculate growth rates (mock data for now)
    const growthRates = {
      users: 15.2,
      projects: 8.7,
      tasks: 23.1,
      logins: 12.4,
    }

    const analyticsData = {
      summary: {
        totalUsers: userCount,
        totalProjects: projectCount,
        totalTasks: taskCount,
        growthRates,
        avgSessionDuration: "12 دقيقة",
      },
      dailyStats,
      topUsers: topUsers.map(user => ({
        name: user.user.name || user.user.email,
        tasksCompleted: user.assigned.length,
        projectsCreated: user.created.length,
        lastActive: "منذ ساعتين", // Mock data
      })),
      projectStats: processedProjectStats,
      period: parseInt(period),
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics error:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء جلب البيانات التحليلية" },
      { status: 500 }
    )
  }
}

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
    const { metric, value, date } = body

    // Validate required fields
    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: "بيانات غير مكتملة" },
        { status: 400 }
      )
    }

    // Validate metric name
    if (typeof metric !== 'string' || metric.trim().length === 0) {
      return NextResponse.json(
        { error: "المقياس غير صالح" },
        { status: 400 }
      )
    }

    // Validate value
    const parsedValue = parseInt(value)
    if (isNaN(parsedValue) || parsedValue < 0) {
      return NextResponse.json(
        { error: "القيمة غير صالحة" },
        { status: 400 }
      )
    }

    // Validate date if provided
    let validDate = new Date()
    if (date) {
      validDate = new Date(date)
      if (isNaN(validDate.getTime())) {
        return NextResponse.json(
          { error: "التاريخ غير صالح" },
          { status: 400 }
        )
      }
    }

    // Record usage stat
    const usageStat = await db.usageStats.create({
      data: {
        tenantId: session.user.tenantId,
        metric,
        value: parsedValue,
        date: validDate,
      },
    })

    return NextResponse.json({
      message: "تم تسجيل الإحصائية بنجاح",
      usageStat,
    })
  } catch (error) {
    console.error("Record analytics error:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل الإحصائية" },
      { status: 500 }
    )
  }
}