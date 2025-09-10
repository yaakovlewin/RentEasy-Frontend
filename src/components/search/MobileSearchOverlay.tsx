'use client';

import { useCallback, useEffect, useState } from 'react';

import { ArrowLeft, Calendar, Clock, MapPin, Search, Users, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { type SearchData, useSearch } from '@/contexts/SearchContext';

import { DatePicker, GuestSelector, LocationInput } from './index';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (searchData: SearchData) => void;
  className?: string;
}

export function MobileSearchOverlay({
  isOpen,
  onClose,
  onSearch,
  className,
}: MobileSearchOverlayProps) {
  const {
    searchData,
    updateLocation,
    updateDates,
    updateGuests,
    setOnSearch,
    onSearch: contextOnSearch,
  } = useSearch();

  const [activeStep, setActiveStep] = useState<'location' | 'dates' | 'guests'>('location');
  const [recentSearches] = useState([
    'Bali, Indonesia',
    'Santorini, Greece',
    'Maldives',
    'Tuscany, Italy',
  ]);

  // Set the onSearch callback in the context when component mounts
  useEffect(() => {
    if (onSearch) {
      setOnSearch(onSearch);
    }
  }, [onSearch, setOnSearch]);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSearch = useCallback(() => {
    const searchCallback = onSearch || contextOnSearch;
    searchCallback?.(searchData);
    onClose();
  }, [onSearch, contextOnSearch, searchData, onClose]);

  const handleStepComplete = (step: 'location' | 'dates' | 'guests') => {
    if (step === 'location' && searchData.location) {
      setActiveStep('dates');
    } else if (step === 'dates' && (searchData.checkIn || searchData.checkOut)) {
      setActiveStep('guests');
    } else if (step === 'guests') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Search Overlay */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 transform transition-all duration-500 ease-out',
          'max-h-[90vh] min-h-[60vh]',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className
        )}
      >
        {/* Handle Bar */}
        <div className='flex justify-center pt-3 pb-2'>
          <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
        </div>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <div className='flex items-center space-x-3'>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={onClose}
              className='rounded-full hover:bg-gray-100'
            >
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>Search Stays</h2>
              <p className='text-sm text-gray-600'>Find your perfect getaway</p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={onClose}
            className='rounded-full hover:bg-gray-100'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className='px-6 py-4'>
          <div className='flex items-center justify-between mb-6'>
            {(['location', 'dates', 'guests'] as const).map((step, index) => (
              <div key={step} className='flex items-center flex-1'>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200',
                    activeStep === step ||
                      index < (['location', 'dates', 'guests'] as const).indexOf(activeStep)
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-3 transition-colors duration-200',
                      index < (['location', 'dates', 'guests'] as const).indexOf(activeStep)
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='px-6 pb-8 overflow-y-auto flex-1'>
          {/* Location Step */}
          {activeStep === 'location' && (
            <div className='space-y-6 animate-slide-up'>
              <div>
                <div className='flex items-center space-x-2 mb-4'>
                  <MapPin className='w-5 h-5 text-primary' />
                  <h3 className='text-lg font-semibold text-gray-900'>Where to?</h3>
                </div>
                <LocationInput
                  value={searchData.location}
                  onChange={updateLocation}
                  placeholder='Search destinations'
                  className='w-full h-14 text-base rounded-2xl border-2 border-gray-200 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0'
                  autoFocus
                />
              </div>

              {/* Recent Searches */}
              <div>
                <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                  <Clock className='w-4 h-4 mr-2' />
                  Recent searches
                </h4>
                <div className='grid grid-cols-2 gap-3'>
                  {recentSearches.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateLocation(location);
                        handleStepComplete('location');
                      }}
                      className='p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors duration-200'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-gradient-to-br from-primary to-pink-500 rounded-lg flex items-center justify-center'>
                          <MapPin className='w-4 h-4 text-white' />
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{location}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleStepComplete('location')}
                disabled={!searchData.location}
                className='w-full h-14 text-base font-semibold rounded-2xl'
                size='lg'
              >
                Continue
              </Button>
            </div>
          )}

          {/* Dates Step */}
          {activeStep === 'dates' && (
            <div className='space-y-6 animate-slide-up'>
              <div>
                <div className='flex items-center space-x-2 mb-4'>
                  <Calendar className='w-5 h-5 text-primary' />
                  <h3 className='text-lg font-semibold text-gray-900'>When?</h3>
                </div>
                <DatePicker
                  checkIn={searchData.checkIn}
                  checkOut={searchData.checkOut}
                  onDateSelect={updateDates}
                  placeholder='Select dates'
                  className='w-full h-14 text-base rounded-2xl border-2 border-gray-200 focus:border-primary'
                />
              </div>

              {/* Quick Date Options */}
              <div>
                <h4 className='text-sm font-semibold text-gray-700 mb-3'>Quick options</h4>
                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { label: 'This weekend', days: 2 },
                    { label: 'Next week', days: 7 },
                    { label: 'This month', days: 30 },
                    { label: 'Flexible', days: 0 },
                  ].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (option.days > 0) {
                          const checkIn = new Date();
                          const checkOut = new Date();
                          checkOut.setDate(checkIn.getDate() + option.days);
                          updateDates(checkIn, checkOut);
                        }
                        handleStepComplete('dates');
                      }}
                      className='p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors duration-200'
                    >
                      <p className='text-sm font-medium text-gray-900'>{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => setActiveStep('location')}
                  className='flex-1 h-14 text-base font-semibold rounded-2xl'
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleStepComplete('dates')}
                  className='flex-1 h-14 text-base font-semibold rounded-2xl'
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Guests Step */}
          {activeStep === 'guests' && (
            <div className='space-y-6 animate-slide-up'>
              <div>
                <div className='flex items-center space-x-2 mb-4'>
                  <Users className='w-5 h-5 text-primary' />
                  <h3 className='text-lg font-semibold text-gray-900'>Who's coming?</h3>
                </div>
                <GuestSelector
                  guests={searchData.guests}
                  onChange={updateGuests}
                  className='w-full'
                />
              </div>

              <div className='flex space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => setActiveStep('dates')}
                  className='flex-1 h-14 text-base font-semibold rounded-2xl'
                >
                  Back
                </Button>
                <Button
                  onClick={handleSearch}
                  className='flex-1 h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary-hover hover:to-pink-600'
                >
                  <Search className='w-5 h-5 mr-2' />
                  Search
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
