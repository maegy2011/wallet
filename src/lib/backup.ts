/**
 * Backup and Restore Service
 * Handles database backups, data exports, and restoration functionality
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AdminAuthService } from './admin-auth';

const db = new PrismaClient();

export interface BackupConfig {
  includeCustomers: boolean;
  includeSubscriptions: boolean;
  includeInvoices: boolean;
  includePackages: boolean;
  includeAdminLogs: boolean;
  encryptBackup: boolean;
}

export interface BackupMetadata {
  id: string;
  filename: string;
  createdAt: string;
  size: number;
  checksum: string;
  config: BackupConfig;
  createdBy: string;
  version: string;
  tableCount: number;
  recordCount: number;
}

export interface RestoreResult {
  success: boolean;
  recordsRestored: number;
  errors: string[];
  warnings: string[];
  tablesRestored: string[];
}

export class BackupService {
  private static readonly BACKUP_DIR = path.join(process.cwd(), 'backups');
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  
  /**
   * Initialize backup directory
   */
  static async initializeBackupDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) {
        fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to initialize backup directory:', error);
      throw new Error('Backup directory initialization failed');
    }
  }

  /**
   * Create a comprehensive database backup
   */
  static async createBackup(config: BackupConfig, adminId: string): Promise<BackupMetadata> {
    await this.initializeBackupDir();
    
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}-${backupId}.json`;
    const filepath = path.join(this.BACKUP_DIR, filename);
    
    try {
      const backupData: any = {
        metadata: {
          id: backupId,
          createdAt: new Date().toISOString(),
          createdBy: adminId,
          version: '1.0.0',
          config,
        },
        data: {}
      };

      let totalRecords = 0;
      const tables: string[] = [];

      // Backup Customers
      if (config.includeCustomers) {
        const customers = await db.customer.findMany({
          include: {
            subscriptions: true,
            invoices: true,
          }
        });
        backupData.data.customers = customers;
        totalRecords += customers.length;
        tables.push('customers');
      }

      // Backup Subscriptions (if not included with customers)
      if (config.includeSubscriptions && !config.includeCustomers) {
        const subscriptions = await db.subscription.findMany();
        backupData.data.subscriptions = subscriptions;
        totalRecords += subscriptions.length;
        tables.push('subscriptions');
      }

      // Backup Invoices (if not included with customers)
      if (config.includeInvoices && !config.includeCustomers) {
        const invoices = await db.invoice.findMany();
        backupData.data.invoices = invoices;
        totalRecords += invoices.length;
        tables.push('invoices');
      }

      // Backup Packages
      if (config.includePackages) {
        const packages = await db.package.findMany();
        backupData.data.packages = packages;
        totalRecords += packages.length;
        tables.push('packages');
      }

      // Backup Admin Logs
      if (config.includeAdminLogs) {
        const adminLogs = await db.auditLog.findMany();
        backupData.data.adminLogs = adminLogs;
        totalRecords += adminLogs.length;
        tables.push('audit_logs');
      }

      // Convert to JSON string
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Encrypt if requested
      let finalData = jsonString;
      let encryptionKey = '';
      
      if (config.encryptBackup) {
        encryptionKey = crypto.randomBytes(32).toString('hex');
        finalData = await this.encryptData(jsonString, encryptionKey);
      }

      // Write backup file
      fs.writeFileSync(filepath, finalData);

      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(finalData).digest('hex');

      // Get file size
      const stats = fs.statSync(filepath);

      const metadata: BackupMetadata = {
        id: backupId,
        filename,
        createdAt: backupData.metadata.createdAt,
        size: stats.size,
        checksum,
        config,
        createdBy: adminId,
        version: backupData.metadata.version,
        tableCount: tables.length,
        recordCount: totalRecords,
      };

      // Store encryption key separately if used
      if (config.encryptBackup) {
        const keyFile = path.join(this.BACKUP_DIR, `${filename}.key`);
        fs.writeFileSync(keyFile, encryptionKey);
      }

      return metadata;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error(`Backup creation failed: ${error}`);
    }
  }

  /**
   * Restore data from backup
   */
  static async restoreFromBackup(backupId: string, encryptionKey?: string): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: false,
      recordsRestored: 0,
      errors: [],
      warnings: [],
      tablesRestored: [],
    };

    try {
      await this.initializeBackupDir();
      
      // Find backup file
      const backupFile = fs.readdirSync(this.BACKUP_DIR)
        .find(file => file.includes(backupId) && file.endsWith('.json'));

      if (!backupFile) {
        throw new Error('Backup file not found');
      }

      const filepath = path.join(this.BACKUP_DIR, backupFile);
      let backupData = fs.readFileSync(filepath, 'utf8');

      // Decrypt if needed
      if (encryptionKey) {
        backupData = await this.decryptData(backupData, encryptionKey);
      }

      const backup = JSON.parse(backupData);

      // Validate backup structure
      if (!backup.metadata || !backup.data) {
        throw new Error('Invalid backup file structure');
      }

      const config = backup.metadata.config;

      // Restore Customers
      if (config.includeCustomers && backup.data.customers) {
        try {
          for (const customer of backup.data.customers) {
            await db.customer.upsert({
              where: { id: customer.id },
              update: {
                name: customer.name,
                businessName: customer.businessName,
                email: customer.email,
                mobile: customer.mobile,
                status: customer.status,
                customerType: customer.customerType,
                notes: customer.notes,
                updatedAt: new Date(),
              },
              create: {
                ...customer,
                createdAt: new Date(customer.createdAt),
                updatedAt: new Date(),
              },
            });
            result.recordsRestored++;
          }
          result.tablesRestored.push('customers');
        } catch (error) {
          result.errors.push(`Failed to restore customers: ${error}`);
        }
      }

      // Restore Subscriptions
      if (config.includeSubscriptions && backup.data.subscriptions) {
        try {
          for (const subscription of backup.data.subscriptions) {
            await db.subscription.upsert({
              where: { id: subscription.id },
              update: {
                customerId: subscription.customerId,
                packageId: subscription.packageId,
                status: subscription.status,
                startDate: new Date(subscription.startDate),
                endDate: new Date(subscription.endDate),
                autoRenew: subscription.autoRenew,
                updatedAt: new Date(),
              },
              create: {
                ...subscription,
                startDate: new Date(subscription.startDate),
                endDate: new Date(subscription.endDate),
                createdAt: new Date(subscription.createdAt),
                updatedAt: new Date(),
              },
            });
            result.recordsRestored++;
          }
          result.tablesRestored.push('subscriptions');
        } catch (error) {
          result.errors.push(`Failed to restore subscriptions: ${error}`);
        }
      }

      // Restore Invoices
      if (config.includeInvoices && backup.data.invoices) {
        try {
          for (const invoice of backup.data.invoices) {
            await db.invoice.upsert({
              where: { id: invoice.id },
              update: {
                customerId: invoice.customerId,
                amount: invoice.amount,
                status: invoice.status,
                dueDate: new Date(invoice.dueDate),
                paidDate: invoice.paidDate ? new Date(invoice.paidDate) : null,
                updatedAt: new Date(),
              },
              create: {
                ...invoice,
                dueDate: new Date(invoice.dueDate),
                paidDate: invoice.paidDate ? new Date(invoice.paidDate) : null,
                createdAt: new Date(invoice.createdAt),
                updatedAt: new Date(),
              },
            });
            result.recordsRestored++;
          }
          result.tablesRestored.push('invoices');
        } catch (error) {
          result.errors.push(`Failed to restore invoices: ${error}`);
        }
      }

      // Restore Packages
      if (config.includePackages && backup.data.packages) {
        try {
          for (const pkg of backup.data.packages) {
            await db.package.upsert({
              where: { id: pkg.id },
              update: {
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                duration: pkg.duration,
                features: pkg.features,
                isActive: pkg.isActive,
                updatedAt: new Date(),
              },
              create: {
                ...pkg,
                createdAt: new Date(pkg.createdAt),
                updatedAt: new Date(),
              },
            });
            result.recordsRestored++;
          }
          result.tablesRestored.push('packages');
        } catch (error) {
          result.errors.push(`Failed to restore packages: ${error}`);
        }
      }

      // Restore Admin Logs
      if (config.includeAdminLogs && backup.data.adminLogs) {
        try {
          for (const log of backup.data.adminLogs) {
            await db.auditLog.upsert({
              where: { id: log.id },
              update: {
                adminId: log.adminId,
                action: log.action,
                resource: log.resource,
                oldValues: log.oldValues,
                newValues: log.newValues,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                timestamp: new Date(log.timestamp),
              },
              create: {
                ...log,
                timestamp: new Date(log.timestamp),
              },
            });
            result.recordsRestored++;
          }
          result.tablesRestored.push('audit_logs');
        } catch (error) {
          result.errors.push(`Failed to restore admin logs: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      
      if (result.success) {
        result.warnings.push(`Backup restored successfully. ${result.recordsRestored} records restored.`);
      }

      return result;
    } catch (error) {
      result.errors.push(`Restore failed: ${error}`);
      return result;
    }
  }

  /**
   * List all available backups
   */
  static async listBackups(): Promise<BackupMetadata[]> {
    await this.initializeBackupDir();
    
    try {
      const files = fs.readdirSync(this.BACKUP_DIR)
        .filter(file => file.endsWith('.json') && !file.endsWith('.key.json'));

      const backups: BackupMetadata[] = [];

      for (const file of files) {
        try {
          const filepath = path.join(this.BACKUP_DIR, file);
          const stats = fs.statSync(filepath);
          const content = fs.readFileSync(filepath, 'utf8');
          
          // Try to parse as JSON (might be encrypted)
          let backup;
          try {
            backup = JSON.parse(content);
          } catch {
            // File is encrypted, skip metadata extraction
            continue;
          }

          if (backup.metadata) {
            backups.push({
              id: backup.metadata.id,
              filename: file,
              createdAt: backup.metadata.createdAt,
              size: stats.size,
              checksum: crypto.createHash('sha256').update(content).digest('hex'),
              config: backup.metadata.config,
              createdBy: backup.metadata.createdBy,
              version: backup.metadata.version,
              tableCount: Object.keys(backup.data || {}).length,
              recordCount: Object.values(backup.data || {}).reduce((sum: number, table: any) => sum + (Array.isArray(table) ? table.length : 0), 0),
            });
          }
        } catch (error) {
          console.error(`Error reading backup file ${file}:`, error);
        }
      }

      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(backupId: string): Promise<boolean> {
    try {
      await this.initializeBackupDir();
      
      const files = fs.readdirSync(this.BACKUP_DIR)
        .filter(file => file.includes(backupId));

      for (const file of files) {
        const filepath = path.join(this.BACKUP_DIR, file);
        fs.unlinkSync(filepath);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Download backup file
   */
  static async getBackupFile(backupId: string): Promise<Buffer | null> {
    try {
      await this.initializeBackupDir();
      
      const backupFile = fs.readdirSync(this.BACKUP_DIR)
        .find(file => file.includes(backupId) && file.endsWith('.json'));

      if (!backupFile) {
        return null;
      }

      const filepath = path.join(this.BACKUP_DIR, backupFile);
      return fs.readFileSync(filepath);
    } catch (error) {
      console.error('Failed to get backup file:', error);
      return null;
    }
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  private static async encryptData(data: string, key: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  private static async decryptData(encryptedData: string, key: string): Promise<string> {
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    latestBackup: string | null;
    encryptedBackups: number;
  }> {
    const backups = await this.listBackups();
    
    return {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
      latestBackup: backups.length > 0 ? backups[0].createdAt : null,
      encryptedBackups: backups.filter(backup => backup.config.encryptBackup).length,
    };
  }
}