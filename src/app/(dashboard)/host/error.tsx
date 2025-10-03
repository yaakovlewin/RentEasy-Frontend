'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { AlertTriangle, ArrowLeft, Home, RefreshCw, Building, BarChart3, Settings, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Host/Owner Route Error Page
 * 
 * Specialized error page for host/property owner functionality.
 * Provides contextual recovery options for property management features.
 */
interface HostErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HostError({ error, reset }: HostErrorProps) {
  useEffect(() => {
    // Report host-specific errors with higher priority
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { route: 'host', severity: 'high', feature: 'property-management', userType: 'owner' }
      // });
    }
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4'>
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
            <Building className='w-8 h-8 text-purple-500' />
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Host Dashboard Error
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            We encountered an issue with your host dashboard. 
            This might affect your property management features, bookings, or analytics.
          </p>

          {/* Suggestions */}
          <div className='bg-purple-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>What you can try:</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Refresh the page to reload your dashboard</li>
              <li>• Check your internet connection</li>
              <li>• Verify your host account permissions</li>
              <li>• Try accessing individual property pages</li>
              <li>• Clear your browser cache and cookies</li>
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
              Reload Dashboard
            </Button>
            
            <Link href='/host/properties' className='flex-1'>
              <Button variant='outline' className='gap-2 w-full'>
                <Building className='w-4 h-4' />
                View Properties
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className='flex flex-col sm:flex-row gap-2 mt-4'>
            <Link href='/host/bookings' className='flex-1'>
              <Button variant='ghost' size='sm' className='gap-2 w-full text-purple-600 hover:text-purple-700'>
                <BarChart3 className='w-4 h-4' />
                Bookings
              </Button>
            </Link>
            
            <Link href='/dashboard' className='flex-1'>
              <Button variant='ghost' size='sm' className='gap-2 w-full text-purple-600 hover:text-purple-700'>
                <Settings className='w-4 h-4' />
                Settings
              </Button>
            </Link>
          </div>

          <div className='mt-4'>
            <Link href='/'>
              <Button variant='ghost' className='gap-2 text-purple-600 hover:text-purple-700'>
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className='text-xs text-gray-500 mt-6'>
            Need immediate help? Contact our host support team for priority assistance.
          </p>
        </div>

        {/* Host Quick Actions */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-3'>Quick host actions:</p>
          <div className='grid grid-cols-2 gap-2'>
            <Link href='/host/properties/new'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1 w-full'>
                <Building className='w-3 h-3' />
                Add Property
              </Button>
            </Link>
            <Link href='/host/bookings'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1 w-full'>
                <BarChart3 className='w-3 h-3' />
                View Bookings
              </Button>
            </Link>
            <Link href='/help/host'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1 w-full'>
                <HelpCircle className='w-3 h-3' />
                Host Guide
              </Button>
            </Link>
            <Link href='/support'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1 w-full'>
                <AlertTriangle className='w-3 h-3' />
                Get Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}