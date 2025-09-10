'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { AlertTriangle, ArrowLeft, Home, RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Property Route Error Page
 * 
 * Specialized error page for property-related errors.
 * Provides contextual recovery options for property functionality.
 */
interface PropertyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertyError({ error, reset }: PropertyErrorProps) {
  useEffect(() => {
    console.error('Property error occurred:', {
      error: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      route: 'property',
      url: typeof window !== 'undefined' ? window.location.pathname : 'Unknown',
    });

    // Report property-specific errors
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { route: 'property', severity: 'medium' }
      // });
    }
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4'>
      <div className='max-w-lg w-full'>
        {/* Navigation */}
        <div className='mb-6'>
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
          <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6'>
            <AlertTriangle className='w-8 h-8 text-green-500' />
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Property Loading Error
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            We couldn't load this property right now. 
            The property might be temporarily unavailable or there could be a connection issue.
          </p>

          {/* Suggestions */}
          <div className='bg-green-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>What you can try:</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Refresh the page to reload the property</li>
              <li>• Check if the property URL is correct</li>
              <li>• Search for similar properties</li>
              <li>• Try again in a few minutes</li>
            </ul>
          </div>

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <details className='mb-6 p-4 bg-red-50 rounded-lg text-left border'>
              <summary className='cursor-pointer font-medium text-red-700 mb-3'>
                🐛 Development Error Details
              </summary>
              <div className='text-sm text-red-600 space-y-2'>
                <div><strong>Error:</strong> {error.message}</div>
                {error.digest && <div><strong>Error ID:</strong> {error.digest}</div>}
                <pre className='whitespace-pre-wrap text-xs bg-red-100 p-3 rounded mt-2 overflow-auto max-h-32 font-mono'>
                  {error.stack}
                </pre>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button 
              onClick={reset}
              className='gap-2 bg-green-600 hover:bg-green-700 flex-1'
            >
              <RefreshCw className='w-4 h-4' />
              Try Again
            </Button>
            
            <Link href='/search' className='flex-1'>
              <Button variant='outline' className='gap-2 w-full'>
                <Search className='w-4 h-4' />
                Search Properties
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className='mt-4'>
            <Link href='/'>
              <Button variant='ghost' className='gap-2 text-green-600 hover:text-green-700'>
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className='text-xs text-gray-500 mt-6'>
            Property not loading? Contact us for assistance.
          </p>
        </div>

        {/* Popular Properties Suggestion */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-3'>Or browse popular destinations:</p>
          <div className='flex flex-wrap justify-center gap-2'>
            <Link href='/search?location=beachfront'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm'>
                🏖️ Beachfront
              </Button>
            </Link>
            <Link href='/search?location=mountain'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm'>
                ⛰️ Mountain
              </Button>
            </Link>
            <Link href='/search?location=city'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm'>
                🌆 City
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}