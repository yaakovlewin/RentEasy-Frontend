'use client';

import { ReactNode } from 'react';

import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';

/**
 * ContextErrorBoundary
 * 
 * Specialized error boundary for React Context providers.
 * Handles errors that occur within context initialization or updates.
 */
interface ContextErrorBoundaryProps {
  children: ReactNode;
  contextName: string;
  fallback?: ReactNode;
}

export function ContextErrorBoundary({
  children,
  contextName,
  fallback,
}: ContextErrorBoundaryProps) {
  const handleContextError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Context error in ${contextName}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      contextName,
      timestamp: new Date().toISOString(),
    });

    // In production, report context-specific errors
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { component: 'Context', contextName },
      //   extra: errorInfo
      // });
    }
  };

  return (
    <ErrorBoundaryWrapper
      title={`${contextName} Error`}
      description={`An error occurred while initializing the ${contextName}. Please refresh the page to try again.`}
      className='min-h-[200px] bg-yellow-50 border border-yellow-200 rounded-lg'
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundaryWrapper>
  );
}