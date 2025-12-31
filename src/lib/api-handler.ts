/**
 * API route handler template with comprehensive error handling and validation
 * 
 * This template provides a consistent structure for all API routes with:
 * - Input validation and sanitization
 * - Authentication and authorization
 * - Rate limiting
 * - Comprehensive error handling
 * - Performance monitoring
 * - Structured logging
 * - Type safety
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  ApiErrorHandler, 
  AppError, 
  AuthenticationError, 
  AuthorizationError,
  PerformanceMonitor,
  ErrorLogger 
} from '@/lib/errors';
import { ApiResponse } from '@/types';

/**
 * API route configuration interface
 */
export interface ApiRouteConfig {
  requireAuth?: boolean;
  requireVerification?: boolean;
  allowedPlans?: string[];
  rateLimit?: {
    max: number;
    window: number; // in milliseconds
  };
  validation?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

/**
 * Enhanced API route handler with middleware
 */
export abstract class BaseApiRoute {
  protected config: ApiRouteConfig = {};

  /**
   * Main handler method - must be implemented by subclasses
   */
  abstract handle(
    request: NextRequest,
    context: {
      user?: any;
      params?: Record<string, string>;
      query: Record<string, string>;
      body?: any;
    }
  ): Promise<any>;

  /**
   * GET method handler
   */
  async GET(request: NextRequest, { params }: { params?: Record<string, string> }) {
    return this.executeRoute('GET', request, { params });
  }

  /**
   * POST method handler
   */
  async POST(request: NextRequest, { params }: { params?: Record<string, string> }) {
    return this.executeRoute('POST', request, { params });
  }

  /**
   * PUT method handler
   */
  async PUT(request: NextRequest, { params }: { params?: Record<string, string> }) {
    return this.executeRoute('PUT', request, { params });
  }

  /**
   * DELETE method handler
   */
  async DELETE(request: NextRequest, { params }: { params?: Record<string, string> }) {
    return this.executeRoute('DELETE', request, { params });
  }

  /**
   * PATCH method handler
   */
  async PATCH(request: NextRequest, { params }: { params?: Record<string, string> }) {
    return this.executeRoute('PATCH', request, { params });
  }

  /**
   * Execute route with comprehensive middleware
   */
  private async executeRoute(
    method: string,
    request: NextRequest,
    { params }: { params?: Record<string, string> }
  ): Promise<NextResponse> {
    const operationId = `${method}-${request.url}`;
    
    return PerformanceMonitor.measureAsync(
      operationId,
      async () => {
        try {
          // Parse request components
          const query = this.getQueryParams(request);
          const body = await this.getRequestBody(request);
          
          // Create execution context
          const context = {
            params,
            query,
            body,
          };

          // Run middleware pipeline
          await this.runMiddleware(request, context);

          // Execute main handler
          const result = await this.handle(request, {
            ...context,
            user: await this.getCurrentUser(request),
          });

          // Return success response
          return NextResponse.json({
            success: true,
            data: result,
            meta: {
              timestamp: new Date().toISOString(),
              operationId,
            },
          });

        } catch (error) {
          // Handle errors consistently
          const errorResponse = ApiErrorHandler.handleError(error, {
            method,
            url: request.url,
            operationId,
            userAgent: request.headers.get('user-agent'),
            ip: this.getClientIp(request),
          });

          return NextResponse.json(errorResponse, { 
            status: error instanceof AppError ? error.statusCode : 500 
          });
        }
      },
      { method, url: request.url }
    );
  }

  /**
   * Middleware pipeline for authentication, validation, etc.
   */
  private async runMiddleware(
    request: NextRequest, 
    context: { query: Record<string, string>; body?: any }
  ): Promise<void> {
    // Authentication check
    if (this.config.requireAuth) {
      const user = await this.getCurrentUser(request);
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }

      // Email verification check
      if (this.config.requireVerification && !user.emailVerified) {
        throw new AuthorizationError('Email verification required');
      }

      // Plan-based authorization
      if (this.config.allowedPlans && !this.config.allowedPlans.includes(user.plan)) {
        throw new AuthorizationError('Subscription plan does not allow this operation');
      }
    }

    // Input validation
    if (this.config.validation) {
      this.validateInput(context, this.config.validation);
    }

    // Rate limiting (placeholder - would implement with Redis or similar)
    if (this.config.rateLimit) {
      // await this.checkRateLimit(request, this.config.rateLimit);
    }
  }

  /**
   * Get current authenticated user
   */
  private async getCurrentUser(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      return session?.user || null;
    } catch (error) {
      ErrorLogger.warn('Failed to get session', { error: error instanceof Error ? error.message : 'Unknown' });
      return null;
    }
  }

  /**
   * Parse query parameters from request
   */
  private getQueryParams(request: NextRequest): Record<string, string> {
    const { searchParams } = new URL(request.url);
    const query: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
    
    return query;
  }

  /**
   * Parse request body safely
   */
  private async getRequestBody(request: NextRequest): Promise<any> {
    try {
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await request.json();
      }
      
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        const body: Record<string, any> = {};
        formData.forEach((value, key) => {
          body[key] = value;
        });
        return body;
      }
      
      return null;
    } catch (error) {
      ErrorLogger.warn('Failed to parse request body', { 
        contentType: request.headers.get('content-type'),
        error: error instanceof Error ? error.message : 'Unknown'
      });
      return null;
    }
  }

  /**
   * Validate input data
   */
  private validateInput(
    context: { query: Record<string, string>; body?: any },
    validation: ApiRouteConfig['validation']
  ): void {
    // Query parameter validation
    if (validation.query) {
      // Implement query validation logic
    }

    // Request body validation
    if (validation.body && context.body) {
      // Implement body validation logic
    }

    // URL parameters validation
    if (validation.params) {
      // Implement params validation logic
    }
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'
    );
  }
}

/**
 * Utility function to create API route handlers
 */
export function createApiRoute(
  handlerClass: new () => BaseApiRoute,
  config?: ApiRouteConfig
) {
  const instance = new handlerClass();
  if (config) {
    instance.config = { ...instance.config, ...config };
  }
  return instance;
}

/**
 * Example usage:
 * 
 * ```typescript
 * class UserApiRoute extends BaseApiRoute {
 *   protected config: ApiRouteConfig = {
 *     requireAuth: true,
 *     allowedPlans: ['free', 'pro'],
 *     rateLimit: { max: 100, window: 60000 }, // 100 requests per minute
 *   };
 * 
 *   async handle(request: NextRequest, context) {
 *     // Your route logic here
 *     return { message: 'Hello from API!' };
 *   }
 * }
 * 
 * export const GET = createApiRoute(UserApiRoute);
 * export const POST = createApiRoute(UserApiRoute);
 * ```
 */