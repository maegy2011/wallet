import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup';
import { AdminAuthService } from '@/lib/admin-auth';

/**
 * POST /api/admin/backup/restore
 * Restore data from backup
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
    const { backupId, encryptionKey } = body;

    if (!backupId) {
      return NextResponse.json({
        success: false,
        error: 'Backup ID is required',
      }, { status: 400 });
    }

    const result = await BackupService.restoreFromBackup(backupId, encryptionKey);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to restore backup',
    }, { status: 500 });
  }
}