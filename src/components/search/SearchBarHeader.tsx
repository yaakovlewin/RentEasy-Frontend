'use client';

import { useCallback, useState } from 'react';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { type SearchData, useSearch } from '@/contexts/SearchContext';

import { SIZES } from './constants';
import { useClickOutside } from './hooks';
import { GuestSelector } from './GuestSelector';
import { LocationInput } from './LocationInput';
import { UnifiedDatePicker } from './UnifiedDatePicker';
import { cn, formatDateRange, formatGuestTextShort } from './utils';

interface SearchBarHeaderProps {
  onSearch?: (searchData: SearchData) => void;
  className?: string;
  isDocked?: boolean;
}

type ActiveField = 'location' | 'dates' | 'guests' | null;

export function SearchBarHeader({ onSearch, className, isDocked = false }: SearchBarHeaderProps) {
  const {
    searchData,
    updateLocation,
    updateDates,
    updateGuests,
    onSearch: contextOnSearch,
  } = useSearch();

  const [activeField, setActiveField] = useState<ActiveField>(null);

  const closeActiveField = useCallback(() => setActiveField(null), []);

  const containerRef = useClickOutside(closeActiveField, [
    '.searchbar',
    '.enhanced-date-picker',
    '.guest-selector-dropdown',
  ]);

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

  const formatDateRangeForHeader = () => {
    if (searchData.checkIn || searchData.checkOut) {
      return formatDateRange(searchData.checkIn, searchData.checkOut, 'Anytime');
    }
    return 'Anytime';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'searchbar relative bg-white rounded-full shadow-md hover:shadow-lg w-full transition-all duration-300 z-[60]',
        SIZES.SEARCH_BAR_MAX_WIDTH.HEADER,
        className
      )}
      data-docked={isDocked ? 'true' : 'false'}
    >
      <form
        role='search'
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        className='flex items-center h-12'
        aria-label='Search stays'
      >
        {/* Location Section */}
        <div
          className='flex-1 flex items-center px-4 py-2 text-left hover:bg-gray-50 rounded-l-full transition-colors duration-200 h-full group cursor-pointer'
          onClick={() => setActiveField('location')}
          role='button'
          tabIndex={0}
        >
          <div className='flex items-center justify-between w-full'>
            <span className='text-sm font-normal text-gray-900'>
              {searchData.location || 'Anywhere'}
            </span>
            <div className='w-px h-5 bg-gray-300 ml-3'></div>
          </div>
        </div>

        {/* Dates Section */}
        <div
          className='flex-1 flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 h-full group cursor-pointer'
          onClick={() => setActiveField('dates')}
          role='button'
          tabIndex={0}
        >
          <div className='flex items-center justify-between w-full'>
            <span className='text-sm font-normal text-gray-900'>{formatDateRangeForHeader()}</span>
            <div className='w-px h-5 bg-gray-300 ml-3'></div>
          </div>
        </div>

        {/* Guests Section */}
        <div
          className='flex-1 flex items-center px-4 py-2 text-left hover:bg-gray-50 rounded-r-full transition-colors duration-200 h-full pr-2 group cursor-pointer'
          onClick={() => setActiveField('guests')}
          role='button'
          tabIndex={0}
        >
          <div className='flex items-center justify-between w-full'>
            <span className='text-sm font-normal text-gray-900'>
              {formatGuestTextShort(searchData.guests)}
            </span>
            <Button
              type='submit'
              size='sm'
              className='bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:from-[#d01050] hover:to-[#c70460] text-white rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 ml-2'
              onClick={e => e.stopPropagation()}
            >
              <Search className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </form>

      {/* Expanded form overlay for location */}
      {activeField === 'location' && (
        <div className='absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-full max-w-3xl'>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <LocationInput
                value={searchData.location}
                onChange={updateLocation}
                placeholder='Search destinations'
                className='w-full'
              />
            </div>
            <button
              type='button'
              onClick={closeActiveField}
              className='text-gray-500 hover:text-gray-700 p-2'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Date picker popup */}
      {activeField === 'dates' && (
        <div className='absolute top-full mt-2 left-1/4 z-50'>
          <UnifiedDatePicker
            variant='enhanced'
            checkIn={searchData.checkIn}
            checkOut={searchData.checkOut}
            onDateSelect={handleDateSelect}
            onClose={closeActiveField}
            isOpen={true}
            showHeader={true}
            autoClose={true}
          />
        </div>
      )}

      {/* Guest selector popup */}
      {activeField === 'guests' && (
        <div className='absolute top-full mt-2 right-0 z-50'>
          <GuestSelector
            guests={searchData.guests}
            onChange={updateGuests}
            className='w-full'
            isOpenByDefault={true}
            variant='compact'
          />
        </div>
      )}
    </div>
  );
}
