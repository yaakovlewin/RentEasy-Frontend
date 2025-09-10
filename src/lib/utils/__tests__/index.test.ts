import { describe, expect, it } from '@jest/globals';

// Test that all utilities are properly exported from the index
import {
  calculateNights,
  capitalizeFirst,
  capitalizeWords,
  // Types
  type ClassValue,
  // Styling
  cn,
  createErrorMessage,
  // Formatting
  DATE_FORMATS,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatPriceRange,
  formatRelativeTime,
  formatTimeAgo,
  generateApiCacheKey,
  generateCSSVariables,
  generateSearchCacheKey,
  generateSlug,
  hasMaxLength,
  hasMinLength,
  isDateInFuture,
  isDateInPast,
  isDateInRange,
  isEmpty,
  isInRange,
  isPositiveNumber,
  isValidDateRange,
  // Validation
  isValidEmail,
  isValidGuestCount,
  isValidPhone,
  isValidPrice,
  isValidUrl,
  MemoryCache,
  pluralize,
  // Cache
  RequestCache,
  requestCache,
  responsive,
  truncateText,
  validateFields,
  validatePassword,
} from '../index';

describe('Utils Index Exports', () => {
  it('should export all styling utilities', () => {
    expect(typeof cn).toBe('function');
    expect(typeof generateCSSVariables).toBe('function');
    expect(typeof responsive).toBe('function');
  });

  it('should export all formatting utilities', () => {
    expect(typeof DATE_FORMATS).toBe('object');
    expect(typeof formatDate).toBe('function');
    expect(typeof formatDateRange).toBe('function');
    expect(typeof formatRelativeTime).toBe('function');
    expect(typeof formatTimeAgo).toBe('function');
    expect(typeof calculateNights).toBe('function');
    expect(typeof formatCurrency).toBe('function');
    expect(typeof formatPriceRange).toBe('function');
    expect(typeof formatNumber).toBe('function');
    expect(typeof formatPercentage).toBe('function');
    expect(typeof capitalizeFirst).toBe('function');
    expect(typeof capitalizeWords).toBe('function');
    expect(typeof truncateText).toBe('function');
    expect(typeof generateSlug).toBe('function');
    expect(typeof formatFileSize).toBe('function');
    expect(typeof pluralize).toBe('function');
  });

  it('should export all validation utilities', () => {
    expect(typeof isValidEmail).toBe('function');
    expect(typeof isValidPhone).toBe('function');
    expect(typeof isDateInPast).toBe('function');
    expect(typeof isDateInFuture).toBe('function');
    expect(typeof isDateInRange).toBe('function');
    expect(typeof isValidDateRange).toBe('function');
    expect(typeof isPositiveNumber).toBe('function');
    expect(typeof isInRange).toBe('function');
    expect(typeof isValidPrice).toBe('function');
    expect(typeof isEmpty).toBe('function');
    expect(typeof hasMinLength).toBe('function');
    expect(typeof hasMaxLength).toBe('function');
    expect(typeof isValidUrl).toBe('function');
    expect(typeof validatePassword).toBe('function');
    expect(typeof isValidGuestCount).toBe('function');
    expect(typeof createErrorMessage).toBe('function');
    expect(typeof validateFields).toBe('function');
  });

  it('should export all cache utilities', () => {
    expect(typeof RequestCache).toBe('function');
    expect(typeof requestCache).toBe('object');
    expect(typeof generateApiCacheKey).toBe('function');
    expect(typeof generateSearchCacheKey).toBe('function');
    expect(typeof MemoryCache).toBe('function');
  });

  it('should export DATE_FORMATS constant correctly', () => {
    expect(DATE_FORMATS).toHaveProperty('SHORT');
    expect(DATE_FORMATS).toHaveProperty('MEDIUM');
    expect(DATE_FORMATS).toHaveProperty('LONG');
    expect(DATE_FORMATS).toHaveProperty('ISO');
    expect(DATE_FORMATS.SHORT).toBe('MMM d');
    expect(DATE_FORMATS.ISO).toBe('yyyy-MM-dd');
  });

  it('should provide working basic functionality', () => {
    // Test a few key functions work as expected
    expect(cn('a', 'b')).toBe('a b');
    expect(capitalizeFirst('hello')).toBe('Hello');
    expect(formatCurrency(100)).toContain('100');
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isEmpty('')).toBe(true);
  });
});

// Integration tests
describe('Utils Integration', () => {
  it('should work together in realistic scenarios', () => {
    // Format a date range for display
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-20');
    const nights = calculateNights(startDate, endDate);
    const dateRange = formatDateRange(startDate, endDate);

    expect(nights).toBe(5);
    expect(dateRange).toContain('Jan 15');
    expect(dateRange).toContain('Jan 20');
  });

  it('should handle form validation workflows', () => {
    const validations = [
      {
        field: 'Email',
        value: 'user@example.com',
        validate: isValidEmail,
        message: 'Invalid email',
      },
      {
        field: 'Price',
        value: 99.99,
        validate: isValidPrice,
        message: 'Invalid price',
      },
    ];

    const errors = validateFields(validations);
    expect(errors).toHaveLength(0);
  });

  it('should format text consistently', () => {
    const title = '  HELLO WORLD!!!  ';
    const slug = generateSlug(title);
    const capitalized = capitalizeWords(title.toLowerCase().trim());
    const truncated = truncateText(capitalized, 10);

    expect(slug).toBe('hello-world');
    expect(capitalized).toBe('Hello World!!!');
    expect(truncated).toBe('Hello Wor...');
  });

  it('should handle guest counting scenarios', () => {
    const guests = { adults: 2, children: 1, infants: 1 };
    const isValid = isValidGuestCount(guests, 6);
    const guestText = pluralize(guests.adults + guests.children, 'guest');

    expect(isValid).toBe(true);
    expect(guestText).toBe('3 guests');
  });

  it('should work with responsive design patterns', () => {
    const isSmallScreen = false; // mock condition
    const classes = cn(
      'base-class',
      isSmallScreen && 'mobile-specific',
      responsive('text-sm', {
        md: 'text-base',
        lg: 'text-lg',
      })
    );

    expect(classes).toContain('base-class');
    expect(classes).toContain('text-sm');
    expect(classes).toContain('md:text-base');
    expect(classes).not.toContain('mobile-specific');
  });
});
