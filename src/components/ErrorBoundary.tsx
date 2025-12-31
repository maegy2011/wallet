/**
 * React Error Boundary Component
 * 
 * Provides comprehensive error handling for React components with:
 * - Error catching and reporting
 * - User-friendly error messages
 * - Recovery mechanisms
 * - Performance monitoring
 * - Development vs production behavior
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorBoundaryUtils } from '@/lib/errors';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showRetry?: boolean;
  componentName?: string;
}

/**
 * Error display component for caught errors
 */
const ErrorDisplay: React.FC<{
  error: Error;
  retryCount: number;
  onRetry: () => void;
  onGoHome: () => void;
  maxRetries: number;
  showRetry: boolean;
  componentName?: string;
}> = ({ error, retryCount, onRetry, onGoHome, maxRetries, showRetry, componentName }) => {
  const isRecoverable = ErrorBoundaryUtils.isRecoverable(error);
  const userMessage = ErrorBoundaryUtils.getUserMessage(error);
  const canRetry = showRetry && isRecoverable && retryCount < maxRetries;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-center">
              {userMessage}
            </AlertDescription>
          </Alert>

          {componentName && (
            <div className="text-sm text-gray-500 text-center">
              Error in component: <code className="bg-gray-100 px-1 py-0.5 rounded">{componentName}</code>
            </div>
          )}

          {retryCount > 0 && (
            <div className="text-sm text-amber-600 text-center">
              Retry attempt {retryCount} of {maxRetries}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {canRetry && (
              <Button 
                onClick={onRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button 
              onClick={onGoHome}
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button 
              onClick={() => window.location.href = 'mailto:support@mahfza.com?subject=Error Report'}
              className="w-full"
              variant="ghost"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <summary className="cursor-pointer font-mono mb-2">Error Details (Dev Mode)</summary>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {error.name}
                </div>
                <div>
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap mt-1 text-xs bg-white p-2 rounded border">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  /**
   * Handle retry attempt with exponential backoff
   */
  private handleRetry = () => {
    const { retryCount } = this.state;
    const { maxRetries = 3 } = this.props;

    if (retryCount >= maxRetries) {
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, etc.
    const delay = Math.pow(2, retryCount) * 1000;
    
    this.setState({ isRecovering: true });

    const timeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false,
      }));
    }, delay);

    this.retryTimeouts.push(timeout);
  };

  /**
   * Navigate to homepage
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Clean up timeouts on unmount
   */
  componentWillUnmount() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  render() {
    const { hasError, error, isRecovering } = this.state;
    const { 
      children, 
      fallback, 
      maxRetries = 3, 
      showRetry = true,
      componentName 
    } = this.props;

    // Show recovery state
    if (isRecovering) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Recovering...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorDisplay
          error={error}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          maxRetries={maxRetries}
          showRetry={showRetry}
          componentName={componentName}
        />
      );
    }

    // Render children normally
    return children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for handling async errors in function components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Async error caught:', error);
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

/**
 * Example usage:
 * 
 * ```tsx
 * // Class component approach
 * class MyComponent extends React.Component {
 *   render() {
 *     return (
 *       <ErrorBoundary componentName="MyComponent">
 *         <YourComponent />
 *       </ErrorBoundary>
 *     );
 *   }
 * }
 * 
 * // HOC approach
 * const SafeComponent = withErrorBoundary(YourComponent, {
 *   componentName: 'YourComponent',
 *   maxRetries: 3,
 *   showRetry: true,
 * });
 * 
 * // Hook approach for async errors
 * function MyComponent() {
 *   const { captureError } = useErrorHandler();
 *   
 *   const handleClick = async () => {
 *     try {
 *       await riskyOperation();
 *     } catch (error) {
 *       captureError(error);
 *     }
 *   };
 *   
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */