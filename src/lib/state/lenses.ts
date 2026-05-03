/**
 * Functional State Management - Lens System
 *
 * This module provides functional lenses for composable, type-safe deep state updates.
 * Lenses allow focusing on and updating nested structures in a pure, immutable way.
 *
 * Team B - Dev 2 (Lens Systems Specialist), Dev 4 (Type Systems Specialist)
 */

import { deepFreeze } from './stateUpdaters';

/**
 * Lens type definition
 * A lens focuses on a part of a larger structure
 */
export interface Lens<S, A> {
  readonly get: (s: S) => A;
  readonly set: (a: A) => (s: S) => S;
}

/**
 * Creates a lens with getter and setter functions
 *
 * @param get - Function to get the focused value
 * @param set - Function to set the focused value
 * @returns A lens object
 *
 * @example
 * ```typescript
 * const nameLens = lens<User, string>(
 *   (user) => user.name,
 *   (name) => (user) => ({ ...user, name })
 * );
 * ```
 */
export const lens = <S, A>(
  get: (s: S) => A,
  set: (a: A) => (s: S) => S
): Lens<S, A> => {
  const frozenSet = (a: A) => (s: S) => {
    const result = set(a)(s);
    return process.env.NODE_ENV === 'development'
      ? (Object.freeze(result) as S)
      : result;
  };

  return Object.freeze({ get, set: frozenSet });
};

/**
 * Creates a lens that focuses on a property of an object
 *
 * @param key - Property key to focus on
 * @returns A lens for the property
 *
 * @example
 * ```typescript
 * const nameLens = prop<User>()('name');
 * const name = view(nameLens, user);
 * const newUser = set(nameLens, 'John', user);
 * ```
 */
export const prop = <S>() => <K extends keyof S>(key: K): Lens<S, S[K]> => {
  return lens<S, S[K]>(
    (s) => s[key],
    (a) => (s) => ({ ...s, [key]: a } as S)
  );
};

/**
 * Composes two lenses to create a lens that focuses deeper
 *
 * @param outer - Outer lens
 * @param inner - Inner lens
 * @returns Composed lens
 *
 * @example
 * ```typescript
 * const addressLens = prop<User>()('address');
 * const cityLens = prop<Address>()('city');
 * const userCityLens = composeLens(addressLens, cityLens);
 * ```
 */
export const composeLens = <S, A, B>(
  outer: Lens<S, A>,
  inner: Lens<A, B>
): Lens<S, B> => {
  return lens<S, B>(
    (s) => inner.get(outer.get(s)),
    (b) => (s) => outer.set(inner.set(b)(outer.get(s)))(s)
  );
};

/**
 * Composes multiple lenses from left to right
 *
 * @param lenses - Array of lenses to compose
 * @returns Composed lens
 *
 * @example
 * ```typescript
 * const lens = compose(
 *   prop<State>()('user'),
 *   prop<User>()('address'),
 *   prop<Address>()('city')
 * );
 * ```
 */
export const compose = <S, A>(...lenses: any[]): Lens<S, A> => {
  return lenses.reduce(composeLens);
};

/**
 * Views (gets) a value through a lens
 *
 * @param lens - Lens to view through
 * @param state - State to view
 * @returns Focused value
 *
 * @example
 * ```typescript
 * const name = view(nameLens, user);
 * ```
 */
export const view = <S, A>(lens: Lens<S, A>, state: S): A => {
  return lens.get(state);
};

/**
 * Sets a value through a lens
 *
 * @param lens - Lens to set through
 * @param value - Value to set
 * @param state - State to update
 * @returns Updated state
 *
 * @example
 * ```typescript
 * const newUser = set(nameLens, 'John', user);
 * ```
 */
export const set = <S, A>(lens: Lens<S, A>, value: A, state: S): S => {
  return lens.set(value)(state);
};

/**
 * Modifies a value through a lens using a function
 *
 * @param lens - Lens to modify through
 * @param fn - Function to modify the value
 * @param state - State to update
 * @returns Updated state
 *
 * @example
 * ```typescript
 * const olderUser = over(ageLens, (age) => age + 1, user);
 * ```
 */
export const over = <S, A>(
  lens: Lens<S, A>,
  fn: (a: A) => A,
  state: S
): S => {
  return lens.set(fn(lens.get(state)))(state);
};

/**
 * Creates a lens for an array index
 *
 * @param index - Array index to focus on
 * @returns Lens for the array element
 *
 * @example
 * ```typescript
 * const firstLens = index<number>(0);
 * const first = view(firstLens, [1, 2, 3]); // 1
 * ```
 */
export const index = <A>(index: number): Lens<readonly A[], A | undefined> => {
  return lens<readonly A[], A | undefined>(
    (arr) => arr[index],
    (a) => (arr) => {
      if (a === undefined) return arr;
      const newArr = [...arr];
      newArr[index] = a;
      return process.env.NODE_ENV === 'development'
        ? Object.freeze(newArr)
        : newArr;
    }
  );
};

/**
 * Creates a lens for finding an element in an array
 *
 * @param predicate - Function to find the element
 * @returns Lens for the found element
 *
 * @example
 * ```typescript
 * const userLens = find<User>((u) => u.id === userId);
 * const user = view(userLens, users);
 * ```
 */
