/**
 * Pure Date Utility Functions
 *
 * Curried, pure functions for date operations.
 * All functions are composable and immutable.
 *
 * Extracted from BookingsClient and enhanced for functional programming.
 */

import { curry2, curry3 } from '../../api/functional/compose';

/**
 * Date format types
 */
export type DateFormat =
  | 'short' // 1/1/2024
  | 'medium' // Jan 1, 2024
  | 'long' // January 1, 2024
  | 'full' // Monday, January 1, 2024
  | 'iso'; // 2024-01-01

/**
 * Type for date-like values (string or Date)
 */
export type DateString = string | Date;

/**
 * Parse date string to Date object
 * Pure function
 */
export const parseDate = (dateStr: DateString): Date =>
  typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

/**
 * Format date with locale and options
 * Pure curried function
 *
 * @example
 * const formatUS = formatDate('en-US')({ month: 'short', day: 'numeric', year: 'numeric' });
 * formatUS(new Date('2024-01-01')); // "Jan 1, 2024"
 */
export const formatDate = (locale: string) =>
  (options: Intl.DateTimeFormatOptions) =>
  (date: DateString): string => {
    const parsedDate = parseDate(date);
    return new Intl.DateTimeFormat(locale, options).format(parsedDate);
  };

/**
 * Format date with predefined formats
 * Pure curried function
 *
 * @example
 * const formatShort = formatDatePreset('en-US')('short');
 * formatShort('2024-01-01'); // "1/1/2024"
 */
export const formatDatePreset = (locale: string) =>
  (format: DateFormat) =>
  (date: DateString): string => {
    const parsedDate = parseDate(date);

    if (format === 'iso') {
      return parsedDate.toISOString().split('T')[0];
    }

    const formats: Record<DateFormat, Intl.DateTimeFormatOptions> = {
      short: { month: 'numeric', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      iso: {}, // Handled above
    };

    return new Intl.DateTimeFormat(locale, formats[format]).format(parsedDate);
  };

/**
 * Format date range
 * Pure curried function
 *
 * @example
 * const formatRange = formatDateRange('en-US')({ month: 'short', day: 'numeric' });
 * formatRange('2024-01-01')('2024-01-05'); // "Jan 1 - Jan 5"
 */
export const formatDateRange = (locale: string) =>
  (options: Intl.DateTimeFormatOptions) =>
  (checkIn: DateString) =>
  (checkOut: DateString): string => {
    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);

    const formatter = new Intl.DateTimeFormat(locale, options);

    const checkInFormatted = formatter.format(checkInDate);
    const checkOutFormatted = formatter.format(checkOutDate);

    // If same year, omit year from first date
    if (checkInDate.getFullYear() === checkOutDate.getFullYear()) {
      const optionsWithoutYear = { ...options };
      delete optionsWithoutYear.year;
      const formatterWithoutYear = new Intl.DateTimeFormat(locale, optionsWithoutYear);
      return `${formatterWithoutYear.format(checkInDate)} - ${checkOutFormatted}`;
    }

    return `${checkInFormatted} - ${checkOutFormatted}`;
  };

/**
 * Format date range with preset format (simplified from BookingsClient)
 * Pure curried function
 *
 * @example
 * const formatRange = formatDateRangeSimple('2024-01-01')('2024-01-05');
 * formatRange; // "Jan 1 - Jan 5, 2024"
 */
export const formatDateRangeSimple = (checkIn: DateString) =>
  (checkOut: DateString): string => {
    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);

    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: checkInDate.getFullYear() !== checkOutDate.getFullYear() ? 'numeric' : undefined,
    });

    return `${formatter.format(checkInDate)} - ${formatter.format(checkOutDate)}`;
  };

/**
 * Calculate number of nights between dates
 * Pure curried function (extracted from BookingsClient)
 *
 * @example
 * const calculateNights = calculateNightsBetween('2024-01-01')('2024-01-05');
 * calculateNights; // 4
 */
export const calculateNightsBetween = (checkIn: DateString) =>
  (checkOut: DateString): number => {
    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

/**
 * Calculate number of days between dates
 * Pure curried function
 */
export const daysBetween = (startDate: DateString) =>
  (endDate: DateString): number => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

/**
 * Calculate number of hours between dates
 * Pure curried function
 */
export const hoursBetween = (startDate: DateString) =>
  (endDate: DateString): number => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.floor(timeDiff / (1000 * 3600));
  };

/**
 * Calculate number of minutes between dates
 * Pure curried function
 */
export const minutesBetween = (startDate: DateString) =>
  (endDate: DateString): number => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.floor(timeDiff / (1000 * 60));
  };

/**
 * Add days to date
 * Pure curried function
 *
 * @example
 * const add5Days = addDays(5);
 * add5Days('2024-01-01'); // Date object for 2024-01-06
 */
