import { NextRequest, NextResponse } from 'next/server';
import { BackupService, BackupConfig } from '@/lib/backup';
import { AdminAuthService } from '@/lib/admin-auth';

/**
 * GET /api/admin/backup
 * List all available backups
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authorization token required',
      }, { status: 401 });
    }

    const admin = AdminAuthService.verifyToken(token);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }

    const backups = await BackupService.listBackups();
    const stats = await BackupService.getBackupStats();

    return NextResponse.json({
      success: true,
      data: {
        backups,
        stats,
      },
    });
  } catch (error) {
    console.error('Backup list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve backups',
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/backup
 * Create a new backup
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authorization token required',
      }, { status: 401 });
    }

    const admin = AdminAuthService.verifyToken(token);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }

    const body = await request.json();
    const config: BackupConfig = {
      includeCustomers: body.includeCustomers ?? true,
      includeSubscriptions: body.includeSubscriptions ?? true,
      includeInvoices: body.includeInvoices ?? true,
      includePackages: body.includePackages ?? true,
      includeAdminLogs: body.includeAdminLogs ?? false,
      encryptBackup: body.encryptBackup ?? false,
    };

    const backup = await BackupService.createBackup(config, admin.id);

    return NextResponse.json({
      success: true,
      data: backup,
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create backup',
    }, { status: 500 });
  }
}