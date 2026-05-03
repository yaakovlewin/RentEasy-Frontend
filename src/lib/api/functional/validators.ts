/**
 * Pure Validator Functions with Composition
 *
 * Type-safe, composable validators using Result monad.
 * All validators are pure functions that return Result<T, ValidationError>.
 *
 * Validators can be composed using `allOf`, `oneOf`, and custom combinators.
 */

import { Result, ok, err, flatMap, all } from './result';

/**
 * Validation error with field and message
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

/**
 * Validator function type
 * Takes a value and returns Result with value or validation error
 */
export type Validator<T> = (value: T) => Result<T, ValidationError>;

/**
 * Create a validation error
 */
const createError = (field: string, message: string, code?: string): ValidationError =>
  Object.freeze({ field, message, code });

/**
 * Required validator - ensures value is not null, undefined, or empty string
 */
export const required = (field: string): Validator<any> =>
  (value: any): Result<any, ValidationError> => {
    if (value === null || value === undefined || value === '') {
      return err(createError(field, `${field} is required`, 'REQUIRED'));
    }
    return ok(value);
  };

/**
 * String validator - ensures value is a string
 */
export const isString = (field: string): Validator<unknown> =>
  (value: unknown): Result<string, ValidationError> => {
    if (typeof value !== 'string') {
      return err(createError(field, `${field} must be a string`, 'TYPE_STRING'));
    }
    return ok(value);
  };

/**
 * Number validator - ensures value is a number
 */
export const isNumber = (field: string): Validator<unknown> =>
  (value: unknown): Result<number, ValidationError> => {
    if (typeof value !== 'number' || isNaN(value)) {
      return err(createError(field, `${field} must be a number`, 'TYPE_NUMBER'));
    }
    return ok(value);
  };

/**
 * Boolean validator - ensures value is a boolean
 */
export const isBoolean = (field: string): Validator<unknown> =>
  (value: unknown): Result<boolean, ValidationError> => {
    if (typeof value !== 'boolean') {
      return err(createError(field, `${field} must be a boolean`, 'TYPE_BOOLEAN'));
    }
    return ok(value);
  };

/**
 * Array validator - ensures value is an array
 */
export const isArray = (field: string): Validator<unknown> =>
  (value: unknown): Result<readonly any[], ValidationError> => {
    if (!Array.isArray(value)) {
      return err(createError(field, `${field} must be an array`, 'TYPE_ARRAY'));
    }
    return ok(Object.freeze([...value]));
  };

/**
 * Minimum length validator for strings and arrays
 */
export const minLength = (field: string, min: number): Validator<string | readonly any[]> =>
  (value: string | readonly any[]): Result<string | readonly any[], ValidationError> => {
    if (value.length < min) {
      return err(createError(
        field,
        `${field} must be at least ${min} characters/items`,
        'MIN_LENGTH'
      ));
    }
    return ok(value);
  };

/**
 * Maximum length validator for strings and arrays
 */
export const maxLength = (field: string, max: number): Validator<string | readonly any[]> =>
  (value: string | readonly any[]): Result<string | readonly any[], ValidationError> => {
    if (value.length > max) {
      return err(createError(
        field,
        `${field} must be at most ${max} characters/items`,
        'MAX_LENGTH'
      ));
    }
    return ok(value);
  };

/**
 * Exact length validator for strings and arrays
 */
export const exactLength = (field: string, length: number): Validator<string | readonly any[]> =>
  (value: string | readonly any[]): Result<string | readonly any[], ValidationError> => {
    if (value.length !== length) {
      return err(createError(
        field,
        `${field} must be exactly ${length} characters/items`,
        'EXACT_LENGTH'
      ));
    }
    return ok(value);
  };

/**
 * Minimum value validator for numbers
 */
export const min = (field: string, minValue: number): Validator<number> =>
  (value: number): Result<number, ValidationError> => {
    if (value < minValue) {
      return err(createError(
        field,
        `${field} must be at least ${minValue}`,
        'MIN_VALUE'
      ));
    }
    return ok(value);
  };

/**
 * Maximum value validator for numbers
 */
export const max = (field: string, maxValue: number): Validator<number> =>
  (value: number): Result<number, ValidationError> => {
    if (value > maxValue) {
      return err(createError(
        field,
        `${field} must be at most ${maxValue}`,
        'MAX_VALUE'
      ));
    }
    return ok(value);
  };

/**
 * Range validator for numbers
 */
