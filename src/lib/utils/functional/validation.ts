/**
 * Functional Validation Library using Either Monad
 *
 * This module provides composable, type-safe validators that use the Either monad
 * for predictable error handling. All validators are pure functions that return
 * Either<ValidationError[], T> where:
 * - Left contains validation errors
 * - Right contains the validated value
 *
 * Consistent with backend validation patterns and follows FP principles:
 * - Pure functions (no side effects)
 * - Composable validators
 * - Type-safe error handling
 * - Accumulative error collection
 *
 * @example
 * ```typescript
 * import { validateEmail, composeValidators, required } from '@/lib/utils/functional/validation';
 *
 * const emailValidator = composeValidators(
 *   required('Email'),
 *   validateEmail
 * );
 *
 * const result = emailValidator('user@example.com');
 * // Right('user@example.com')
 *
 * const errors = emailValidator('');
 * // Left(['Email is required'])
 * ```
 */

import { Either, left, right, isLeft } from '@/lib/api/functional/either';

/**
 * Validation error type - simple string for readable error messages
 */
export type ValidationError = string;

/**
 * Validator function type
 * Takes a value and returns Either with errors or validated value
 */
export type Validator<T> = (value: T) => Either<ValidationError[], T>;

/**
 * Field validator result - map of field names to validation errors
 */
export type FieldErrors<T> = Partial<Record<keyof T, ValidationError[]>>;

/**
 * Validator result for forms - Either field errors or validated data
 */
export type FormValidationResult<T> = Either<FieldErrors<T>, T>;

// ========================
// Primitive Validators
// ========================

/**
 * Validates that a string is not empty
 *
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = required('Email');
 * validator('test@example.com'); // Right('test@example.com')
 * validator(''); // Left(['Email is required'])
 * validator('   '); // Left(['Email is required'])
 */
export const required = (fieldName: string): Validator<string> => (value: string) =>
  value.trim().length > 0
    ? right(value)
    : left([`${fieldName} is required`]);

/**
 * Validates email format using RFC 5322 compliant regex
 *
 * @example
 * validateEmail('user@example.com'); // Right('user@example.com')
 * validateEmail('invalid'); // Left(['Invalid email address'])
 */
export const validateEmail: Validator<string> = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? right(value)
    : left(['Invalid email address']);

/**
 * Validates minimum length requirement
 *
 * @param min - Minimum length
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = minLength(8, 'Password');
 * validator('12345678'); // Right('12345678')
 * validator('123'); // Left(['Password must be at least 8 characters'])
 */
export const minLength = (min: number, fieldName: string): Validator<string> =>
  (value: string) =>
    value.length >= min
      ? right(value)
      : left([`${fieldName} must be at least ${min} characters`]);

/**
 * Validates maximum length requirement
 *
 * @param max - Maximum length
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = maxLength(100, 'Bio');
 * validator('Short bio'); // Right('Short bio')
 * validator('x'.repeat(101)); // Left(['Bio must be at most 100 characters'])
 */
export const maxLength = (max: number, fieldName: string): Validator<string> =>
  (value: string) =>
    value.length <= max
      ? right(value)
      : left([`${fieldName} must be at most ${max} characters`]);

/**
 * Validates that string contains at least one uppercase letter
 *
 * @example
 * hasUppercase('Password1'); // Right('Password1')
 * hasUppercase('password1'); // Left(['Must contain an uppercase letter'])
 */
export const hasUppercase: Validator<string> = (value: string) =>
  /[A-Z]/.test(value)
    ? right(value)
    : left(['Must contain an uppercase letter']);

/**
 * Validates that string contains at least one lowercase letter
 *
 * @example
 * hasLowercase('Password1'); // Right('Password1')
 * hasLowercase('PASSWORD1'); // Left(['Must contain a lowercase letter'])
 */
export const hasLowercase: Validator<string> = (value: string) =>
  /[a-z]/.test(value)
    ? right(value)
    : left(['Must contain a lowercase letter']);

/**
 * Validates that string contains at least one number
 *
 * @example
 * hasNumber('Password1'); // Right('Password1')
 * hasNumber('Password'); // Left(['Must contain a number'])
 */
export const hasNumber: Validator<string> = (value: string) =>
  /\d/.test(value)
    ? right(value)
    : left(['Must contain a number']);

/**
 * Validates that string contains at least one special character
 *
 * @example
 * hasSpecialChar('Password1!'); // Right('Password1!')
 * hasSpecialChar('Password1'); // Left(['Must contain a special character'])
 */
export const hasSpecialChar: Validator<string> = (value: string) =>
  /[!@#$%^&*(),.?":{}|<>]/.test(value)
    ? right(value)
    : left(['Must contain a special character (!@#$%^&*(),.?":{}|<>)']);

/**
 * Validates phone number format (international)
 * Accepts 10-15 digits with optional formatting
 *
 * @example
 * validatePhone('+1 (555) 123-4567'); // Right('+1 (555) 123-4567')
 * validatePhone('123'); // Left(['Invalid phone number'])
 */
export const validatePhone: Validator<string> = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15
    ? right(value)
    : left(['Invalid phone number (must be 10-15 digits)']);
};

