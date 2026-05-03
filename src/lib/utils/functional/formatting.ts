/**
 * Pure Formatting Functions
 *
 * Curried, pure functions for formatting values.
 * All functions are composable and immutable.
 *
 * Extracted from PropertiesClient and enhanced for functional programming.
 */

import { curry2, curry3 } from '../../api/functional/compose';

/**
 * Currency codes supported
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

/**
 * Locale codes supported
 */
export type Locale = 'en-US' | 'en-GB' | 'en-CA' | 'en-AU' | 'ja-JP' | 'de-DE' | 'fr-FR';

/**
 * Format price with currency
 * Pure curried function for partial application
 *
 * @example
 * const formatUSD = formatPrice('USD')('en-US');
 * const price = formatUSD(1234.56); // "$1,234.56"
 */
export const formatPrice = (currency: Currency) =>
  (locale: Locale) =>
  (price: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(price);

/**
 * Format price with USD currency (pre-applied)
 */
export const formatUSD = formatPrice('USD')('en-US');

/**
 * Format price with EUR currency (pre-applied)
 */
export const formatEUR = formatPrice('EUR')('de-DE');

/**
 * Format price with GBP currency (pre-applied)
 */
export const formatGBP = formatPrice('GBP')('en-GB');

/**
 * Format number with thousand separators
 * Pure curried function
 *
 * @example
 * const formatter = formatNumber('en-US');
 * const result = formatter(1234567); // "1,234,567"
 */
export const formatNumber = (locale: Locale) =>
  (value: number): string =>
    new Intl.NumberFormat(locale).format(value);

/**
 * Format number as percentage
 * Pure curried function
 *
 * @example
 * const formatPercent = formatPercentage('en-US')(2);
 * const result = formatPercent(0.8532); // "85.32%"
 */
export const formatPercentage = (locale: Locale) =>
  (decimals: number) =>
  (value: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

/**
 * Format number with specific decimal places
 * Pure curried function
 *
 * @example
 * const format2Decimals = formatDecimal(2);
 * const result = format2Decimals(3.14159); // "3.14"
 */
export const formatDecimal = (decimals: number) =>
  (value: number): string =>
    value.toFixed(decimals);

/**
 * Format large numbers with K, M, B suffixes
 * Pure function
 *
 * @example
 * formatCompactNumber(1500); // "1.5K"
 * formatCompactNumber(1500000); // "1.5M"
 */
export const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
};

/**
 * Capitalize first letter of string
 * Pure function
 *
 * @example
 * capitalize("hello world"); // "Hello world"
 */
export const capitalize = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize all words in string
 * Pure function
 *
 * @example
 * capitalizeWords("hello world"); // "Hello World"
 */
export const capitalizeWords = (str: string): string =>
  str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');

/**
 * Convert to title case
 * Pure function
 *
 * @example
 * toTitleCase("the quick brown fox"); // "The Quick Brown Fox"
 */
export const toTitleCase = (str: string): string => {
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to']);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !minorWords.has(word)) {
        return capitalize(word);
      }
      return word;
    })
    .join(' ');
};

/**
 * Truncate string to max length with ellipsis
 * Pure curried function
 *
 * @example
 * const truncate20 = truncate(20);
 * truncate20("This is a very long string"); // "This is a very long..."
 */
export const truncate = (maxLength: number) =>
  (str: string): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  };

/**
 * Truncate string at word boundary
 * Pure curried function
 */
export const truncateWords = (maxLength: number) =>
  (str: string): string => {
    if (str.length <= maxLength) return str;

    const truncated = str.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace === -1) {
      return truncated + '...';
    }

    return truncated.slice(0, lastSpace) + '...';
  };

/**
 * Format phone number
 * Pure function
 *
 * @example
 * formatPhoneNumber("1234567890"); // "(123) 456-7890"
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return original if format unknown
};

/**
 * Pluralize word based on count
 * Pure curried function
 *
 * @example
 * const pluralizeGuest = pluralize('guest')('guests');
 * pluralizeGuest(1); // "guest"
 * pluralizeGuest(2); // "guests"
 */
