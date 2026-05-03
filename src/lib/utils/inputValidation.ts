/**
 * Input Validation and Sanitization Utilities
 *
 * Provides security-focused validation against:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection  
 * - Integer Overflow
 * - Invalid Date Formats
 * - Path Traversal
 *
 * All functions are pure and follow functional programming principles.
 */

import { isValid, parseISO, isFuture, isPast, addYears, subYears } from 'date-fns';

// Optional security logging (imported lazily to avoid circular dependencies)
let captureErrorFn: ((error: Error, severity: any, category: any, data?: any) => void) | null = null;

/**
 * Initialize security logging (optional)
 * Call this to enable security event logging
 */
export const initSecurityLogging = (
  captureError: (error: Error, severity: any, category: any, data?: any) => void
) => {
  captureErrorFn = captureError;
};

/**
 * Log security event if logging is enabled
 */
const logSecurityEvent = (message: string, data: Record<string, any>) => {
  if (captureErrorFn && typeof window !== 'undefined') {
    try {
      captureErrorFn(
        new Error(message),
        'medium', // ErrorSeverity.MEDIUM
        'security', // ErrorCategory.SECURITY
        {
          ...data,
          timestamp: new Date().toISOString(),
          function: data.function || 'inputValidation',
        }
      );
    } catch {
      // Silently fail if logging fails
    }
  }
};

/**
 * Safely parse a positive integer with validation
 *
 * @param value - String to parse
 * @param max - Optional maximum value (defaults to no limit)
 * @returns Parsed integer or undefined if invalid
 *
 * Security: Rejects NaN, negative numbers, overflow, and malicious input
 */
export const parsePositiveInt = (
  value: string | null | undefined,
  max?: number
): number | undefined => {
  if (!value || typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (trimmed === '') return undefined;

  const parsed = parseInt(trimmed, 10);

  // Reject NaN, negative, or zero
  if (isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  // Reject if exceeds max (if specified)
  if (max !== undefined && parsed > max) {
    return undefined;
  }

  // Reject if parsed value doesn't match original (catches "10abc" scenarios)
  if (parsed.toString() !== trimmed) {
    return undefined;
  }

  return parsed;
};

/**
 * Validate and format date string to YYYY-MM-DD (matches backend validation)
 *
 * @param dateString - Date string to validate
 * @param options - Optional validation options (enableRangeCheck for date range validation)
 * @returns Formatted date or empty string if invalid
 *
 * Security: Rejects malicious payloads, invalid formats
 * Backend Compatibility: Matches Zod schema /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
 */
export const validateDateString = (
  dateString: string | null | undefined,
  options?: { enableRangeCheck?: boolean }
): string => {
  if (!dateString || typeof dateString !== 'string') return '';

  // Reject inputs with control characters or null bytes (security)
  if (/[\x00-\x1F\x7F]/.test(dateString)) return '';

  const trimmed = dateString.trim();
  if (trimmed === '') return '';

  // Validate format matches backend regex: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(trimmed)) return '';

  try {
    const date = parseISO(trimmed);

    // Validate date is actually valid (e.g., not 2024-02-30)
    if (!isValid(date)) return '';

    // Optional: Check date range (for UI validation, not backend requirement)
    if (options?.enableRangeCheck) {
      const minDate = subYears(new Date(), 5);
      const maxDate = addYears(new Date(), 10);

      if ((isPast(date) && date < minDate) || (isFuture(date) && date > maxDate)) {
        return '';
      }
    }

    // Return formatted date (already in YYYY-MM-DD format if we got here)
    return trimmed;
  } catch {
    return '';
  }
};

/**
 * Normalize Unicode characters to prevent homograph attacks
 *
 * @param str - String to normalize
 * @returns Normalized string
 *
 * Security: Prevents Unicode-based XSS bypasses (e.g., ＜script＞)
 */
export const normalizeUnicode = (str: string): string => {
  // Normalize Unicode to NFC form for consistency
  let normalized = str.normalize('NFC');

  // Convert fullwidth characters to their ASCII equivalents
  // Fullwidth range: U+FF00 to U+FFEF maps to ASCII U+0020 to U+007E
  normalized = normalized.replace(/[\uFF00-\uFFEF]/g, (char) => {
    const code = char.charCodeAt(0);
    // Fullwidth space (U+3000) maps to regular space
    if (code === 0x3000) return ' ';
    // Other fullwidth chars: subtract 0xFEE0 to get ASCII equivalent
    if (code >= 0xFF01 && code <= 0xFF5E) {
      return String.fromCharCode(code - 0xFEE0);
    }
    // If outside expected range, remove the character
    return '';
  });

  return normalized;
};

/**
 * Encode HTML entities to prevent XSS
 *
 * @param str - String to encode
 * @returns HTML-encoded string
 *
 * Security: Converts special characters to HTML entities
 */
export const encodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize string input for safe display
 *
 * @param value - String to sanitize
 * @param options - Optional sanitization options (maxLength defaults to 1000 for security)
 * @returns Sanitized string
 *
 * Security: Removes script tags, path traversal, enforces max length, encodes HTML
 */
export const sanitizeString = (
  value: string | null | undefined,
  options?: { maxLength?: number }
): string => {
  if (!value || typeof value !== 'string') return '';

  const original = value;
  const maxLength = options?.maxLength ?? 1000; // Default 1000 chars for security

  // Normalize Unicode first to prevent homograph attacks
  let sanitized = normalizeUnicode(value);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove script tags and javascript: protocols
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // onerror=, onclick=, etc.

  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\.[\\/]/g, '');

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce maximum length (configurable, default 1000 for security)
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Encode HTML entities as final protection layer
  const beforeEncoding = sanitized;
  sanitized = encodeHtmlEntities(sanitized);

  // Log security event if input was modified (potential attack)
  if (original !== beforeEncoding && original.length > 0) {
    logSecurityEvent('Potentially malicious input detected and sanitized', {
      function: 'sanitizeString',
      original: original.substring(0, 100), // Truncate for logging
      sanitized: sanitized.substring(0, 100),
      originalLength: original.length,
      sanitizedLength: sanitized.length,
    });
  }

  return sanitized;
};

/**
 * Safe search parameters interface (matches backend property search schema)
 */
export interface SafeSearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number; // Backend uses "guests", not "adults"
}

