/**
 * Function Composition Utilities
 *
 * Pure functional composition tools including pipe, compose, curry, and partial application.
 * These utilities enable building complex transformations from simple functions.
 *
 * All functions are type-safe with full TypeScript inference.
 */

/**
 * Pipe functions left-to-right
 * Data flows from first function through each subsequent function
 *
 * @example
 * const addOne = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const result = pipe(5, addOne, double); // (5 + 1) * 2 = 12
 */

// Pipe with 1-10 arguments for maximum type safety
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): D;
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E
): E;
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F
): F;
export function pipe<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I
): I;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J
): J;
export function pipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K
): K;
export function pipe(value: any, ...fns: Array<(arg: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * Compose functions right-to-left
 * Mathematical function composition: (f ∘ g)(x) = f(g(x))
 *
 * @example
 * const addOne = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const fn = compose(double, addOne);
 * const result = fn(5); // (5 + 1) * 2 = 12
 */
export function compose<A>(fn1: (a: A) => A): (a: A) => A;
export function compose<A, B>(fn2: (b: A) => B, fn1: (a: A) => A): (a: A) => B;
export function compose<A, B, C>(
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => C;
export function compose<A, B, C, D>(
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => D;
export function compose<A, B, C, D, E>(
  fn5: (e: D) => E,
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => E;
export function compose<A, B, C, D, E, F>(
  fn6: (f: E) => F,
  fn5: (e: D) => E,
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => F;
export function compose<A, B, C, D, E, F, G>(
  fn7: (g: F) => G,
  fn6: (f: E) => F,
  fn5: (e: D) => E,
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => G;
export function compose<A, B, C, D, E, F, G, H>(
  fn8: (h: G) => H,
  fn7: (g: F) => G,
  fn6: (f: E) => F,
  fn5: (e: D) => E,
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => H;
export function compose<A, B, C, D, E, F, G, H, I>(
  fn9: (i: H) => I,
  fn8: (h: G) => H,
  fn7: (g: F) => G,
  fn6: (f: E) => F,
  fn5: (e: D) => E,
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => I;
export function compose<A, B, C, D, E, F, G, H, I, J>(
  fn10: (j: I) => J,
  fn9: (i: H) => I,
  fn8: (h: G) => H,
  fn7: (g: F) => G,
  fn6: (f: E) => F,
  fn5: (e: D) => E,
  fn4: (d: C) => D,
  fn3: (c: B) => C,
  fn2: (b: A) => B,
  fn1: (a: A) => A
): (a: A) => J;
export function compose(...fns: Array<(arg: any) => any>): (arg: any) => any {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value);
}

/**
 * Curry a binary function
 * Transforms f(a, b) into f(a)(b)
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * const curriedAdd = curry(add);
 * const add5 = curriedAdd(5);
 * const result = add5(3); // 8
 */
export const curry2 = <A, B, R>(fn: (a: A, b: B) => R) =>
  (a: A) =>
  (b: B): R =>
    fn(a, b);

/**
 * Curry a ternary function
 * Transforms f(a, b, c) into f(a)(b)(c)
 */
export const curry3 = <A, B, C, R>(fn: (a: A, b: B, c: C) => R) =>
  (a: A) =>
  (b: B) =>
  (c: C): R =>
    fn(a, b, c);

/**
 * Curry a 4-ary function
 * Transforms f(a, b, c, d) into f(a)(b)(c)(d)
 */
export const curry4 = <A, B, C, D, R>(fn: (a: A, b: B, c: C, d: D) => R) =>
  (a: A) =>
  (b: B) =>
  (c: C) =>
  (d: D): R =>
    fn(a, b, c, d);

/**
 * Curry a 5-ary function
 * Transforms f(a, b, c, d, e) into f(a)(b)(c)(d)(e)
 */
export const curry5 = <A, B, C, D, E, R>(
  fn: (a: A, b: B, c: C, d: D, e: E) => R
) =>
  (a: A) =>
  (b: B) =>
  (c: C) =>
  (d: D) =>
  (e: E): R =>
    fn(a, b, c, d, e);

/**
 * Generic curry that automatically curries functions
 * Works with functions of any arity
 *
 * @example
 * const sum = (a: number, b: number, c: number) => a + b + c;
 * const curriedSum = curry(sum);
 * const result = curriedSum(1)(2)(3); // 6
 */
export const curry = <T extends (...args: any[]) => any>(fn: T): any => {
  const arity = fn.length;

  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...args);
    }

    return (...nextArgs: any[]) =>
      curried(...args, ...nextArgs);
  };
};

/**
 * Partial application - fix some arguments of a function
 *
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const add5And3 = partial(add, 5, 3);
 * const result = add5And3(2); // 10
 */
export const partial = <T extends (...args: any[]) => any>(
  fn: T,
  ...fixedArgs: any[]
): ((...args: any[]) => ReturnType<T>) =>
  (...remainingArgs: any[]) =>
    fn(...fixedArgs, ...remainingArgs);

/**
 * Flip the order of arguments for a binary function
 *
 * @example
 * const divide = (a: number, b: number) => a / b;
 * const divideFlipped = flip(divide);
 * const result = divideFlipped(2, 10); // 10 / 2 = 5
 */
export const flip = <A, B, R>(fn: (a: A, b: B) => R) =>
  (b: B) =>
  (a: A): R =>
    fn(a, b);

/**
 * Create a function that always returns the same value
 * Useful for default values in functional pipelines
 *
 * @example
 * const always5 = constant(5);
 * console.log(always5()); // 5
 * console.log(always5(10)); // 5
 */
export const constant = <T>(value: T) =>
  (..._args: any[]): T =>
    value;

/**
 * Identity function - returns its argument unchanged
 * Useful as a no-op in functional pipelines
 *
 * @example
 * const value = identity(42); // 42
 */
export const identity = <T>(value: T): T => value;

/**
 * Tap function - execute side effect and return value unchanged
 * Useful for debugging in pipelines
 *
 * @example
 * const result = pipe(
 *   5,
 *   x => x * 2,
 *   tap(x => console.log('Current value:', x)),
 *   x => x + 1
 * ); // Logs: Current value: 10, Returns: 11
 */
export const tap = <T>(fn: (value: T) => void) =>
  (value: T): T => {
    fn(value);
    return value;
  };

/**
 * Memoize a function - cache results based on arguments
 * Returns cached result for previously seen arguments
 *
 * @example
 * const expensiveCalc = (n: number) => { / * expensive * / return n * 2; };
 * const memoized = memoize(expensiveCalc);
 * memoized(5); // Calculates
 * memoized(5); // Returns cached result
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Debounce a function - delay execution until after wait time has passed
 * Useful for reducing API calls on user input
 *
 * @example
 * const search = debounce((query: string) => api.search(query), 300);
 * search('a'); // Not called yet
 * search('ab'); // Not called yet
 * search('abc'); // Called after 300ms
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, wait);
  };
};

/**
 * Throttle a function - ensure it's only called once per time period
 * Useful for scroll/resize event handlers
 *
 * @example
 * const handleScroll = throttle(() => console.log('Scrolled'), 100);
 * window.addEventListener('scroll', handleScroll);
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Once - ensure function is only called once
 * Subsequent calls return the cached result
 *
 * @example
 * const initialize = once(() => { / * setup * / return 'initialized'; });
 * initialize(); // Runs setup, returns 'initialized'
 * initialize(); // Returns 'initialized' without running setup
 */
export const once = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  let called = false;
  let result: ReturnType<T>;

  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
};

/**
 * Negate a predicate function
 * Returns true if predicate returns false, and vice versa
 *
 * @example
 * const isEven = (n: number) => n % 2 === 0;
 * const isOdd = not(isEven);
 * isOdd(3); // true
 */
export const not = <T extends (...args: any[]) => boolean>(
  predicate: T
): T =>
  ((...args: Parameters<T>): boolean => !predicate(...args)) as T;

/**
 * Combine predicates with AND logic
 * Returns true only if all predicates return true
 *
 * @example
 * const isPositive = (n: number) => n > 0;
 * const isEven = (n: number) => n % 2 === 0;
 * const isPositiveEven = allPass([isPositive, isEven]);
 * isPositiveEven(4); // true
 * isPositiveEven(-4); // false
 */
export const allPass = <T extends readonly any[]>(
  predicates: ReadonlyArray<(...args: T) => boolean>
) =>
  (...args: T): boolean =>
    predicates.every(predicate => predicate(...args));

/**
 * Combine predicates with OR logic
 * Returns true if any predicate returns true
 *
 * @example
 * const isZero = (n: number) => n === 0;
 * const isNegative = (n: number) => n < 0;
 * const isZeroOrNegative = anyPass([isZero, isNegative]);
 * isZeroOrNegative(-5); // true
 * isZeroOrNegative(5); // false
 */
export const anyPass = <T extends readonly any[]>(
  predicates: ReadonlyArray<(...args: T) => boolean>
) =>
  (...args: T): boolean =>
    predicates.some(predicate => predicate(...args));

/**
 * Safe property access - returns Option instead of throwing
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const getC = prop('a', prop('b', prop('c')));
 * getC(obj); // Some(42)
 */
export const prop = <K extends PropertyKey>(key: K) =>
  <T extends Record<K, any>>(obj: T): T[K] | undefined =>
    obj?.[key];

/**
 * Safe nested property access
 *
 * @example
 * const obj = { user: { name: 'John' } };
 * const name = path(['user', 'name'], obj); // 'John'
 */
export const path = <T>(keys: readonly PropertyKey[]) =>
  (obj: any): T | undefined =>
    keys.reduce((acc, key) => acc?.[key], obj);

/**
 * Namespace containing all composition utilities
 */
export const Compose = Object.freeze({
  pipe,
  compose,
  curry,
  curry2,
  curry3,
  curry4,
  curry5,
  partial,
  flip,
  constant,
  identity,
  tap,
  memoize,
  debounce,
  throttle,
  once,
  not,
  allPass,
  anyPass,
  prop,
  path,
});