export const range = (field: string, minValue: number, maxValue: number): Validator<number> =>
  (value: number): Result<number, ValidationError> => {
    if (value < minValue || value > maxValue) {
      return err(createError(
        field,
        `${field} must be between ${minValue} and ${maxValue}`,
        'RANGE'
      ));
    }
    return ok(value);
  };

/**
 * Pattern validator - validates against regex
 */
export const pattern = (field: string, regex: RegExp, message?: string): Validator<string> =>
  (value: string): Result<string, ValidationError> => {
    if (!regex.test(value)) {
      return err(createError(
        field,
        message || `${field} format is invalid`,
        'PATTERN'
      ));
    }
    return ok(value);
  };

/**
 * Email validator
 */
export const email = (field: string): Validator<string> =>
  pattern(
    field,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    `${field} must be a valid email address`
  );

/**
 * URL validator
 */
export const url = (field: string): Validator<string> =>
  pattern(
    field,
    /^https?:\/\/.+/,
    `${field} must be a valid URL`
  );

/**
 * UUID validator
 */
export const uuid = (field: string): Validator<string> =>
  pattern(
    field,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    `${field} must be a valid UUID`
  );

/**
 * ISO date string validator
 */
export const isoDate = (field: string): Validator<string> =>
  (value: string): Result<string, ValidationError> => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return err(createError(field, `${field} must be a valid ISO date`, 'ISO_DATE'));
    }
    return ok(value);
  };

/**
 * Phone number validator (basic)
 */
export const phoneNumber = (field: string): Validator<string> =>
  pattern(
    field,
    /^[\d\s\-\+\(\)]+$/,
    `${field} must be a valid phone number`
  );

/**
 * Alphanumeric validator
 */
export const alphanumeric = (field: string): Validator<string> =>
  pattern(
    field,
    /^[a-zA-Z0-9]+$/,
    `${field} must contain only letters and numbers`
  );

/**
 * Enum validator - value must be one of allowed values
 */
export const oneOf = <T>(field: string, allowedValues: readonly T[]): Validator<T> =>
  (value: T): Result<T, ValidationError> => {
    if (!allowedValues.includes(value)) {
      return err(createError(
        field,
        `${field} must be one of: ${allowedValues.join(', ')}`,
        'ONE_OF'
      ));
    }
    return ok(value);
  };

/**
 * Custom validator - use a predicate function
 */
export const custom = <T>(
  field: string,
  predicate: (value: T) => boolean,
  message: string,
  code?: string
): Validator<T> =>
  (value: T): Result<T, ValidationError> => {
    if (!predicate(value)) {
      return err(createError(field, message, code));
    }
    return ok(value);
  };

/**
 * Compose validators - all must pass (AND logic)
 * Returns first error if any validator fails
 */
export const allOf = <T>(...validators: Validator<T>[]): Validator<T> =>
  (value: T): Result<T, ValidationError> => {
    for (const validator of validators) {
      const result = validator(value);
      if (Result.isErr(result)) {
        return result;
      }
    }
    return ok(value);
  };

/**
 * Optional validator - allows null/undefined or validates if present
 */
export const optional = <T>(validator: Validator<T>): Validator<T | null | undefined> =>
  (value: T | null | undefined): Result<T | null | undefined, ValidationError> => {
    if (value === null || value === undefined) {
      return ok(value);
    }
    return validator(value);
  };

/**
 * Validate each item in an array
 */
export const arrayOf = <T>(
  field: string,
  itemValidator: Validator<T>
): Validator<readonly T[]> =>
  (values: readonly T[]): Result<readonly T[], ValidationError> => {
    const validatedResults = values.map((value, index) =>
      itemValidator(value)
    );

    const allResult = all(validatedResults);

    if (Result.isErr(allResult)) {
      return err(createError(field, `${field} contains invalid items`, 'ARRAY_ITEMS'));
    }

    return ok(allResult.value);
  };

/**
 * Object shape validator - validate object properties
 */
export const shape = <T extends Record<string, any>>(
  validators: { readonly [K in keyof T]: Validator<T[K]> }
): Validator<T> =>
  (value: T): Result<T, ValidationError> => {
    for (const [key, validator] of Object.entries(validators)) {
      const result = validator(value[key as keyof T]);
      if (Result.isErr(result)) {
        return result;
      }
    }
    return ok(value);
  };

/**
 * Conditional validator - only validate if condition is true
 */
export const when = <T>(
  condition: (value: T) => boolean,
  validator: Validator<T>
): Validator<T> =>
  (value: T): Result<T, ValidationError> => {
    if (condition(value)) {
      return validator(value);
    }
    return ok(value);
  };

