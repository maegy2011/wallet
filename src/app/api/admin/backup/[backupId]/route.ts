import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup';
import { AdminAuthService } from '@/lib/admin-auth';

/**
 * GET /api/admin/backup/[backupId]/download
 * Download a backup file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
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

    const { backupId } = params;
    const backupFile = await BackupService.getBackupFile(backupId);

    if (!backupFile) {
      return NextResponse.json({
        success: false,
        error: 'Backup file not found',
      }, { status: 404 });
    }

    // Get backup metadata for filename
    const backups = await BackupService.listBackups();
    const backup = backups.find(b => b.id === backupId);
    const filename = backup?.filename || `backup-${backupId}.json`;

    return new NextResponse(backupFile, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': backupFile.length.toString(),
      },
    });
  } catch (error) {
    console.error('Backup download error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to download backup',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/backup/[backupId]
 * Delete a backup
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
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

    const { backupId } = params;
    const success = await BackupService.deleteBackup(backupId);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete backup',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    });
  } catch (error) {
    console.error('Backup delete error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete backup',
    }, { status: 500 });
  }
}