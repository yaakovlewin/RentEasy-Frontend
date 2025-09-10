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
import { cn, formatDateForDisplay, formatGuestText } from './utils';

interface SearchBarHeroProps {
  onSearch?: (searchData: SearchData) => void;
  className?: string;
  isDocked?: boolean;
}

type ActiveField = 'location' | 'dates' | 'guests' | null;

export function SearchBarHero({ onSearch, className, isDocked = false }: SearchBarHeroProps) {
  const {
    searchData,
    updateLocation,
    updateDates,
    updateGuests,
    onSearch: contextOnSearch,
  } = useSearch();

  const [activeField, setActiveField] = useState<ActiveField>(null);

  const closeActiveField = useCallback(() => setActiveField(null), []);

  useClickOutside(closeActiveField, [
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

  return (
    <div
      className={cn(
        'searchbar bg-white rounded-full shadow-xl hover:shadow-2xl mx-auto transition-all duration-300',
        SIZES.SEARCH_BAR_MAX_WIDTH.HERO,
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
        className='flex flex-col lg:flex-row items-stretch lg:items-center'
        aria-label='Search stays'
      >
        {/* Location Field */}
        <div className='relative flex-1 group hover:bg-gray-50/50 rounded-l-full transition-colors duration-200'>
          <div className='px-7 py-4' onClick={() => setActiveField('location')}>
            <label className='block text-xs font-semibold text-gray-900 mb-1.5'>Where</label>
            <LocationInput
              value={searchData.location}
              onChange={updateLocation}
              placeholder='Search destinations'
              className='location-input border-0 shadow-none p-0 focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 bg-transparent text-sm font-normal w-full outline-none'
            />
          </div>
          <div className='absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200'></div>
        </div>

        {/* Check-in Field */}
        <div className='relative flex-1 group hover:bg-gray-50/50 transition-colors duration-200'>
          <div className='px-6 py-4'>
            <label className='block text-xs font-semibold text-gray-900 mb-1.5'>Check in</label>
            <button
              type='button'
              onClick={() => setActiveField('dates')}
              className='text-sm text-gray-900 font-normal bg-transparent outline-none text-left w-full'
            >
              {formatDateForDisplay(searchData.checkIn)}
            </button>
          </div>
          <div className='absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200'></div>
        </div>

        {/* Check-out Field */}
        <div className='relative flex-1 group hover:bg-gray-50/50 transition-colors duration-200'>
          <div className='px-6 py-4'>
            <label className='block text-xs font-semibold text-gray-900 mb-1.5'>Check out</label>
            <button
              type='button'
              onClick={() => setActiveField('dates')}
              className='text-sm text-gray-900 font-normal bg-transparent outline-none text-left w-full'
            >
              {formatDateForDisplay(searchData.checkOut)}
            </button>
          </div>
          <div className='absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200'></div>
        </div>

        {/* Guests Field */}
        <div className='flex-1 group hover:bg-gray-50/50 transition-colors duration-200 rounded-r-full flex items-center justify-between pr-2'>
          <div
            className='px-6 py-4 flex-1'
            onClick={e => {
              e.stopPropagation();
              setActiveField('guests');
            }}
          >
            <label className='block text-xs font-semibold text-gray-900 mb-1.5'>Who</label>
            <div className='text-sm text-gray-900 font-normal'>
              {formatGuestText(searchData.guests)}
            </div>
          </div>
          <Button
            type='submit'
            size='lg'
            className='bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:from-[#d01050] hover:to-[#c70460] text-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 ml-2'
          >
            <Search className='w-5 h-5' />
          </Button>
        </div>
      </form>

      {/* Enhanced date picker popup */}
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
            variant='full'
          />
        </div>
      )}
    </div>
  );
}
