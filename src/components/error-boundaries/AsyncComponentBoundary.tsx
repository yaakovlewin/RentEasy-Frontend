'use client';

import { ReactNode, useEffect, useState } from 'react';

import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * AsyncComponentBoundary
 * 
 * Enhanced error boundary for components that perform async operations.
 * Handles loading states, errors, and retry mechanisms for async components.
 */
interface AsyncComponentBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  onRetry?: () => Promise<void> | void;
  componentName?: string;
  retryCount?: number;
  maxRetries?: number;
}

export function AsyncComponentBoundary({
  children,
  fallback,
  loadingFallback,
  onRetry,
  componentName = 'Component',
  retryCount = 0,
  maxRetries = 3,
}: AsyncComponentBoundaryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retries, setRetries] = useState(retryCount);

  const handleAsyncError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Async component error in ${componentName}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      componentName,
      retries,
      maxRetries,
      timestamp: new Date().toISOString(),
    });

    // Report async component errors
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { 
      //     component: 'AsyncComponent',
      //     componentName,
      //     retryCount: retries.toString()
      //   },
      //   extra: {
      //     errorInfo,
      //     retries,
      //     maxRetries,
      //   }
      // });
    }
  };

  const handleRetry = async () => {
    if (retries >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) reached for ${componentName}`);
      return;
    }

    setIsRetrying(true);
    setRetries(prev => prev + 1);

    try {
      if (onRetry) {
        await onRetry();
      }
      
      // Reset retries on successful retry
      setRetries(0);
    } catch (error) {
      console.error(`Retry failed for ${componentName}:`, error);
      // Error will be caught by error boundary
    } finally {
      setIsRetrying(false);
    }
  };

  // Custom error fallback with retry functionality
  const AsyncErrorFallback = ({ error, resetError }: { error: Error | null; resetError: () => void }) => {
    if (isRetrying) {
      return loadingFallback || (
        <div className='flex flex-col items-center justify-center min-h-[200px] p-6'>
          <LoadingSpinner size='lg' />
          <p className='text-gray-600 mt-4'>Retrying... ({retries}/{maxRetries})</p>
        </div>
      );
    }

    return fallback || (
      <div className='flex flex-col items-center justify-center min-h-[200px] p-6 text-center bg-blue-50 border border-blue-200 rounded-lg'>
        <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4'>
          <span className='text-blue-600 text-xl'>⚡</span>
        </div>
        
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {componentName} Error
        </h3>
        
        <p className='text-gray-600 mb-4'>
          Something went wrong while loading this content.
        </p>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className='mb-4 p-3 bg-blue-100 rounded-lg text-left w-full max-w-md'>
            <summary className='cursor-pointer font-medium text-blue-700 mb-2'>
              Error Details (Development)
            </summary>
            <pre className='text-sm text-blue-600 whitespace-pre-wrap overflow-auto max-h-32'>
              {error.message}
            </pre>
          </details>
        )}

        <div className='flex gap-2'>
          {retries < maxRetries && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isRetrying ? 'Retrying...' : `Retry (${retries}/${maxRetries})`}
            </button>
          )}
          
          <button
            onClick={resetError}
            className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
          >
            Reset
          </button>
        </div>

        {retries >= maxRetries && (
          <p className='text-xs text-red-600 mt-3'>
            Maximum retries reached. Please refresh the page.
          </p>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundaryWrapper
      title={`${componentName} Error`}
      description={`An error occurred in ${componentName}. You can try again or refresh the page.`}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundaryWrapper>
  );
}