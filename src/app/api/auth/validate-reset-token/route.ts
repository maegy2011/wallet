import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const validateTokenSchema = z.object({
  token: z.string().min(1, "الرمز مطلوب"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateTokenSchema.parse(body)

    // Validate token format first
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const isValidFormat = uuidRegex.test(validatedData.token)

    if (!isValidFormat) {
      return NextResponse.json(
        { error: "رمز إعادة التعيين غير صالح" },
        { status: 400 }
      )
    }

    // Find user by reset token and check if token is not expired
    const user = await db.user.findFirst({
      where: {
        resetToken: validatedData.token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      message: "الرمز صالح",
      user: {
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Validate token error:", error)

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
      { error: "حدث خطأ غير متوقع أثناء التحقق من الرمز" },
      { status: 500 }
    )
  }
}
