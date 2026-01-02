export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private maxErrors = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private constructor() {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    const error: AppError = {
      code: 'GLOBAL_ERROR',
      message: event.message,
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      },
      timestamp: new Date(),
      context: 'global'
    };
    this.logError(error);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error: AppError = {
      code: 'UNHANDLED_PROMISE_REJECTION',
      message: event.reason?.message || 'Unhandled promise rejection',
      details: {
        reason: event.reason
      },
      timestamp: new Date(),
      context: 'promise'
    };
    this.logError(error);
  }

  logError(error: AppError) {
    // Add to local error log
    this.errors.push(error);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console
    console.error(`[${error.code}] ${error.message}`, error.details);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(error);
    }
  }

  private async sendToMonitoringService(error: AppError) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: error.timestamp.toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to send error to monitoring service:', err);
    }
  }

  // Error creation helpers
  static createError(code: string, message: string, details?: any, context?: string): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      context
    };
  }

  // Common error types
  static networkError(message: string, details?: any): AppError {
    return this.createError('NETWORK_ERROR', message, details, 'network');
  }

  static validationError(message: string, details?: any): AppError {
    return this.createError('VALIDATION_ERROR', message, details, 'validation');
  }

  static authenticationError(message: string, details?: any): AppError {
    return this.createError('AUTH_ERROR', message, details, 'authentication');
  }

  static authorizationError(message: string, details?: any): AppError {
    return this.createError('AUTHORIZATION_ERROR', message, details, 'authorization');
  }

  static notFoundError(message: string, details?: any): AppError {
    return this.createError('NOT_FOUND', message, details, 'not_found');
  }

  static serverError(message: string, details?: any): AppError {
    return this.createError('SERVER_ERROR', message, details, 'server');
  }

  // Get recent errors
  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  // Clear error log
  clearErrors(): void {
    this.errors = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export error types
export { AppError };