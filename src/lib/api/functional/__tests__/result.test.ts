/**
 * Result Monad Tests
 *
 * Comprehensive tests for the Result monad including:
 * - Basic operations (ok, err, isOk, isErr)
 * - Functor laws (map)
 * - Monad laws (flatMap/chain)
 * - Utility functions
 * - Edge cases
 */

import {
  Result,
  ok,
  err,
  isOk,
  isErr,
  map,
  mapError,
  flatMap,
  match,
  getOrElse,
  toOption,
  unwrap,
  tryCatch,
  fromPromise,
  all,
  any,
} from '../result';

import {
  testPureFunction,
  testFunctorIdentityLaw,
  testFunctorCompositionLaw,
  testMonadLeftIdentity,
  testMonadRightIdentity,
  testMonadAssociativity,
  expectOk,
  expectErr,
  registerResultMatchers,
} from '@/lib/testing';

beforeAll(() => {
  registerResultMatchers();
});

describe('Result Monad', () => {
  describe('Constructors', () => {
    test('ok creates Ok Result', () => {
      const result = ok(42);
      expect(result).toBeOk();
      expect(expectOk(result)).toBe(42);
    });

    test('err creates Err Result', () => {
      const result = err('error');
      expect(result).toBeErr();
      expect(expectErr(result)).toBe('error');
    });

    test('Result.ok is same as ok', () => {
      expect(Result.ok(42)).toEqual(ok(42));
    });

    test('Result.err is same as err', () => {
      expect(Result.err('error')).toEqual(err('error'));
    });
  });

  describe('Type Guards', () => {
    test('isOk returns true for Ok', () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
    });

    test('isErr returns true for Err', () => {
      const result = err('error');
      expect(isOk(result)).toBe(false);
      expect(isErr(result)).toBe(true);
    });

    test('Result.isOk is same as isOk', () => {
      const result = ok(42);
      expect(Result.isOk(result)).toBe(isOk(result));
    });

    test('Result.isErr is same as isErr', () => {
      const result = err('error');
      expect(Result.isErr(result)).toBe(isErr(result));
    });
  });

  describe('Functor: map', () => {
    test('map transforms Ok value', () => {
      const result = ok(5);
      const doubled = map((x: number) => x * 2)(result);

      expect(doubled).toBeOk();
      expect(expectOk(doubled)).toBe(10);
    });

    test('map passes through Err', () => {
      const result = err('error');
      const doubled = map((x: number) => x * 2)(result);

      expect(doubled).toBeErr();
      expect(expectErr(doubled)).toBe('error');
    });

    test('map is pure', () => {
      testPureFunction(
        map((x: number) => x * 2),
        [
          [ok(5), ok(10)],
          [ok(0), ok(0)],
          [err('error'), err('error')],
        ]
      );
    });

    test('functor identity law: map(id) === id', () => {
      const result = ok(42);
      const id = <T>(x: T): T => x;
      const mapped = map(id)(result);

      expect(mapped).toEqual(result);
    });

    test('functor composition law', () => {
      const f = (x: number) => x + 1;
      const g = (x: number) => x * 2;
      const result = ok(5);

      const left = map((x: number) => g(f(x)))(result);
      const right = map(g)(map(f)(result));

      expect(left).toEqual(right);
    });
  });

  describe('mapError', () => {
    test('mapError transforms Err value', () => {
      const result = err('error');
      const mapped = mapError((e: string) => e.toUpperCase())(result);

      expect(mapped).toBeErr();
      expect(expectErr(mapped)).toBe('ERROR');
    });

    test('mapError passes through Ok', () => {
      const result = ok(42);
      const mapped = mapError((e: string) => e.toUpperCase())(result);

      expect(mapped).toBeOk();
      expect(expectOk(mapped)).toBe(42);
    });
  });

  describe('Monad: flatMap', () => {
    test('flatMap chains Ok values', () => {
      const divide = (a: number) => (b: number) =>
        b === 0 ? err('Division by zero') : ok(a / b);

      const result = ok(10);
      const chained = flatMap(divide(5))(result);

      expect(chained).toBeOk();
      expect(expectOk(chained)).toBe(2);
    });

    test('flatMap short-circuits on Err', () => {
      const divide = (a: number) => (b: number) =>
        b === 0 ? err('Division by zero') : ok(a / b);

      const result = err('Previous error');
      const chained = flatMap(divide(5))(result);

      expect(chained).toBeErr();
      expect(expectErr(chained)).toBe('Previous error');
    });

    test('flatMap propagates error', () => {
      const divide = (a: number) => (b: number) =>
        b === 0 ? err('Division by zero') : ok(a / b);

      const result = ok(0);
      const chained = flatMap(divide(5))(result);

      expect(chained).toBeErr();
      expect(expectErr(chained)).toBe('Division by zero');
    });

    test('monad left identity: return(a).flatMap(f) === f(a)', () => {
      const f = (x: number) => ok(x * 2);
      const value = 5;

      testMonadLeftIdentity(ok, flatMap, f, value);
    });

    test('monad right identity: m.flatMap(return) === m', () => {
      const monad = ok(42);

      testMonadRightIdentity(monad, flatMap, ok);
    });

    test('monad associativity', () => {
      const monad = ok(5);
      const f = (x: number) => ok(x + 1);
      const g = (x: number) => ok(x * 2);

      testMonadAssociativity(monad, flatMap, f, g);
    });
  });

  describe('Pattern Matching: match', () => {
    test('match handles Ok case', () => {
      const result = ok(42);
      const value = match({
        ok: (v) => `Success: ${v}`,
        err: (e) => `Error: ${e}`,
      })(result);

      expect(value).toBe('Success: 42');
    });

    test('match handles Err case', () => {
      const result = err('failed');
      const value = match({
        ok: (v) => `Success: ${v}`,
        err: (e) => `Error: ${e}`,
      })(result);

      expect(value).toBe('Error: failed');
    });

    test('match is exhaustive', () => {
      const result = ok(42);
      const value = match({
        ok: (v) => v * 2,
        err: () => 0,
      })(result);

      expect(value).toBe(84);
    });
  });

  describe('Utility Functions', () => {
    test('getOrElse returns value for Ok', () => {
      const result = ok(42);
      const value = getOrElse(0)(result);

      expect(value).toBe(42);
    });

    test('getOrElse returns default for Err', () => {
      const result = err('error');
      const value = getOrElse(0)(result);

      expect(value).toBe(0);
    });

    test('toOption converts Ok to value', () => {
      const result = ok(42);
      const option = toOption(result);

      expect(option).toBe(42);
    });

    test('toOption converts Err to null', () => {
      const result = err('error');
      const option = toOption(result);

      expect(option).toBeNull();
    });

    test('unwrap returns value for Ok', () => {
      const result = ok(42);
      const value = unwrap(result);

      expect(value).toBe(42);
    });

    test('unwrap throws for Err', () => {
      const result = err('error');

      expect(() => unwrap(result)).toThrow();
    });
  });

  describe('Error Handling: tryCatch', () => {
    test('tryCatch catches exceptions', () => {
      const safeParse = tryCatch(JSON.parse);
      const result = safeParse('invalid json');

      expect(result).toBeErr();
    });

    test('tryCatch returns Ok for success', () => {
      const safeParse = tryCatch(JSON.parse);
      const result = safeParse('{"valid": true}');

      expect(result).toBeOk();
      expect(expectOk(result)).toEqual({ valid: true });
    });

    test('tryCatch is reusable', () => {
      const safeParse = tryCatch(JSON.parse);

      const result1 = safeParse('{"a": 1}');
      const result2 = safeParse('{invalid}');

      expect(result1).toBeOk();
      expect(result2).toBeErr();
    });
  });

  describe('Async: fromPromise', () => {
    test('fromPromise converts resolved promise to Ok', async () => {
      const promise = Promise.resolve(42);
      const result = await fromPromise(promise);

      expect(result).toBeOk();
      expect(expectOk(result)).toBe(42);
    });

    test('fromPromise converts rejected promise to Err', async () => {
      const promise = Promise.reject('error');
      const result = await fromPromise(promise);

      expect(result).toBeErr();
      expect(expectErr(result)).toBe('error');
    });
  });

  describe('Combinators', () => {
    test('all returns Ok with all values', () => {
      const results = [ok(1), ok(2), ok(3)];
      const combined = all(results);

      expect(combined).toBeOk();
      expect(expectOk(combined)).toEqual([1, 2, 3]);
    });

    test('all returns first Err', () => {
      const results = [ok(1), err('error'), ok(3)];
      const combined = all(results);

      expect(combined).toBeErr();
      expect(expectErr(combined)).toBe('error');
    });

    test('any returns first Ok', () => {
      const results = [err('error1'), ok(2), err('error3')];
      const combined = any(results);

      expect(combined).toBeOk();
      expect(expectOk(combined)).toBe(2);
    });

    test('any returns last Err if all fail', () => {
      const results = [err('error1'), err('error2'), err('error3')];
      const combined = any(results);

      expect(combined).toBeErr();
      expect(expectErr(combined)).toBe('error3');
    });
  });

  describe('Immutability', () => {
    test('Result is frozen', () => {
      const result = ok(42);

      expect(Object.isFrozen(result)).toBe(true);
    });

    test('modifying Result throws in strict mode', () => {
      const result = ok(42);

      expect(() => {
        (result as any).value = 100;
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('handles null values', () => {
      const result = ok(null);

      expect(result).toBeOk();
      expect(expectOk(result)).toBeNull();
    });

    test('handles undefined values', () => {
      const result = ok(undefined);

      expect(result).toBeOk();
      expect(expectOk(result)).toBeUndefined();
    });

    test('handles complex objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const result = ok(obj);

      expect(result).toBeOk();
      expect(expectOk(result)).toEqual(obj);
    });

    test('handles arrays', () => {
      const arr = [1, 2, 3];
      const result = ok(arr);

      expect(result).toBeOk();
      expect(expectOk(result)).toEqual(arr);
    });
  });
});
