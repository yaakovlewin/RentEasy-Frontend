/**
 * Validation utilities for forms and inputs
 */

// ========================
// Email Validation
// ========================

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number (basic international format)
 * @param phone - Phone number to validate
 * @returns True if valid phone number
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check if it's between 10 and 15 digits (international range)
  return digits.length >= 10 && digits.length <= 15;
}

// ========================
// Date Validation
// ========================

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Checks if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}

/**
 * Checks if a date is within a range
 * @param date - Date to check
 * @param startDate - Start of range
 * @param endDate - End of range
 * @returns True if date is within range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  return checkDate >= start && checkDate <= end;
}

/**
 * Validates if check-out date is after check-in date
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns True if valid date range
 */
export function isValidDateRange(checkIn: Date | null, checkOut: Date | null): boolean {
  if (!checkIn || !checkOut) return false;
  return checkOut > checkIn;
}

// ========================
// Number Validation
// ========================

/**
 * Checks if a value is a valid positive number
 * @param value - Value to check
 * @returns True if positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Checks if a value is within a range
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates a price (positive number with max 2 decimal places)
 * @param price - Price to validate
 * @returns True if valid price
 */
export function isValidPrice(price: unknown): boolean {
  const num = Number(price);
  if (isNaN(num) || num < 0) return false;

  // Check for max 2 decimal places
  const priceStr = String(price);
  const decimalPart = priceStr.split('.')[1];
  return !decimalPart || decimalPart.length <= 2;
}

// ========================
// String Validation
// ========================

/**
 * Checks if a string is empty or only whitespace
 * @param str - String to check
 * @returns True if empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Checks if a string meets minimum length requirement
 * @param str - String to check
 * @param minLength - Minimum length
 * @returns True if meets minimum length
 */
export function hasMinLength(str: string, minLength: number): boolean {
  return str.length >= minLength;
}

/**
 * Checks if a string meets maximum length requirement
 * @param str - String to check
 * @param maxLength - Maximum length
 * @returns True if within maximum length
 */
export function hasMaxLength(str: string, maxLength: number): boolean {
  return str.length <= maxLength;
}

/**
 * Validates a URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================
// Guest Validation
// ========================

/**
 * Validates guest counts for a booking
 * @param guests - Guest counts object
 * @param maxGuests - Maximum allowed guests
 * @returns True if valid guest count
 */
export function isValidGuestCount(
  guests: { adults: number; children: number; infants: number },
  maxGuests: number
): boolean {
  const totalGuests = guests.adults + guests.children;
  return (
    guests.adults > 0 &&
    guests.adults >= 0 &&
    guests.children >= 0 &&
    guests.infants >= 0 &&
    totalGuests <= maxGuests
  );
}

// ========================
// Form Validation Helpers
// ========================

/**
 * Creates a validation error message
 * @param field - Field name
 * @param message - Error message
 * @returns Formatted error message
 */
export function createErrorMessage(field: string, message: string): string {
  return `${field}: ${message}`;
}

/**
 * Validates multiple fields and returns errors
 * @param validations - Array of validation objects
 * @returns Array of error messages
 */
export function validateFields(
  validations: Array<{
    field: string;
    value: unknown;
    validate: (value: unknown) => boolean;
    message: string;
  }>
): string[] {
  const errors: string[] = [];

  validations.forEach(({ field, value, validate, message }) => {
    if (!validate(value)) {
      errors.push(createErrorMessage(field, message));
    }
  });

  return errors;
}
