/**
 * Comprehensive Loading States Component Library
 * 
 * Provides consistent loading indicators with accessibility,
 * performance considerations, and user experience best practices.
 */

'use client';

import React from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Base loading spinner component with customizable options
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

/**
 * Full page loading overlay
 */
interface FullPageLoaderProps {
  message?: string;
  showLogo?: boolean;
  className?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Loading...',
  showLogo = true,
  className
}) => {
  return (
    <div className={cn(
      'fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50',
      className
    )}>
      {showLogo && (
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white font-bold text-2xl">م</span>
        </div>
      )}
      
      <LoadingSpinner size="xl" />
      
      {message && (
        <p className="mt-4 text-gray-600 text-lg animate-pulse">
          {message}
        </p>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
};

/**
 * Skeleton loading component for content placeholders
 */
interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 3,
  avatar = false,
  title = false,
  paragraph = true
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-3">
        {avatar && (
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        )}
        
        {title && (
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        )}
        
        {paragraph && Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 rounded',
              i === lines - 1 ? 'w-5/6' : 'w-full'
            )}
          ></div>
        ))}
      </div>
    </div>
  );
};

/**
 * Card skeleton loader
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
      <Skeleton lines={4} />
    </div>
  );
};

/**
 * List skeleton loader
 */
export const ListSkeleton: React.FC<{ 
  items?: number; 
  className?: string 
}> = ({ items = 3, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton avatar className="w-10 h-10" />
          <div className="flex-1">
            <Skeleton title className="w-1/3" />
            <Skeleton lines={1} className="w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Table skeleton loader
 */
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string 
}> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="border-b pb-3 mb-4">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Button loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
        loading && 'opacity-75 cursor-not-allowed',
        className
      )}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {loading ? loadingText : children}
    </button>
  );
};

/**
 * Form loading overlay
 */
interface FormLoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const FormLoadingOverlay: React.FC<FormLoadingOverlayProps> = ({
  loading,
  message = 'Processing...',
  children
}) => {
  return (
    <div className="relative">
      {children}
      
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Progress indicator for multi-step processes
 */
interface ProgressLoaderProps {
  progress: number; // 0-100
  message?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  progress,
  message,
  showPercentage = true,
  className
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full', className)}>
      {message && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{message}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{clampedProgress}%</span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Staggered loading animation for lists
 */
export const StaggeredLoader: React.FC<{
  items: Array<{ key: string; component: React.ReactNode }>;
  delay?: number;
  className?: string;
}> = ({ items, delay = 100, className }) => {
  const [loadedItems, setLoadedItems] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    items.forEach((item, index) => {
      setTimeout(() => {
        setLoadedItems(prev => new Set(prev).add(item.key));
      }, index * delay);
    });
  }, [items, delay]);

  return (
    <div className={className}>
      {items.map(item => (
        <div
          key={item.key}
          className={cn(
            'transition-all duration-300 ease-out',
            loadedItems.has(item.key)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          )}
        >
          {loadedItems.has(item.key) ? (
            item.component
          ) : (
            <Skeleton className="h-20" />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Error state with retry functionality
 */
interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error = 'Something went wrong',
  onRetry,
  retrying = false,
  className
}) => {
  return (
    <div className={cn('text-center py-8', className)}>
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">{error}</p>
      
      {onRetry && (
        <LoadingButton
          loading={retrying}
          loadingText="Retrying..."
          onClick={onRetry}
          className="mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </LoadingButton>
      )}
    </div>
  );
};

/**
 * Hook for managing loading states with timeout
 */
export function useLoadingTimeout(
  initialLoading = false,
  timeoutMs = 10000
) {
  const [loading, setLoading] = React.useState(initialLoading);
  const [timedOut, setTimedOut] = React.useState(false);

  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const startLoading = React.useCallback(() => {
    setLoading(true);
    setTimedOut(false);
    
    // Set timeout
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
    }, timeoutMs);
  }, [timeoutMs]);

  const stopLoading = React.useCallback(() => {
    setLoading(false);
    setTimedOut(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loading,
    timedOut,
    startLoading,
    stopLoading,
  };
}