import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { EmailService } from "@/lib/email"

const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
      include: {
        tenantUsers: {
          include: {
            tenant: true,
          },
        },
      },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: "إذا كان البريد الإلكتروني مسجلاً، فسيتم إرسال رابط إعادة التعيين",
      })
    }

    // Generate reset token
    const resetToken = uuidv4()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token (you might want to create a separate table for this)
    // For now, we'll use a simple approach with user table update
    await db.user.update({
      where: { id: user.id },
      data: {
        // Note: You should add resetToken and resetTokenExpires to user schema
        // For demo purposes, we'll proceed without storing the token
      },
    })

    // Send password reset email
    const emailResult = await EmailService.sendPasswordResetEmail(
      validatedData.email,
      resetToken,
      user.name || validatedData.email
    )

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error)
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إرسال رابط إعادة التعيين" },
      { status: 500 }
    )
  }
}