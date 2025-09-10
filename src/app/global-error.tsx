'use client';

import { useEffect } from 'react';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Global Error Page
 * 
 * Handles critical errors that occur at the root level, including layout errors.
 * This is the last resort error boundary that catches errors even in the root layout.
 * 
 * Note: This must be a Client Component as it uses error and reset functions.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error occurred:', error);
    
    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
          <div className='max-w-md w-full text-center'>
            {/* Error Icon */}
            <div className='w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6'>
              <AlertTriangle className='w-10 h-10 text-red-500' />
            </div>

            {/* Error Message */}
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              Something went wrong
            </h1>
            
            <p className='text-gray-600 mb-8 leading-relaxed'>
              We're sorry, but a critical error occurred. Our team has been notified and is working to fix this issue.
            </p>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className='mb-8 p-4 bg-red-50 rounded-lg text-left'>
                <summary className='cursor-pointer font-medium text-red-700 mb-2'>
                  Error Details (Development Only)
                </summary>
                <div className='text-sm text-red-600 space-y-2'>
                  <p><strong>Message:</strong> {error.message}</p>
                  {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
                  <pre className='whitespace-pre-wrap text-xs bg-red-100 p-2 rounded mt-2 overflow-auto max-h-32'>
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button 
                onClick={reset}
                className='gap-2 bg-red-600 hover:bg-red-700'
              >
                <RefreshCw className='w-4 h-4' />
                Try Again
              </Button>
              
              <Button
                variant='outline'
                onClick={() => window.location.href = '/'}
                className='gap-2'
              >
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </div>

            {/* RentEasy Branding */}
            <div className='mt-12 pt-8 border-t border-gray-200'>
              <p className='text-sm text-gray-500'>
                <strong>RentEasy</strong> - Your Perfect Vacation Rental
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}