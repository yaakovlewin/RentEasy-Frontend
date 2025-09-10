'use client';

import { ReactNode } from 'react';

import { BaseApiError } from '@/lib/api/services/ApiErrors';
import { ErrorBoundaryWrapper, NetworkError } from '@/components/ui/error-boundary';

/**
 * ApiErrorBoundary
 * 
 * Specialized error boundary for API-related errors.
 * Integrates with the existing structured error system from ApiErrors.ts
 */
interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  context?: string;
}

export function ApiErrorBoundary({
  children,
  fallback,
  onRetry,
  context = 'API operation',
}: ApiErrorBoundaryProps) {
  const handleApiError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`API error in ${context}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      context,
      timestamp: new Date().toISOString(),
      isApiError: error instanceof BaseApiError,
      ...(error instanceof BaseApiError && {
        apiErrorCode: error.code,
        apiErrorType: error.constructor.name,
        statusCode: error.statusCode,
        context: error.context,
        recovery: error.recovery,
      }),
    });

    // Report API-specific errors with enhanced context
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { 
      //     component: 'API',
      //     context,
      //     errorType: error instanceof BaseApiError ? error.constructor.name : 'UnknownError'
      //   },
      //   extra: {
      //     errorInfo,
      //     ...(error instanceof BaseApiError && {
      //       apiContext: error.context,
      //       recoveryStrategy: error.recovery?.strategy,
      //     }),
      //   }
      // });
    }
  };

  // Custom fallback for API errors
  const ApiErrorFallback = ({ error, resetError }: { error: Error | null; resetError: () => void }) => {
    // Check if it's a structured API error
    if (error instanceof BaseApiError) {
      // Network-specific error handling
      if (error.constructor.name === 'NetworkError') {
        return (
          <NetworkError
            onRetry={() => {
              if (onRetry) onRetry();
              resetError();
            }}
            title='Connection Problem'
            description='Unable to connect to our servers. Please check your internet connection.'
            className='min-h-[300px]'
          />
        );
      }

      // Server error handling
      if (error.constructor.name === 'ServerError') {
        return (
          <div className='flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-red-50 rounded-lg'>
            <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4'>
              <span className='text-red-500 text-xl'>⚠️</span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Server Error</h3>
            <p className='text-gray-600 mb-4'>
              Our servers are experiencing issues. Please try again in a moment.
            </p>
            <button
              onClick={() => {
                if (onRetry) onRetry();
                resetError();
              }}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              Try Again
            </button>
          </div>
        );
      }

      // Authentication error handling
      if (error.constructor.name === 'AuthenticationError') {
        return (
          <div className='flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-yellow-50 rounded-lg'>
            <div className='w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4'>
              <span className='text-yellow-600 text-xl'>🔐</span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Authentication Required</h3>
            <p className='text-gray-600 mb-4'>
              Please log in to access this feature.
            </p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors'
            >
              Go to Login
            </button>
          </div>
        );
      }

      // Authorization error handling
      if (error.constructor.name === 'AuthorizationError') {
        return (
          <div className='flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-orange-50 rounded-lg'>
            <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4'>
              <span className='text-orange-600 text-xl'>🚫</span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Access Denied</h3>
            <p className='text-gray-600 mb-4'>
              You don't have permission to access this resource.
            </p>
            <button
              onClick={() => window.history.back()}
              className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'
            >
              Go Back
            </button>
          </div>
        );
      }
    }

    // Fallback for other API errors
    return fallback || (
      <div className='flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-gray-50 rounded-lg'>
        <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
          <span className='text-gray-500 text-xl'>⚠️</span>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Something went wrong</h3>
        <p className='text-gray-600 mb-4'>
          An error occurred while {context}. Please try again.
        </p>
        <button
          onClick={() => {
            if (onRetry) onRetry();
            resetError();
          }}
          className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <ErrorBoundaryWrapper
      title={`${context} Error`}
      description={`An error occurred during ${context}. Please try again.`}
      className='bg-gray-50 border border-gray-200 rounded-lg'
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundaryWrapper>
  );
}