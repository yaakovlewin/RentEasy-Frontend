'use client';

import { Suspense } from 'react';
import SearchContent from './SearchContent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * SearchClient - Client Component for Search Page
 * 
 * Separates client-side search functionality from server-side metadata generation.
 */
export default function SearchClient() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen'>
          <LoadingSpinner size='lg' />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}