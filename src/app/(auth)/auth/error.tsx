'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { AlertTriangle, ArrowLeft, Home, RefreshCw, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Authentication Route Error Page
 * 
 * Specialized error page for authentication-related errors.
 * Provides contextual recovery options for auth functionality.
 */
interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    // Report auth-specific errors (be careful with sensitive data)
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { route: 'auth', severity: 'high' }
      //   // Note: Don't include sensitive auth data in error reports
      // });
    }
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 px-4'>
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
          <div className='w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6'>
            <Shield className='w-8 h-8 text-purple-500' />
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Authentication Error
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            We encountered an issue with the authentication system. 
            This could be a temporary problem with our servers or your session.
          </p>

          {/* Suggestions */}
          <div className='bg-purple-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>What you can try:</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Try refreshing the page</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Disable browser extensions temporarily</li>
              <li>• Try a different browser or incognito mode</li>
              <li>• Check if your email and password are correct</li>
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
              className='gap-2 bg-purple-600 hover:bg-purple-700 flex-1'
            >
              <RefreshCw className='w-4 h-4' />
              Try Again
            </Button>
            
            <Link href='/auth/login' className='flex-1'>
              <Button variant='outline' className='gap-2 w-full'>
                <Shield className='w-4 h-4' />
                Back to Login
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className='mt-4 flex flex-col sm:flex-row gap-2 justify-center'>
            <Link href='/'>
              <Button variant='ghost' size='sm' className='gap-2'>
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Security Note */}
          <div className='mt-6 p-3 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-600'>
              <Shield className='w-4 h-4 inline mr-1' />
              Your data is secure. This error doesn't affect your account security.
            </p>
          </div>
        </div>

        {/* Help Links */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-3'>Need help with your account?</p>
          <div className='flex justify-center gap-4'>
            <Link href='/help' className='text-xs text-purple-600 hover:text-purple-800'>
              Help Center
            </Link>
            <Link href='/contact' className='text-xs text-purple-600 hover:text-purple-800'>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}