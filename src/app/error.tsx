'use client';

import { useEffect } from 'react';

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * App-Level Error Page
 * 
 * Handles errors that occur within the main application layout.
 * This catches errors in pages and components, but not in the root layout itself.
 * 
 * Note: This must be a Client Component as it uses error and reset functions.
 */
interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error for monitoring
    console.error('Application error occurred:', error);
    
    // In production, send to error reporting service
    // Example: Sentry.captureException(error, { level: 'error' });
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4'>
      <div className='max-w-lg w-full'>
        {/* Header Navigation */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => window.history.back()}
            className='gap-2 text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='w-4 h-4' />
            Go Back
          </Button>
        </div>

        {/* Error Content */}
        <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
          {/* Error Icon */}
          <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6'>
            <AlertTriangle className='w-8 h-8 text-red-500' />
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Oops! Something went wrong
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            We encountered an unexpected error while processing your request. 
            Don't worry - we've been notified and are working to fix it.
          </p>

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <details className='mb-6 p-4 bg-red-50 rounded-lg text-left border'>
              <summary className='cursor-pointer font-medium text-red-700 mb-3'>
                🐛 Development Error Details
              </summary>
              <div className='text-sm text-red-600 space-y-3'>
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.digest && (
                  <div>
                    <strong>Error ID:</strong> {error.digest}
                  </div>
                )}
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className='whitespace-pre-wrap text-xs bg-red-100 p-3 rounded mt-1 overflow-auto max-h-40 font-mono'>
                    {error.stack}
                  </pre>
                </div>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button 
              onClick={reset}
              className='gap-2 bg-red-600 hover:bg-red-700 flex-1'
            >
              <RefreshCw className='w-4 h-4' />
              Try Again
            </Button>
            
            <Button
              variant='outline'
              onClick={() => window.location.href = '/'}
              className='gap-2 flex-1'
            >
              <Home className='w-4 h-4' />
              Go Home
            </Button>
          </div>

          {/* Help Text */}
          <p className='text-xs text-gray-500 mt-6'>
            If this problem persists, please contact our support team.
          </p>
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-500'>
            Error occurred in RentEasy application
          </p>
        </div>
      </div>
    </div>
  );
}