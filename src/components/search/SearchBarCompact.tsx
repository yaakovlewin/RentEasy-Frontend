'use client';

import { useCallback } from 'react';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { type SearchData, useSearch } from '@/contexts/SearchContext';

import { GuestSelector } from './GuestSelector';
import { LocationInput } from './LocationInput';
import { UnifiedDatePicker } from './UnifiedDatePicker';
import { cn } from './utils';

interface SearchBarCompactProps {
  onSearch?: (searchData: SearchData) => void;
  className?: string;
  isDocked?: boolean;
}

export function SearchBarCompact({ onSearch, className, isDocked = false }: SearchBarCompactProps) {
  const {
    searchData,
    updateLocation,
    updateDates,
    updateGuests,
    onSearch: contextOnSearch,
  } = useSearch();

  const handleSearch = useCallback(() => {
    const searchCallback = onSearch || contextOnSearch;
    searchCallback?.(searchData);
  }, [onSearch, contextOnSearch, searchData]);

  const handleDateSelect = useCallback(
    (checkIn: Date | null, checkOut: Date | null) => {
      updateDates(checkIn, checkOut);
    },
    [updateDates]
  );

  return (
    <div className={cn('searchbar space-y-4', className)} data-docked={isDocked ? 'true' : 'false'}>
      <form
        role='search'
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        className='space-y-4'
        aria-label='Search stays'
      >
        {/* Location Field */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Where are you going?
          </label>
          <LocationInput
            value={searchData.location}
            onChange={updateLocation}
            placeholder='Search destinations'
            className='w-full'
          />
        </div>

        {/* Date Field */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>When?</label>
          <UnifiedDatePicker
            variant='compact'
            checkIn={searchData.checkIn}
            checkOut={searchData.checkOut}
            onDateSelect={handleDateSelect}
            placeholder='Add dates'
            className='w-full'
            autoClose={true}
          />
        </div>

        {/* Guests Field */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Guests</label>
          <GuestSelector
            guests={searchData.guests}
            onChange={updateGuests}
            className='w-full'
            variant='full'
          />
        </div>

        {/* Search Button */}
        <Button
          type='submit'
          className='w-full bg-primary hover:bg-primary/90 text-white py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200'
        >
          <Search className='w-5 h-5 mr-2' />
          Search
        </Button>
      </form>
    </div>
  );
}
