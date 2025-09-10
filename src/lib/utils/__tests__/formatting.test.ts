import { describe, expect, it } from '@jest/globals';

import {
  calculateNights,
  capitalizeFirst,
  capitalizeWords,
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
  generateSlug,
  pluralize,
  truncateText,
} from '../formatting';

describe('Date Formatting Utilities', () => {
  describe('formatDate', () => {
    it('should format a date object correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, DATE_FORMATS.MEDIUM)).toBe('Jan 15, 2024');
      expect(formatDate(date, DATE_FORMATS.ISO)).toBe('2024-01-15');
    });

    it('should format a date string correctly', () => {
      const dateStr = '2024-01-15T00:00:00Z';
      expect(formatDate(dateStr, DATE_FORMATS.SHORT)).toBe('Jan 15');
    });

    it('should return default value for invalid date', () => {
      expect(formatDate(null, DATE_FORMATS.MEDIUM, 'No date')).toBe('No date');
      expect(formatDate('invalid', DATE_FORMATS.MEDIUM, 'Invalid')).toBe('Invalid');
    });
  });

  describe('formatDateRange', () => {
    it('should format a date range correctly', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-20');
      expect(formatDateRange(start, end)).toBe('Jan 15 - Jan 20');
    });

    it('should handle missing dates', () => {
      const date = new Date('2024-01-15');
      expect(formatDateRange(date, null)).toBe('Jan 15 - Select end date');
      expect(formatDateRange(null, date)).toBe('Select start date - Jan 15');
      expect(formatDateRange(null, null)).toBe('Select dates');
    });
  });

  describe('calculateNights', () => {
    it('should calculate nights correctly', () => {
      const checkIn = new Date('2024-01-15');
      const checkOut = new Date('2024-01-20');
      expect(calculateNights(checkIn, checkOut)).toBe(5);
    });

    it('should handle string dates', () => {
      expect(calculateNights('2024-01-15', '2024-01-20')).toBe(5);
    });

    it('should return 0 for invalid dates', () => {
      expect(calculateNights(null, null)).toBe(0);
      expect(calculateNights('invalid', 'invalid')).toBe(0);
    });

    it('should return 0 for same-day bookings', () => {
      const date = '2024-01-15';
      expect(calculateNights(date, date)).toBe(0);
    });
  });
});

describe('Currency and Number Formatting', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,235');
    });

    it('should format other currencies', () => {
      expect(formatCurrency(1234.56, 'EUR', 'en-US')).toContain('1,234');
      expect(formatCurrency(1234.56, 'GBP', 'en-US')).toContain('1,234');
    });

    it('should handle zero and negative values', () => {
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(-100)).toBe('-$100');
    });
  });

  describe('formatPriceRange', () => {
    it('should format price range correctly', () => {
      expect(formatPriceRange(100, 500)).toBe('$100 - $500');
    });

    it('should handle open-ended ranges', () => {
      expect(formatPriceRange(100, null)).toBe('$100+');
      expect(formatPriceRange(100, 100)).toBe('$100+');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separator', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.15)).toBe('15%');
      expect(formatPercentage(0.1567, 2)).toBe('15.67%');
      expect(formatPercentage(1)).toBe('100%');
    });
  });
});

describe('Text Formatting Utilities', () => {
  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('HELLO')).toBe('Hello');
      expect(capitalizeFirst('hello world')).toBe('Hello world');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirst('')).toBe('');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('THE QUICK BROWN FOX')).toBe('The Quick Brown Fox');
    });

    it('should handle single words', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very lo...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });

    it('should handle custom suffix', () => {
      expect(truncateText('Long text here', 10, '…')).toBe('Long text…');
    });

    it('should handle empty text', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('should generate URL-friendly slugs', () => {
      expect(generateSlug('Hello World!')).toBe('hello-world');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(generateSlug('Special@#$Characters')).toBe('specialcharacters');
    });

    it('should handle hyphens correctly', () => {
      expect(generateSlug('Already-With-Hyphens')).toBe('already-with-hyphens');
      expect(generateSlug('---Multiple---Hyphens---')).toBe('multiple-hyphens');
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 2)).toBe('1.5 KB');
    });
  });

  describe('pluralize', () => {
    it('should pluralize correctly', () => {
      expect(pluralize(0, 'item')).toBe('0 items');
      expect(pluralize(1, 'item')).toBe('1 item');
      expect(pluralize(5, 'item')).toBe('5 items');
    });

    it('should handle custom plural forms', () => {
      expect(pluralize(1, 'child', 'children')).toBe('1 child');
      expect(pluralize(2, 'child', 'children')).toBe('2 children');
      expect(pluralize(1, 'person', 'people')).toBe('1 person');
      expect(pluralize(3, 'person', 'people')).toBe('3 people');
    });
  });
});
