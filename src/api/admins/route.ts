import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminAuthService } from '@/lib/admin-auth';
import { ErrorLogger, ValidationError, AuthenticationError } from '@/lib/errors';

/**
 * POST /api/admins/login
 * Authenticate admin using credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, captchaId, captchaAnswer } = body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Validate email format
    if (!AdminAuthService.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Verify captcha
    const isCaptchaValid = await AdminAuthService.verifyCaptchaToken(captchaId, captchaAnswer);
    if (!isCaptchaValid) {
      throw new ValidationError('Invalid captcha answer');
    }

    // Find admin by email
    const admin = await db.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if account is locked
    if (AdminAuthService.isAccountLocked(admin.lockedUntil)) {
      throw new AuthenticationError('Account is temporarily locked due to too many failed attempts');
    }

    // Check if account is active
    if (!admin.isActive) {
      throw new AuthenticationError('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await AdminAuthService.verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      // Increment login attempts
      const loginAttempts = admin.loginAttempts + 1;
      const lockedUntil = loginAttempts >= 5 ? AdminAuthService.lockAccount(30) : null;

      await db.admin.update({
        where: { id: admin.id },
        data: { loginAttempts, lockedUntil },
      });

      throw new AuthenticationError('Invalid credentials');
    }

    // Reset login attempts on successful login
    await db.admin.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token
    const token = AdminAuthService.generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      twoFactorEnabled: admin.twoFactorEnabled,
    });

    // Log successful login
    await logAdminAction(admin.id, 'LOGIN', 'ADMIN', admin.id, {
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
    });

    ErrorLogger.info('Admin login successful', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          twoFactorEnabled: admin.twoFactorEnabled,
          lastLoginAt: admin.lastLoginAt,
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Admin login failed'), {
      endpoint: '/api/admins/login',
      email: body?.email || 'unknown',
    });

    if (error instanceof ValidationError || 
        error instanceof AuthenticationError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'AUTHENTICATION_ERROR',
          message: error.message,
        },
      }, { status: error instanceof ValidationError ? 400 : 401 });
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

/**
 * POST /api/admins/logout
 * Log out admin
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Authorization header required',
        },
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminData = AdminAuthService.verifyToken(token);

    if (!adminData) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid token',
        },
      }, { status: 401 });
    }

    // Log logout
    await logAdminAction(adminData.id, 'LOGOUT', 'ADMIN', adminData.id, {
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent'),
    });

    ErrorLogger.info('Admin logout successful', {
      adminId: adminData.id,
      email: adminData.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Admin logout failed'), {
      endpoint: '/api/admins/logout',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to logout',
      },
    }, { status: 500 });
  }
}

/**
 * GET /api/admins/me
 * Get current admin details
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Authorization header required',
        },
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminData = AdminAuthService.verifyToken(token);

    if (!adminData) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid token',
        },
      }, { status: 401 });
    }

    // Get full admin details
    const admin = await db.admin.findUnique({
      where: { id: adminData.id },
      select: {
        id: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Admin not found',
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: admin,
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get admin details'), {
      endpoint: '/api/admins/me',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get admin details',
      },
    }, { status: 500 });
  }
}

/**
 * Log admin action to audit trail
 */
async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: any
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        oldValue: metadata?.oldValues ? JSON.stringify(metadata.oldValues) : null,
        newValue: metadata?.newValues ? JSON.stringify(metadata.newValues) : null,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
  } catch (error) {
    ErrorLogger.warn('Failed to log admin action', {
      adminId,
      action,
      entityType,
      entityId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}