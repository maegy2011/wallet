import { NextRequest, NextResponse } from 'next/server';
import { CaptchaService } from '@/lib/captcha';

/**
 * GET /api/admin/captcha
 * Generate a new captcha for admin login
 */
export async function GET(request: NextRequest) {
  try {
    const captcha = CaptchaService.generateCaptcha();
    
    // Set cache headers to prevent caching of captcha images
    const headers = new Headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: captcha.id,
        question: captcha.question,
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
 * POST /api/admin/captcha/verify
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

    const isValid = CaptchaService.verifyCaptcha(id, answer);

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