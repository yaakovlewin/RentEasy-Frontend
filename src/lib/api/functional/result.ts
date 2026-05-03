/**
 * Result Monad - Functional Error Handling
 *
 * A Result type represents the outcome of a computation that may fail.
 * It's either Ok (success) with a value, or Err (failure) with an error.
 *
 * This eliminates the need for try-catch blocks and makes error handling explicit.
 * All operations are pure and composable.
 *
 * @example
 * const result = Result.ok(42);
 * const mapped = result.map(x => x * 2); // Ok(84)
 *
 * const error = Result.err("Something went wrong");
 * const stillError = error.map(x => x * 2); // Still Err("Something went wrong")
 */

/**
 * Result type representing success or failure
 * @template T - Success value type
 * @template E - Error type
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/**
 * Success variant containing a value
 */
interface Ok<T, E> {
  readonly kind: 'ok';
  readonly value: T;
}

/**
 * Failure variant containing an error
 */
interface Err<T, E> {
  readonly kind: 'err';
  readonly error: E;
}

/**
 * Create a successful Result
 * @template T - Value type
 * @template E - Error type
 * @param value - Success value
 * @returns Result in Ok state
 */
export const ok = <T, E = never>(value: T): Result<T, E> =>
  Object.freeze({ kind: 'ok', value });

/**
 * Create a failed Result
 * @template T - Value type
 * @template E - Error type
 * @param error - Error value
 * @returns Result in Err state
 */
export const err = <T = never, E = unknown>(error: E): Result<T, E> =>
  Object.freeze({ kind: 'err', error });

/**
 * Check if Result is Ok
 * @param result - Result to check
 * @returns True if Result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T, E> =>
  result.kind === 'ok';

/**
 * Check if Result is Err
 * @param result - Result to check
 * @returns True if Result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<T, E> =>
  result.kind === 'err';

/**
 * Map over a Result value (functor)
 * Transforms the success value if Ok, passes through if Err
 *
 * @template T - Input value type
 * @template U - Output value type
 * @template E - Error type
 * @param fn - Transformation function
 * @returns Function that maps Result<T, E> to Result<U, E>
 *
 * @example
 * const result = ok(5);
 * const doubled = map((x: number) => x * 2)(result); // Ok(10)
 */
export const map = <T, U, E>(fn: (value: T) => U) =>
  (result: Result<T, E>): Result<U, E> =>
    isOk(result) ? ok(fn(result.value)) : result;

/**
 * Map over a Result error
 * Transforms the error value if Err, passes through if Ok
 *
 * @template T - Value type
 * @template E - Input error type
 * @template F - Output error type
 * @param fn - Error transformation function
 * @returns Function that maps Result<T, E> to Result<T, F>
 */
export const mapError = <T, E, F>(fn: (error: E) => F) =>
  (result: Result<T, E>): Result<T, F> =>
    isErr(result) ? err(fn(result.error)) : result;

/**
 * FlatMap over a Result (monad bind)
 * Chains Result-returning operations, short-circuits on first error
 *
 * @template T - Input value type
 * @template U - Output value type
 * @template E - Error type
 * @param fn - Function returning Result
 * @returns Function that chains Result operations
 *
 * @example
 * const divide = (a: number) => (b: number): Result<number, string> =>
 *   b === 0 ? err("Division by zero") : ok(a / b);
 *
 * const result = ok(10);
 * const chained = flatMap(divide(5))(result); // Ok(2)
 */