/**
 * Transform and validate - transform value then validate
 */
export const transform = <T, U>(
  transformer: (value: T) => U,
  validator: Validator<U>
): Validator<T> =>
  (value: T): Result<U, ValidationError> => {
    const transformed = transformer(value);
    return validator(transformed);
  };

/**
 * Positive number validator
 */
export const positive = (field: string): Validator<number> =>
  custom(
    field,
    (value: number) => value > 0,
    `${field} must be positive`,
    'POSITIVE'
  );

/**
 * Negative number validator
 */
export const negative = (field: string): Validator<number> =>
  custom(
    field,
    (value: number) => value < 0,
    `${field} must be negative`,
    'NEGATIVE'
  );

/**
 * Integer validator
 */
export const integer = (field: string): Validator<number> =>
  custom(
    field,
    (value: number) => Number.isInteger(value),
    `${field} must be an integer`,
    'INTEGER'
  );

/**
 * Non-empty string validator
 */
export const nonEmptyString = (field: string): Validator<string> =>
  allOf(
    isString(field),
    custom(
      field,
      (value: string) => value.trim().length > 0,
      `${field} cannot be empty or whitespace only`,
      'NON_EMPTY'
    )
  );

/**
 * Trim string and validate
 */
export const trimmed = (field: string): Validator<string> =>
  (value: string): Result<string, ValidationError> => {
    const trimmedValue = value.trim();
    return ok(trimmedValue);
  };

/**
 * Lowercase string and validate
 */
export const lowercase = (field: string): Validator<string> =>
  (value: string): Result<string, ValidationError> => {
    const lowercaseValue = value.toLowerCase();
    return ok(lowercaseValue);
  };

/**
 * Uppercase string and validate
 */
export const uppercase = (field: string): Validator<string> =>
  (value: string): Result<string, ValidationError> => {
    const uppercaseValue = value.toUpperCase();
    return ok(uppercaseValue);
  };

/**
 * Validate and collect all errors (instead of stopping at first)
 */
export const validateAll = <T>(
  value: T,
  ...validators: Validator<T>[]
): Result<T, readonly ValidationError[]> => {
  const errors: ValidationError[] = [];

  for (const validator of validators) {
    const result = validator(value);
    if (Result.isErr(result)) {
      errors.push(result.error);
    }
  }

  if (errors.length > 0) {
    return err(Object.freeze(errors));
  }

  return ok(value);
};

/**
 * Namespace containing all validators
 */
export const Validators = Object.freeze({
  required,
  isString,
  isNumber,
  isBoolean,
  isArray,
  minLength,
  maxLength,
  exactLength,
  min,
  max,
  range,
  pattern,
  email,
  url,
  uuid,
  isoDate,
  phoneNumber,
  alphanumeric,
  oneOf,
  custom,
  allOf,
  optional,
  arrayOf,
  shape,
  when,
  transform,
  positive,
  negative,
  integer,
  nonEmptyString,
  trimmed,
  lowercase,
  uppercase,
  validateAll,
});

/**
 * Common validation patterns for RentEasy domain
 */

/**
 * Property ID validator
 */
export const propertyId = (field: string = 'propertyId'): Validator<string> =>
  allOf(
    required(field),
    isString(field),
    nonEmptyString(field)
  );

/**
 * User ID validator
 */
export const userId = (field: string = 'userId'): Validator<string> =>
  allOf(
    required(field),
    isString(field),
    nonEmptyString(field)
  );

/**
 * Price validator
 */
export const price = (field: string = 'price'): Validator<number> =>
  allOf(
    required(field),
    isNumber(field),
    positive(field)
  );

/**
 * Guest count validator
 */
export const guestCount = (field: string = 'guests'): Validator<number> =>
  allOf(
    required(field),
    isNumber(field),
    integer(field),
    positive(field),
    max(field, 50)
  );

/**
 * Date string validator
 */
export const dateString = (field: string): Validator<string> =>
  allOf(
    required(field),
    isString(field),
    isoDate(field)
  );

/**
 * Pagination page validator
 */
export const page = (field: string = 'page'): Validator<number> =>
  allOf(
    isNumber(field),
    integer(field),
    min(field, 1)
  );

/**
 * Pagination limit validator
 */
export const limit = (field: string = 'limit'): Validator<number> =>
  allOf(
    isNumber(field),
    integer(field),
    range(field, 1, 100)
  );
