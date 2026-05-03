/**
 * Option Monad - Functional Null Handling
 *
 * An Option type represents a value that may or may not exist.
 * It's either Some (has value) or None (no value).
 *
 * This eliminates null/undefined checks and makes optional values explicit.
 * All operations are pure and composable.
 *
 * @example
 * const option = some(42);
 * const mapped = map((x: number) => x * 2)(option); // Some(84)
 *
 * const nothing = none<number>();
 * const stillNothing = map((x: number) => x * 2)(nothing); // None
 */

/**
 * Option type representing presence or absence of a value
 * @template T - Value type
 */
export type Option<T> = Some<T> | None;

/**
 * Some variant containing a value
 */
interface Some<T> {
  readonly kind: 'some';
  readonly value: T;
}

/**
 * None variant representing absence of value
 */
interface None {
  readonly kind: 'none';
}

/**
 * Create an Option with a value
 * @template T - Value type
 * @param value - The value to wrap
 * @returns Option in Some state
 */
export const some = <T>(value: T): Option<T> =>
  Object.freeze({ kind: 'some', value });

/**
 * Create an Option with no value
 * @template T - Value type
 * @returns Option in None state
 */
export const none = <T = never>(): Option<T> =>
  Object.freeze({ kind: 'none' });

/**
 * Create Option from nullable value
 * Converts null/undefined to None, other values to Some
 *
 * @template T - Value type
 * @param value - Nullable value
 * @returns Some if value exists, None otherwise
 *
 * @example
 * const opt1 = fromNullable(42); // Some(42)
 * const opt2 = fromNullable(null); // None
 * const opt3 = fromNullable(undefined); // None
 */
export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value !== null && value !== undefined ? some(value) : none();

/**
 * Create Option from falsy value check
 * Converts falsy values (0, "", false, null, undefined) to None
 *
 * @template T - Value type
 * @param value - Value to check
 * @returns Some if value is truthy, None otherwise
 */
export const fromFalsy = <T>(value: T | null | undefined): Option<T> =>
  value ? some(value) : none();

/**
 * Check if Option is Some
 * @param option - Option to check
 * @returns True if Option is Some
 */
export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option.kind === 'some';

/**
 * Check if Option is None
 * @param option - Option to check
 * @returns True if Option is None
 */
export const isNone = <T>(option: Option<T>): option is None =>
  option.kind === 'none';

/**
 * Map over an Option value (functor)
 * Transforms the value if Some, passes through if None
 *
 * @template T - Input value type
 * @template U - Output value type
 * @param fn - Transformation function
 * @returns Function that maps Option<T> to Option<U>
 *
 * @example
 * const option = some(5);
 * const doubled = map((x: number) => x * 2)(option); // Some(10)
 */
export const map = <T, U>(fn: (value: T) => U) =>
  (option: Option<T>): Option<U> =>
    isSome(option) ? some(fn(option.value)) : none();

/**
 * FlatMap over an Option (monad bind)
 * Chains Option-returning operations, short-circuits on first None
 *
 * @template T - Input value type
 * @template U - Output value type
 * @param fn - Function returning Option
 * @returns Function that chains Option operations
 *
 * @example
 * const divide = (denominator: number) =>
 *   (numerator: number): Option<number> =>
 *     denominator === 0 ? none() : some(numerator / denominator);
 *
 * const option = some(10);
 * const result = flatMap(divide(2))(option); // Some(5)
 */
export const flatMap = <T, U>(fn: (value: T) => Option<U>) =>
  (option: Option<T>): Option<U> =>
    isSome(option) ? fn(option.value) : none();

/**
 * Alternative name for flatMap (common in functional programming)
 */
export const chain = flatMap;

/**
 * Alternative name for flatMap (common in Rust/Swift)
 */
export const andThen = flatMap;

/**
 * Match on Option variants (pattern matching)
 * Exhaustive case analysis that handles both Some and None
 *
 * @template T - Value type
 * @template U - Return type
 * @param handlers - Object with some and none handlers
 * @returns Function that matches on Option
 *
 * @example
 * const option = some(42);
 * const message = match({
 *   some: (value) => `Value: ${value}`,
 *   none: () => "No value"
 * })(option); // "Value: 42"
 */
