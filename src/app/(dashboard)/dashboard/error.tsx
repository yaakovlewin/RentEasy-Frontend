'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { AlertTriangle, ArrowLeft, Home, RefreshCw, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Dashboard Route Error Page
 * 
 * Specialized error page for dashboard-related errors.
 * Provides contextual recovery options for dashboard functionality.
 */
interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Report dashboard-specific errors
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { route: 'dashboard', severity: 'medium' }
      // });
    }
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='max-w-lg w-full'>
        {/* Navigation */}
        <div className='mb-6'>
          <Link href='/'>
            <Button variant='ghost' className='gap-2 text-gray-600 hover:text-gray-900'>
              <ArrowLeft className='w-4 h-4' />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Error Content */}
        <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
          {/* Error Icon */}
          <div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6'>
            <Settings className='w-8 h-8 text-blue-500' />
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Dashboard Error
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            We encountered an issue while loading your dashboard. 
            This might be due to a temporary problem with your account data or settings.
          </p>

          {/* Suggestions */}
          <div className='bg-blue-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>What you can try:</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache</li>
              <li>• Try logging out and back in</li>
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
              className='gap-2 bg-blue-600 hover:bg-blue-700 flex-1'
            >
              <RefreshCw className='w-4 h-4' />
              Try Again
            </Button>
            
            <Link href='/' className='flex-1'>
              <Button variant='outline' className='gap-2 w-full'>
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className='text-xs text-gray-500 mt-6'>
            If this problem continues, please contact support.
          </p>
        </div>

        {/* Quick Links */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-3'>Or try these pages:</p>
          <div className='flex justify-center gap-2'>
            <Link href='/search'>
              <Button variant='ghost' size='sm' className='text-xs'>
                Search Properties
              </Button>
            </Link>
            <Link href='/host'>
              <Button variant='ghost' size='sm' className='text-xs'>
                Host Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}