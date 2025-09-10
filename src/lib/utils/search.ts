/**
 * Search-specific utility functions
 */
import { endOfMonth, startOfMonth } from 'date-fns';

import type { SearchData } from '@/contexts/SearchContext';

import { DATE_FORMATS, formatDate, pluralize } from './formatting';

// ========================
// Guest Utilities
// ========================

/**
 * Gets the total number of guests (excluding infants)
 * @param guests - Guest object
 * @returns Total guest count
 */
export function getTotalGuests(guests: SearchData['guests']): number {
  return guests.adults + guests.children;
}

/**
 * Gets the total number of all occupants (including infants)
 * @param guests - Guest object
 * @returns Total occupant count
 */
export function getTotalOccupants(guests: SearchData['guests']): number {
  return guests.adults + guests.children + guests.infants;
}

/**
 * Formats guest text for display
 * @param guests - Guest object
 * @returns Formatted guest string
 */
export function formatGuestText(guests: SearchData['guests']): string {
  const total = getTotalGuests(guests);
  const parts: string[] = [];

  if (total === 0) {
    return 'Add guests';
  }

  parts.push(pluralize(total, 'guest'));

  if (guests.infants > 0) {
    parts.push(pluralize(guests.infants, 'infant'));
  }

  return parts.join(', ');
}

/**
 * Formats guest text in short form
 * @param guests - Guest object
 * @returns Short formatted guest string
 */
export function formatGuestTextShort(guests: SearchData['guests']): string {
  const total = getTotalGuests(guests);

  if (total === 0) {
    return 'Add guests';
  }

  return pluralize(total, 'guest');
}

/**
 * Gets description for guest type
 * @param type - Guest type
 * @returns Description string
 */
export function getGuestTypeDescription(type: 'adults' | 'children' | 'infants'): string {
  const descriptions = {
    adults: 'Ages 13 or above',
    children: 'Ages 2-12',
    infants: 'Under 2',
  } as const;

  return descriptions[type];
}

/**
 * Validates if guest configuration is valid for a property
 * @param guests - Guest configuration
 * @param maxGuests - Maximum allowed guests
 * @param maxAdults - Maximum allowed adults (optional)
 * @returns Validation result
 */
export function validateGuestConfiguration(
  guests: SearchData['guests'],
  maxGuests: number,
  maxAdults?: number
): { isValid: boolean; error?: string } {
  const total = getTotalGuests(guests);

  if (guests.adults === 0) {
    return { isValid: false, error: 'At least one adult is required' };
  }

  if (total > maxGuests) {
    return { isValid: false, error: `Maximum ${maxGuests} guests allowed` };
  }

  if (maxAdults && guests.adults > maxAdults) {
    return { isValid: false, error: `Maximum ${maxAdults} adults allowed` };
  }

  return { isValid: true };
}

// ========================
// Calendar Utilities
// ========================

/**
 * Gets the starting date for calendar grid (Sunday of the week)
 * @param monthDate - Any date in the month
 * @returns Start date for calendar grid
 */
export function getCalendarStartDate(monthDate: Date): Date {
  const firstDay = startOfMonth(monthDate);
  const dayOfWeek = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - dayOfWeek);
  return startDate;
}

/**
 * Gets the ending date for calendar grid (Saturday of the week)
 * @param monthDate - Any date in the month
 * @returns End date for calendar grid
 */
export function getCalendarEndDate(monthDate: Date): Date {
  const lastDay = endOfMonth(monthDate);
  const dayOfWeek = lastDay.getDay();
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - dayOfWeek));
  return endDate;
}

/**
 * Checks if a date should be disabled in the calendar
 * @param date - Date to check
 * @param options - Disable options
 * @returns True if date should be disabled
 */
export function isDateDisabled(
  date: Date,
  options: {
    disablePast?: boolean;
    disableFuture?: boolean;
    disabledDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
  } = {}
): boolean {
  const {
    disablePast = true,
    disableFuture = false,
    disabledDates = [],
    minDate,
    maxDate,
  } = options;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Check past dates
  if (disablePast && checkDate < today) {
    return true;
  }

  // Check future dates
  if (disableFuture && checkDate > today) {
    return true;
  }

  // Check min/max dates
  if (minDate && checkDate < minDate) {
    return true;
  }

  if (maxDate && checkDate > maxDate) {
    return true;
  }

  // Check specific disabled dates
  return disabledDates.some(disabled => {
    const d = new Date(disabled);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === checkDate.getTime();
  });
}

// ========================
// Search Filter Utilities
// ========================

/**
 * Builds search query parameters from search data
 * @param searchData - Search data object
 * @returns URL search params
 */
export function buildSearchParams(searchData: Partial<SearchData>): URLSearchParams {
  const params = new URLSearchParams();

  if (searchData.location) {
    params.set('location', searchData.location);
  }

  if (searchData.checkIn) {
    params.set('checkIn', formatDate(searchData.checkIn, DATE_FORMATS.ISO));
  }

  if (searchData.checkOut) {
    params.set('checkOut', formatDate(searchData.checkOut, DATE_FORMATS.ISO));
  }

  if (searchData.guests) {
    params.set('adults', searchData.guests.adults.toString());
    params.set('children', searchData.guests.children.toString());
    params.set('infants', searchData.guests.infants.toString());
  }

  return params;
}

/**
 * Parses search parameters from URL
 * @param params - URL search params
 * @returns Parsed search data
 */
export function parseSearchParams(params: URLSearchParams): Partial<SearchData> {
  const searchData: Partial<SearchData> = {};

  const location = params.get('location');
  if (location) {
    searchData.location = location;
  }

  const checkIn = params.get('checkIn');
  if (checkIn) {
    searchData.checkIn = new Date(checkIn);
  }

  const checkOut = params.get('checkOut');
  if (checkOut) {
    searchData.checkOut = new Date(checkOut);
  }

  const adults = params.get('adults');
  const children = params.get('children');
  const infants = params.get('infants');

  if (adults || children || infants) {
    searchData.guests = {
      adults: parseInt(adults || '1', 10),
      children: parseInt(children || '0', 10),
      infants: parseInt(infants || '0', 10),
    };
  }

  return searchData;
}

/**
 * Merges search filters with defaults
 * @param filters - Partial filters
 * @param defaults - Default filters
 * @returns Merged filters
 */
export function mergeSearchFilters<T extends Record<string, any>>(
  filters: Partial<T>,
  defaults: T
): T {
  return {
    ...defaults,
    ...Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key as keyof T] = value;
      }
      return acc;
    }, {} as Partial<T>),
  } as T;
}
