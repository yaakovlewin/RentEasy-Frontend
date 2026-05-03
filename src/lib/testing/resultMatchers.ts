/**
 * Custom Jest Matchers for Result Monad
 *
 * Provides custom Jest matchers for testing Result types in a more expressive way
 */

import type { Result } from '@/lib/api/functional/result';
import { isOk, isErr } from '@/lib/api/functional/result';

/**
 * Custom matcher types for TypeScript
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOk(): R;
      toBeErr(): R;
      toBeOkWith<T>(expectedValue: T): R;
      toBeErrWith<E>(expectedError: E): R;
      toBeOkWithSatisfying<T>(predicate: (value: T) => boolean): R;
      toBeErrWithSatisfying<E>(predicate: (error: E) => boolean): R;
    }
  }
}

/**
 * Matcher to check if Result is Ok
 */
const toBeOk = <T, E>(received: Result<T, E>) => {
  const pass = isOk(received);

  return {
    pass,
    message: () =>
      pass
        ? `expected Result not to be Ok, but it was Ok with value: ${JSON.stringify(
            (received as any).value
          )}`
        : `expected Result to be Ok, but it was Err with error: ${JSON.stringify(
            (received as any).error
          )}`,
  };
};

/**
 * Matcher to check if Result is Err
 */
const toBeErr = <T, E>(received: Result<T, E>) => {
  const pass = isErr(received);

  return {
    pass,
    message: () =>
      pass
        ? `expected Result not to be Err, but it was Err with error: ${JSON.stringify(
            (received as any).error
          )}`
        : `expected Result to be Err, but it was Ok with value: ${JSON.stringify(
            (received as any).value
          )}`,
  };
};

/**
 * Matcher to check if Result is Ok with specific value
 */
const toBeOkWith = <T, E>(received: Result<T, E>, expectedValue: T) => {
  const isOkResult = isOk(received);
  const pass = isOkResult && received.value === expectedValue;

  return {
    pass,
    message: () => {
      if (!isOkResult) {
        return `expected Result to be Ok with value: ${JSON.stringify(
          expectedValue
        )}, but it was Err with error: ${JSON.stringify((received as any).error)}`;
      }
      return `expected Result to be Ok with value: ${JSON.stringify(
        expectedValue
      )}, but got: ${JSON.stringify(received.value)}`;
    },
  };
};

/**
 * Matcher to check if Result is Err with specific error
 */
const toBeErrWith = <T, E>(received: Result<T, E>, expectedError: E) => {
  const isErrResult = isErr(received);
  const pass = isErrResult && received.error === expectedError;

  return {
    pass,
    message: () => {
      if (!isErrResult) {
        return `expected Result to be Err with error: ${JSON.stringify(
          expectedError
        )}, but it was Ok with value: ${JSON.stringify((received as any).value)}`;
      }
      return `expected Result to be Err with error: ${JSON.stringify(
        expectedError
      )}, but got: ${JSON.stringify(received.error)}`;
    },
  };
};

/**
 * Matcher to check if Result is Ok and value satisfies predicate
 */
const toBeOkWithSatisfying = <T, E>(
  received: Result<T, E>,
  predicate: (value: T) => boolean
) => {
  const isOkResult = isOk(received);
  const pass = isOkResult && predicate(received.value);

  return {
    pass,
    message: () => {
      if (!isOkResult) {
        return `expected Result to be Ok satisfying predicate, but it was Err with error: ${JSON.stringify(
          (received as any).error
        )}`;
      }
      return `expected Result value to satisfy predicate, but got: ${JSON.stringify(
        received.value
      )}`;
    },
  };
};

/**
 * Matcher to check if Result is Err and error satisfies predicate
 */
const toBeErrWithSatisfying = <T, E>(
  received: Result<T, E>,
  predicate: (error: E) => boolean
) => {
  const isErrResult = isErr(received);
  const pass = isErrResult && predicate(received.error);

  return {
    pass,
    message: () => {
      if (!isErrResult) {
        return `expected Result to be Err satisfying predicate, but it was Ok with value: ${JSON.stringify(
          (received as any).value
        )}`;
      }
      return `expected Result error to satisfy predicate, but got: ${JSON.stringify(
        received.error
      )}`;
    },
  };
};

/**
 * Register all custom matchers with Jest
 * Call this in your test setup file
 */
export const registerResultMatchers = (): void => {
  expect.extend({
    toBeOk,
    toBeErr,
    toBeOkWith,
    toBeErrWith,
    toBeOkWithSatisfying,
    toBeErrWithSatisfying,
  });
};

/**
 * Export individual matchers for direct use
 */
export const resultMatchers = {
  toBeOk,
  toBeErr,
  toBeOkWith,
  toBeErrWith,
  toBeOkWithSatisfying,
  toBeErrWithSatisfying,
};

/**
 * Helper to create matcher message
 */
const createMatcherMessage = (
  pass: boolean,
  passMessage: string,
  failMessage: string
) => ({
  pass,
  message: () => (pass ? passMessage : failMessage),
});

/**
 * Additional matcher utilities
 */
export const matcherUtils = {
  /**
   * Deep equality check for Result values
   */
  toEqualOk: <T, E>(received: Result<T, E>, expectedValue: T) => {
    const isOkResult = isOk(received);

    if (!isOkResult) {
      return createMatcherMessage(
        false,
        '',
        `expected Result to be Ok with value: ${JSON.stringify(
          expectedValue
        )}, but it was Err`
      );
    }

    const pass =
      JSON.stringify(received.value) === JSON.stringify(expectedValue);

    return createMatcherMessage(
      pass,
      `expected Result not to equal Ok(${JSON.stringify(expectedValue)})`,
      `expected Result to equal Ok(${JSON.stringify(
        expectedValue
      )}), but got Ok(${JSON.stringify(received.value)})`
    );
  },

  /**
   * Deep equality check for Result errors
   */
  toEqualErr: <T, E>(received: Result<T, E>, expectedError: E) => {
    const isErrResult = isErr(received);

    if (!isErrResult) {
      return createMatcherMessage(
        false,
        '',
        `expected Result to be Err with error: ${JSON.stringify(
          expectedError
        )}, but it was Ok`
      );
    }

    const pass =
      JSON.stringify(received.error) === JSON.stringify(expectedError);

    return createMatcherMessage(
      pass,
      `expected Result not to equal Err(${JSON.stringify(expectedError)})`,
      `expected Result to equal Err(${JSON.stringify(
        expectedError
      )}), but got Err(${JSON.stringify(received.error)})`
    );
  },
};

/**
 * Example usage in tests:
 *
 * import { registerResultMatchers } from '@/lib/testing/resultMatchers';
 *
 * beforeAll(() => {
 *   registerResultMatchers();
 * });
 *
 * test('Result is Ok', () => {
 *   const result = Result.ok(42);
 *   expect(result).toBeOk();
 *   expect(result).toBeOkWith(42);
 *   expect(result).toBeOkWithSatisfying(x => x > 0);
 * });
 *
 * test('Result is Err', () => {
 *   const result = Result.err('failed');
 *   expect(result).toBeErr();
 *   expect(result).toBeErrWith('failed');
 *   expect(result).toBeErrWithSatisfying(e => e.includes('fail'));
 * });
 */
