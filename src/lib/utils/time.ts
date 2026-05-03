/**
 * Time Utilities
 *
 * Pure, immutable time calculation functions following FP principles.
 * Eliminates magic numbers and provides clear, self-documenting code.
 */

/**
 * Time constants in milliseconds
 * Immutable object with clear naming (YAGNI - only common durations)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Convert time units to milliseconds
 * Pure functions for time conversion
 */
export const toMilliseconds = {
  seconds: (n: number): number => n * TIME.SECOND,
  minutes: (n: number): number => n * TIME.MINUTE,
  hours: (n: number): number => n * TIME.HOUR,
  days: (n: number): number => n * TIME.DAY,
  weeks: (n: number): number => n * TIME.WEEK,
} as const;

/**
 * Create future expiration dates
 * Pure functions that return new Date objects (immutable)
 */
export const expiresIn = {
  seconds: (n: number): Date => new Date(Date.now() + toMilliseconds.seconds(n)),
  minutes: (n: number): Date => new Date(Date.now() + toMilliseconds.minutes(n)),
  hours: (n: number): Date => new Date(Date.now() + toMilliseconds.hours(n)),
  days: (n: number): Date => new Date(Date.now() + toMilliseconds.days(n)),
  weeks: (n: number): Date => new Date(Date.now() + toMilliseconds.weeks(n)),
} as const;

/**
 * Get expiration timestamp in milliseconds
 * Pure function for timestamp calculation
 */
export const expiresInMs = {
  seconds: (n: number): number => Date.now() + toMilliseconds.seconds(n),
  minutes: (n: number): number => Date.now() + toMilliseconds.minutes(n),
  hours: (n: number): number => Date.now() + toMilliseconds.hours(n),
  days: (n: number): number => Date.now() + toMilliseconds.days(n),
  weeks: (n: number): number => Date.now() + toMilliseconds.weeks(n),
} as const;
