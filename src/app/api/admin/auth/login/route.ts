import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminAuthService } from '@/lib/admin-auth';
import { ErrorLogger, ValidationError, AuthenticationError, ConflictError } from '@/lib/errors';
import { AuditLog, AdminRole } from '@prisma/client';

/**
 * POST /api/admin/auth/login
 * Admin login with email, password, captcha, and optional 2FA
 */
export async function POST(request: NextRequest) {
  let body: any = {};
  let requestError: any = null;
  
  try {
    try {
      body = await request.json();
    } catch (parseError) {
      requestError = parseError;
      throw new ValidationError('Invalid JSON in request body');
    }
    
    const { email, password, captchaId, captchaAnswer, twoFactorCode } = body;

    // Validate required fields
    if (!email || !password || !captchaId || !captchaAnswer) {
      throw new ValidationError('Email, password, captcha ID, and captcha answer are required');
    }

    // Validate email format
    if (!AdminAuthService.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Verify captcha
    console.log('Verifying captcha:', { captchaId, captchaAnswer });
    const isCaptchaValid = await AdminAuthService.verifyCaptchaToken(captchaId, captchaAnswer);
    console.log('Captcha valid:', isCaptchaValid);
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

    // Check 2FA if enabled
    if (admin.twoFactorEnabled && !twoFactorCode) {
      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        message: 'Two-factor authentication code required',
      });
    }

    if (admin.twoFactorEnabled && twoFactorCode) {
      if (!admin.twoFactorSecret) {
        throw new AuthenticationError('Two-factor authentication is not properly configured');
      }

      const isTwoFactorValid = AdminAuthService.verifyTwoFactorToken(
        admin.twoFactorSecret,
        twoFactorCode
      );

      if (!isTwoFactorValid) {
        throw new AuthenticationError('Invalid two-factor authentication code');
      }
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
      name: admin.name,
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
          name: admin.name,
          role: admin.role,
          twoFactorEnabled: admin.twoFactorEnabled,
          lastLoginAt: admin.lastLoginAt,
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Admin login failed'), {
      endpoint: '/api/admin/auth/login',
      email: body.email?.toLowerCase() || (requestError ? 'parse-error' : 'unknown'),
    });

    if (error instanceof ValidationError || 
        error instanceof AuthenticationError || 
        error instanceof ConflictError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 
                error instanceof AuthenticationError ? 'AUTHENTICATION_ERROR' : 
                'CONFLICT_ERROR',
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
 * Log admin action to audit trail
 */
async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: any
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        oldValues: metadata?.oldValues ? JSON.stringify(metadata.oldValues) : null,
        newValues: metadata?.newValues ? JSON.stringify(metadata.newValues) : null,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
  } catch (error) {
    ErrorLogger.warn('Failed to log admin action', {
      adminId,
      action,
      resource,
      resourceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}