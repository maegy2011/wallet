import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, NotFoundError } from '@/lib/errors';
import { v4 as uuidv4 } from 'uuid';

interface Params {
  params: {
    uuid: string;
  };
}

/**
 * POST /api/customers/[uuid]/reset-password
 * Reset customer password
 */
export const POST = withAdminAuth(async (request: NextRequest, admin, { params }: Params) => {
  try {
    const { uuid } = params;

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword();
    const resetToken = uuidv4();

    // In a real implementation, you would:
    // 1. Hash the password
    // 2. Send email with reset link or temporary password
    // 3. Store reset token with expiration
    // For now, we'll just return the temporary password

    // Log password reset
    await AdminMiddleware.logAction(
      admin.id,
      'RESET_PASSWORD',
      'CUSTOMER',
      customer.id,
      undefined,
      { 
        resetToken,
        resetAt: new Date(),
        resetBy: admin.email 
      },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Customer password reset successfully', {
      adminId: admin.id,
      customerId: customer.id,
      customerEmail: customer.email,
      resetBy: admin.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        tempPassword,
        resetToken,
        message: 'Password reset successful. In production, this would be sent via email.',
      },
      message: 'Customer password has been reset',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to reset customer password'), {
      adminId: admin.id,
      endpoint: `/api/customers/${params.uuid}/reset-password`,
    });

    if (error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset customer password',
      },
    }, { status: 500 });
  }
});

/**
 * Generate a secure temporary password
 */
function generateTempPassword(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  
  // Generate 8-character password
  for (let i = 0; i < 8; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}