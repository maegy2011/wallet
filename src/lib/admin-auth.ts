/**
 * Admin Authentication Utilities
 * Handles password hashing, 2FA, JWT tokens, and security
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface AdminLoginData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AdminSession {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  twoFactorEnabled: boolean;
}

export class AdminAuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash or plain text (temporary for development)
   */
  static async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    // For development: if stored password doesn't look like bcrypt hash, compare as plain text
    if (!storedPassword.startsWith('$2') && !storedPassword.startsWith('$2a') && !storedPassword.startsWith('$2b')) {
      return password === storedPassword;
    }
    
    // For production: use bcrypt comparison
    try {
      return bcrypt.compare(password, storedPassword);
    } catch (error) {
      // Fallback to plain text comparison if bcrypt fails
      return password === storedPassword;
    }
  }

  /**
   * Generate JWT token for admin session
   */
  static generateToken(admin: AdminSession): string {
    return jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        twoFactorEnabled: admin.twoFactorEnabled,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        twoFactorEnabled: decoded.twoFactorEnabled,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate 2FA secret for admin
   */
  static generateTwoFactorSecret(adminEmail: string): {
    secret: string;
    backupCodes: string[];
    qrCodeUrl: string;
  } {
    const secret = speakeasy.generateSecret({
      name: `Mahfza Admin (${adminEmail})`,
      issuer: 'Mahfza | محفظة',
      length: 32,
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    return {
      secret: secret.base32!,
      backupCodes,
      qrCodeUrl: secret.otpauth_url!,
    };
  }

  /**
   * Generate QR code for 2FA setup
   */
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Verify 2FA token
   */
  static verifyTwoFactorToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 steps before/after for time drift
    });
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(providedCode: string, backupCodes: string[]): boolean {
    return backupCodes.includes(providedCode.toUpperCase());
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each category
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill remaining length
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check if admin account is locked
   */
  static isAccountLocked(lockedUntil: Date | null): boolean {
    if (!lockedUntil) return false;
    return new Date() < lockedUntil;
  }

  /**
   * Lock admin account for specified minutes
   */
  static lockAccount(minutes: number = 30): Date {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + minutes);
    return lockedUntil;
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data (for backups)
   */
  static encryptData(data: string, key: string): string {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data (for backups)
   */
  static decryptData(encryptedData: string, key: string): string {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate checksum for file integrity
   */
  static generateChecksum(data: Buffer | string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate captcha token (placeholder for react-next-captcha integration)
   */
  static generateCaptchaToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify captcha token with production captcha system
   */
  static async verifyCaptchaToken(captchaId: string, captchaAnswer: string): Promise<boolean> {
    try {
      // In development, allow bypass with test tokens for easier testing
      if (process.env.NODE_ENV === 'development') {
        const testTokens = ['test-token', 'captcha-test', 'demo-token', 'admin-test'];
        if (testTokens.includes(captchaAnswer)) {
          return true;
        }
      }

      // Call the captcha verification API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: captchaId,
          answer: captchaAnswer,
        }),
      });

      if (!response.ok) {
        console.error('Captcha verification failed:', response.status);
        return false;
      }

      const result = await response.json();
      return result.success && result.data.valid;
    } catch (error) {
      console.error('Captcha verification error:', error);
      return false;
    }
  }
}