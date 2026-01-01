/**
 * Core type definitions for the Mahfza application
 * Provides type safety across the entire application
 */

// User-related types with comprehensive typing
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Hashed password
  createdAt: string;
  updatedAt: string;
  onboarded: boolean;
  plan: 'free' | 'pro';
  lastLoginAt?: string;
  emailVerified: boolean;
  loginAttempts: number;
  lockedUntil?: string; // For account lockout after failed attempts
}

// Public user data (excluding sensitive information)
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboarded: boolean;
  plan: 'free' | 'pro';
  emailVerified: boolean;
}

// Authentication credentials interface
export interface AuthCredentials {
  email: string;
  password: string;
  name?: string; // Only required for signup
  isSignup: boolean;
}

// API response types for consistent error handling
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Database operation result type
export interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: 'NOT_FOUND' | 'DUPLICATE' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'FILE_ERROR';
    message: string;
  };
}

// Form validation error type
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Portfolio and transaction types (for future use)
export interface Wallet {
  id: string;
  userId: string;
  name: string;
  description?: string;
  initialBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  description?: string;
  category?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Error codes for consistent error handling
export enum ErrorCodes {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

// Configuration types
export interface AppConfig {
  auth: {
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    passwordMinLength: number;
    sessionTimeout: number; // in hours
  };
  database: {
    filePath: string;
    backupEnabled: boolean;
    backupInterval: number; // in hours
  };
  security: {
    bcryptRounds: number;
    enableRateLimit: boolean;
    enableCaptcha: boolean;
  };
}