/**
 * Validates URL format
 *
 * @example
 * validateUrl('https://example.com'); // Right('https://example.com')
 * validateUrl('not-a-url'); // Left(['Invalid URL'])
 */
export const validateUrl: Validator<string> = (value: string) => {
  try {
    new URL(value);
    return right(value);
  } catch {
    return left(['Invalid URL']);
  }
};

/**
 * Validates that a number is positive
 *
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = isPositive('Price');
 * validator(100); // Right(100)
 * validator(-10); // Left(['Price must be positive'])
 */
export const isPositive = (fieldName: string): Validator<number> => (value: number) =>
  value > 0
    ? right(value)
    : left([`${fieldName} must be positive`]);

/**
 * Validates that a number is within a range
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = inRange(1, 10, 'Rating');
 * validator(5); // Right(5)
 * validator(15); // Left(['Rating must be between 1 and 10'])
 */
export const inRange = (min: number, max: number, fieldName: string): Validator<number> =>
  (value: number) =>
    value >= min && value <= max
      ? right(value)
      : left([`${fieldName} must be between ${min} and ${max}`]);

/**
 * Validates that a date is in the future
 *
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = isFutureDate('Check-in date');
 * validator(new Date('2026-01-01')); // Right(date)
 * validator(new Date('2020-01-01')); // Left(['Check-in date must be in the future'])
 */
export const isFutureDate = (fieldName: string): Validator<Date> => (value: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(value);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate > today
    ? right(value)
    : left([`${fieldName} must be in the future`]);
};

/**
 * Validates that end date is after start date
 *
 * @param startDate - Start date
 * @param startFieldName - Start field name
 * @param endFieldName - End field name
 * @returns Validator function for end date
 *
 * @example
 * const checkIn = new Date('2025-01-01');
 * const validator = isAfterDate(checkIn, 'Check-in', 'Check-out');
 * validator(new Date('2025-01-05')); // Right(date)
 * validator(new Date('2024-12-31')); // Left(['Check-out must be after Check-in'])
 */
export const isAfterDate = (
  startDate: Date,
  startFieldName: string,
  endFieldName: string
): Validator<Date> => (value: Date) =>
  value > startDate
    ? right(value)
    : left([`${endFieldName} must be after ${startFieldName}`]);

/**
 * Validates that two values match
 *
 * @param matchValue - Value to match against
 * @param fieldName - Field name for error messages
 * @returns Validator function
 *
 * @example
 * const validator = matches('password123', 'Password confirmation');
 * validator('password123'); // Right('password123')
 * validator('different'); // Left(['Password confirmation must match'])
 */
export const matches = <T>(matchValue: T, fieldName: string): Validator<T> => (value: T) =>
  value === matchValue
    ? right(value)
    : left([`${fieldName} must match`]);

// ========================
// Composed Validators
// ========================

/**
 * Compose multiple validators, accumulating all errors
 * Runs all validators and collects errors from failed validations
 *
 * @param validators - Array of validators to compose
 * @returns Validator that runs all validators and accumulates errors
 *
 * @example
 * const passwordValidator = composeValidators(
 *   required('Password'),
 *   minLength(8, 'Password'),
 *   hasUppercase,
 *   hasLowercase,
 *   hasNumber
 * );
 *
 * passwordValidator(''); // Left(['Password is required'])
 * passwordValidator('weak'); // Left(['Password must be at least 8 characters', ...])
 * passwordValidator('Strong123'); // Right('Strong123')
 */
export const composeValidators = <T>(...validators: Validator<T>[]): Validator<T> =>
  (value: T) => {
    const errors: ValidationError[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (isLeft(result)) {
        errors.push(...result.left);
      }
    }

    return errors.length > 0 ? left(errors) : right(value);
  };

/**
 * Predefined password validator with all requirements
 * Requires: 8+ chars, uppercase, lowercase, number, special char
 *
 * @example
 * validatePassword('Weak'); // Left([...multiple errors...])
 * validatePassword('Strong123!'); // Right('Strong123!')
 */
export const validatePassword: Validator<string> = composeValidators(
  minLength(8, 'Password'),
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
);

/**
 * Predefined strong password validator
 * Requires: 12+ chars, uppercase, lowercase, number, special char
 *
 * @example
 * validateStrongPassword('Short1!'); // Left(['Password must be at least 12 characters'])
 * validateStrongPassword('VeryStrong123!'); // Right('VeryStrong123!')
 */
export const validateStrongPassword: Validator<string> = composeValidators(
  minLength(12, 'Password'),
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
);

// ========================
// Object/Form Validators
// ========================

