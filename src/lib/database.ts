/**
 * Database utilities for Mahfza application
 * Provides secure, type-safe file-based database operations
 * with comprehensive error handling and logging
 */

import { promises as fs } from 'fs';
import path from 'path';
import { User, DbResult, ErrorCodes } from '@/types';

// Database configuration
const DB_CONFIG = {
  usersFilePath: path.join(process.cwd(), 'data', 'users.json'),
  backupDir: path.join(process.cwd(), 'data', 'backups'),
  maxBackups: 10,
  writeLockTimeout: 5000, // 5 seconds
} as const;

/**
 * Database operation wrapper with error handling and logging
 */
class DatabaseService {
  private static instance: DatabaseService;
  private writeLocks: Set<string> = new Set();

  private constructor() {}

  /**
   * Singleton pattern for database service
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Acquire a write lock for file operations
   * Prevents concurrent write operations that could corrupt data
   */
  private async acquireWriteLock(filePath: string): Promise<void> {
    const lockKey = filePath;
    const startTime = Date.now();
    
    while (this.writeLocks.has(lockKey)) {
      if (Date.now() - startTime > DB_CONFIG.writeLockTimeout) {
        throw new Error(`Database write lock timeout for ${filePath}`);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.writeLocks.add(lockKey);
  }

  /**
   * Release a write lock
   */
  private releaseWriteLock(filePath: string): void {
    this.writeLocks.delete(filePath);
  }

  /**
   * Create backup of database file before modifications
   */
  private async createBackup(filePath: string): Promise<void> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(DB_CONFIG.backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(DB_CONFIG.backupDir, `users-${timestamp}.json`);
      
      await fs.copyFile(filePath, backupPath);
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      console.log(`Database backup created: ${backupPath}`);
    } catch (error) {
      // Log backup error but don't fail the operation
      console.error('Failed to create database backup:', error);
    }
  }

  /**
   * Clean up old backup files, keeping only the most recent ones
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(DB_CONFIG.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('users-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(DB_CONFIG.backupDir, file),
          mtime: fs.stat(path.join(DB_CONFIG.backupDir, file)).then(stat => stat.mtime)
        }));

      // Sort by modification time (newest first)
      const sortedBackups = await Promise.all(
        backupFiles.map(async (file) => ({
          ...file,
          mtime: await file.mtime
        }))
      );
      
      sortedBackups.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Remove old backups beyond the limit
      if (sortedBackups.length > DB_CONFIG.maxBackups) {
        const filesToDelete = sortedBackups.slice(DB_CONFIG.maxBackups);
        await Promise.all(
          filesToDelete.map(file => fs.unlink(file.path).catch(console.error))
        );
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Read users from database with comprehensive error handling
   */
  public async getUsers(): Promise<DbResult<User[]>> {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(DB_CONFIG.usersFilePath), { recursive: true });
      
      const data = await fs.readFile(DB_CONFIG.usersFilePath, 'utf8');
      
      if (!data.trim()) {
        return { success: true, data: [] };
      }

      const users = JSON.parse(data);
      
      // Validate data structure
      if (!Array.isArray(users)) {
        throw new Error('Invalid database structure: expected array');
      }

      return { success: true, data: users };
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        // File doesn't exist, return empty array
        return { success: true, data: [] };
      }
      
