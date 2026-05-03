/**
 * Either Monad - Functional Error Handling with Explicit Left/Right
 *
 * Either represents a value of one of two possible types (a disjoint union).
 * By convention:
 * - Left represents failure/error (like Result's Err)
 * - Right represents success/value (like Result's Ok)
 *
 * Key difference from Result: Either is more general-purpose and doesn't
 * assume Left is an error. This makes it perfect for validation where
 * Left contains validation errors and Right contains validated values.
 *
 * @example
 * const validation = validateEmail('user@example.com');
 * // Right('user@example.com')
 *
 * const failed = validateEmail('invalid');
 * // Left(['Invalid email address'])
 *
 * const result = pipe(
 *   validateEmail('user@example.com'),
 *   map(email => email.toLowerCase()),
 *   chain(email => validateDomain(email))
 * );
 */

/**
 * Either type representing one of two possible values
 * @template L - Left (error/failure) type
 * @template R - Right (success/value) type
 */
export type Either<L, R> = Left<L> | Right<R>;

/**
 * Left variant representing failure/error
 */
interface Left<L> {
  readonly _tag: 'Left';
  readonly left: L;
}

/**
 * Right variant representing success/value
 */
interface Right<R> {
  readonly _tag: 'Right';
  readonly right: R;
}

/**
 * Create a Left Either (failure/error)
 * @template L - Left type
 * @template R - Right type
 * @param value - Left value
 * @returns Either in Left state
 *
 * @example
 * const error = left<string[], User>(['User not found']);
 */
export const left = <L, R = never>(value: L): Either<L, R> =>
  Object.freeze({ _tag: 'Left', left: value });

/**
 * Create a Right Either (success/value)
 * @template L - Left type
 * @template R - Right type
 * @param value - Right value
 * @returns Either in Right state
 *
 * @example
 * const user = right<string[], User>({ id: 1, name: 'John' });
 */
export const right = <L = never, R = unknown>(value: R): Either<L, R> =>
  Object.freeze({ _tag: 'Right', right: value });

/**
 * Check if Either is Left
 * @param either - Either to check
 * @returns True if Either is Left
 */
export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
  either._tag === 'Left';

/**
 * Check if Either is Right
 * @param either - Either to check
 * @returns True if Either is Right
 */
export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
  either._tag === 'Right';

/**
 * Map over Either right value (functor)
 * Transforms the right value if Right, passes through if Left
 *
 * @template L - Left type
 * @template R - Input right type
 * @template B - Output right type
 * @param fn - Transformation function
 * @returns Function that maps Either<L, R> to Either<L, B>
 *
 * @example
 * const either = right<string[], number>(5);
 * const doubled = map((x: number) => x * 2)(either); // Right(10)
 *
 * const error = left<string[], number>(['Error']);
 * const stillError = map((x: number) => x * 2)(error); // Left(['Error'])
 */
export const map = <L, R, B>(fn: (value: R) => B) =>
  (either: Either<L, R>): Either<L, B> =>
    isRight(either) ? right(fn(either.right)) : either;

/**
 * Map over Either left value
 * Transforms the left value if Left, passes through if Right
 *
 * @template L - Input left type
 * @template R - Right type
 * @template C - Output left type
 * @param fn - Transformation function
 * @returns Function that maps Either<L, R> to Either<C, R>
 *
 * @example
 * const error = left<string[], number>(['Invalid']);
 * const formatted = mapLeft((errs: string[]) => errs.map(e => `Error: ${e}`))(error);
 * // Left(['Error: Invalid'])
 */
export const mapLeft = <L, R, C>(fn: (value: L) => C) =>
  (either: Either<L, R>): Either<C, R> =>
    isLeft(either) ? left(fn(either.left)) : either;

/**
 * FlatMap over Either (monad bind/chain)
 * Chains Either-returning operations, short-circuits on first Left
 *
 * @template L - Left type
 * @template R - Input right type
 * @template B - Output right type
 * @param fn - Function returning Either
 * @returns Function that chains Either operations
 *
 * @example
 * const validatePositive = (n: number): Either<string[], number> =>
 *   n > 0 ? right(n) : left(['Must be positive']);
 *
 * const result = chain(validatePositive)(right(5)); // Right(5)
 * const error = chain(validatePositive)(right(-1)); // Left(['Must be positive'])
 */
export const chain = <L, R, B>(fn: (value: R) => Either<L, B>) =>
  (either: Either<L, R>): Either<L, B> =>
    isRight(either) ? fn(either.right) : either;

/**
 * Alternative name for chain (common in functional programming)
 */
export const flatMap = chain;

/**
 * Alternative name for chain (common in Rust/Swift)
 */
export const andThen = chain;

