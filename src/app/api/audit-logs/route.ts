import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger } from '@/lib/errors';

/**
 * GET /api/audit-logs
 * List all audit logs (filtered by admin/action/entity)
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const adminId = searchParams.get('adminId');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { admin: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get audit logs with pagination
    const [auditLogs, totalCount] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    // Parse JSON fields for better readability
    const auditLogsWithParsedData = auditLogs.map(log => ({
      ...log,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null,
    }));

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'AUDIT_LOG',
      undefined,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: {
        auditLogs: auditLogsWithParsedData,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get audit logs'), {
      adminId: admin.id,
      endpoint: '/api/audit-logs',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve audit logs',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/audit-logs
 * Log an admin action (automatically called from other endpoints)
 */
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json();
    const {
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
    } = body;

    // Validation
    if (!action) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Action is required',
        },
      }, { status: 400 });
    }

    // Create audit log entry
    const auditLog = await db.auditLog.create({
      data: {
        adminId: admin.id,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress: request.ip,
        userAgent: request.headers.get('user-agent'),
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    ErrorLogger.info('Audit log created successfully', {
      adminId: admin.id,
      auditLogId: auditLog.id,
      action,
      entityType,
      entityId,
    });

    return NextResponse.json({
      success: true,
      data: auditLog,
      message: 'Audit log created successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to create audit log'), {
      adminId: admin.id,
      endpoint: '/api/audit-logs',
      requestBody: body,
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create audit log',
      },
    }, { status: 500 });
  }
});