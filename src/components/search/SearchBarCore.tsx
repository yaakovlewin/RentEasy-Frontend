'use client';

import { memo, useCallback, useMemo, useState } from 'react';

import { Search } from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { Button } from '@/components/ui/button';

import { type SearchData, useSearch } from '@/contexts/SearchContext';

import { SIZES } from './constants';
import { useClickOutside } from './hooks';
import { GuestSelector } from './GuestSelector';
import { LocationInput } from './LocationInput';
import { UnifiedDatePicker } from './UnifiedDatePicker';
import { cn, formatDateForDisplay, formatDateRange, formatGuestText, formatGuestTextShort } from './utils';

type SearchBarLayout = 'hero' | 'header' | 'compact';
type ActiveField = 'location' | 'dates' | 'guests' | null;

interface SearchBarCoreProps {
  layout: SearchBarLayout;
  onSearch?: (searchData: SearchData) => void;
  className?: string;
  isDocked?: boolean;
  'data-testid'?: string;
}

/**
 * SearchBarCore - Unified search bar component with multiple layouts
 * 
 * Consolidates all search bar variants into a single component with different
 * layout modes to eliminate code duplication while maintaining distinct UIs.
 * 
 * @param layout - The layout variant ('hero' | 'header' | 'compact')
 * @param onSearch - Callback function when search is performed
 * @param className - Additional CSS classes
 * @param isDocked - Whether the search bar is in docked mode
 * @param data-testid - Test identifier for testing
 */
