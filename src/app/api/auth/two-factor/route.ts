import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { authenticator } from "otplib"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    })

    return NextResponse.json({
      twoFactor: {
        enabled: user?.twoFactorEnabled || false,
        secret: user?.twoFactorSecret || "",
      },
    })
  } catch (error) {
    console.error("Get 2FA settings error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء جلب إعدادات المصادقة الثنائية" },
      { status: 500 }
    )
  }
}

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
    const { action } = body

    if (action === "enable") {
      return await enableTwoFactor(session.user.id)
    } else if (action === "disable") {
      return await disableTwoFactor(session.user.id)
    } else if (action === "verify") {
      return await verifyTwoFactor(session.user.id, body.code)
    } else {
      return NextResponse.json(
        { error: "إجراء غير صالح" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("2FA operation error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء عملية المصادقة الثنائية" },
      { status: 500 }
    )
  }
}

async function enableTwoFactor(userId: string) {
  try {
    // Generate secret for user
    const secret = authenticator.generateSecret()
    const backupCodes = Array.from({ length: 10 }, () => authenticator.generateToken())

    // Update user with 2FA settings
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    })

    return NextResponse.json({
      message: "تم تفعيل المصادقة الثنائية بنجاح",
      secret: secret,
      backupCodes: backupCodes,
      qrCode: authenticator.keyuri(secret, "SaaSApp", "ساسaaS"),
    })
  } catch (error) {
    console.error("Enable 2FA error:", error)
    throw error
  }
}

async function disableTwoFactor(userId: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    return NextResponse.json({
      message: "تم تعطيل المصادقة الثنائية بنجاح",
    })
  } catch (error) {
    console.error("Disable 2FA error:", error)
    throw error
  }
}

async function verifyTwoFactor(userId: string, code: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
      },
    })

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "المصادقة الثنائية غير مفعلة" },
        { status: 400 }
      )
    }

    const isValid = authenticator.verify(code, user.twoFactorSecret)

    if (!isValid) {
      return NextResponse.json(
        { error: "كود التحقق غير صحيح" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "تم التحقق من الكود بنجاح",
      verified: true,
    })
  } catch (error) {
    console.error("Verify 2FA error:", error)
    throw error
  }
}