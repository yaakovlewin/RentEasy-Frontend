'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { AlertTriangle, ArrowLeft, Home, RefreshCw, Search, MapPin, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Search Route Error Page
 * 
 * Specialized error page for search-related errors.
 * Provides contextual recovery options for property search functionality.
 */
interface SearchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SearchError({ error, reset }: SearchErrorProps) {
  useEffect(() => {
    console.error('Search error occurred:', {
      error: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      route: 'search',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
    });

    // Report search-specific errors
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReporting.captureException(error, {
      //   tags: { route: 'search', severity: 'high', feature: 'property-search' }
      // });
    }
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4'>
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
          <div className='w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6'>
            <Search className='w-8 h-8 text-orange-500' />
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Search Error
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            We encountered an issue while searching for properties. 
            This might be due to a temporary problem with our search service or your search criteria.
          </p>

          {/* Suggestions */}
          <div className='bg-orange-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>What you can try:</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Try refreshing the page to reload the search</li>
              <li>• Simplify your search filters</li>
              <li>• Check your location and date settings</li>
              <li>• Try a broader search area</li>
              <li>• Clear all filters and start over</li>
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
              className='gap-2 bg-orange-600 hover:bg-orange-700 flex-1'
            >
              <RefreshCw className='w-4 h-4' />
              Try Search Again
            </Button>
            
            <Link href='/search' className='flex-1'>
              <Button variant='outline' className='gap-2 w-full'>
                <Search className='w-4 h-4' />
                New Search
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className='mt-4'>
            <Link href='/'>
              <Button variant='ghost' className='gap-2 text-orange-600 hover:text-orange-700'>
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className='text-xs text-gray-500 mt-6'>
            Search issues persist? Our support team can help you find the perfect property.
          </p>
        </div>

        {/* Quick Search Suggestions */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-3'>Try these popular searches:</p>
          <div className='flex flex-wrap justify-center gap-2'>
            <Link href='/search?location=beachfront'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1'>
                <MapPin className='w-3 h-3' />
                🏖️ Beachfront Homes
              </Button>
            </Link>
            <Link href='/search?location=mountain&guests=4'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1'>
                <MapPin className='w-3 h-3' />
                ⛰️ Mountain Cabins
              </Button>
            </Link>
            <Link href='/search?location=city&type=apartment'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1'>
                <MapPin className='w-3 h-3' />
                🌆 City Apartments
              </Button>
            </Link>
            <Link href='/search?available=weekend'>
              <Button variant='ghost' size='sm' className='text-xs bg-white shadow-sm gap-1'>
                <Calendar className='w-3 h-3' />
                🗓️ Weekend Getaways
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}