export const flatMap = <T, U, E>(fn: (value: T) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> =>
    isOk(result) ? fn(result.value) : result;

/**
 * Alternative name for flatMap (common in functional programming)
 */
export const chain = flatMap;

/**
 * Alternative name for flatMap (common in Rust/Swift)
 */
export const andThen = flatMap;

/**
 * Match on Result variants (pattern matching)
 * Exhaustive case analysis that handles both Ok and Err
 *
 * @template T - Value type
 * @template E - Error type
 * @template U - Return type
 * @param handlers - Object with ok and err handlers
 * @returns Function that matches on Result
 *
 * @example
 * const result = ok(42);
 * const message = match({
 *   ok: (value) => `Success: ${value}`,
 *   err: (error) => `Error: ${error}`
 * })(result); // "Success: 42"
 */
export const match = <T, E, U>(handlers: {
  readonly ok: (value: T) => U;
  readonly err: (error: E) => U;
}) =>
  (result: Result<T, E>): U =>
    isOk(result) ? handlers.ok(result.value) : handlers.err(result.error);

/**
 * Get value or default if Err
 * Extracts value from Ok, or returns default for Err
 *
 * @template T - Value type
 * @template E - Error type
 * @param defaultValue - Value to return if Err
 * @returns Function that extracts value or default
 *
 * @example
 * const result = err("failed");
 * const value = getOrElse(0)(result); // 0
 */
export const getOrElse = <T, E>(defaultValue: T) =>
  (result: Result<T, E>): T =>
    isOk(result) ? result.value : defaultValue;

/**
 * Get value or compute default if Err
 * Lazy version of getOrElse, only evaluates default if needed
 *
 * @template T - Value type
 * @template E - Error type
 * @param fn - Function to compute default value
 * @returns Function that extracts value or computes default
 */
export const getOrElseLazy = <T, E>(fn: (error: E) => T) =>
  (result: Result<T, E>): T =>
    isOk(result) ? result.value : fn(result.error);

/**
 * Convert Result to Option, discarding error
 * Ok becomes Some, Err becomes None
 *
 * @template T - Value type
 * @template E - Error type
 * @param result - Result to convert
 * @returns Option<T>
 */
export const toOption = <T, E>(result: Result<T, E>): T | null =>
  isOk(result) ? result.value : null;

/**
 * Unwrap a Result value (unsafe)
 * Throws if Result is Err. Use only when you know Result is Ok.
 *
 * @template T - Value type
 * @template E - Error type
 * @param result - Result to unwrap
 * @returns Value if Ok
 * @throws Error if Err
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isErr(result)) {
    throw new Error(`Attempted to unwrap Err value: ${result.error}`);
  }
  return result.value;
};

/**
 * Unwrap error from Result (unsafe)
 * Throws if Result is Ok. Use only when you know Result is Err.
 *
 * @template T - Value type
 * @template E - Error type
 * @param result - Result to unwrap error from
 * @returns Error if Err
 * @throws Error if Ok
 */
export const unwrapErr = <T, E>(result: Result<T, E>): E => {
  if (isOk(result)) {
    throw new Error(`Attempted to unwrap Ok value as Err`);
  }
  return result.error;
};

/**
 * Apply a function in a Result to a value in a Result (applicative)
 *
 * @template T - Input type
 * @template U - Output type
 * @template E - Error type
 * @param fn - Result containing function
 * @returns Function that applies Result function to Result value
 */
export const ap = <T, U, E>(fn: Result<(value: T) => U, E>) =>
  (result: Result<T, E>): Result<U, E> =>
    isOk(fn) && isOk(result) ? ok(fn.value(result.value)) :
    isErr(fn) ? fn : result as Result<U, E>;

/**
 * Combine two Results with a binary function
 * Both must be Ok for result to be Ok
 *
 * @template T1 - First value type
 * @template T2 - Second value type
 * @template U - Output type
 * @template E - Error type
 * @param fn - Binary function
 * @returns Function that combines two Results
 */
export const map2 = <T1, T2, U, E>(fn: (a: T1, b: T2) => U) =>
  (r1: Result<T1, E>) =>
  (r2: Result<T2, E>): Result<U, E> =>
    isOk(r1) && isOk(r2) ? ok(fn(r1.value, r2.value)) :
    isErr(r1) ? r1 :
    r2 as Result<U, E>;

/**
 * Execute side effect if Ok, ignore if Err
 * Useful for logging, analytics, etc.
 *
 * @template T - Value type
 * @template E - Error type
 * @param fn - Side effect function
 * @returns Function that performs side effect and returns Result unchanged
 */
export const tap = <T, E>(fn: (value: T) => void) =>
  (result: Result<T, E>): Result<T, E> => {
    if (isOk(result)) {
      fn(result.value);
    }
    return result;
  };

/**
 * Execute side effect if Err, ignore if Ok
 * Useful for error logging
 *
 * @template T - Value type
 * @template E - Error type
 * @param fn - Side effect function for errors
 * @returns Function that performs side effect and returns Result unchanged
 */
export const tapError = <T, E>(fn: (error: E) => void) =>
  (result: Result<T, E>): Result<T, E> => {
    if (isErr(result)) {
      fn(result.error);
    }
    return result;
  };

/**
 * Convert a throwing function to a Result-returning function
 * Catches exceptions and converts to Err
 *
 * @template T - Input type
 * @template U - Output type
 * @param fn - Potentially throwing function
 * @returns Function that returns Result instead of throwing
 *
 * @example
 * const safeParse = tryCatch(JSON.parse);
 * const result = safeParse('{"valid": true}'); // Ok({valid: true})
 * const error = safeParse('{invalid}'); // Err(SyntaxError)
 */
export const tryCatch = <T extends readonly any[], U>(
  fn: (...args: T) => U
) =>
  (...args: T): Result<U, Error> => {
    try {
      return ok(fn(...args));
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  };

/**
 * Convert Promise to Result
 * Resolves to Ok on success, Err on rejection
 *
 * @template T - Value type
 * @template E - Error type
 * @param promise - Promise to convert
 * @returns Promise<Result<T, E>>
 *
 * @example
 * const result = await fromPromise(fetch('/api/data'));
 */
export const fromPromise = async <T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> => {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(error as E);
  }
};

/**
 * Convert Result to Promise
 * Ok becomes resolved Promise, Err becomes rejected Promise
 *
 * @template T - Value type
 * @template E - Error type
 * @param result - Result to convert
 * @returns Promise<T>
 */
export const toPromise = <T, E>(result: Result<T, E>): Promise<T> =>
  isOk(result) ? Promise.resolve(result.value) : Promise.reject(result.error);

/**
 * Combine array of Results into Result of array
 * Returns Ok with all values if all are Ok, otherwise first Err
 *
 * @template T - Value type
 * @template E - Error type
 * @param results - Array of Results
 * @returns Result containing array of values or first error
 *
 * @example
 * const results = [ok(1), ok(2), ok(3)];
 * const combined = all(results); // Ok([1, 2, 3])
 */
export const all = <T, E>(
  results: readonly Result<T, E>[]
): Result<readonly T[], E> => {
  const values: T[] = [];

  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    values.push(result.value);
  }

  return ok(Object.freeze(values));
};

/**
 * Return first Ok from array of Results, or last Err if all fail
 *
 * @template T - Value type
 * @template E - Error type
 * @param results - Array of Results
 * @returns First Ok or last Err
 */
export const any = <T, E>(
  results: readonly Result<T, E>[]
): Result<T, E> => {
  let lastErr: Result<T, E> | null = null;

  for (const result of results) {
    if (isOk(result)) {
      return result;
    }
    lastErr = result;
  }

  return lastErr || err('No results provided' as any);
};

/**
 * Namespace containing all Result operations
 * Provides OOP-like interface while maintaining functional implementation
 */
export const Result = Object.freeze({
  ok,
  err,
  isOk,
  isErr,
  map,
  mapError,
  flatMap,
  chain,
  andThen,
  match,
  getOrElse,
  getOrElseLazy,
  toOption,
  unwrap,
  unwrapErr,
  ap,
  map2,
  tap,
  tapError,
  tryCatch,
  fromPromise,
  toPromise,
  all,
  any,
});

/**
 * Type guard for Result type
 */
export const isResult = <T, E>(value: unknown): value is Result<T, E> =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  ((value as any).kind === 'ok' || (value as any).kind === 'err');
