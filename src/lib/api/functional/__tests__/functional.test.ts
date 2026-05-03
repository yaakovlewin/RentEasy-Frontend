/**
 * Comprehensive Functional Programming Tests
 *
 * Tests for Result, Option, Compose, Validators, and core FP utilities.
 */

import {
  // Result
  ok, err, isOk, isErr, map as mapResult, flatMap, match, getOrElse, all as allResults,
  // Option
  some, none, isSome, isNone, fromNullable, map as mapOption, filter,
  // Compose
  pipe, compose, curry2, curry3, constant, identity, tap, memoize,
  // Validators
  required, isString, isNumber, minLength, maxLength, email, allOf,
} from '../index';

describe('Functional Programming - Core Features', () => {
  describe('Result Monad', () => {
    test('ok creates Ok variant', () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
    });

    test('err creates Err variant', () => {
      const result = err('error');
      expect(isErr(result)).toBe(true);
    });

    test('map transforms Ok value', () => {
      const result = ok(5);
      const mapped = mapResult((x: number) => x * 2)(result);
      expect(getOrElse(0)(mapped)).toBe(10);
    });

    test('flatMap chains operations', () => {
      const divide = (a: number) => (b: number) =>
        b === 0 ? err('Division by zero') : ok(a / b);

      const result = ok(10);
      const chained = flatMap(divide(5))(result);
      expect(getOrElse(0)(chained)).toBe(2);
    });

    test('match handles both cases', () => {
      const result = ok(42);
      const message = match({
        ok: (v) => `Success: ${v}`,
        err: (e) => `Error: ${e}`,
      })(result);
      expect(message).toBe('Success: 42');
    });

    test('all combines results', () => {
      const results = [ok(1), ok(2), ok(3)];
      const combined = allResults(results);
      expect(isOk(combined)).toBe(true);
    });
  });

  describe('Option Monad', () => {
    test('some creates Some variant', () => {
      const option = some(42);
      expect(isSome(option)).toBe(true);
    });

    test('none creates None variant', () => {
      const option = none();
      expect(isNone(option)).toBe(true);
    });

    test('fromNullable converts null to None', () => {
      const option = fromNullable(null);
      expect(isNone(option)).toBe(true);
    });

    test('fromNullable converts value to Some', () => {
      const option = fromNullable(42);
      expect(isSome(option)).toBe(true);
    });

    test('map transforms Some value', () => {
      const option = some(5);
      const mapped = mapOption((x: number) => x * 2)(option);
      expect(isSome(mapped)).toBe(true);
    });

    test('filter removes value if predicate fails', () => {
      const option = some(5);
      const filtered = filter((x: number) => x > 10)(option);
      expect(isNone(filtered)).toBe(true);
    });
  });

  describe('Function Composition', () => {
    test('pipe flows data left to right', () => {
      const addOne = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const result = pipe(5, addOne, double);
      expect(result).toBe(12); // (5 + 1) * 2
    });

    test('compose flows data right to left', () => {
      const addOne = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const fn = compose(double, addOne);
      expect(fn(5)).toBe(12); // (5 + 1) * 2
    });

    test('curry2 curries binary function', () => {
      const add = (a: number, b: number) => a + b;
      const curriedAdd = curry2(add);
      const add5 = curriedAdd(5);
      expect(add5(3)).toBe(8);
    });

    test('curry3 curries ternary function', () => {
      const sum3 = (a: number, b: number, c: number) => a + b + c;
      const curriedSum = curry3(sum3);
      expect(curriedSum(1)(2)(3)).toBe(6);
    });

    test('constant always returns same value', () => {
      const always5 = constant(5);
      expect(always5()).toBe(5);
      expect(always5(10)).toBe(5);
    });

    test('identity returns argument unchanged', () => {
      expect(identity(42)).toBe(42);
      expect(identity('test')).toBe('test');
    });

    test('tap executes side effect and returns value', () => {
      const log: number[] = [];
      const result = pipe(
        5,
        tap((x) => log.push(x)),
        (x) => x * 2,
        tap((x) => log.push(x))
      );
      expect(result).toBe(10);
      expect(log).toEqual([5, 10]);
    });

    test('memoize caches function results', () => {
      let callCount = 0;
      const expensive = (n: number) => {
        callCount++;
        return n * 2;
      };
      const memoized = memoize(expensive);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(callCount).toBe(1); // Only called once
    });
  });

  describe('Validators', () => {
    test('required validates non-empty values', () => {
      const validator = required('email');
      const result = validator('test@example.com');
      expect(isOk(result)).toBe(true);
    });

    test('required rejects empty values', () => {
      const validator = required('email');
      const result = validator('');
      expect(isErr(result)).toBe(true);
    });

    test('isString validates string type', () => {
      const validator = isString('name');
      const result = validator('John');
      expect(isOk(result)).toBe(true);
    });

    test('isNumber validates number type', () => {
      const validator = isNumber('age');
      const result = validator(25);
      expect(isOk(result)).toBe(true);
    });

    test('minLength validates minimum length', () => {
      const validator = minLength('password', 8);
      const result = validator('password123');
      expect(isOk(result)).toBe(true);
    });

    test('minLength rejects short strings', () => {
      const validator = minLength('password', 8);
      const result = validator('short');
      expect(isErr(result)).toBe(true);
    });

    test('maxLength validates maximum length', () => {
      const validator = maxLength('name', 50);
      const result = validator('John Doe');
      expect(isOk(result)).toBe(true);
    });

    test('email validates email format', () => {
      const validator = email('email');
      const result = validator('test@example.com');
      expect(isOk(result)).toBe(true);
    });

    test('email rejects invalid format', () => {
      const validator = email('email');
      const result = validator('invalid-email');
      expect(isErr(result)).toBe(true);
    });

    test('allOf combines validators', () => {
      const validator = allOf(
        required('name'),
        isString('name'),
        minLength('name', 2),
        maxLength('name', 50)
      );
      const result = validator('John Doe');
      expect(isOk(result)).toBe(true);
    });

    test('allOf returns first error', () => {
      const validator = allOf(
        required('name'),
        isString('name'),
        minLength('name', 100)
      );
      const result = validator('John');
      expect(isErr(result)).toBe(true);
    });
  });

  describe('Integration: Pipe + Result + Validators', () => {
    test('can compose validation pipeline', () => {
      const validateEmail = (email: string) =>
        pipe(
          email,
          required('email'),
          flatMap(isString('email')),
          flatMap(email('email'))
        );

      const result = validateEmail('test@example.com');
      expect(isOk(result)).toBe(true);
    });

    test('validation pipeline stops at first error', () => {
      const validateEmail = (email: string) =>
        pipe(
          email,
          required('email'),
          flatMap(isString('email')),
          flatMap(email('email'))
        );

      const result = validateEmail('');
      expect(isErr(result)).toBe(true);
    });
  });

  describe('Immutability', () => {
    test('Result values are frozen', () => {
      const result = ok(42);
      expect(Object.isFrozen(result)).toBe(true);
    });

    test('Option values are frozen', () => {
      const option = some(42);
      expect(Object.isFrozen(option)).toBe(true);
    });

    test('arrays in results are frozen', () => {
      const results = [ok(1), ok(2), ok(3)];
      const combined = allResults(results);
      if (isOk(combined)) {
        expect(Object.isFrozen(combined.value)).toBe(true);
      }
    });
  });
});