/**
 * Match on Either variants (pattern matching)
 * Exhaustive case analysis that handles both Left and Right
 *
 * @template L - Left type
 * @template R - Right type
 * @template T - Return type
 * @param patterns - Object with left and right handlers
 * @returns Function that matches on Either
 *
 * @example
 * const either = right<string[], number>(42);
 * const message = match({
 *   left: (errors) => `Errors: ${errors.join(', ')}`,
 *   right: (value) => `Success: ${value}`
 * })(either); // "Success: 42"
 */
export const match = <L, R, T>(patterns: {
  readonly left: (value: L) => T;
  readonly right: (value: R) => T;
}) =>
  (either: Either<L, R>): T =>
    isLeft(either) ? patterns.left(either.left) : patterns.right(either.right);

/**
 * Get right value or default if Left
 * Extracts value from Right, or returns default for Left
 *
 * @template L - Left type
 * @template R - Right type
 * @param defaultValue - Value to return if Left
 * @returns Function that extracts value or default
 *
 * @example
 * const error = left<string[], number>(['Failed']);
 * const value = getOrElse(0)(error); // 0
 *
 * const success = right<string[], number>(42);
 * const value2 = getOrElse(0)(success); // 42
 */
export const getOrElse = <L, R>(defaultValue: R) =>
  (either: Either<L, R>): R =>
    isRight(either) ? either.right : defaultValue;

/**
 * Get right value or compute default if Left
 * Lazy version of getOrElse, only evaluates default if needed
 *
 * @template L - Left type
 * @template R - Right type
 * @param fn - Function to compute default value
 * @returns Function that extracts value or computes default
 *
 * @example
 * const error = left<string[], number>(['Failed']);
 * const value = getOrElseLazy((errs) => errs.length)(error); // 1
 */
export const getOrElseLazy = <L, R>(fn: (left: L) => R) =>
  (either: Either<L, R>): R =>
    isRight(either) ? either.right : fn(either.left);

/**
 * Unwrap an Either right value (unsafe)
 * Throws if Either is Left. Use only when you know Either is Right.
 *
 * @template L - Left type
 * @template R - Right type
 * @param either - Either to unwrap
 * @returns Right value if Right
 * @throws Error if Left
 */
export const unwrap = <L, R>(either: Either<L, R>): R => {
  if (isLeft(either)) {
    throw new Error(`Attempted to unwrap Left value: ${JSON.stringify(either.left)}`);
  }
  return either.right;
};

/**
 * Unwrap an Either left value (unsafe)
 * Throws if Either is Right. Use only when you know Either is Left.
 *
 * @template L - Left type
 * @template R - Right type
 * @param either - Either to unwrap
 * @returns Left value if Left
 * @throws Error if Right
 */
export const unwrapLeft = <L, R>(either: Either<L, R>): L => {
  if (isRight(either)) {
    throw new Error('Attempted to unwrap Right value as Left');
  }
  return either.left;
};

/**
 * Apply a function in an Either to a value in an Either (applicative)
 *
 * @template L - Left type
 * @template R - Input type
 * @template B - Output type
 * @param fn - Either containing function
 * @returns Function that applies Either function to Either value
 */
export const ap = <L, R, B>(fn: Either<L, (value: R) => B>) =>
  (either: Either<L, R>): Either<L, B> =>
    isRight(fn) && isRight(either)
      ? right(fn.right(either.right))
      : isLeft(fn)
      ? fn
      : either as Either<L, B>;

/**
 * Combine two Eithers with a binary function
 * Both must be Right for result to be Right
 *
 * @template L - Left type
 * @template A - First right type
 * @template B - Second right type
 * @template C - Output type
 * @param fn - Binary function
 * @returns Function that combines two Eithers
 */
export const map2 = <L, A, B, C>(fn: (a: A, b: B) => C) =>
  (e1: Either<L, A>) =>
  (e2: Either<L, B>): Either<L, C> =>
    isRight(e1) && isRight(e2)
      ? right(fn(e1.right, e2.right))
      : isLeft(e1)
      ? e1
      : e2 as Either<L, C>;

/**
 * Execute side effect if Right, ignore if Left
 * Useful for logging, analytics, etc.
 *
 * @template L - Left type
 * @template R - Right type
 * @param fn - Side effect function
 * @returns Function that performs side effect and returns Either unchanged
 */
export const tap = <L, R>(fn: (value: R) => void) =>
  (either: Either<L, R>): Either<L, R> => {
    if (isRight(either)) {
      fn(either.right);
    }
    return either;
  };

/**
 * Execute side effect if Left, ignore if Right
 * Useful for error logging
 *
 * @template L - Left type
 * @template R - Right type
 * @param fn - Side effect function for left values
 * @returns Function that performs side effect and returns Either unchanged
 */
