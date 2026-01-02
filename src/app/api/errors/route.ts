import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ErrorLogSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.string(),
  context: z.string().optional(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
});

type ErrorLog = z.infer<typeof ErrorLogSchema>;

// In-memory error storage (in production, use a database)
const errorLogs: ErrorLog[] = [];
const MAX_LOGS = 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = ErrorLogSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const errorData: ErrorLog = validationResult.data;

    // Add additional context
    const logEntry: ErrorLog = {
      ...errorData,
      userAgent: request.headers.get('user-agent') || undefined,
      url: request.headers.get('referer') || errorData.url,
    };

    // Add to logs
    errorLogs.push(logEntry);

    // Keep only the last MAX_LOGS entries
    if (errorLogs.length > MAX_LOGS) {
      errorLogs.splice(0, errorLogs.length - MAX_LOGS);
    }

    // Log to console for debugging
    console.error('Error logged:', {
      ...logEntry,
      timestamp: new Date(logEntry.timestamp).toISOString()
    });

    // In production, you would send this to a monitoring service
    // like Sentry, LogRocket, DataDog, etc.
    await sendToMonitoringService(logEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully',
      id: errorLogs.length 
    });

  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return recent errors (for debugging/admin purposes)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const context = searchParams.get('context');
    
    let filteredErrors = errorLogs;
    
    // Filter by context if provided
    if (context) {
      filteredErrors = errorLogs.filter(log => log.context === context);
    }
    
    const recentErrors = filteredErrors.slice(-limit).reverse();
    
    return NextResponse.json({
      success: true,
      data: {
        errors: recentErrors,
        total: filteredErrors.length,
        limit,
        contexts: [...new Set(errorLogs.map(log => log.context).filter(Boolean))]
      }
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context');
    
    if (context) {
      // Clear errors for specific context
      const initialLength = errorLogs.length;
      for (let i = errorLogs.length - 1; i >= 0; i--) {
        if (errorLogs[i].context === context) {
          errorLogs.splice(i, 1);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${initialLength - errorLogs.length} errors for context: ${context}`
      });
    } else {
      // Clear all errors
      const count = errorLogs.length;
      errorLogs.length = 0;
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${count} error logs`
      });
    }

  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

async function sendToMonitoringService(error: ErrorLog) {
  // In production, send to monitoring service
  try {
    // Example: Send to Sentry
    // await fetch('https://sentry.io/api/123456/store/', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Bearer YOUR_SENTRY_DSN',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message: error.message,
    //     level: 'error',
    //     extra: {
    //       code: error.code,
    //       details: error.details,
    //       context: error.context,
    //       userAgent: error.userAgent,
    //       url: error.url,
    //       timestamp: error.timestamp
    //     }
    //   })
    // });
    
    console.log('Error would be sent to monitoring service:', error);
  } catch (err) {
    console.error('Failed to send error to monitoring service:', err);
  }
}