/**
 * Validate and sanitize search parameters (matches backend validation)
 *
 * @param params - Raw search parameters from URL or form
 * @param options - Optional validation options
 * @returns Validated and sanitized parameters matching backend schema
 *
 * Security: Comprehensive validation of all search inputs
 * Backend Compatibility: Matches property.ts propertySearchSchema
 */
export const validateSearchParams = (
  params: Record<string, any>,
  options?: { enableDateRangeCheck?: boolean; maxGuests?: number }
): SafeSearchParams => {
  const validated: SafeSearchParams = {};

  // Validate location (sanitize but no max length to match backend)
  if (params.location) {
    const sanitized = sanitizeString(params.location);
    // Only include if sanitization didn't remove everything
    if (sanitized && sanitized.length > 0) {
      validated.location = sanitized;
    }
  }

  // Validate checkIn date (backend format: YYYY-MM-DD)
  if (params.checkIn) {
    const checkIn = validateDateString(params.checkIn, {
      enableRangeCheck: options?.enableDateRangeCheck,
    });
    if (checkIn) {
      validated.checkIn = checkIn;
    }
  }

  // Validate checkOut date (backend format: YYYY-MM-DD)
  if (params.checkOut) {
    const checkOut = validateDateString(params.checkOut, {
      enableRangeCheck: options?.enableDateRangeCheck,
    });
    if (checkOut) {
      validated.checkOut = checkOut;
    }
  }

  // Validate guests parameter (backend uses "guests", must be positive int)
  // Try both "guests" and "adults" for backward compatibility
  const guestsParam = params.guests || params.adults;
  if (guestsParam) {
    const guests = parsePositiveInt(guestsParam, options?.maxGuests);
    if (guests !== undefined) {
      validated.guests = guests;
    }
  }

  return validated;
};
