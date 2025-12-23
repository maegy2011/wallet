import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const securityQuestionsSchema = z.object({
  securityQuestion1: z.string().optional(),
  securityAnswer1: z.string().optional(),
  securityQuestion2: z.string().optional(),
  securityAnswer2: z.string().optional(),
  securityQuestion3: z.string().optional(),
  securityAnswer3: z.string().optional(),
}).refine((data) => {
  // At least one question must be set
  const hasAtLeastOneQuestion = 
    (data.securityQuestion1 && data.securityAnswer1) ||
    (data.securityQuestion2 && data.securityAnswer2) ||
    (data.securityQuestion3 && data.securityAnswer3)
  
  return hasAtLeastOneQuestion
}, {
  message: "يجب تعيين سؤال أمان واحد على الأقل",
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = securityQuestionsSchema.parse(body)

    // Hash security answers for storage
    const hashedData = {
      securityQuestion1: validatedData.securityQuestion1,
      securityAnswer1: validatedData.securityAnswer1 ? await bcryptjs.hash(validatedData.securityAnswer1, 12) : null,
      securityQuestion2: validatedData.securityQuestion2,
      securityAnswer2: validatedData.securityAnswer2 ? await bcryptjs.hash(validatedData.securityAnswer2, 12) : null,
      securityQuestion3: validatedData.securityQuestion3,
      securityAnswer3: validatedData.securityAnswer3 ? await bcryptjs.hash(validatedData.securityAnswer3, 12) : null,
    }

    // Update user with security questions
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: hashedData,
    })

    return NextResponse.json({
      message: "تم حفظ أسئلة الأمان بنجاح",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        hasSecurityQuestions: true,
      },
    })
  } catch (error) {
    console.error("Security questions error:", error)

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
      { error: "حدث خطأ غير متوقع أثناء حفظ أسئلة الأمان" },
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

    // Get user's current security questions (without answers for security)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        securityQuestion1: true,
        securityQuestion2: true,
        securityQuestion3: true,
      },
    })

    return NextResponse.json({
      securityQuestions: {
        question1: user?.securityQuestion1,
        question2: user?.securityQuestion2,
        question3: user?.securityQuestion3,
      },
      hasSecurityQuestions: !!(user?.securityQuestion1 || user?.securityQuestion2 || user?.securityQuestion3),
    })
  } catch (error) {
    console.error("Get security questions error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء جلب أسئلة الأمان" },
      { status: 500 }
    )
  }
}