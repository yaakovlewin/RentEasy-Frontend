import {
  addDays,
  differenceInDays,
  endOfDay,
  format,
  formatDistance,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

// ========================
// Date Formatting
// ========================

/**
 * Standard date formats used across the application
 */
export const DATE_FORMATS = {
  SHORT: 'MMM d', // Jan 1
  MEDIUM: 'MMM d, yyyy', // Jan 1, 2024
  LONG: 'MMMM d, yyyy', // January 1, 2024
  FULL: 'EEEE, MMMM d, yyyy', // Monday, January 1, 2024
  MONTH_DAY: 'MMM d', // Jan 1
  MONTH_YEAR: 'MMMM yyyy', // January 2024
  ISO: 'yyyy-MM-dd', // 2024-01-01
  TIME: 'h:mm a', // 3:30 PM
  DATETIME: 'MMM d, yyyy h:mm a', // Jan 1, 2024 3:30 PM
} as const;

/**
 * Formats a date using a predefined or custom format
 * @param date - Date to format (Date, string, or null)
 * @param formatStr - Format string (use DATE_FORMATS or custom)
 * @param defaultValue - Value to return if date is invalid
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = DATE_FORMATS.MEDIUM,
  defaultValue = ''
): string {
  if (!date) return defaultValue;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return defaultValue;

    return format(dateObj, formatStr, { locale: enUS });
  } catch {
    return defaultValue;
  }
}

/**
 * Formats a date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @param separator - Separator between dates
 * @returns Formatted date range
 */
export function formatDateRange(
  startDate: Date | string | null,
  endDate: Date | string | null,
  separator = ' - '
): string {
  if (!startDate && !endDate) return 'Select dates';
  if (!startDate) return `Select start date${separator}${formatDate(endDate, DATE_FORMATS.SHORT)}`;
  if (!endDate) return `${formatDate(startDate, DATE_FORMATS.SHORT)}${separator}Select end date`;

  const start = formatDate(startDate, DATE_FORMATS.SHORT);
  const end = formatDate(endDate, DATE_FORMATS.SHORT);

  return `${start}${separator}${end}`;
}

/**
 * Formats relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to format
 * @param baseDate - Base date for comparison (defaults to now)
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string, baseDate: Date = new Date()): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    return formatDistance(dateObj, baseDate, {
      addSuffix: true,
      locale: enUS,
    });
  } catch {
    return '';
  }
}

/**
 * Formats time from now (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string from now
 */
export function formatTimeAgo(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: enUS,
    });
  } catch {
    return '';
  }
}

/**
 * Calculates the number of nights between two dates
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Number of nights
 */
export function calculateNights(
  checkIn: Date | string | null,
  checkOut: Date | string | null
): number {
  if (!checkIn || !checkOut) return 0;

  try {
    const startDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
    const endDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;

    if (!isValid(startDate) || !isValid(endDate)) return 0;

    const nights = differenceInDays(endDate, startDate);
    return Math.max(0, nights);
  } catch {
    return 0;
  }
}

// ========================
// Currency Formatting
// ========================

/**
 * Formats a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats a price range
 * @param min - Minimum price
 * @param max - Maximum price
 * @param currency - Currency code
 * @returns Formatted price range
 */
export function formatPriceRange(min: number, max: number | null, currency = 'USD'): string {
  const minPrice = formatCurrency(min, currency);

  if (!max || max <= min) {
    return `${minPrice}+`;
  }

  const maxPrice = formatCurrency(max, currency);
  return `${minPrice} - ${maxPrice}`;
}

// ========================
// Number Formatting
// ========================

/**
 * Formats a number with thousands separators
 * @param value - Number to format
 * @param locale - Locale for formatting
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Formats a percentage
 * @param value - Value between 0 and 1
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ========================
// Text Formatting
// ========================

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes each word in a string
 * @param str - String to capitalize
 * @returns Title-cased string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

/**
 * Truncates text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Generates a URL-friendly slug from text
 * @param text - Text to convert
 * @returns URL slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}

/**
 * Formats a file size in bytes to human-readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Pluralizes a word based on count
 * @param count - Number of items
 * @param singular - Singular form
 * @param plural - Plural form (optional, adds 's' by default)
 * @returns Pluralized string
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}
