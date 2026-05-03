/**
 * Formatting Utilities FP Tests
 *
 * Tests for pure formatting functions with FP testing patterns
 */

import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { testPureFunction, testReferentialTransparency } from '@/lib/testing';

describe('Formatting Utilities (FP)', () => {
  describe('formatCurrency', () => {
    test('is a pure function', () => {
      testPureFunction(formatCurrency, [
        [100, '$100.00'],
        [1000, '$1,000.00'],
        [0, '$0.00'],
        [99.99, '$99.99'],
        [1234.56, '$1,234.56'],
      ]);
    });

    test('maintains referential transparency', () => {
      testReferentialTransparency(formatCurrency, 1234.56, 100);
    });

    test('handles edge cases', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(0.01)).toBe('$0.01');
      expect(formatCurrency(999999.99)).toBe('$999,999.99');
    });

    test('handles negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });

  describe('formatDate', () => {
    test('is a pure function for same inputs', () => {
      const date = new Date('2024-01-15');

      const result1 = formatDate(date);
      const result2 = formatDate(date);

      expect(result1).toBe(result2);
    });

    test('formats dates consistently', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('maintains referential transparency', () => {
      const date = new Date('2024-01-15');
      testReferentialTransparency(formatDate, date, 50);
    });

    test('handles different date formats', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-12-31');
      const date3 = new Date('2024-06-01');

      expect(formatDate(date1)).toBeTruthy();
      expect(formatDate(date2)).toBeTruthy();
      expect(formatDate(date3)).toBeTruthy();
    });
  });

  describe('Function Composition', () => {
    test('formatCurrency can be composed', () => {
      const addTax = (price: number) => price * 1.1;
      const formatWithTax = (price: number) => formatCurrency(addTax(price));

      expect(formatWithTax(100)).toBe('$110.00');
      expect(formatWithTax(200)).toBe('$220.00');
    });

    test('composed functions are pure', () => {
      const addTax = (price: number) => price * 1.1;
      const formatWithTax = (price: number) => formatCurrency(addTax(price));

      testPureFunction(formatWithTax, [
        [100, '$110.00'],
        [200, '$220.00'],
        [0, '$0.00'],
      ]);
    });
  });

  describe('Immutability', () => {
    test('formatCurrency does not modify input', () => {
      const value = 100;
      formatCurrency(value);

      expect(value).toBe(100);
    });

    test('formatDate does not modify input', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();

      formatDate(date);

      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('Property-Based Testing', () => {
    test('formatCurrency always returns string', () => {
      for (let i = 0; i < 100; i++) {
        const randomValue = Math.random() * 10000;
        const result = formatCurrency(randomValue);

        expect(typeof result).toBe('string');
        expect(result).toMatch(/^\$[\d,]+\.\d{2}$/);
      }
    });

    test('formatCurrency handles all numbers', () => {
      const testCases = [
        0,
        0.01,
        1,
        10,
        100,
        1000,
        10000,
        100000,
        999999.99,
      ];

      testCases.forEach((value) => {
        const result = formatCurrency(value);
        expect(result).toMatch(/^\$[\d,]+\.\d{2}$/);
      });
    });
  });
});
