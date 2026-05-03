/**
 * Security Tests for Input Validation
 *
 * Tests protection against:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - Path Traversal
 * - Integer Overflow
 * - Invalid Date Formats
 */

import { describe, it, expect } from '@jest/globals';
import {
  parsePositiveInt,
  validateDateString,
  sanitizeString,
  validateSearchParams,
  normalizeUnicode,
  encodeHtmlEntities,
} from '../inputValidation';

// Pure test data generators (immutable)
const MALICIOUS_INPUTS = Object.freeze({
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<svg/onload=alert(1)>',
  ],
  sql: [
    "'; DROP TABLE users--",
    "1' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM users--",
  ],
  path: [
    '../../../etc/passwd',
    '..\..\..\windows\system32',
    '/etc/passwd',
    'C:\Windows\System32',
  ],
}) as const;

describe('Input Validation Security', () => {
  describe('parsePositiveInt', () => {
    it('should reject negative numbers', () => {
      expect(parsePositiveInt('-1')).toBeUndefined();
      expect(parsePositiveInt('-999')).toBeUndefined();
    });

    it('should reject zero', () => {
      expect(parsePositiveInt('0')).toBeUndefined();
    });

    it('should reject NaN values', () => {
      expect(parsePositiveInt('abc')).toBeUndefined();
      expect(parsePositiveInt('12abc')).toBeUndefined();
    });

    it('should reject null and undefined', () => {
      expect(parsePositiveInt(null)).toBeUndefined();
      expect(parsePositiveInt(undefined)).toBeUndefined();
    });

    it('should reject numbers exceeding maximum when max is specified', () => {
      expect(parsePositiveInt('21', 20)).toBeUndefined();
      expect(parsePositiveInt('100', 20)).toBeUndefined();
    });

    it('should accept valid positive integers', () => {
      expect(parsePositiveInt('1')).toBe(1);
      expect(parsePositiveInt('10')).toBe(10);
      expect(parsePositiveInt('20')).toBe(20);
      expect(parsePositiveInt('100')).toBe(100); // No max by default (backend compatibility)
    });

    // Agent 5 recommendations - Critical gaps
    it('should reject decimal and floating point numbers', () => {
      expect(parsePositiveInt('10.5')).toBeUndefined();
      expect(parsePositiveInt('3.14')).toBeUndefined();
      expect(parsePositiveInt('1.0')).toBeUndefined();
    });

    it('should handle boundary conditions correctly with max parameter', () => {
      expect(parsePositiveInt('1', 20)).toBe(1); // minimum valid
      expect(parsePositiveInt('20', 20)).toBe(20); // maximum valid
      expect(parsePositiveInt('21', 20)).toBeUndefined(); // first invalid
    });

    it('should reject special number formats', () => {
      expect(parsePositiveInt('+5')).toBeUndefined(); // leading plus
      expect(parsePositiveInt('5e2')).toBeUndefined(); // scientific notation
      expect(parsePositiveInt('0x10')).toBeUndefined(); // hexadecimal
      expect(parsePositiveInt('Infinity')).toBeUndefined();
      expect(parsePositiveInt('NaN')).toBeUndefined();
    });

    it('should handle whitespace variations', () => {
      expect(parsePositiveInt('\t5\n')).toBe(5); // tabs and newlines
      expect(parsePositiveInt('  10  ')).toBe(10); // multiple spaces
    });
  });

  describe('validateDateString', () => {
    it('should reject SQL injection attempts', () => {
      MALICIOUS_INPUTS.sql.forEach(input => {
        expect(validateDateString(input)).toBe('');
      });
    });

    it('should reject XSS attempts', () => {
      MALICIOUS_INPUTS.xss.forEach(input => {
        expect(validateDateString(input)).toBe('');
      });
    });

    it('should reject invalid date formats', () => {
      expect(validateDateString('not-a-date')).toBe('');
      expect(validateDateString('2024-13-01')).toBe('');
    });

    it('should accept valid ISO dates', () => {
      expect(validateDateString('2024-01-15')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    // Agent 5 recommendations - Critical gaps
    it('should handle leap year dates correctly', () => {
      expect(validateDateString('2024-02-29')).toMatch(/^\d{4}-\d{2}-\d{2}$/); // 2024 is leap year
      expect(validateDateString('2023-02-29')).toBe(''); // 2023 is not leap year
    });

    it('should reject invalid month/day combinations', () => {
      expect(validateDateString('2024-02-30')).toBe(''); // February has max 29 days
      expect(validateDateString('2024-04-31')).toBe(''); // April has max 30 days
      expect(validateDateString('2024-00-15')).toBe(''); // Month 0 invalid
      expect(validateDateString('2024-13-01')).toBe(''); // Month 13 invalid
    });

    it('should reject dates outside acceptable range when range check enabled', () => {
      const veryOldDate = '2000-01-01'; // More than 5 years ago
      const veryFutureDate = '2040-01-01'; // More than 10 years in future
      expect(validateDateString(veryOldDate, { enableRangeCheck: true })).toBe('');
      expect(validateDateString(veryFutureDate, { enableRangeCheck: true })).toBe('');
    });

    it('should accept any valid date when range check disabled (backend compatibility)', () => {
      const veryOldDate = '2000-01-01';
      const veryFutureDate = '2040-01-01';
      expect(validateDateString(veryOldDate)).toBe('2000-01-01');
      expect(validateDateString(veryFutureDate)).toBe('2040-01-01');
    });

    it('should handle malicious payload variations', () => {
      expect(validateDateString('2024-01-15\u0000')).toBe(''); // null byte
      expect(validateDateString('2024-01-15\r\n')).toBe(''); // CRLF injection
    });
  });

  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const result = sanitizeString('<script>alert(1)</script>');
      expect(result).not.toContain('<script');
    });

    it('should enforce maximum length (default 1000, configurable)', () => {
      const longString = 'a'.repeat(2000);
      // Default max is 1000 (with HTML encoding 'a' becomes 'a', stays same length)
      expect(sanitizeString(longString)).toHaveLength(1000);
      // Custom max
      expect(sanitizeString(longString, { maxLength: 200 })).toHaveLength(200);
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  New York  ')).toBe('New York');
    });

    // Agent 5 recommendations - Critical gaps
    it('should handle advanced XSS vectors', () => {
      expect(sanitizeString('<img src=x onerror="alert(1)">')).not.toContain('onerror');
      expect(sanitizeString('<div onmouseover=alert(1)>hover</div>')).not.toContain('onmouseover');
      expect(sanitizeString('<svg/onload=alert(1)>')).not.toContain('onload');
    });

    it('should handle path traversal with mixed separators', () => {
      expect(sanitizeString('../../../etc/passwd')).not.toContain('..');
      expect(sanitizeString('..\\..\\..\\windows')).not.toContain('..');
    });

    it('should handle length boundary conditions', () => {
      const exactly1000 = 'a'.repeat(1000);
      const exactly1001 = 'a'.repeat(1001);
      expect(sanitizeString(exactly1000)).toHaveLength(1000);
      expect(sanitizeString(exactly1001)).toHaveLength(1000);

      // With custom max
      const exactly200 = 'a'.repeat(200);
      const exactly201 = 'a'.repeat(201);
      expect(sanitizeString(exactly200, { maxLength: 200 })).toHaveLength(200);
      expect(sanitizeString(exactly201, { maxLength: 200 })).toHaveLength(200);
    });

    it('should remove null bytes', () => {
      expect(sanitizeString('test\u0000payload')).toBe('testpayload');
    });
  });

  describe('validateSearchParams', () => {
    it('should sanitize location parameter and remove malicious input', () => {
      const result1 = validateSearchParams({
        location: '<script>alert(1)</script>',
      });
      // Completely sanitized - script tags removed, leaving nothing
      expect(result1.location).toBeUndefined();

      const result2 = validateSearchParams({
        location: 'Paris <script>alert(1)</script>',
      });
      // Keeps safe content after sanitization, removes malicious parts
      expect(result2.location).toBe('Paris');
    });

    it('should validate guests parameter (backend compatibility)', () => {
      const result1 = validateSearchParams({ guests: '25' });
      expect(result1.guests).toBe(25); // No max by default

      const result2 = validateSearchParams({ guests: '25' }, { maxGuests: 20 });
      expect(result2.guests).toBeUndefined(); // Exceeds max
    });

    it('should support adults parameter for backward compatibility', () => {
      const result = validateSearchParams({ adults: '5' });
      expect(result.guests).toBe(5); // Mapped to "guests"
    });

    // Agent 5 recommendations - Critical gaps
    it('should validate checkIn date parameter', () => {
      const validResult = validateSearchParams({ checkIn: '2024-06-15' });
      expect(validResult.checkIn).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const maliciousResult = validateSearchParams({ checkIn: '<script>alert(1)</script>' });
      expect(maliciousResult.checkIn).toBeUndefined();

      const invalidResult = validateSearchParams({ checkIn: 'invalid-date' });
      expect(invalidResult.checkIn).toBeUndefined();
    });

    it('should validate checkOut date parameter', () => {
      const validResult = validateSearchParams({ checkOut: '2024-06-20' });
      expect(validResult.checkOut).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const maliciousResult = validateSearchParams({ checkOut: "'; DROP TABLE--" });
      expect(maliciousResult.checkOut).toBeUndefined();
    });

    it('should handle type coercion attacks', () => {
      expect(validateSearchParams({ location: null }).location).toBeUndefined();
      expect(validateSearchParams({ location: undefined }).location).toBeUndefined();
      expect(validateSearchParams({ adults: 'Infinity' }).adults).toBeUndefined();
      expect(validateSearchParams({ adults: 'NaN' }).adults).toBeUndefined();
    });

    it('should handle empty and missing parameters', () => {
      const emptyResult = validateSearchParams({});
      expect(emptyResult).toEqual({});

      const partialResult = validateSearchParams({ location: 'Paris' });
      expect(partialResult.location).toBe('Paris');
      expect(partialResult.checkIn).toBeUndefined();
      expect(partialResult.adults).toBeUndefined();
    });

    it('should validate all parameters together (backend compatibility)', () => {
      const result = validateSearchParams({
        location: '  Paris  ',
        checkIn: '2024-06-15',
        checkOut: '2024-06-20',
        adults: '2', // backward compat: adults → guests
      });
      expect(result.location).toBe('Paris'); // Trimmed and sanitized
      expect(result.checkIn).toBe('2024-06-15');
      expect(result.checkOut).toBe('2024-06-20');
      expect(result.guests).toBe(2); // Mapped from "adults" to "guests"
    });
  });

  // OWASP Critical Fixes - Agent 4 Recommendations
  describe('normalizeUnicode', () => {
    it('should normalize Unicode to NFC form', () => {
      const unnormalized = 'café'; // Using combining characters
      const normalized = normalizeUnicode(unnormalized);
      expect(normalized).toBe(unnormalized.normalize('NFC'));
    });

    it('should convert fullwidth characters to ASCII (homograph attack prevention)', () => {
      // Fullwidth less-than and greater-than characters
      const fullwidth = '＜script＞alert(1)＜/script＞';
      const result = normalizeUnicode(fullwidth);
      expect(result).toContain('<'); // Converted to ASCII
      expect(result).toContain('>'); // Converted to ASCII
      expect(result).not.toContain('＜'); // Original fullwidth removed
      expect(result).not.toContain('＞'); // Original fullwidth removed
      expect(result).toBe('<script>alert(1)</script>'); // Full conversion
    });

    it('should handle mixed fullwidth and normal characters', () => {
      const mixed = 'Hello＜World＞';
      const result = normalizeUnicode(mixed);
      expect(result).toBe('Hello<World>'); // Fullwidth converted to ASCII
    });
  });

  describe('encodeHtmlEntities', () => {
    it('should encode ampersand', () => {
      expect(encodeHtmlEntities('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should encode less-than and greater-than', () => {
      expect(encodeHtmlEntities('<div>')).toBe('&lt;div&gt;');
    });

    it('should encode quotes', () => {
      expect(encodeHtmlEntities('say "hello"')).toBe('say &quot;hello&quot;');
      expect(encodeHtmlEntities("it's ok")).toBe('it&#x27;s ok');
    });

    it('should encode forward slash', () => {
      expect(encodeHtmlEntities('a/b/c')).toBe('a&#x2F;b&#x2F;c');
    });

    it('should encode all special characters together', () => {
      const input = '<script>alert("XSS")</script>';
      const result = encodeHtmlEntities(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });
  });

  describe('sanitizeString with OWASP enhancements', () => {
    it('should apply Unicode normalization before sanitization', () => {
      const fullwidthXSS = '＜script＞alert(1)＜/script＞';
      const result = sanitizeString(fullwidthXSS);
      expect(result).not.toContain('script');
      expect(result).not.toContain('＜');
    });

    it('should HTML encode the final output', () => {
      const result = sanitizeString('Tom & Jerry');
      expect(result).toContain('&amp;');
    });

    it('should handle complex attack with Unicode and HTML', () => {
      const attack = '＜img src=x onerror="alert(1)"＞';
      const result = sanitizeString(attack);
      expect(result).not.toContain('img');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('＜');
    });
  });
});
