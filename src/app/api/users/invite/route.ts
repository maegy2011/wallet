import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { EmailService } from "@/lib/email"

const inviteSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
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

    // Check if user has permission to invite (must be ADMIN or OWNER)
    const userRole = session.user.role
    if (userRole !== "OWNER" && userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "ليست لديك صلاحية لدعوة مستخدمين جدد" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = inviteSchema.parse(body)

    // Check if user is trying to invite someone with higher role
    if (userRole === "ADMIN" && validatedData.role === "OWNER") {
      return NextResponse.json(
        { error: "لا يمكنك دعوة مالك جديد" },
        { status: 403 }
      )
    }

    // Check if user is already a member of the tenant
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
      include: {
        tenantUsers: {
          where: {
            tenantId: session.user.tenantId,
          },
        },
      },
    })

    if (existingUser && existingUser.tenantUsers.length > 0) {
      return NextResponse.json(
        { error: "المستخدم عضو بالفعل في المؤسسة" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email: validatedData.email,
        tenantId: session.user.tenantId,
        status: "PENDING",
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "تم إرسال دعوة لهذا المستخدم بالفعل" },
        { status: 400 }
      )
    }

    // Check tenant limits
    const tenant = await db.tenant.findUnique({
      where: { id: session.user.tenantId },
      include: {
        _count: {
          select: {
            users: true,
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

    // Check if tenant has reached user limit
    const maxUsers = {
      FREE: 5,
      PRO: 25,
      ENTERPRISE: 999999,
    }

    const currentUsers = tenant._count.users
    const maxAllowedUsers = maxUsers[tenant.plan as keyof typeof maxUsers]

    if (currentUsers >= maxAllowedUsers) {
      return NextResponse.json(
        { error: `لقد وصلت إلى الحد الأقصى للمستخدمين (${maxAllowedUsers}) في خطتك الحالية` },
        { status: 400 }
      )
    }

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email: validatedData.email,
        role: validatedData.role,
        token: uuidv4(),
        tenantId: session.user.tenantId,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        tenant: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Send email invitation - NOW IMPLEMENTED!
    const emailResult = await EmailService.sendInvitationEmail(
      validatedData.email,
      tenant.name,
      session.user.name || session.user.email,
      validatedData.role,
      invitation.token
    )

    if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error)
      // Still create invitation even if email fails for development
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: "تم إرسال الدعوة بنجاح",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        tenantName: invitation.tenant.name,
        invitedBy: invitation.invitedBy.name,
        expiresAt: invitation.expiresAt,
      },
    })
  } catch (error) {
    console.error("Invite error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إرسال الدعوة" },
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

    const invitations = await db.invitation.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Get invitations error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    )
  }
}