      console.error('Failed to read users from database:', error);
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to read user data'
        }
      };
    }
  }

  /**
   * Save users to database with backup and atomic write
   */
  public async saveUsers(users: User[]): Promise<DbResult<User[]>> {
    const filePath = DB_CONFIG.usersFilePath;
    
    try {
      // Acquire write lock
      await this.acquireWriteLock(filePath);
      
      try {
        // Validate input data
        if (!Array.isArray(users)) {
          throw new Error('Invalid data: expected array of users');
        }

        // Create backup before modification
        await this.createBackup(filePath);
        
        // Prepare data for writing
        const dataToWrite = JSON.stringify(users, null, 2);
        
        // Ensure data directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Atomic write: write to temp file first, then rename
        const tempFilePath = `${filePath}.tmp`;
        await fs.writeFile(tempFilePath, dataToWrite, 'utf8');
        await fs.rename(tempFilePath, filePath);
        
        console.log(`Successfully saved ${users.length} users to database`);
        return { success: true, data: users };
        
      } finally {
        // Always release the lock
        this.releaseWriteLock(filePath);
      }
    } catch (error) {
      console.error('Failed to save users to database:', error);
      return {
        success: false,
        error: {
          code: ErrorCodes.FILE_WRITE_ERROR,
          message: 'Failed to save user data'
        }
      };
    }
  }

  /**
   * Find user by email with case-insensitive search
   */
  public async findUserByEmail(email: string): Promise<DbResult<User>> {
    try {
      // Validate email format
      if (!email || typeof email !== 'string') {
        return {
          success: false,
          error: {
            code: ErrorCodes.INVALID_EMAIL,
            message: 'Invalid email format'
          }
        };
      }

      const normalizedEmail = email.toLowerCase().trim();
      const result = await this.getUsers();
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || {
            code: ErrorCodes.DATABASE_ERROR,
            message: 'Failed to read users'
          }
        };
      }

      const user = result.data.find(
        u => u.email.toLowerCase() === normalizedEmail
      );

      if (!user) {
        return {
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found'
          }
        };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Failed to find user by email:', error);
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Database operation failed'
        }
      };
    }
  }

  /**
   * Find user by ID
   */
  public async findUserById(id: string): Promise<DbResult<User>> {
    try {
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid user ID'
          }
        };
      }

      const result = await this.getUsers();
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || {
            code: ErrorCodes.DATABASE_ERROR,
            message: 'Failed to read users'
          }
        };
      }

      const user = result.data.find(u => u.id === id);

      if (!user) {
        return {
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found'
          }
        };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Failed to find user by ID:', error);
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Database operation failed'
        }
      };
    }
  }

  /**
   * Create new user with validation and duplicate checking
   */
  public async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbResult<User>> {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'password'];
      for (const field of requiredFields) {
        if (!userData[field as keyof typeof userData]) {
          return {
            success: false,
            error: {
              code: ErrorCodes.REQUIRED_FIELD_MISSING,
              message: `${field} is required`
            }
          };
        }
      }

      // Check for duplicate email
      const existingUserResult = await this.findUserByEmail(userData.email);
      if (existingUserResult.success) {
        return {
          success: false,
          error: {
            code: ErrorCodes.USER_ALREADY_EXISTS,
            message: 'User with this email already exists'
          }
        };
      }

      // Generate new user
      const newUser: User = {
        ...userData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        loginAttempts: 0,
      };

      // Save to database
      const usersResult = await this.getUsers();
      if (!usersResult.success || !usersResult.data) {
        return {
          success: false,
          error: usersResult.error || {
            code: ErrorCodes.DATABASE_ERROR,
            message: 'Failed to read existing users'
          }
        };
      }

      const updatedUsers = [...usersResult.data, newUser];
      const saveResult = await this.saveUsers(updatedUsers);
      
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error
        };
      }

      console.log(`Successfully created new user: ${newUser.email}`);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Failed to create user:', error);
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to create user'
        }
      };
    }
  }

  /**
   * Update user with validation and audit trail
   */
  public async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<DbResult<User>> {
    try {
      // Find existing user
      const userResult = await this.findUserById(id);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: userResult.error || {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found'
          }
        };
      }

      // Prepare updated user
      const updatedUser: User = {
        ...userResult.data,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Get all users and update the specific one
      const usersResult = await this.getUsers();
      if (!usersResult.success || !usersResult.data) {
        return {
          success: false,
          error: usersResult.error || {
            code: ErrorCodes.DATABASE_ERROR,
            message: 'Failed to read users'
          }
        };
      }

      const updatedUsers = usersResult.data.map(user => 
        user.id === id ? updatedUser : user
      );

      // Save to database
      const saveResult = await this.saveUsers(updatedUsers);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error
        };
      }

      console.log(`Successfully updated user: ${updatedUser.email}`);
      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Failed to update user:', error);
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to update user'
        }
      };
    }
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();