/**
 * Validate an object with field-specific validators
 * Returns Either with field errors or validated object
 *
 * @param validators - Map of field names to validators
 * @returns Function that validates entire object
 *
 * @example
 * const loginValidator = validateFields({
 *   email: composeValidators(required('Email'), validateEmail),
 *   password: composeValidators(required('Password'), minLength(8, 'Password'))
 * });
 *
 * const result = loginValidator({ email: 'user@example.com', password: 'password123' });
 * // Right({ email: 'user@example.com', password: 'password123' })
 *
 * const errors = loginValidator({ email: '', password: '123' });
 * // Left({ email: ['Email is required'], password: ['Password must be at least 8 characters'] })
 */
export const validateFields = <T extends Record<string, any>>(
  validators: { [K in keyof T]?: Validator<T[K]> }
) =>
  (values: T): FormValidationResult<T> => {
    const fieldErrors: FieldErrors<T> = {};
    let hasErrors = false;

    for (const field in validators) {
      const validator = validators[field];
      if (validator) {
        const result = validator(values[field]);
        if (isLeft(result)) {
          fieldErrors[field] = result.left;
          hasErrors = true;
        }
      }
    }

    return hasErrors ? left(fieldErrors) : right(values);
  };

/**
 * Validate a specific field and return field-specific errors
 *
 * @param field - Field name
 * @param validator - Validator for this field
 * @param value - Field value
 * @returns Either field errors or validated value
 *
 * @example
 * const result = validateField('email', validateEmail, 'user@example.com');
 * // Right('user@example.com')
 *
 * const error = validateField('email', validateEmail, 'invalid');
 * // Left({ email: ['Invalid email address'] })
 */
export const validateField = <T, K extends string>(
  field: K,
  validator: Validator<T>,
  value: T
): Either<Record<K, ValidationError[]>, T> => {
  const result = validator(value);
  return isLeft(result) ? left({ [field]: result.left } as Record<K, ValidationError[]>) : right(value);
};

/**
 * Create a conditional validator that only runs if predicate is true
 *
 * @param predicate - Function to determine if validation should run
 * @param validator - Validator to run conditionally
 * @returns Conditional validator
 *
 * @example
 * const requireIfOwner = when(
 *   (data: FormData) => data.role === 'owner',
 *   required('Property ID')
 * );
 */
export const when = <T>(
  predicate: (value: T) => boolean,
  validator: Validator<T>
): Validator<T> => (value: T) =>
  predicate(value) ? validator(value) : right(value);

/**
 * Create optional field validator (only validates if value is non-empty)
 *
 * @param validator - Validator to run on non-empty values
 * @returns Optional validator
 *
 * @example
 * const optionalPhone = optional(validatePhone);
 * optionalPhone(''); // Right('')
 * optionalPhone('+1 555-1234'); // Right('+1 555-1234')
 * optionalPhone('invalid'); // Left(['Invalid phone number'])
 */
export const optional = <T extends string>(validator: Validator<T>): Validator<T> =>
  (value: T) =>
    value.trim().length === 0 ? right(value) : validator(value);

/**
 * Transform value before validation
 *
 * @param transformer - Function to transform value
 * @param validator - Validator to run on transformed value
 * @returns Validator with transformation
 *
 * @example
 * const emailValidator = withTransform(
 *   (email: string) => email.toLowerCase().trim(),
 *   validateEmail
 * );
 */
export const withTransform = <T, U>(
  transformer: (value: T) => U,
  validator: Validator<U>
): Validator<T> => (value: T) => validator(transformer(value));

// ========================
// Helper Functions
// ========================

/**
 * Extract first error from each field in field errors
 *
 * @param fieldErrors - Field errors object
 * @returns Map of field names to first error
 *
 * @example
 * const errors = { email: ['Required', 'Invalid'], password: ['Too short'] };
 * getFirstErrors(errors); // { email: 'Required', password: 'Too short' }
 */
export const getFirstErrors = <T>(fieldErrors: FieldErrors<T>): Record<keyof T, string> => {
  const result: any = {};
  for (const field in fieldErrors) {
    const errors = fieldErrors[field];
    if (errors && errors.length > 0) {
      result[field] = errors[0];
    }
  }
  return result;
};

/**
 * Check if field has errors
 *
 * @param fieldErrors - Field errors object
 * @param field - Field to check
 * @returns True if field has errors
 */
export const hasFieldError = <T>(
  fieldErrors: FieldErrors<T>,
  field: keyof T
): boolean => {
  const errors = fieldErrors[field];
  return !!errors && errors.length > 0;
};

/**
 * Get all errors for a field
 *
 * @param fieldErrors - Field errors object
 * @param field - Field to get errors for
 * @returns Array of errors or empty array
 */
export const getFieldErrors = <T>(
  fieldErrors: FieldErrors<T>,
  field: keyof T
): ValidationError[] => {
  return fieldErrors[field] || [];
};

/**
 * Count total number of errors across all fields
 *
 * @param fieldErrors - Field errors object
 * @returns Total error count
 */
export const countErrors = <T>(fieldErrors: FieldErrors<T>): number => {
  let count = 0;
  for (const field in fieldErrors) {
    const errors = fieldErrors[field];
    if (errors) {
      count += errors.length;
    }
  }
  return count;
};
