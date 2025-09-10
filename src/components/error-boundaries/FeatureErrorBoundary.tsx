'use client';

import { ReactNode } from 'react';

import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';

/**
 * FeatureErrorBoundary
 * 
 * Feature-specific error boundary for complex components or features.
 * Provides isolated error handling without breaking the entire page.
 */
interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  enableRetry?: boolean;
  onRetry?: () => void;
  level?: 'critical' | 'high' | 'medium' | 'low';
}

export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
  enableRetry = true,
  onRetry,
  level = 'medium',
}: FeatureErrorBoundaryProps) {
  const handleFeatureError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Feature error in ${featureName}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      featureName,
      level,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : 'Unknown',
    });

    // Report feature-specific errors with severity level
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { 
      //     component: 'Feature',
      //     featureName,
      //     level,
      //   },
      //   level: level === 'critical' ? 'fatal' : level,
      //   extra: errorInfo
      // });
    }
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return '💡';
      default:
        return '❗';
    }
  };

  // Custom fallback for feature errors
  const FeatureErrorFallback = ({ error, resetError }: { error: Error | null; resetError: () => void }) => {
    return fallback || (
      <div className={`flex flex-col items-center justify-center min-h-[250px] p-6 text-center border rounded-lg ${getLevelStyles(level)}`}>
        <div className='text-4xl mb-4'>
          {getLevelIcon(level)}
        </div>
        
        <h3 className='text-lg font-semibold mb-2'>
          {featureName} Unavailable
        </h3>
        
        <p className='text-sm mb-4 max-w-sm opacity-80'>
          This feature is temporarily unavailable. 
          {level === 'critical' ? ' Please contact support.' : ' You can continue using other parts of the app.'}
        </p>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className={`mb-4 p-3 rounded-lg text-left w-full max-w-md ${level === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <summary className='cursor-pointer font-medium mb-2'>
              🐛 Error Details (Dev)
            </summary>
            <pre className='text-xs whitespace-pre-wrap overflow-auto max-h-24'>
              {error.message}
            </pre>
          </details>
        )}

        <div className='flex gap-2'>
          {enableRetry && (
            <button
              onClick={() => {
                if (onRetry) onRetry();
                resetError();
              }}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                level === 'critical' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              Try Again
            </button>
          )}
          
          {level !== 'critical' && (
            <button
              onClick={resetError}
              className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              Dismiss
            </button>
          )}
        </div>

        {level === 'critical' && (
          <p className='text-xs mt-3 opacity-70'>
            This is a critical feature. Please refresh the page or contact support if the problem persists.
          </p>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundaryWrapper
      title={`${featureName} Error`}
      description={`An error occurred in the ${featureName} feature.`}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundaryWrapper>
  );
}