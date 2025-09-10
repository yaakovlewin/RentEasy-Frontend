import Link from 'next/link';

import { ArrowLeft, Home, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * 404 Not Found Page
 * 
 * Displayed when a user navigates to a route that doesn't exist.
 * This can be a server component since it doesn't need error/reset functions.
 */
export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='max-w-lg w-full'>
        {/* 404 Illustration */}
        <div className='text-center mb-8'>
          <div className='text-9xl font-bold text-indigo-200 mb-4'>
            404
          </div>
          <div className='w-24 h-1 bg-indigo-300 mx-auto rounded-full'></div>
        </div>

        {/* Content */}
        <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            Page Not Found
          </h1>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Suggestions */}
          <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-900 mb-2'>Here's what you can try:</h3>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• Check the URL for any typos</li>
              <li>• Go back to the previous page</li>
              <li>• Visit our homepage and navigate from there</li>
              <li>• Use the search to find what you're looking for</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Link href='/' className='w-full'>
              <Button className='gap-2 w-full bg-indigo-600 hover:bg-indigo-700'>
                <Home className='w-4 h-4' />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Search Option */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <Link href='/search'>
              <Button variant='ghost' className='gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'>
                <Search className='w-4 h-4' />
                Search Properties
              </Button>
            </Link>
          </div>
        </div>

        {/* Popular Links */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-600 mb-3'>Popular pages:</p>
          <div className='flex flex-wrap justify-center gap-2'>
            <Link href='/search' className='text-xs text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all'>
              Search Properties
            </Link>
            <Link href='/host' className='text-xs text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all'>
              Become a Host
            </Link>
            <Link href='/dashboard' className='text-xs text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all'>
              Dashboard
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-8'>
          <p className='text-sm text-gray-500'>
            <strong>RentEasy</strong> - Your Perfect Vacation Rental
          </p>
        </div>
      </div>
    </div>
  );
}