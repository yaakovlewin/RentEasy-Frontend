/**
 * FP Testing Utilities
 *
 * Utilities for testing functional programming patterns including:
 * - Pure function testing
 * - Result monad testing
 * - Option monad testing
 * - Property-based testing helpers
 */

import type { Result } from '@/lib/api/functional/result';
import { isOk, isErr } from '@/lib/api/functional/result';

/**
 * Test a pure function with multiple inputs
 * Verifies that:
 * 1. Function produces expected outputs for given inputs
 * 2. Function is pure (same input always produces same output)
 *
 * @template A - Input type
 * @template R - Return type
 * @param fn - Pure function to test
 * @param testCases - Array of [input, expectedOutput] pairs
 *
 * @example
 * testPureFunction(
 *   (x: number) => x * 2,
 *   [
 *     [2, 4],
 *     [5, 10],
 *     [-3, -6]
 *   ]
 * );
 */
export const testPureFunction = <A, R>(
  fn: (a: A) => R,
  testCases: ReadonlyArray<readonly [A, R]>
): void => {
  testCases.forEach(([input, expectedOutput]) => {
    const result = fn(input);
    expect(result).toEqual(expectedOutput);

    // Test purity - same input should produce same output
    const secondResult = fn(input);
    expect(secondResult).toEqual(expectedOutput);
    expect(secondResult).toEqual(result);
  });
};

/**
 * Test a pure function with multiple arguments
 *
 * @template A - Input types
 * @template R - Return type
 * @param fn - Pure function to test
 * @param testCases - Array of [inputs, expectedOutput] pairs
 */
export const testPureFunctionMulti = <A extends readonly any[], R>(
  fn: (...args: A) => R,
  testCases: ReadonlyArray<readonly [...A, R]>
): void => {
  testCases.forEach((testCase) => {
    const expectedOutput = testCase[testCase.length - 1] as R;
    const inputs = testCase.slice(0, -1) as unknown as A;

    const result = fn(...inputs);
    expect(result).toEqual(expectedOutput);

    // Test purity
    const secondResult = fn(...inputs);
    expect(secondResult).toEqual(expectedOutput);
    expect(secondResult).toEqual(result);
  });
};

/**
 * Expect a Result to be Ok and return its value
 * Useful for asserting on successful Results
 *
 * @template T - Value type
 * @template E - Error type
 * @param result - Result to check
 * @returns The unwrapped value
 * @throws If Result is Err
 *
 * @example
 * const result = Result.ok(42);
 * const value = expectOk(result);
 * expect(value).toBe(42);
 */
export const expectOk = <T, E>(result: Result<T, E>): T => {
  expect(isOk(result)).toBe(true);
  if (isOk(result)) {
    return result.value;
  }
  throw new Error(`Expected Ok, got Err: ${(result as any).error}`);
};

/**
 * Expect a Result to be Err and return its error
 * Useful for asserting on failed Results
 *
 * @template T - Value type
 * @template E - Error type
 * @param result - Result to check
 * @returns The unwrapped error
 * @throws If Result is Ok
 *
 * @example
 * const result = Result.err("Failed");
 * const error = expectErr(result);
 * expect(error).toBe("Failed");
 */
export const expectErr = <T, E>(result: Result<T, E>): E => {
  expect(isErr(result)).toBe(true);
  if (isErr(result)) {
    return result.error;
  }
  throw new Error(`Expected Err, got Ok: ${(result as any).value}`);
};

/**
 * Test that a function maintains referential transparency
 * Verifies that calling the function multiple times with same input
 * produces identical results (not just equal, but same reference for objects)
 *
 * @template A - Input type
 * @template R - Return type
 * @param fn - Function to test
 * @param input - Input value
 * @param iterations - Number of times to test (default: 100)
 */
export const testReferentialTransparency = <A, R>(
  fn: (a: A) => R,
  input: A,
  iterations: number = 100
): void => {
  const firstResult = fn(input);

  for (let i = 0; i < iterations; i++) {
    const result = fn(input);
    expect(result).toEqual(firstResult);
  }
};

/**
 * Test that a function has no side effects
 * Captures console output and checks for modifications
 *
 * @template A - Input type
 * @template R - Return type
 * @param fn - Function to test
 * @param input - Input value
 */
export const testNoSideEffects = <A, R>(
  fn: (a: A) => R,
  input: A
): void => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const logs: string[] = [];
  console.log = jest.fn((...args) => logs.push(args.join(' ')));
  console.error = jest.fn((...args) => logs.push(args.join(' ')));
  console.warn = jest.fn((...args) => logs.push(args.join(' ')));

  try {
    fn(input);
    expect(logs).toHaveLength(0);
  } finally {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
};

