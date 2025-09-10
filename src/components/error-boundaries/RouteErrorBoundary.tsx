'use client';

import { ReactNode } from 'react';

import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';

/**
 * RouteErrorBoundary
 * 
 * Route-specific error boundary that provides contextual error handling
 * for different sections of the application.
 */
interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
  fallback?: ReactNode;
}

export function RouteErrorBoundary({
  children,
  routeName,
  fallback,
}: RouteErrorBoundaryProps) {
  const handleRouteError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Route error in ${routeName}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      routeName,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : 'Unknown',
    });

    // In production, report route-specific errors
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { 
      //     component: 'Route', 
      //     routeName,
      //     severity: 'high'
      //   },
      //   extra: errorInfo
      // });
    }
  };

  return (
    <ErrorBoundaryWrapper
      title={`${routeName} Error`}
      description={`An error occurred while loading the ${routeName} page. Please try refreshing or navigate back.`}
      className='min-h-[400px] bg-blue-50 border border-blue-200 rounded-lg'
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundaryWrapper>
  );
}