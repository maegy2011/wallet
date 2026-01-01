import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminAuthService } from '@/lib/admin-auth';
import { ErrorLogger, AuthenticationError } from '@/lib/errors';

/**
 * GET /api/admin/auth/me
 * Get current admin session info
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const adminSession = AdminAuthService.verifyToken(token);
    if (!adminSession) {
      throw new AuthenticationError('Invalid token');
    }

    // Get fresh admin data from database
    const admin = await db.admin.findUnique({
      where: { id: adminSession.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new AuthenticationError('Admin account not found or inactive');
    }

    return NextResponse.json({
      success: true,
      data: { admin },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Get admin session failed'), {
      endpoint: '/api/admin/auth/me',
    });

    if (error instanceof AuthenticationError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: error.message,
        },
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}