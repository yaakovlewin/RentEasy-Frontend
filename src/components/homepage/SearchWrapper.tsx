'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useSearch } from '@/contexts/SearchContext';
import { type SearchData } from '@/components/search';

interface SearchWrapperProps {
  children: React.ReactNode;
}

/**
 * Client wrapper that provides search functionality to the homepage
 */
export function SearchWrapper({ children }: SearchWrapperProps) {
  const router = useRouter();
  const { setOnSearch } = useSearch();

  useEffect(() => {
    const handleSearch = (searchData: SearchData) => {
      console.log('Search data:', searchData);

      // Build search query parameters
      const params = new URLSearchParams();
      if (searchData.location) params.set('location', searchData.location);
      if (searchData.checkIn) params.set('checkIn', searchData.checkIn.toISOString());
      if (searchData.checkOut) params.set('checkOut', searchData.checkOut.toISOString());
      if (searchData.guests.adults) params.set('adults', searchData.guests.adults.toString());
      if (searchData.guests.children) params.set('children', searchData.guests.children.toString());
      if (searchData.guests.infants) params.set('infants', searchData.guests.infants.toString());

      // Navigate to search page with parameters
      router.push(`/search?${params.toString()}`);
    };

    setOnSearch(handleSearch);
  }, [router, setOnSearch]);

  return <>{children}</>;
}