export const pluralize = (singular: string) =>
  (plural: string) =>
  (count: number): string =>
    count === 1 ? singular : plural;

/**
 * Simple pluralize by adding 's'
 * Pure curried function
 *
 * @example
 * const pluralizeItem = pluralizeSimple('item');
 * pluralizeItem(1); // "item"
 * pluralizeItem(2); // "items"
 */
export const pluralizeSimple = (word: string) =>
  (count: number): string =>
    count === 1 ? word : `${word}s`;

/**
 * Format count with word
 * Pure curried function
 *
 * @example
 * const formatGuestCount = formatCount('guest')('guests');
 * formatGuestCount(1); // "1 guest"
 * formatGuestCount(5); // "5 guests"
 */
export const formatCount = (singular: string) =>
  (plural: string) =>
  (count: number): string =>
    `${count} ${pluralize(singular)(plural)(count)}`;

/**
 * Format list with commas and 'and'
 * Pure function
 *
 * @example
 * formatList(['apple', 'banana', 'orange']); // "apple, banana, and orange"
 */
export const formatList = (items: readonly string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];

  return `${allButLast.join(', ')}, and ${last}`;
};

/**
 * Format rating as stars
 * Pure curried function
 *
 * @example
 * const format5Stars = formatStars(5);
 * format5Stars(3.5); // "★★★½☆"
 */
export const formatStars = (maxStars: number) =>
  (rating: number): string => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      '★'.repeat(fullStars) +
      (hasHalfStar ? '½' : '') +
      '☆'.repeat(emptyStars)
    );
  };

/**
 * Format rating as text
 * Pure function
 *
 * @example
 * formatRatingText(4.5); // "4.5 out of 5"
 */
export const formatRatingText = (rating: number): string =>
  `${rating.toFixed(1)} out of 5`;

/**
 * Mask sensitive data
 * Pure curried function
 *
 * @example
 * const maskEmail = maskString(3)(3);
 * maskEmail("john.doe@example.com"); // "joh****com"
 */
export const maskString = (showStart: number) =>
  (showEnd: number) =>
  (str: string): string => {
    if (str.length <= showStart + showEnd) {
      return str;
    }

    const start = str.slice(0, showStart);
    const end = str.slice(-showEnd);
    const maskedLength = str.length - showStart - showEnd;

    return `${start}${'*'.repeat(maskedLength)}${end}`;
  };

/**
 * Mask email address
 * Pure function
 *
 * @example
 * maskEmail("john.doe@example.com"); // "j******e@example.com"
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');

  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }

  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
};

/**
 * Mask credit card number
 * Pure function
 *
 * @example
 * maskCreditCard("1234567890123456"); // "****-****-****-3456"
 */
export const maskCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);

  return `****-****-****-${last4}`;
};

/**
 * Format file size
 * Pure function
 *
 * @example
 * formatFileSize(1536); // "1.5 KB"
 * formatFileSize(1048576); // "1.0 MB"
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Format initials from name
 * Pure function
 *
 * @example
 * formatInitials("John Doe"); // "JD"
 */
export const formatInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);

  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Format full name from parts
 * Pure curried function
 *
 * @example
 * const formatName = formatFullName('John')('Doe');
 * formatName; // "John Doe"
 */
export const formatFullName = (firstName: string) =>
  (lastName: string): string =>
    `${firstName} ${lastName}`.trim();

/**
 * Namespace containing all formatting utilities
 */
export const Formatting = Object.freeze({
  formatPrice,
  formatUSD,
  formatEUR,
  formatGBP,
  formatNumber,
  formatPercentage,
  formatDecimal,
  formatCompactNumber,
  capitalize,
  capitalizeWords,
  toTitleCase,
  truncate,
  truncateWords,
  formatPhoneNumber,
  pluralize,
  pluralizeSimple,
  formatCount,
  formatList,
  formatStars,
  formatRatingText,
  maskString,
  maskEmail,
  maskCreditCard,
  formatFileSize,
  formatInitials,
  formatFullName,
});
