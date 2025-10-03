import { describe, expect, it } from '@jest/globals';

import {
  createErrorMessage,
  hasMaxLength,
  hasMinLength,
  isDateInFuture,
  isDateInPast,
  isDateInRange,
  isEmpty,
  isInRange,
  isPositiveNumber,
  isValidDateRange,
  isValidEmail,
  isValidGuestCount,
  isValidPhone,
  isValidPrice,
  isValidUrl,
  validateFields,
  validatePassword,
} from '../validation';

describe('Email and Phone Validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1-234-567-8900')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('+44 20 7123 4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });
});

describe('Date Validation', () => {
  describe('isDateInPast', () => {
    it('should correctly identify past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isDateInPast(yesterday)).toBe(true);

      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      expect(isDateInPast(lastYear)).toBe(true);
    });

    it('should reject future and current dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDateInPast(tomorrow)).toBe(false);

      const today = new Date();
      today.setHours(12, 0, 0, 0);
      expect(isDateInPast(today)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('should correctly identify future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDateInFuture(tomorrow)).toBe(true);

      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      expect(isDateInFuture(nextYear)).toBe(true);
    });

    it('should reject past and current dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isDateInFuture(yesterday)).toBe(false);

      const today = new Date();
      today.setHours(12, 0, 0, 0);
      expect(isDateInFuture(today)).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should validate dates within range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const middle = new Date('2024-06-15');

      expect(isDateInRange(middle, start, end)).toBe(true);
      expect(isDateInRange(start, start, end)).toBe(true);
      expect(isDateInRange(end, start, end)).toBe(true);
    });

    it('should reject dates outside range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const before = new Date('2023-12-31');
      const after = new Date('2025-01-01');

      expect(isDateInRange(before, start, end)).toBe(false);
      expect(isDateInRange(after, start, end)).toBe(false);
    });
  });

  describe('isValidDateRange', () => {
    it('should validate correct date ranges', () => {
      const checkIn = new Date('2024-01-15');
      const checkOut = new Date('2024-01-20');
      expect(isValidDateRange(checkIn, checkOut)).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const checkIn = new Date('2024-01-20');
      const checkOut = new Date('2024-01-15');
      expect(isValidDateRange(checkIn, checkOut)).toBe(false);
      expect(isValidDateRange(checkIn, checkIn)).toBe(false);
      expect(isValidDateRange(null, checkOut)).toBe(false);
      expect(isValidDateRange(checkIn, null)).toBe(false);
    });
  });
});

describe('Number Validation', () => {
  describe('isPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
      expect(isPositiveNumber(1000)).toBe(true);
      expect(isPositiveNumber('10')).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber('abc')).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate numbers in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('should validate correct prices', () => {
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(99.99)).toBe(true);
      expect(isValidPrice('50.25')).toBe(true);
      expect(isValidPrice(0)).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(isValidPrice(-10)).toBe(false);
      expect(isValidPrice(99.999)).toBe(false);
      expect(isValidPrice('abc')).toBe(false);
    });
  });
});

describe('String Validation', () => {
  describe('isEmpty', () => {
    it('should detect empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should detect non-empty strings', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty(' text ')).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should validate minimum length', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('hello', 5)).toBe(true);
      expect(hasMinLength('hello', 6)).toBe(false);
    });
  });

  describe('hasMaxLength', () => {
    it('should validate maximum length', () => {
      expect(hasMaxLength('hello', 10)).toBe(true);
      expect(hasMaxLength('hello', 5)).toBe(true);
      expect(hasMaxLength('hello', 4)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('https://sub.example.com:8080/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('Str0ng!Pass');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should check all requirements', () => {
      const result = validatePassword('longenoughbutWEAK');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });
});

describe('Guest Validation', () => {
  describe('isValidGuestCount', () => {
    it('should validate correct guest counts', () => {
      expect(isValidGuestCount({ adults: 2, children: 1, infants: 0 }, 6)).toBe(true);

      expect(isValidGuestCount({ adults: 1, children: 0, infants: 1 }, 4)).toBe(true);
    });

    it('should reject invalid guest counts', () => {
      // No adults
      expect(isValidGuestCount({ adults: 0, children: 2, infants: 0 }, 6)).toBe(false);

      // Exceeds max guests
      expect(isValidGuestCount({ adults: 4, children: 3, infants: 0 }, 6)).toBe(false);

      // Negative values
      expect(isValidGuestCount({ adults: 1, children: -1, infants: 0 }, 6)).toBe(false);
    });
  });
});

describe('Form Validation Helpers', () => {
  describe('createErrorMessage', () => {
    it('should format error messages correctly', () => {
      expect(createErrorMessage('Email', 'Invalid format')).toBe('Email: Invalid format');
      expect(createErrorMessage('Password', 'Too short')).toBe('Password: Too short');
    });
  });

  describe('validateFields', () => {
    it('should validate multiple fields', () => {
      const validations = [
        {
          field: 'Email',
          value: 'invalid',
          validate: (v: string) => isValidEmail(v),
          message: 'Invalid email format',
        },
        {
          field: 'Age',
          value: -5,
          validate: (v: number) => isPositiveNumber(v),
          message: 'Must be positive',
        },
        {
          field: 'Name',
          value: 'John',
          validate: (v: string) => hasMinLength(v, 3),
          message: 'Too short',
        },
      ];

      const errors = validateFields(validations);
      expect(errors).toHaveLength(2);
      expect(errors).toContain('Email: Invalid email format');
      expect(errors).toContain('Age: Must be positive');
    });

    it('should return empty array for valid fields', () => {
      const validations = [
        {
          field: 'Email',
          value: 'user@example.com',
          validate: (v: string) => isValidEmail(v),
          message: 'Invalid email',
        },
      ];

      const errors = validateFields(validations);
      expect(errors).toHaveLength(0);
    });
  });
});
