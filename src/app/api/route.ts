import { NextResponse } from "next/server";
import { ApiErrorHandler, ErrorLogger } from "@/lib/errors";
import { ApiResponse } from "@/types";

/**
 * Health check endpoint with proper error handling
 * Returns API status and basic system information
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    // Basic health checks
    const healthChecks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
    };

    ErrorLogger.info('Health check accessed', { 
      userAgent: 'API Health Check',
      ip: 'localhost'
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Mahfza API is running successfully!",
        ...healthChecks
      },
      meta: {
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api',
      method: 'GET'
    });

    const errorResponse = ApiErrorHandler.handleError(error, {
      endpoint: '/api',
      method: 'GET'
    });

    return NextResponse.json(errorResponse, { 
      status: error instanceof Error && 'statusCode' in error ? 
        (error as any).statusCode : 500 
    });
  }
}