export const find = <A>(
  predicate: (a: A) => boolean
): Lens<readonly A[], A | undefined> => {
  return lens<readonly A[], A | undefined>(
    (arr) => arr.find(predicate),
    (a) => (arr) => {
      if (a === undefined) return arr;
      const idx = arr.findIndex(predicate);
      if (idx === -1) return arr;
      const newArr = [...arr];
      newArr[idx] = a;
      return process.env.NODE_ENV === 'development'
        ? Object.freeze(newArr)
        : newArr;
    }
  );
};

/**
 * Creates a lens for filtering elements in an array
 *
 * @param predicate - Function to filter elements
 * @returns Lens for filtered elements
 *
 * @example
 * ```typescript
 * const activeLens = filter<User>((u) => u.active);
 * const activeUsers = view(activeLens, users);
 * ```
 */
export const filter = <A>(
  predicate: (a: A) => boolean
): Lens<readonly A[], readonly A[]> => {
  return lens<readonly A[], readonly A[]>(
    (arr) => arr.filter(predicate),
    (filtered) => (arr) => {
      const removed = new Set(
        arr.filter((a) => !predicate(a)).map((a) => JSON.stringify(a))
      );
      const result = [
        ...filtered,
        ...arr.filter((a) => removed.has(JSON.stringify(a))),
      ];
      return process.env.NODE_ENV === 'development'
        ? Object.freeze(result)
        : result;
    }
  );
};

/**
 * Creates a lens that applies to each element of an array
 *
 * @param elementLens - Lens to apply to each element
 * @returns Lens for mapping over array
 *
 * @example
 * ```typescript
 * const nameLens = prop<User>()('name');
 * const namesLens = traverse(nameLens);
 * const names = view(namesLens, users);
 * ```
 */
export const traverse = <A, B>(
  elementLens: Lens<A, B>
): Lens<readonly A[], readonly B[]> => {
  return lens<readonly A[], readonly B[]>(
    (arr) => arr.map((a) => elementLens.get(a)),
    (bs) => (arr) => {
      const result = arr.map((a, i) => elementLens.set(bs[i])(a));
      return process.env.NODE_ENV === 'development'
        ? Object.freeze(result)
        : result;
    }
  );
};

/**
 * Creates a lens with a default value when the focused value is undefined
 *
 * @param lens - Original lens
 * @param defaultValue - Default value to use
 * @returns Lens with default
 *
 * @example
 * ```typescript
 * const safeLens = withDefault(optionalLens, 'default');
 * const value = view(safeLens, state); // never undefined
 * ```
 */
export const withDefault = <S, A>(
  lens: Lens<S, A | undefined>,
  defaultValue: A
): Lens<S, A> => {
  return {
    get: (s: S) => lens.get(s) ?? defaultValue,
    set: (a: A) => lens.set(a),
  };
};

/**
 * Creates a lens that applies a transformation on get and its inverse on set
 *
 * @param lens - Original lens
 * @param to - Transform function
 * @param from - Inverse transform function
 * @returns Transformed lens
 *
 * @example
 * ```typescript
 * const stringLens = iso(
 *   numberLens,
 *   (n) => n.toString(),
 *   (s) => parseInt(s, 10)
 * );
 * ```
 */
export const iso = <S, A, B>(
  lens: Lens<S, A>,
  to: (a: A) => B,
  from: (b: B) => A
): Lens<S, B> => {
  return {
    get: (s: S) => to(lens.get(s)),
    set: (b: B) => lens.set(from(b)),
  };
};

/**
 * Creates a lens for a path in a nested structure
 *
 * @param path - Array of keys representing the path
 * @returns Lens for the path
 *
 * @example
 * ```typescript
 * const cityLens = path<State>()(['user', 'address', 'city']);
 * const city = view(cityLens, state);
 * ```
 */
export const path = <S>() => <T = any>(
  keys: readonly (string | number)[]
): Lens<S, T> => {
  if (keys.length === 0) {
    return lens<S, T>(
      (s) => s as unknown as T,
      (a) => () => a as unknown as S
    );
  }

  const [head, ...tail] = keys;
  const headLens = lens<S, any>(
    (s: any) => s[head],
    (a: any) => (s: any) => ({ ...s, [head]: a })
  );

  if (tail.length === 0) {
    return headLens as Lens<S, T>;
  }

  const tailLens = path<any>()(tail);
  return composeLens(headLens, tailLens) as Lens<S, T>;
};

/**
 * Helper to create multiple property lenses at once
 *
 * @param keys - Array of property keys
 * @returns Map of property lenses
 *
 * @example
 * ```typescript
 * const { name, age, email } = props<User>()(['name', 'age', 'email']);
 * ```
 */
export const props = <S>() => <K extends keyof S>(
  keys: readonly K[]
): Record<K, Lens<S, S[K]>> => {
  return keys.reduce((acc, key) => {
    acc[key] = prop<S>()(key);
    return acc;
  }, {} as Record<K, Lens<S, S[K]>>);
};

/**
 * Exports deepFreeze for use with lens operations
 */
export { deepFreeze };