export const tapLeft = <L, R>(fn: (value: L) => void) =>
  (either: Either<L, R>): Either<L, R> => {
    if (isLeft(either)) {
      fn(either.left);
    }
    return either;
  };

/**
 * Swap Left and Right
 * Left becomes Right, Right becomes Left
 *
 * @template L - Left type
 * @template R - Right type
 * @param either - Either to swap
 * @returns Swapped Either
 */
export const swap = <L, R>(either: Either<L, R>): Either<R, L> =>
  isLeft(either) ? right(either.left) : left(either.right);

/**
 * Combine array of Eithers into Either of array
 * Returns Right with all values if all are Right, otherwise first Left
 *
 * @template L - Left type
 * @template R - Right type
 * @param eithers - Array of Eithers
 * @returns Either containing array of values or first left
 *
 * @example
 * const eithers = [right(1), right(2), right(3)];
 * const combined = all(eithers); // Right([1, 2, 3])
 *
 * const withError = [right(1), left(['Error']), right(3)];
 * const result = all(withError); // Left(['Error'])
 */
export const all = <L, R>(
  eithers: readonly Either<L, R>[]
): Either<L, readonly R[]> => {
  const values: R[] = [];

  for (const either of eithers) {
    if (isLeft(either)) {
      return either;
    }
    values.push(either.right);
  }

  return right(Object.freeze(values));
};

/**
 * Return first Right from array of Eithers, or last Left if all fail
 *
 * @template L - Left type
 * @template R - Right type
 * @param eithers - Array of Eithers
 * @returns First Right or last Left
 */
export const any = <L, R>(eithers: readonly Either<L, R>[]): Either<L, R> => {
  let lastLeft: Either<L, R> | null = null;

  for (const either of eithers) {
    if (isRight(either)) {
      return either;
    }
    lastLeft = either;
  }

  return lastLeft || left('No eithers provided' as any);
};

/**
 * Convert a throwing function to an Either-returning function
 * Catches exceptions and converts to Left
 *
 * @template T - Input type
 * @template R - Output type
 * @param fn - Potentially throwing function
 * @returns Function that returns Either instead of throwing
 *
 * @example
 * const safeParse = tryCatch(JSON.parse);
 * const result = safeParse('{"valid": true}'); // Right({valid: true})
 * const error = safeParse('{invalid}'); // Left(Error)
 */
export const tryCatch = <T extends readonly any[], R>(fn: (...args: T) => R) =>
  (...args: T): Either<Error, R> => {
    try {
      return right(fn(...args));
    } catch (error) {
      return left(error instanceof Error ? error : new Error(String(error)));
    }
  };

/**
 * Namespace containing all Either operations
 * Provides unified interface for Either operations
 */
export const Either = Object.freeze({
  left,
  right,
  isLeft,
  isRight,
  map,
  mapLeft,
  chain,
  flatMap,
  andThen,
  match,
  getOrElse,
  getOrElseLazy,
  unwrap,
  unwrapLeft,
  ap,
  map2,
  tap,
  tapLeft,
  swap,
  all,
  any,
  tryCatch,
});

/**
 * Type guard for Either type
 */
export const isEither = <L, R>(value: unknown): value is Either<L, R> =>
  typeof value === 'object' &&
  value !== null &&
  '_tag' in value &&
  ((value as any)._tag === 'Left' || (value as any)._tag === 'Right');

/**
 * Utility: Pipe function for composing Either transformations
 * Allows chaining operations in a readable, left-to-right manner
 *
 * @example
 * const result = pipe(
 *   validateEmail('user@example.com'),
 *   map(email => email.toLowerCase()),
 *   chain(validateDomain)
 * );
 */
export function pipe<L, A>(value: Either<L, A>): Either<L, A>;
export function pipe<L, A, B>(
  value: Either<L, A>,
  fn1: (a: Either<L, A>) => Either<L, B>
): Either<L, B>;
export function pipe<L, A, B, C>(
  value: Either<L, A>,
  fn1: (a: Either<L, A>) => Either<L, B>,
  fn2: (b: Either<L, B>) => Either<L, C>
): Either<L, C>;
export function pipe<L, A, B, C, D>(
  value: Either<L, A>,
  fn1: (a: Either<L, A>) => Either<L, B>,
  fn2: (b: Either<L, B>) => Either<L, C>,
  fn3: (c: Either<L, C>) => Either<L, D>
): Either<L, D>;
export function pipe<L, A, B, C, D, E>(
  value: Either<L, A>,
  fn1: (a: Either<L, A>) => Either<L, B>,
  fn2: (b: Either<L, B>) => Either<L, C>,
  fn3: (c: Either<L, C>) => Either<L, D>,
  fn4: (d: Either<L, D>) => Either<L, E>
): Either<L, E>;
export function pipe(value: any, ...fns: Array<(a: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}
