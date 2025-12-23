import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Simple captcha generation
const captchaTexts = [
  "AB12", "CD34", "EF56", "GH78", "IJ90",
  "KL12", "MN34", "OP56", "QR78", "ST90",
  "UV12", "WX34", "YZ56", "AB78", "CD90"
]

const captchaStore = new Map<string, { text: string; expires: number }>()

export async function GET() {
  const text = captchaTexts[Math.floor(Math.random() * captchaTexts.length)]
  const id = uuidv4()
  const expires = Date.now() + 5 * 60 * 1000 // 5 minutes

  captchaStore.set(id, { text, expires })

  // Create a simple SVG captcha
  const svg = `
    <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa" rx="4"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            font-family="Arial, sans-serif" font-size="18" 
            font-weight="bold" fill="#333">
        ${text.split('').map((char, i) => 
          `<tspan x="${30 + i * 15}" y="25" 
                  transform="rotate(${Math.random() * 20 - 10} ${30 + i * 15} 25)">${char}</tspan>`
        ).join('')}
      </text>
      ${Array.from({ length: 3 }, () => {
        const x1 = Math.random() * 120
        const y1 = Math.random() * 40
        const x2 = Math.random() * 120
        const y2 = Math.random() * 40
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                      stroke="#ddd" stroke-width="1"/>`
      }).join('')}
    </svg>
  `

  // Clean up expired captchas
  const now = Date.now()
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires < now) {
      captchaStore.delete(key)
    }
  }

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'X-Captcha-Id': id,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { id, answer } = await request.json()

    if (!id || !answer) {
      return NextResponse.json(
        { error: "بيانات غير مكتملة" },
        { status: 400 }
      )
    }

    const captcha = captchaStore.get(id)

    if (!captcha) {
      return NextResponse.json(
        { error: "انتهت صلاحية الكابتشا" },
        { status: 400 }
      )
    }

    if (captcha.expires < Date.now()) {
      captchaStore.delete(id)
      return NextResponse.json(
        { error: "انتهت صلاحية الكابتشا" },
        { status: 400 }
      )
    }

    const isValid = captcha.text.toUpperCase() === answer.toUpperCase()

    // Remove captcha after verification
    captchaStore.delete(id)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("Captcha verification error:", error)
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    )
  }
}