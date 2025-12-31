/**
 * Comprehensive error handling utilities
 * Provides consistent error handling, logging, and user-friendly error messages
 */

import { ApiResponse, ErrorCodes } from '@/types';

/**
 * Application error class with structured error information
 */
export class AppError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCodes = ErrorCodes.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Specific error types for different scenarios
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400, true, { field });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, ErrorCodes.UNAUTHORIZED, 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, ErrorCodes.FORBIDDEN, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, ErrorCodes.USER_NOT_FOUND, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCodes.USER_ALREADY_EXISTS, 409, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, operation?: string) {
    super(message, ErrorCodes.DATABASE_ERROR, 500, true, { operation });
  }
}

/**
 * Error logger with structured logging
 */
export class ErrorLogger {
  /**
   * Log error with context and stack trace
   */
  public static log(error: Error, context?: Record<string, any>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      code: error instanceof AppError ? error.code : 'UNKNOWN',
      statusCode: error instanceof AppError ? error.statusCode : 500,
      isOperational: error instanceof AppError ? error.isOperational : false,
      context: {
        ...context,
        ...(error instanceof AppError ? error.context : {}),
      },
      environment: process.env.NODE_ENV || 'development',
    };

    // In development, log to console with pretty formatting
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Application Error:', {
        message: logData.message,
        code: logData.code,
        statusCode: logData.statusCode,
        context: logData.context,
        stack: logData.stack,
      });
    } else {
      // In production, log structured JSON
      console.error(JSON.stringify(logData));
    }

    // TODO: Send to external logging service (Sentry, LogRocket, etc.)
    // this.sendToLoggingService(logData);
  }

  /**
   * Log warning for non-critical issues
   */
  public static warn(message: string, context?: Record<string, any>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      environment: process.env.NODE_ENV || 'development',
    };

    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Warning:', logData);
    } else {
      console.warn(JSON.stringify(logData));
    }
  }

  /**
   * Log info for debugging and monitoring
   */
  public static info(message: string, context?: Record<string, any>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      environment: process.env.NODE_ENV || 'development',
    };

    if (process.env.NODE_ENV === 'development') {
      console.info('ℹ️ Info:', logData);
    } else {
      console.info(JSON.stringify(logData));
    }
  }
}

/**
 * API response formatter with consistent structure
 */
export class ResponseFormatter {
  /**
   * Create success response
   */
  public static success<T>(data: T, meta?: Record<string, any>): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Create error response
   */
  public static error(
    error: Error | AppError,
    includeStackTrace: boolean = false
  ): ApiResponse {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const code = error instanceof AppError ? error.code : ErrorCodes.INTERNAL_SERVER_ERROR;
    
    // Don't expose internal errors in production
    const message = this.getErrorMessage(error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && includeStackTrace && { 
          stack: error.stack 
        }),
        ...(error instanceof AppError && error.context && { 
          details: error.context 
        }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return response;
  }

  /**
   * Get appropriate error message based on environment and error type
   */
  private static getErrorMessage(error: Error): string {
    // In production, don't expose internal error details
    if (process.env.NODE_ENV === 'production') {
      if (error instanceof AppError) {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again later.';
    }

    // In development, show full error details
    return error.message;
  }
}

/**
 * Global error handler for Next.js API routes
 */
export class ApiErrorHandler {
  /**
   * Handle API route errors with consistent response format
   */
  public static handleError(error: unknown, context?: Record<string, any>): ApiResponse {
    // Log the error
    if (error instanceof Error) {
      ErrorLogger.log(error, context);
    } else {
      ErrorLogger.log(new Error(String(error)), context);
    }

    // Convert to AppError if needed
    let appError: AppError;
    
    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        true
      );
    } else {
      appError = new AppError(
        'An unexpected error occurred',
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        true
      );
    }

    return ResponseFormatter.error(appError);
  }

  /**
   * Wrap async API route handlers with error handling
   */
  public static async handleAsync<T>(
    handler: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const result = await handler();
      return ResponseFormatter.success(result);
    } catch (error) {
      return this.handleError(error, context) as ApiResponse<T>;
    }
  }
}

/**
 * Error boundary utilities for React components
 */
export class ErrorBoundaryUtils {
  /**
   * Check if error is recoverable
   */
  public static isRecoverable(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    
    // Network errors are typically recoverable
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return true;
    }
    
    return false;
  }

  /**
   * Get user-friendly error message
   */
  public static getUserMessage(error: Error): string {
    if (error instanceof AppError) {
      return error.message;
    }
    
    // Common error patterns
    if (error.message.includes('Network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    if (error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  public static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing and log duration
   */
  public static endTimer(name: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      ErrorLogger.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    ErrorLogger.info(`Operation '${name}' completed`, {
      duration: `${duration.toFixed(2)}ms`,
      ...context,
    });

    // Log slow operations
    if (duration > 1000) {
      ErrorLogger.warn(`Slow operation detected: '${name}'`, {
        duration: `${duration.toFixed(2)}ms`,
        ...context,
      });
    }

    return duration;
  }

  /**
   * Measure async operation performance
   */
  public static async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await operation();
      this.endTimer(name, context);
      return result;
    } catch (error) {
      this.endTimer(name, { ...context, error: 'failed' });
      throw error;
    }
  }
}