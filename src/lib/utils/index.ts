/**
 * Central export file for all utility functions
 * This provides a clean API for importing utilities throughout the application
 */

// Re-export all styling utilities
export { cn, generateCSSVariables, responsive } from './styling';

// Re-export all formatting utilities
export {
  // Date formatting
  DATE_FORMATS,
  formatDate,
  formatDateRange,
  formatRelativeTime,
  formatTimeAgo,
  calculateNights,

  // Currency and number formatting
  formatCurrency,
  formatPriceRange,
  formatNumber,
  formatPercentage,

  // Text formatting
  capitalizeFirst,
  capitalizeWords,
  truncateText,
  generateSlug,
  formatFileSize,
  pluralize,
} from './formatting';

// Re-export all validation utilities
export {
  // Email and phone validation
  isValidEmail,
  isValidPhone,

  // Date validation
  isDateInPast,
  isDateInFuture,
  isDateInRange,
  isValidDateRange,

  // Number validation
  isPositiveNumber,
  isInRange,
  isValidPrice,

  // String validation
  isEmpty,
  hasMinLength,
  hasMaxLength,
  isValidUrl,
  validatePassword,

  // Guest validation
  isValidGuestCount,

  // Form helpers
  createErrorMessage,
  validateFields,
} from './validation';

// Re-export cache utilities
export {
  RequestCache,
  requestCache,
  generateApiCacheKey,
  generateSearchCacheKey,
  MemoryCache,
} from './cache';

// Re-export environment utilities
export {
  isBrowser,
  isServer,
  isLocalhost,
  isProduction,
  isDevelopment,
  hasLocalStorage,
  hasSessionStorage,
} from './environment';

// Re-export cookie utilities
export {
  setCookie,
  getCookie,
  deleteCookie,
  hasCookie,
  setAuthTokenCookies,
  clearAuthTokenCookies,
} from './cookies';
export type { CookieOptions } from './cookies';

// Re-export time utilities
export {
  TIME,
  toMilliseconds,
  expiresIn,
  expiresInMs,
} from './time';

// Re-export object security utilities
export { sanitizeKeys, safeObjectMerge } from './objectSecurity';

// Type exports for better IDE support
export type { ClassValue } from 'clsx';