export const addDays = (days: number) =>
  (date: DateString): Date => {
    const newDate = new Date(parseDate(date));
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

/**
 * Add months to date
 * Pure curried function
 */
export const addMonths = (months: number) =>
  (date: DateString): Date => {
    const newDate = new Date(parseDate(date));
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

/**
 * Add years to date
 * Pure curried function
 */
export const addYears = (years: number) =>
  (date: DateString): Date => {
    const newDate = new Date(parseDate(date));
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  };

/**
 * Add hours to date
 * Pure curried function
 */
export const addHours = (hours: number) =>
  (date: DateString): Date => {
    const newDate = new Date(parseDate(date));
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

/**
 * Subtract days from date
 * Pure curried function
 */
export const subtractDays = (days: number) =>
  (date: DateString): Date => addDays(-days)(date);

/**
 * Subtract months from date
 * Pure curried function
 */
export const subtractMonths = (months: number) =>
  (date: DateString): Date => addMonths(-months)(date);

/**
 * Subtract years from date
 * Pure curried function
 */
export const subtractYears = (years: number) =>
  (date: DateString): Date => addYears(-years)(date);

/**
 * Check if date is after another date
 * Pure curried function
 */
export const isAfter = (compareDate: DateString) =>
  (date: DateString): boolean => {
    const d = parseDate(date);
    const c = parseDate(compareDate);
    return d.getTime() > c.getTime();
  };

/**
 * Check if date is before another date
 * Pure curried function
 */
export const isBefore = (compareDate: DateString) =>
  (date: DateString): boolean => {
    const d = parseDate(date);
    const c = parseDate(compareDate);
    return d.getTime() < c.getTime();
  };

/**
 * Check if date is same as another date
 * Pure curried function
 */
export const isSameDay = (compareDate: DateString) =>
  (date: DateString): boolean => {
    const d = parseDate(date);
    const c = parseDate(compareDate);
    return (
      d.getFullYear() === c.getFullYear() &&
      d.getMonth() === c.getMonth() &&
      d.getDate() === c.getDate()
    );
  };

/**
 * Check if date is between two dates (inclusive)
 * Pure curried function
 */
export const isBetween = (startDate: DateString) =>
  (endDate: DateString) =>
  (date: DateString): boolean => {
    const d = parseDate(date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
  };

/**
 * Check if date is today
 * Pure function
 */
export const isToday = (date: DateString): boolean => {
  const d = parseDate(date);
  const today = new Date();
  return isSameDay(today)(d);
};

/**
 * Check if date is in the past
 * Pure function
 */
export const isPast = (date: DateString): boolean => {
  const d = parseDate(date);
  const now = new Date();
  return d.getTime() < now.getTime();
};

/**
 * Check if date is in the future
 * Pure function
 */
export const isFuture = (date: DateString): boolean => {
  const d = parseDate(date);
  const now = new Date();
  return d.getTime() > now.getTime();
};

/**
 * Check if date is a weekend
 * Pure function
 */
export const isWeekend = (date: DateString): boolean => {
  const d = parseDate(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Check if date is a weekday
 * Pure function
 */
export const isWeekday = (date: DateString): boolean => !isWeekend(date);

/**
 * Get start of day (00:00:00)
 * Pure function
 */
export const startOfDay = (date: DateString): Date => {
  const d = new Date(parseDate(date));
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day (23:59:59)
 * Pure function
 */
export const endOfDay = (date: DateString): Date => {
  const d = new Date(parseDate(date));
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of month
 * Pure function
 */
export const startOfMonth = (date: DateString): Date => {
  const d = new Date(parseDate(date));
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of month
 * Pure function
 */
export const endOfMonth = (date: DateString): Date => {
  const d = new Date(parseDate(date));
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get relative time description
 * Pure function
 *
 * @example
 * relativeTime(Date.now() - 3600000); // "1 hour ago"
 */
export const relativeTime = (date: DateString): string => {
  const d = parseDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(diffDays / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

/**
 * Get time until date
 * Pure function
 *
 * @example
 * timeUntil(new Date(Date.now() + 3600000)); // "in 1 hour"
 */
export const timeUntil = (date: DateString): string => {
  const d = parseDate(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  if (diffMs < 0) return 'in the past';

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'in less than a minute';
  if (diffMins < 60) return `in ${diffMins} minute${diffMins === 1 ? '' : 's'}`;
  if (diffHours < 24) return `in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  if (diffDays < 7) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `in ${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `in ${months} month${months === 1 ? '' : 's'}`;
  }

  const years = Math.floor(diffDays / 365);
  return `in ${years} year${years === 1 ? '' : 's'}`;
};

/**
 * Convert to ISO string
 * Pure function
 */
export const toISOString = (date: DateString): string =>
  parseDate(date).toISOString();

/**
 * Convert to ISO date (YYYY-MM-DD)
 * Pure function
 */
export const toISODate = (date: DateString): string =>
  toISOString(date).split('T')[0];

/**
 * Namespace containing all date utilities
 */
export const DateUtils = Object.freeze({
  parseDate,
  formatDate,
  formatDatePreset,
  formatDateRange,
  formatDateRangeSimple,
  calculateNightsBetween,
  daysBetween,
  hoursBetween,
  minutesBetween,
  addDays,
  addMonths,
  addYears,
  addHours,
  subtractDays,
  subtractMonths,
  subtractYears,
  isAfter,
  isBefore,
  isSameDay,
  isBetween,
  isToday,
  isPast,
  isFuture,
  isWeekend,
  isWeekday,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  relativeTime,
  timeUntil,
  toISOString,
  toISODate,
});
