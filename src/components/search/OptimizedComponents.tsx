'use client';

import React, { memo, useCallback, useMemo } from 'react';

import type { SearchData } from '@/contexts/SearchContext';

import { Calendar as CalendarComponent } from './Calendar';
import { GuestCounter as GuestCounterComponent } from './GuestCounter';
import { LocationInput } from './LocationInput';
import { getTotalGuests } from './utils';

// Memoized Calendar Component
export const MemoizedCalendar = memo(CalendarComponent, (prevProps, nextProps) => {
  return (
    prevProps.currentMonth.getTime() === nextProps.currentMonth.getTime() &&
    prevProps.checkIn?.getTime() === nextProps.checkIn?.getTime() &&
    prevProps.checkOut?.getTime() === nextProps.checkOut?.getTime() &&
    prevProps.selectingCheckOut === nextProps.selectingCheckOut &&
    prevProps.monthOffset === nextProps.monthOffset &&
    prevProps.showNavigation === nextProps.showNavigation
  );
});

MemoizedCalendar.displayName = 'MemoizedCalendar';

// Memoized Guest Counter Component
export const MemoizedGuestCounter = memo(GuestCounterComponent, (prevProps, nextProps) => {
  return (
    prevProps.label === nextProps.label &&
    prevProps.description === nextProps.description &&
    prevProps.value === nextProps.value &&
    prevProps.canIncrement === nextProps.canIncrement &&
    prevProps.canDecrement === nextProps.canDecrement &&
    prevProps.className === nextProps.className
  );
});

MemoizedGuestCounter.displayName = 'MemoizedGuestCounter';

// Memoized Location Input Component
export const MemoizedLocationInput = memo(LocationInput, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.suggestions) === JSON.stringify(nextProps.suggestions)
  );
});

MemoizedLocationInput.displayName = 'MemoizedLocationInput';

// Optimized Guest Text Hook
export function useOptimizedGuestText(guests: SearchData['guests']) {
  return useMemo(() => {
    const total = getTotalGuests(guests);
    const parts: string[] = [];

    if (total === 0) {
      return 'Add guests';
    }

    if (total === 1) {
      parts.push('1 guest');
    } else if (total > 1) {
      parts.push(`${total} guests`);
    }

    if (guests.infants > 0) {
      parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`);
    }

    return parts.join(', ');
  }, [guests]);
}

// Optimized Date Text Hook
export function useOptimizedDateText(checkIn: Date | null, checkOut: Date | null) {
  return useMemo(() => {
    if (checkIn && checkOut) {
      return `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (checkIn) {
      return `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Add dates`;
    }
    return 'Add dates';
  }, [checkIn, checkOut]);
}

// Optimized Search Handler Hook
export function useOptimizedSearchHandler(
  onSearch?: (searchData: SearchData) => void,
  contextOnSearch?: (searchData: SearchData) => void,
  searchData?: SearchData
) {
  return useCallback(() => {
    if (!searchData) return;
    const searchCallback = onSearch || contextOnSearch;
    searchCallback?.(searchData);
  }, [onSearch, contextOnSearch, searchData]);
}

// Performance monitoring hook for development
export function usePerformanceMonitor(componentName: string) {
  const renderStart = useMemo(() => performance.now(), []);

  React.useLayoutEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      // More than one frame
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
  });
}

// Debounced search hook
export function useLegacyDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}