export const match = <T, U>(handlers: {
  readonly some: (value: T) => U;
  readonly none: () => U;
}) =>
  (option: Option<T>): U =>
    isSome(option) ? handlers.some(option.value) : handlers.none();

/**
 * Get value or default if None
 * Extracts value from Some, or returns default for None
 *
 * @template T - Value type
 * @param defaultValue - Value to return if None
 * @returns Function that extracts value or default
 *
 * @example
 * const option = none<number>();
 * const value = getOrElse(0)(option); // 0
 */
export const getOrElse = <T>(defaultValue: T) =>
  (option: Option<T>): T =>
    isSome(option) ? option.value : defaultValue;

/**
 * Get value or compute default if None
 * Lazy version of getOrElse, only evaluates default if needed
 *
 * @template T - Value type
 * @param fn - Function to compute default value
 * @returns Function that extracts value or computes default
 */
export const getOrElseLazy = <T>(fn: () => T) =>
  (option: Option<T>): T =>
    isSome(option) ? option.value : fn();

/**
 * Convert Option to nullable value
 * Some becomes value, None becomes null
 *
 * @template T - Value type
 * @param option - Option to convert
 * @returns Value or null
 */
export const toNullable = <T>(option: Option<T>): T | null =>
  isSome(option) ? option.value : null;

/**
 * Convert Option to value or undefined
 * Some becomes value, None becomes undefined
 *
 * @template T - Value type
 * @param option - Option to convert
 * @returns Value or undefined
 */
export const toUndefined = <T>(option: Option<T>): T | undefined =>
  isSome(option) ? option.value : undefined;

/**
 * Unwrap an Option value (unsafe)
 * Throws if Option is None. Use only when you know Option is Some.
 *
 * @template T - Value type
 * @param option - Option to unwrap
 * @returns Value if Some
 * @throws Error if None
 */
export const unwrap = <T>(option: Option<T>): T => {
  if (isNone(option)) {
    throw new Error('Attempted to unwrap None value');
  }
  return option.value;
};

/**
 * Filter Option based on predicate
 * Converts Some to None if predicate fails
 *
 * @template T - Value type
 * @param predicate - Test function
 * @returns Function that filters Option
 *
 * @example
 * const option = some(5);
 * const filtered = filter((x: number) => x > 3)(option); // Some(5)
 * const removed = filter((x: number) => x > 10)(option); // None
 */
export const filter = <T>(predicate: (value: T) => boolean) =>
  (option: Option<T>): Option<T> =>
    isSome(option) && predicate(option.value) ? option : none();

/**
 * Apply a function in an Option to a value in an Option (applicative)
 *
 * @template T - Input type
 * @template U - Output type
 * @param fn - Option containing function
 * @returns Function that applies Option function to Option value
 */
export const ap = <T, U>(fn: Option<(value: T) => U>) =>
  (option: Option<T>): Option<U> =>
    isSome(fn) && isSome(option) ? some(fn.value(option.value)) : none();

/**
 * Combine two Options with a binary function
 * Both must be Some for result to be Some
 *
 * @template T1 - First value type
 * @template T2 - Second value type
 * @template U - Output type
 * @param fn - Binary function
 * @returns Function that combines two Options
 */
export const map2 = <T1, T2, U>(fn: (a: T1, b: T2) => U) =>
  (o1: Option<T1>) =>
  (o2: Option<T2>): Option<U> =>
    isSome(o1) && isSome(o2) ? some(fn(o1.value, o2.value)) : none();

/**
 * Combine three Options with a ternary function
 * All must be Some for result to be Some
 *
 * @template T1 - First value type
 * @template T2 - Second value type
 * @template T3 - Third value type
 * @template U - Output type
 * @param fn - Ternary function
 * @returns Function that combines three Options
 */
