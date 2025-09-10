/**
 * @deprecated Most utilities have been moved to @/lib/utils/search
 * This file re-exports for backward compatibility during migration
 */
// Import from new centralized utilities
import {
  calculateNights,
  DATE_FORMATS as CORE_DATE_FORMATS,
  formatDate,
  formatDateRange as formatDateRangeBase,
} from '@/lib/utils/formatting';
import {
  formatGuestText,
  formatGuestTextShort,
  getCalendarEndDate,
  getCalendarStartDate,
  getGuestTypeDescription,
  getTotalGuests,
  isDateDisabled as isDateDisabledBase,
} from '@/lib/utils/search';
import { cn } from '@/lib/utils/styling';
import { isDateInRange as isDateInRangeBase } from '@/lib/utils/validation';

// Keep local DATE_FORMATS import from constants for now
import { DATE_FORMATS } from './constants';

// Re-export for backward compatibility
export { cn } from '@/lib/utils/styling';
export { calculateNights } from '@/lib/utils/formatting';
export {
  getTotalGuests,
  formatGuestText,
  formatGuestTextShort,
  getGuestTypeDescription,
  getCalendarStartDate,
  getCalendarEndDate,
} from '@/lib/utils/search';

// Wrapper functions for backward compatibility with existing signatures
export const formatDateRange = (
  checkIn: Date | null,
  checkOut: Date | null,
  placeholder = 'Check in - Check out'
): string => {
  if (!checkIn && !checkOut) return placeholder;
  return formatDateRangeBase(checkIn, checkOut, ' - ');
};

export const formatDateForDisplay = (date: Date | null, defaultText = 'Add dates'): string => {
  return formatDate(date, DATE_FORMATS.MONTH_DAY, defaultText);
};

// Simple wrappers for validation functions
export const isDateDisabled = (date: Date): boolean => {
  return isDateDisabledBase(date, { disablePast: true });
};

export const isDateInRange = (
  date: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  if (!startDate || !endDate) return false;
  return isDateInRangeBase(date, startDate, endDate);
};