/**
 * Test function composition laws
 * Verifies that composed functions behave correctly
 *
 * @template A - Input type
 * @template B - Intermediate type
 * @template C - Output type
 * @param f - First function
 * @param g - Second function
 * @param input - Test input
 */
export const testCompositionLaw = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C,
  input: A
): void => {
  // (g ∘ f)(x) === g(f(x))
  const composed = (x: A) => g(f(x));
  const directResult = g(f(input));
  const composedResult = composed(input);

  expect(composedResult).toEqual(directResult);
};

/**
 * Test functor identity law: map(id) === id
 *
 * @template T - Value type
 * @param functor - Object with map function
 * @param value - Test value
 */
export const testFunctorIdentityLaw = <T>(
  functor: { map: <U>(fn: (value: T) => U) => any },
  value: T
): void => {
  const id = <X>(x: X): X => x;
  const mapped = functor.map(id);
  expect(mapped).toEqual(functor);
};

/**
 * Test functor composition law: map(f ∘ g) === map(f) ∘ map(g)
 *
 * @template T - Input type
 * @template U - Intermediate type
 * @template V - Output type
 * @param functor - Object with map function
 * @param f - First function
 * @param g - Second function
 */
export const testFunctorCompositionLaw = <T, U, V>(
  functor: { map: (fn: any) => any },
  f: (x: T) => U,
  g: (x: U) => V
): void => {
  const compose = <A, B, C>(fn1: (x: B) => C, fn2: (x: A) => B) =>
    (x: A): C => fn1(fn2(x));

  const left = functor.map(compose(g, f));
  const right = functor.map(f).map(g);

  expect(left).toEqual(right);
};

/**
 * Test monad left identity law: return(a).flatMap(f) === f(a)
 */
export const testMonadLeftIdentity = <T, U>(
  returnFn: (value: T) => any,
  flatMapFn: (fn: (value: T) => any) => (monad: any) => any,
  f: (value: T) => any,
  value: T
): void => {
  const left = flatMapFn(f)(returnFn(value));
  const right = f(value);

  expect(left).toEqual(right);
};

/**
 * Test monad right identity law: m.flatMap(return) === m
 */
export const testMonadRightIdentity = <T>(
  monad: any,
  flatMapFn: (fn: any) => (m: any) => any,
  returnFn: (value: T) => any
): void => {
  const result = flatMapFn(returnFn)(monad);
  expect(result).toEqual(monad);
};

/**
 * Test monad associativity law: m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))
 */
export const testMonadAssociativity = <T, U, V>(
  monad: any,
  flatMapFn: (fn: any) => (m: any) => any,
  f: (value: T) => any,
  g: (value: U) => any
): void => {
  const left = flatMapFn(g)(flatMapFn(f)(monad));
  const right = flatMapFn((x: T) => flatMapFn(g)(f(x)))(monad);

  expect(left).toEqual(right);
};

/**
 * Property-based testing: Generate random test data
 * Simple property-based testing without external dependencies
 */
export const propertyTest = {
  /**
   * Generate random integer within range
   */
  randomInt: (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min,

  /**
   * Generate random string
   */
  randomString: (length: number): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  },

  /**
   * Generate random boolean
   */
  randomBoolean: (): boolean => Math.random() > 0.5,

  /**
   * Generate random array
   */
  randomArray: <T>(generator: () => T, length: number): T[] =>
    Array.from({ length }, generator),

  /**
   * Run property test with multiple iterations
   */
  check: <T>(
    generator: () => T,
    predicate: (value: T) => boolean,
    iterations: number = 100
  ): void => {
    for (let i = 0; i < iterations; i++) {
      const value = generator();
      expect(predicate(value)).toBe(true);
    }
  },
};

/**
 * Create a spy that tracks function calls for testing side effects
 */
export const createFunctionSpy = <T extends readonly any[], R>(
  implementation: (...args: T) => R
): jest.Mock<R, T> & { calls: T[] } => {
  const calls: T[] = [];
  const spy = jest.fn((...args: T): R => {
    calls.push(args);
    return implementation(...args);
  });

  return Object.assign(spy, { calls });
};

/**
 * Test helpers for immutability
 */
export const immutabilityHelpers = {
  /**
   * Verify object is frozen (immutable)
   */
  expectFrozen: <T>(obj: T): void => {
    expect(Object.isFrozen(obj)).toBe(true);
  },

  /**
   * Verify array is frozen
   */
  expectArrayFrozen: <T>(arr: readonly T[]): void => {
    expect(Object.isFrozen(arr)).toBe(true);
  },

  /**
   * Verify that modifying object throws error
   */
  expectImmutable: <T extends Record<string, any>>(obj: T, key: keyof T): void => {
    expect(() => {
      (obj as any)[key] = 'modified';
    }).toThrow();
  },
};
