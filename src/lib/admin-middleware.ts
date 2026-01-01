/**
 * Admin Authentication Middleware
 * Validates admin tokens and permissions for API routes
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { AdminAuthService } from '@/lib/admin-auth';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';

export interface AdminContext {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  twoFactorEnabled: boolean;
}

export class AdminMiddleware {
  /**
   * Verify admin token and return admin context
   */
  static async verifyAdmin(request: NextRequest): Promise<AdminContext> {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('No authorization token provided');
    }

    const adminSession = AdminAuthService.verifyToken(token);
    if (!adminSession) {
      throw new AuthenticationError('Invalid or expired token');
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
      },
    });

    if (!admin || !admin.isActive) {
      throw new AuthenticationError('Admin account not found or inactive');
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      twoFactorEnabled: admin.twoFactorEnabled,
    };
  }

  /**
   * Check if admin has required role
   */
  static requireRole(admin: AdminContext, requiredRole: 'SUPER_ADMIN' | 'ADMIN'): void {
    if (requiredRole === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
      throw new AuthorizationError('Super Admin access required');
    }
  }

  /**
   * Check if admin can perform action on resource
   */
  static canPerformAction(
    admin: AdminContext,
    action: string,
    resource: string
  ): boolean {
    // Super Admin can do everything
    if (admin.role === 'SUPER_ADMIN') {
      return true;
    }

    // Define permissions for regular admin
    const adminPermissions = {
      // Customer Management
      'CUSTOMER_CREATE': true,
      'CUSTOMER_READ': true,
      'CUSTOMER_UPDATE': true,
      'CUSTOMER_DELETE': false, // Only Super Admin can delete
      
      // Package Management
      'PACKAGE_CREATE': false, // Only Super Admin
      'PACKAGE_READ': true,
      'PACKAGE_UPDATE': false, // Only Super Admin
      'PACKAGE_DELETE': false, // Only Super Admin
      
      // Subscription Management
      'SUBSCRIPTION_CREATE': true,
      'SUBSCRIPTION_READ': true,
      'SUBSCRIPTION_UPDATE': true,
      'SUBSCRIPTION_DELETE': false, // Only Super Admin
      
      // Invoice Management
      'INVOICE_CREATE': true,
      'INVOICE_READ': true,
      'INVOICE_UPDATE': true,
      'INVOICE_DELETE': false, // Only Super Admin
      
      // Admin Management
      'ADMIN_CREATE': false, // Only Super Admin
      'ADMIN_READ': true,
      'ADMIN_UPDATE': false, // Only Super Admin
      'ADMIN_DELETE': false, // Only Super Admin
      
      // Backup Management
      'BACKUP_CREATE': true,
      'BACKUP_READ': true,
      'BACKUP_RESTORE': false, // Only Super Admin
      
      // System Settings
      'SETTING_READ': true,
      'SETTING_UPDATE': false, // Only Super Admin
      
      // Audit Logs
      'AUDIT_READ': true,
      'AUDIT_DELETE': false, // Only Super Admin
    };

    const permissionKey = `${resource.toUpperCase()}_${action.toUpperCase()}`;
    return adminPermissions[permissionKey] || false;
  }

  /**
   * Log admin action to audit trail
   */
  static async logAction(
    adminId: string,
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          adminId,
          action,
          resource,
          resourceId,
          oldValues: oldValues ? JSON.stringify(oldValues) : null,
          newValues: newValues ? JSON.stringify(newValues) : null,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        },
      });
    } catch (error) {
      // Don't throw error for logging failures, just log to console
      console.error('Failed to log admin action:', error);
    }
  }

  /**
   * Extract client information from request
   */
  static getClientInfo(request: NextRequest): {
    ipAddress: string;
    userAgent: string;
  } {
    return {
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
  }
}

/**
 * Higher-order function to wrap API handlers with admin authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest, admin: AdminContext) => Promise<Response>,
  options?: {
    requiredRole?: 'SUPER_ADMIN' | 'ADMIN';
    requiredPermission?: {
      action: string;
      resource: string;
    };
  }
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Verify admin token
      const admin = await AdminMiddleware.verifyAdmin(request);

      // Check role requirements
      if (options?.requiredRole) {
        AdminMiddleware.requireRole(admin, options.requiredRole);
      }

      // Check permission requirements
      if (options?.requiredPermission) {
        const canPerform = AdminMiddleware.canPerformAction(
          admin,
          options.requiredPermission.action,
          options.requiredPermission.resource
        );

        if (!canPerform) {
          throw new AuthorizationError('Insufficient permissions');
        }
      }

      // Call the original handler
      return await handler(request, admin);

    } catch (error) {
      // Handle authentication and authorization errors
      if (error instanceof AuthenticationError) {
        return Response.json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: error.message,
          },
        }, { status: 401 });
      }

      if (error instanceof AuthorizationError) {
        return Response.json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: error.message,
          },
        }, { status: 403 });
      }

      // Re-throw other errors to be handled by the handler
      throw error;
    }
  };
}