const SearchBarCoreComponent = ({
  layout,
  onSearch,
  className,
  isDocked = false,
  'data-testid': testId,
}: SearchBarCoreProps) => {
  const {
    searchData,
    updateLocation,
    updateDates,
    updateGuests,
    onSearch: contextOnSearch,
  } = useSearch();

  const [activeField, setActiveField] = useState<ActiveField>(null);

  // Memoized callbacks to prevent unnecessary re-renders
  const closeActiveField = useCallback(() => setActiveField(null), []);

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

  const handleFieldClick = useCallback((field: ActiveField) => {
    setActiveField(field);
  }, []);

  useClickOutside(closeActiveField, [
    '.searchbar',
    '.enhanced-date-picker',
    '.guest-selector-dropdown',
  ]);

  // Memoized layout-specific configurations
  const layoutConfig = useMemo(() => {
    switch (layout) {
      case 'hero':
        return {
          containerClass: cn(
            'searchbar bg-white rounded-full shadow-xl hover:shadow-2xl mx-auto transition-all duration-300',
            SIZES.SEARCH_BAR_MAX_WIDTH.HERO
          ),
          formClass: 'flex flex-col lg:flex-row items-stretch lg:items-center',
          showLabels: true,
          showPopups: false,
          fieldSpacing: 'border-r border-gray-200',
        };
      case 'header':
        return {
          containerClass: cn(
            'searchbar bg-white rounded-full shadow-md hover:shadow-lg w-full transition-all duration-300',
            SIZES.SEARCH_BAR_MAX_WIDTH.HEADER
          ),
          formClass: 'flex items-center h-12',
          showLabels: false,
          showPopups: true,
          fieldSpacing: 'w-px h-5 bg-gray-300',
        };
      case 'compact':
        return {
          containerClass: 'searchbar space-y-4',
          formClass: 'space-y-4',
          showLabels: true,
          showPopups: false,
          fieldSpacing: '',
        };
      default:
        return {
          containerClass: 'searchbar',
          formClass: 'flex items-center',
          showLabels: true,
          showPopups: false,
          fieldSpacing: '',
        };
    }
  }, [layout]);

  // Memoized date display text
  const dateDisplayText = useMemo(() => {
    if (layout === 'header') {
      return searchData.checkIn || searchData.checkOut
        ? formatDateRange(searchData.checkIn, searchData.checkOut, 'Anytime')
        : 'Anytime';
    }
    return formatDateForDisplay(searchData.checkIn, searchData.checkOut);
  }, [layout, searchData.checkIn, searchData.checkOut]);

  // Memoized guest display text
  const guestDisplayText = useMemo(() => {
    return layout === 'header' 
      ? formatGuestTextShort(searchData.guests)
      : formatGuestText(searchData.guests);
  }, [layout, searchData.guests]);

  // Hero Layout
  if (layout === 'hero') {
    return (
      <FeatureErrorBoundary
        featureName="Hero Search Bar"
        level="high"
        enableRetry
      >
        <div
          className={cn(layoutConfig.containerClass, className)}
          data-docked={isDocked ? 'true' : 'false'}
          data-testid={testId}
        >
          <form
            role="search"
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
            className={layoutConfig.formClass}
            aria-label="Search stays"
          >
            {/* Location Field */}
            <div className="relative flex-1 group hover:bg-gray-50/50 rounded-l-full transition-colors duration-200">
              <div 
                className="px-7 py-4 cursor-pointer" 
                onClick={() => handleFieldClick('location')}
              >
                <label className="block text-xs font-semibold text-gray-900 mb-1.5">Where</label>
                <div className="text-sm text-gray-900 font-normal bg-transparent outline-none text-left w-full">
                  {searchData.location || 'Search destinations'}
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200" />
            </div>

            {/* Check-in Field */}
            <div className="relative flex-1 group hover:bg-gray-50/50 transition-colors duration-200">
              <div 
                className="px-7 py-4 cursor-pointer" 
                onClick={() => handleFieldClick('dates')}
              >
                <label className="block text-xs font-semibold text-gray-900 mb-1.5">Check in</label>
                <div className="text-sm text-gray-900 font-normal bg-transparent outline-none text-left w-full">
                  {formatDateForDisplay(searchData.checkIn)}
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200" />
            </div>

            {/* Check-out Field */}
            <div className="relative flex-1 group hover:bg-gray-50/50 transition-colors duration-200">
              <div 
                className="px-7 py-4 cursor-pointer" 
                onClick={() => handleFieldClick('dates')}
              >
                <label className="block text-xs font-semibold text-gray-900 mb-1.5">Check out</label>
                <div className="text-sm text-gray-900 font-normal bg-transparent outline-none text-left w-full">
                  {formatDateForDisplay(searchData.checkOut)}
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200" />
            </div>

            {/* Guests Field */}
            <div className="relative flex-1 group hover:bg-gray-50/50 rounded-r-full transition-colors duration-200">
              <div className="px-7 py-4 flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => handleFieldClick('guests')}
                >
                  <label className="block text-xs font-semibold text-gray-900 mb-1.5">Who</label>
                  <div className="text-sm text-gray-900 font-normal bg-transparent outline-none text-left w-full">
                    {guestDisplayText}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:from-[#d01050] hover:to-[#c70466] text-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 ml-4"
                  data-testid={`${testId}-search-button`}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </form>

          {/* Location popup for hero layout */}
          {activeField === 'location' && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-full max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <LocationInput
                    value={searchData.location}
                    onChange={updateLocation}
                    placeholder="Search destinations"
                    className="w-full"
                    data-testid={`${testId}-location-input`}
                  />
                </div>
                <button
                  type="button"
                  onClick={closeActiveField}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Date picker popup for hero layout */}
          {activeField === 'dates' && (
            <div className="absolute top-full mt-2 left-1/4 z-50">
              <UnifiedDatePicker
                variant="enhanced"
                checkIn={searchData.checkIn}
                checkOut={searchData.checkOut}
                onDateSelect={handleDateSelect}
                onClose={closeActiveField}
                isOpen={true}
                showHeader={true}
                autoClose={true}
                data-testid={`${testId}-date-picker`}
              />
            </div>
          )}

          {/* Guest selector popup for hero layout */}
          {activeField === 'guests' && (
            <div className="absolute top-full mt-2 right-0 z-50">
              <GuestSelector
                guests={searchData.guests}
                onChange={updateGuests}
                className="w-full"
                isOpenByDefault={true}
                variant="compact"
                data-testid={`${testId}-guest-selector`}
              />
            </div>
          )}
        </div>
      </FeatureErrorBoundary>
    );
  }

  // Header Layout
  if (layout === 'header') {
    return (
      <FeatureErrorBoundary
        featureName="Header Search Bar"
        level="high"
        enableRetry
      >
        <div
          className={cn(layoutConfig.containerClass, className)}
          data-docked={isDocked ? 'true' : 'false'}
          data-testid={testId}
        >
          <form
            role="search"
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
            className={layoutConfig.formClass}
            aria-label="Search stays"
          >
            {/* Location Section */}
            <div
              className="flex-1 flex items-center px-4 py-2 text-left hover:bg-gray-50 rounded-l-full transition-colors duration-200 h-full group cursor-pointer"
              onClick={() => handleFieldClick('location')}
              role="button"
              tabIndex={0}
              data-testid={`${testId}-location-trigger`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-normal text-gray-900">
                  {searchData.location || 'Anywhere'}
                </span>
                <div className="w-px h-5 bg-gray-300 ml-3" />
              </div>
            </div>

            {/* Dates Section */}
            <div
              className="flex-1 flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 h-full group cursor-pointer"
              onClick={() => handleFieldClick('dates')}
              role="button"
              tabIndex={0}
              data-testid={`${testId}-dates-trigger`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-normal text-gray-900">{dateDisplayText}</span>
                <div className="w-px h-5 bg-gray-300 ml-3" />
              </div>
            </div>

            {/* Guests Section */}
            <div
              className="flex-1 flex items-center px-4 py-2 text-left hover:bg-gray-50 rounded-r-full transition-colors duration-200 h-full pr-2 group cursor-pointer"
              onClick={() => handleFieldClick('guests')}
              role="button"
              tabIndex={0}
              data-testid={`${testId}-guests-trigger`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-normal text-gray-900">
                  {guestDisplayText}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:from-[#d01050] hover:to-[#c70460] text-white rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 ml-2"
                  data-testid={`${testId}-search-button`}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>

          {/* Popups for header layout */}
          {activeField === 'location' && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-full max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <LocationInput
                    value={searchData.location}
                    onChange={updateLocation}
                    placeholder="Search destinations"
                    className="w-full"
                    data-testid={`${testId}-location-input`}
                  />
                </div>
                <button
                  type="button"
                  onClick={closeActiveField}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {activeField === 'dates' && (
            <div className="absolute top-full mt-2 left-1/4 z-50">
              <UnifiedDatePicker
                variant="enhanced"
                checkIn={searchData.checkIn}
                checkOut={searchData.checkOut}
                onDateSelect={handleDateSelect}
                onClose={closeActiveField}
                isOpen={true}
                showHeader={true}
                autoClose={true}
                data-testid={`${testId}-date-picker`}
              />
            </div>
          )}

          {activeField === 'guests' && (
            <div className="absolute top-full mt-2 right-0 z-50">
              <GuestSelector
                guests={searchData.guests}
                onChange={updateGuests}
                className="w-full"
                isOpenByDefault={true}
                variant="compact"
                data-testid={`${testId}-guest-selector`}
              />
            </div>
          )}
        </div>
      </FeatureErrorBoundary>
    );
  }

  // Compact Layout
  return (
    <FeatureErrorBoundary
      featureName="Compact Search Bar"
      level="medium"
      enableRetry
    >
      <div 
        className={cn(layoutConfig.containerClass, className)} 
        data-docked={isDocked ? 'true' : 'false'}
        data-testid={testId}
      >
        <form
          role="search"
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className={layoutConfig.formClass}
          aria-label="Search stays"
        >
          {/* Location Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where are you going?
            </label>
            <LocationInput
              value={searchData.location}
              onChange={updateLocation}
              placeholder="Search destinations"
              className="w-full"
              data-testid={`${testId}-location`}
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">When?</label>
            <UnifiedDatePicker
              variant="compact"
              checkIn={searchData.checkIn}
              checkOut={searchData.checkOut}
              onDateSelect={handleDateSelect}
              placeholder="Add dates"
              className="w-full"
              autoClose={true}
              data-testid={`${testId}-dates`}
            />
          </div>

          {/* Guests Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who?</label>
            <GuestSelector
              guests={searchData.guests}
              onChange={updateGuests}
              className="w-full"
              variant="full"
              data-testid={`${testId}-guests`}
            />
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:from-[#d01050] hover:to-[#c70460] text-white rounded-lg py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            data-testid={`${testId}-search-button`}
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </form>
      </div>
    </FeatureErrorBoundary>
  );
};

// Export the memoized version for performance optimization
export const SearchBarCore = memo(SearchBarCoreComponent);
SearchBarCore.displayName = 'SearchBarCore';