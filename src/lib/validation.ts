/**
 * Input validation and sanitization utilities
 * Provides comprehensive validation for all user inputs with security considerations
 */

import { ValidationError, ErrorCodes } from '@/types';

/**
 * Email validation with comprehensive checks
 */
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  /**
   * Validate email format and business rules
   */
  public static validate(email: string): ValidationError | null {
    if (!email || typeof email !== 'string') {
      return {
        field: 'email',
        message: 'Email is required',
        code: ErrorCodes.REQUIRED_FIELD_MISSING
      };
    }

    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return {
        field: 'email',
        message: 'Email cannot be empty',
        code: ErrorCodes.REQUIRED_FIELD_MISSING
      };
    }

    if (trimmedEmail.length > 254) { // RFC 5321 limit
      return {
        field: 'email',
        message: 'Email is too long',
        code: ErrorCodes.INVALID_EMAIL
      };
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return {
        field: 'email',
        message: 'Invalid email format',
        code: ErrorCodes.INVALID_EMAIL
      };
    }

    // Additional business rule checks
    const [localPart, domain] = trimmedEmail.split('@');
    
    if (localPart.length > 64) { // RFC 5321 limit
      return {
        field: 'email',
        message: 'Email local part is too long',
        code: ErrorCodes.INVALID_EMAIL
      };
    }

    // Block suspicious domains (example)
    const blockedDomains = ['tempmail.com', 'throwaway.email'];
    if (blockedDomains.some(blocked => domain.toLowerCase().endsWith(blocked))) {
      return {
        field: 'email',
        message: 'Disposable email addresses are not allowed',
        code: ErrorCodes.INVALID_EMAIL
      };
    }

    return null; // Valid
  }

  /**
   * Sanitize email for storage
   */
  public static sanitize(email: string): string {
    return email.trim().toLowerCase();
  }
}

/**
 * Password validation with security requirements
 */
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  
  /**
   * Validate password strength and format
   */
  public static validate(password: string): ValidationError | null {
    if (!password || typeof password !== 'string') {
      return {
        field: 'password',
        message: 'Password is required',
        code: ErrorCodes.REQUIRED_FIELD_MISSING
      };
    }

    if (password.length < this.MIN_LENGTH) {
      return {
        field: 'password',
        message: `Password must be at least ${this.MIN_LENGTH} characters long`,
        code: ErrorCodes.WEAK_PASSWORD
      };
    }

    if (password.length > this.MAX_LENGTH) {
      return {
        field: 'password',
        message: `Password must be less than ${this.MAX_LENGTH} characters long`,
        code: ErrorCodes.WEAK_PASSWORD
      };
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '12345678', 'qwerty123', 'admin123', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'sunshine'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      return {
        field: 'password',
        message: 'Password is too common. Please choose a stronger password',
        code: ErrorCodes.WEAK_PASSWORD
      };
    }

    // Password strength requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    if (strengthScore < 3) {
      return {
        field: 'password',
        message: 'Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters',
        code: ErrorCodes.WEAK_PASSWORD
      };
    }

    return null; // Valid
  }

  /**
   * Check password strength score (0-4)
   */
  public static getStrengthScore(password: string): number {
    let score = 0;
    
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    return score;
  }

  /**
   * Get password strength description
   */
  public static getStrengthDescription(password: string): string {
    const score = this.getStrengthScore(password);
    
    switch (score) {
      case 0-1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return 'Unknown';
    }
  }
}

/**
 * Name validation with sanitization
 */
export class NameValidator {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;
  
  /**
   * Validate name format and content
   */
  public static validate(name: string): ValidationError | null {
    if (!name || typeof name !== 'string') {
      return {
        field: 'name',
        message: 'Name is required',
        code: ErrorCodes.REQUIRED_FIELD_MISSING
      };
    }

    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return {
        field: 'name',
        message: 'Name cannot be empty',
        code: ErrorCodes.REQUIRED_FIELD_MISSING
      };
    }

    if (trimmedName.length < this.MIN_LENGTH) {
      return {
        field: 'name',
        message: `Name must be at least ${this.MIN_LENGTH} characters long`,
        code: ErrorCodes.REQUIRED_FIELD_MISSING
      };
    }

    if (trimmedName.length > this.MAX_LENGTH) {
      return {
        field: 'name',
        message: `Name must be less than ${this.MAX_LENGTH} characters long`,
        code: ErrorCodes.VALIDATION_ERROR
      };
    }

    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      return {
        field: 'name',
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
        code: ErrorCodes.VALIDATION_ERROR
      };
    }

    // Check for suspicious patterns
    if (/(.)\1{2,}/.test(trimmedName)) { // Repeated characters
      return {
        field: 'name',
        message: 'Name contains invalid character patterns',
        code: ErrorCodes.VALIDATION_ERROR
      };
    }

    return null; // Valid
  }

  /**
   * Sanitize name for storage
   */
  public static sanitize(name: string): string {
    return name.trim().replace(/\s+/g, ' '); // Normalize whitespace
  }
}

/**
 * Comprehensive form validator
 */
export class FormValidator {
  /**
   * Validate authentication credentials
   */
  public static validateAuthCredentials(data: {
    email?: string;
    password?: string;
    name?: string;
    isSignup?: boolean;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate email
    if (data.email) {
      const emailError = EmailValidator.validate(data.email);
      if (emailError) errors.push(emailError);
    }

    // Validate password
    if (data.password) {
      const passwordError = PasswordValidator.validate(data.password);
      if (passwordError) errors.push(passwordError);
    }

    // Validate name (only for signup)
    if (data.isSignup && data.name) {
      const nameError = NameValidator.validate(data.name);
      if (nameError) errors.push(nameError);
    }

    return errors;
  }

  /**
   * Validate that required fields are present
   */
  public static validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push({
          field,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          code: ErrorCodes.REQUIRED_FIELD_MISSING
        });
      }
    }

    return errors;
  }

  /**
   * Sanitize form data
   */
  public static sanitizeAuthData(data: {
    email?: string;
    password?: string;
    name?: string;
  }): {
    email?: string;
    password?: string;
    name?: string;
  } {
    const sanitized: any = {};

    if (data.email) {
      sanitized.email = EmailValidator.sanitize(data.email);
    }

    if (data.password) {
      // Password is not sanitized (stored as-is after hashing)
      sanitized.password = data.password;
    }

    if (data.name) {
      sanitized.name = NameValidator.sanitize(data.name);
    }

    return sanitized;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();
  
  /**
   * Check if rate limit is exceeded
   */
  public static isRateLimited(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Increment counter
    record.count++;
    record.lastAttempt = now;

    return record.count > maxAttempts;
  }

  /**
   * Get remaining attempts before rate limit
   */
  public static getRemainingAttempts(
    identifier: string,
    maxAttempts: number = 5
  ): number {
    const record = this.attempts.get(identifier);
    return record ? Math.max(0, maxAttempts - record.count) : maxAttempts;
  }

  /**
   * Clear rate limit for identifier
   */
  public static clearRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }
}