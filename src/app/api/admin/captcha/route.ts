import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate a random string for captcha
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate SVG captcha without external font dependencies
 */
function generateSvgCaptcha(text: string): string {
  const width = 200;
  const height = 60;
  const chars = text.split('');

  // Generate random colors and positions for each character
  const charElements = chars.map((char, index) => {
    const x = 20 + (index * 30) + Math.random() * 10;
    const y = 35 + Math.random() * 10;
    const rotation = (Math.random() - 0.5) * 30;
    const fontSize = 20 + Math.random() * 10;
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#059669'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return `
      <text
        x="${x}"
        y="${y}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}"
        transform="rotate(${rotation} ${x} ${y})"
        style="user-select: none;"
      >
        ${char}
      </text>
    `;
  }).join('');

  // Generate noise lines
  const noiseLines = Array.from({ length: 5 }, () => {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e5e7eb" stroke-width="1"/>`;
  }).join('');

  // Generate noise dots
  const noiseDots = Array.from({ length: 30 }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return `<circle cx="${x}" cy="${y}" r="1" fill="#e5e7eb"/>`;
  }).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 4px;">
      ${noiseLines}
      ${noiseDots}
      ${charElements}
    </svg>
  `;
}

/**
 * GET /api/admin/captcha
 * Generate a new captcha for admin login using SVG
 */
export async function GET(request: NextRequest) {
  try {
    const text = generateRandomString(6);
    const svg = generateSvgCaptcha(text);
    const hash = Buffer.from(`${text}-${Date.now()}`).toString('base64');

    // Set cache headers to prevent caching of captcha
    const headers = new Headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: hash,
        question: svg, // SVG string
      },
    }, { headers });
  } catch (error) {
    console.error('Captcha generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate captcha',
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/captcha
 * Verify captcha answer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, answer } = body;

    if (!id || !answer) {
      return NextResponse.json({
        success: false,
        error: 'Captcha ID and answer are required',
      }, { status: 400 });
    }

    // Verify captcha by decoding the hash
    const parts = Buffer.from(id, 'base64').toString().split('-');
    const expectedText = parts[0];
    const isValid = expectedText === answer.trim();

    return NextResponse.json({
      success: true,
      data: {
        valid: isValid,
      },
    });
  } catch (error) {
    console.error('Captcha verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify captcha',
    }, { status: 500 });
  }
}