export const map3 = <T1, T2, T3, U>(fn: (a: T1, b: T2, c: T3) => U) =>
  (o1: Option<T1>) =>
  (o2: Option<T2>) =>
  (o3: Option<T3>): Option<U> =>
    isSome(o1) && isSome(o2) && isSome(o3)
      ? some(fn(o1.value, o2.value, o3.value))
      : none();

/**
 * Execute side effect if Some, ignore if None
 * Useful for logging, analytics, etc.
 *
 * @template T - Value type
 * @param fn - Side effect function
 * @returns Function that performs side effect and returns Option unchanged
 */
export const tap = <T>(fn: (value: T) => void) =>
  (option: Option<T>): Option<T> => {
    if (isSome(option)) {
      fn(option.value);
    }
    return option;
  };

/**
 * Return first Some from two Options, or None if both are None
 *
 * @template T - Value type
 * @param first - First Option
 * @returns Function that returns first Some
 */
export const or = <T>(first: Option<T>) =>
  (second: Option<T>): Option<T> =>
    isSome(first) ? first : second;

/**
 * Return Some only if both Options are Some, otherwise None
 *
 * @template T - Value type
 * @param first - First Option
 * @returns Function that returns Some if both are Some
 */
export const and = <T>(first: Option<T>) =>
  (second: Option<T>): Option<T> =>
    isSome(first) ? second : none();

/**
 * Combine array of Options into Option of array
 * Returns Some with all values if all are Some, otherwise None
 *
 * @template T - Value type
 * @param options - Array of Options
 * @returns Option containing array of values or None
 *
 * @example
 * const options = [some(1), some(2), some(3)];
 * const combined = all(options); // Some([1, 2, 3])
 *
 * const withNone = [some(1), none(), some(3)];
 * const result = all(withNone); // None
 */
export const all = <T>(
  options: readonly Option<T>[]
): Option<readonly T[]> => {
  const values: T[] = [];

  for (const option of options) {
    if (isNone(option)) {
      return none();
    }
    values.push(option.value);
  }

  return some(Object.freeze(values));
};

/**
 * Return first Some from array of Options, or None if all are None
 *
 * @template T - Value type
 * @param options - Array of Options
 * @returns First Some or None
 */
export const any = <T>(options: readonly Option<T>[]): Option<T> => {
  for (const option of options) {
    if (isSome(option)) {
      return option;
    }
  }
  return none();
};

/**
 * Flatten nested Option
 * Option<Option<T>> becomes Option<T>
 *
 * @template T - Value type
 * @param option - Nested Option
 * @returns Flattened Option
 */
export const flatten = <T>(option: Option<Option<T>>): Option<T> =>
  isSome(option) ? option.value : none();

/**
 * Convert a throwing function to an Option-returning function
 * Catches exceptions and converts to None
 *
 * @template T - Input type
 * @template U - Output type
 * @param fn - Potentially throwing function
 * @returns Function that returns Option instead of throwing
 *
 * @example
 * const safeParse = tryCatch(JSON.parse);
 * const result = safeParse('{"valid": true}'); // Some({valid: true})
 * const error = safeParse('{invalid}'); // None
 */
export const tryCatch = <T extends readonly any[], U>(
  fn: (...args: T) => U
) =>
  (...args: T): Option<U> => {
    try {
      return some(fn(...args));
    } catch {
      return none();
    }
  };

/**
 * Namespace containing all Option operations
 * Provides OOP-like interface while maintaining functional implementation
 */
export const Option = Object.freeze({
  some,
  none,
  fromNullable,
  fromFalsy,
  isSome,
  isNone,
  map,
  flatMap,
  chain,
  andThen,
  match,
  getOrElse,
  getOrElseLazy,
  toNullable,
  toUndefined,
  unwrap,
  filter,
  ap,
  map2,
  map3,
  tap,
  or,
  and,
  all,
  any,
  flatten,
  tryCatch,
});

/**
 * Type guard for Option type
 */
export const isOption = <T>(value: unknown): value is Option<T> =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  ((value as any).kind === 'some' || (value as any).kind === 'none');
