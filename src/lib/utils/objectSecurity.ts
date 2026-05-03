/**
 * Object Security Utilities
 *
 * Provides pure functions for protecting against prototype pollution attacks.
 * All functions are immutable and follow functional programming principles.
 *
 * @module objectSecurity
 */

/**
 * Dangerous object keys that can lead to prototype pollution attacks
 */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'] as const;

/**
 * Type guard to check if a value is an object
 *
 * @param value - Value to check
 * @returns True if value is a plain object
 */
const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Checks if a key is dangerous and could lead to prototype pollution
 *
 * @param key - The key to validate
 * @returns True if the key is dangerous
 *
 * @example
 * isDangerousKey('__proto__') // true
 * isDangerousKey('name') // false
 */
const isDangerousKey = (key: string): boolean => {
  return DANGEROUS_KEYS.includes(key as typeof DANGEROUS_KEYS[number]);
};

/**
 * Sanitizes arrays recursively, processing objects and nested arrays
 *
 * @param arr - The array to sanitize
 * @returns A new sanitized array
 */
const sanitizeArray = (arr: unknown[]): unknown[] => {
  return arr.map((item) => {
    if (isObject(item)) {
      return sanitizeKeys(item);
    } else if (Array.isArray(item)) {
      return sanitizeArray(item);
    }
    return item;
  });
};

/**
 * Removes dangerous keys from an object that could cause prototype pollution.
 * Returns a new object without mutation (pure function).
 *
 * @param obj - The object to sanitize
 * @returns A new object with dangerous keys removed
 *
 * @example
 * const unsafe = { name: 'John', __proto__: { isAdmin: true } };
 * const safe = sanitizeKeys(unsafe);
 * // safe = { name: 'John' }
 *
 * @example
 * const nested = {
 *   user: {
 *     name: 'John',
 *     __proto__: { isAdmin: true },
 *     profile: { bio: 'Developer' }
 *   }
 * };
 * const safe = sanitizeKeys(nested);
 * // safe = { user: { name: 'John', profile: { bio: 'Developer' } } }
 */
export const sanitizeKeys = <T extends Record<string, unknown>>(
  obj: T
): Partial<T> => {
  if (!isObject(obj)) {
    return obj as Partial<T>;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous keys
    if (isDangerousKey(key)) {
      continue;
    }

    // Recursively sanitize nested objects
    if (isObject(value)) {
      sanitized[key] = sanitizeKeys(value);
    } else if (Array.isArray(value)) {
      // Recursively sanitize arrays (including nested arrays)
      sanitized[key] = sanitizeArray(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as Partial<T>;
};

/**
 * Safely merges a source object into a target object without prototype pollution.
 * Returns a new object without mutating the original objects (pure function).
 *
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new merged object with dangerous keys removed
 *
 * @example
 * const target = { name: 'John', age: 30 };
 * const source = { age: 31, city: 'NYC', __proto__: { isAdmin: true } };
 * const result = safeObjectMerge(target, source);
 * // result = { name: 'John', age: 31, city: 'NYC' }
 * // target and source remain unchanged
 *
 * @example
 * const target = { user: { name: 'John' } };
 * const source = { user: { age: 30, constructor: {} } };
 * const result = safeObjectMerge(target, source);
 * // result = { user: { name: 'John', age: 30 } }
 */
export const safeObjectMerge = <
  T extends Record<string, unknown>,
  S extends Record<string, unknown>
>(
  target: T,
  source: S
): T & Partial<S> => {
  // Sanitize both objects first
  const sanitizedTarget = sanitizeKeys(target);
  const sanitizedSource = sanitizeKeys(source);

  // Deep merge function
  const deepMerge = (
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = { ...obj1 };

    for (const [key, value] of Object.entries(obj2)) {
      if (isObject(value) && isObject(result[key])) {
        // Recursively merge nested objects
        result[key] = deepMerge(
          result[key] as Record<string, unknown>,
          value
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return deepMerge(
    sanitizedTarget as Record<string, unknown>,
    sanitizedSource as Record<string, unknown>
  ) as T & Partial<S>;
};
