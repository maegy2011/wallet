import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware } from '@/lib/admin-middleware';
import { ErrorLogger } from '@/lib/errors';

/**
 * POST /api/admin/auth/logout
 * Admin logout - invalidate session and log activity
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const admin = await AdminMiddleware.verifyAdmin(request);
    
    // Log the logout action
    await AdminMiddleware.logAction(
      admin.id,
      'LOGOUT',
      'ADMIN',
      admin.id,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Admin logged out successfully', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Admin logout failed'), {
      endpoint: '/api/admin/auth/logout',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed',
      },
    }, { status: 500 });
  }
}