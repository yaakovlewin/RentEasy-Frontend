/**
 * Functional State Management - Immutable Update Helpers
 *
 * This module provides pure functions for immutable state updates.
 * All update functions return frozen objects in development to prevent mutations.
 *
 * Team B - Dev 1 (State Architecture Lead), Dev 2 (Lens Systems Specialist)
 */

/**
 * Deep freezes an object and all its properties
 * Only in development to avoid performance impact in production
 */
export const deepFreeze = <T>(obj: T): T => {
  if (process.env.NODE_ENV !== 'development') {
    return obj;
  }

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (
      value !== null &&
      (typeof value === 'object' || typeof value === 'function') &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });

  return obj;
};

/**
 * Creates a shallow copy of an object with updated properties
 *
 * @param state - The state object to update
 * @param updates - Partial object with properties to update
 * @returns New state object with updates applied
 *
 * @example
 * ```typescript
 * const state = { count: 0, name: 'test' };
 * const newState = update(state, { count: 1 }); // { count: 1, name: 'test' }
 * ```
 */
export const update = <S extends Record<string, any>>(
  state: S,
  updates: Partial<S>
): S => {
  const newState = { ...state, ...updates };
  return deepFreeze(newState);
};

/**
 * Updates a nested property using a path and updater function
 *
 * @param state - The state object to update
 * @param key - The key of the nested property
 * @param updater - Function to update the nested property
 * @returns New state object with nested update applied
 *
 * @example
 * ```typescript
 * const state = { user: { name: 'John', age: 30 } };
 * const newState = updateNested(state, 'user', user => update(user, { age: 31 }));
 * // { user: { name: 'John', age: 31 } }
 * ```
 */
export const updateNested = <S extends Record<string, any>, K extends keyof S>(
  state: S,
  key: K,
  updater: (value: S[K]) => S[K]
): S => {
  const newState = {
    ...state,
    [key]: updater(state[key]),
  };
  return deepFreeze(newState);
};

/**
 * Updates a deeply nested property using a path array
 *
 * @param state - The state object to update
 * @param path - Array of keys representing the path to the property
 * @param updater - Function to update the nested property
 * @returns New state object with deep update applied
 *
 * @example
 * ```typescript
 * const state = { a: { b: { c: 1 } } };
 * const newState = updateDeep(state, ['a', 'b', 'c'], (c) => c + 1);
 * // { a: { b: { c: 2 } } }
 * ```
 */
export const updateDeep = <S>(
  state: S,
  path: readonly (string | number)[],
  updater: (value: any) => any
): S => {
  if (path.length === 0) {
    return deepFreeze(updater(state));
  }

  const [head, ...tail] = path;
  const current = (state as any)[head];

  const newState = {
    ...(state as any),
    [head]: tail.length === 0 ? updater(current) : updateDeep(current, tail, updater),
  };

  return deepFreeze(newState);
};

/**
 * Updates an item in an array by index
 *
 * @param array - The array to update
 * @param index - Index of the item to update
 * @param updater - Function to update the item
 * @returns New array with item updated
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * const newArr = updateArray(arr, 1, (n) => n * 2); // [1, 4, 3]
 * ```
 */
export const updateArray = <T>(
  array: readonly T[],
  index: number,
  updater: (item: T) => T
): readonly T[] => {
  const newArray = array.map((item, i) => (i === index ? updater(item) : item));
  return deepFreeze(newArray as T[]);
};

/**
 * Updates array items that match a predicate
 *
 * @param array - The array to update
 * @param predicate - Function to test each item
 * @param updater - Function to update matching items
 * @returns New array with matching items updated
 *
 * @example
 * ```typescript
 * const users = [{ id: 1, active: false }, { id: 2, active: false }];
 * const newUsers = updateArrayWhere(
 *   users,
 *   (u) => u.id === 1,
 *   (u) => ({ ...u, active: true })
 * );
 * // [{ id: 1, active: true }, { id: 2, active: false }]
 * ```
 */
export const updateArrayWhere = <T>(
  array: readonly T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): readonly T[] => {
  const newArray = array.map((item) => (predicate(item) ? updater(item) : item));
  return deepFreeze(newArray as T[]);
};

/**
 * Appends items to the end of an array
 *
 * @param array - The array to append to
 * @param items - Items to append
 * @returns New array with items appended
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * const newArr = appendToArray(arr, 4, 5); // [1, 2, 3, 4, 5]
 * ```
 */
export const appendToArray = <T>(
  array: readonly T[],
  ...items: T[]
): readonly T[] => {
  const newArray = [...array, ...items];
  return deepFreeze(newArray);
};

/**
 * Prepends items to the beginning of an array
 *
 * @param array - The array to prepend to
 * @param items - Items to prepend
 * @returns New array with items prepended
 *
 * @example
 * ```typescript
 * const arr = [3, 4, 5];
 * const newArr = prependToArray(arr, 1, 2); // [1, 2, 3, 4, 5]
 * ```
 */
export const prependToArray = <T>(
  array: readonly T[],
  ...items: T[]
): readonly T[] => {
  const newArray = [...items, ...array];
  return deepFreeze(newArray);
};

/**
 * Removes an item from an array by index
 *
 * @param array - The array to remove from
 * @param index - Index of the item to remove
 * @returns New array with item removed
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * const newArr = removeFromArray(arr, 1); // [1, 3]
 * ```
 */
export const removeFromArray = <T>(
  array: readonly T[],
  index: number
): readonly T[] => {
  const newArray = array.filter((_, i) => i !== index);
  return deepFreeze(newArray as T[]);
};

/**
 * Removes items from an array that match a predicate
 *
 * @param array - The array to remove from
 * @param predicate - Function to test each item
 * @returns New array with matching items removed
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3, 4, 5];
 * const newArr = removeFromArrayWhere(arr, (n) => n % 2 === 0); // [1, 3, 5]
 * ```
 */
export const removeFromArrayWhere = <T>(
  array: readonly T[],
  predicate: (item: T) => boolean
): readonly T[] => {
  const newArray = array.filter((item) => !predicate(item));
  return deepFreeze(newArray as T[]);
};

/**
 * Inserts items at a specific index in an array
 *
 * @param array - The array to insert into
 * @param index - Index to insert at
 * @param items - Items to insert
 * @returns New array with items inserted
 *
 * @example
 * ```typescript
 * const arr = [1, 4, 5];
 * const newArr = insertIntoArray(arr, 1, 2, 3); // [1, 2, 3, 4, 5]
 * ```
 */
export const insertIntoArray = <T>(
  array: readonly T[],
  index: number,
  ...items: T[]
): readonly T[] => {
  const newArray = [...array.slice(0, index), ...items, ...array.slice(index)];
  return deepFreeze(newArray);
};

/**
 * Toggles an item in an array (adds if not present, removes if present)
 *
 * @param array - The array to toggle in
 * @param item - Item to toggle
 * @param comparator - Optional function to compare items
 * @returns New array with item toggled
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * const newArr1 = toggleInArray(arr, 2); // [1, 3]
 * const newArr2 = toggleInArray(arr, 4); // [1, 2, 3, 4]
 * ```
 */
export const toggleInArray = <T>(
  array: readonly T[],
  item: T,
  comparator: (a: T, b: T) => boolean = (a, b) => a === b
): readonly T[] => {
  const index = array.findIndex((i) => comparator(i, item));
  if (index === -1) {
    return appendToArray(array, item);
  }
  return removeFromArray(array, index);
};

/**
 * Replaces an item in an array
 *
 * @param array - The array to replace in
 * @param oldItem - Item to replace
 * @param newItem - Replacement item
 * @param comparator - Optional function to compare items
 * @returns New array with item replaced
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * const newArr = replaceInArray(arr, 2, 5); // [1, 5, 3]
 * ```
 */
export const replaceInArray = <T>(
  array: readonly T[],
  oldItem: T,
  newItem: T,
  comparator: (a: T, b: T) => boolean = (a, b) => a === b
): readonly T[] => {
  const newArray = array.map((item) => (comparator(item, oldItem) ? newItem : item));
  return deepFreeze(newArray as T[]);
};

/**
 * Merges two objects deeply
 *
 * @param target - Target object
 * @param source - Source object to merge
 * @returns New merged object
 *
 * @example
 * ```typescript
 * const obj1 = { a: { b: 1, c: 2 } };
 * const obj2 = { a: { b: 3 } };
 * const merged = mergeDeep(obj1, obj2); // { a: { b: 3, c: 2 } }
 * ```
 */
export const mergeDeep = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const output = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      (output as any)[key] = mergeDeep(targetValue, sourceValue);
    } else {
      (output as any)[key] = sourceValue;
    }
  }

  return deepFreeze(output);
};

/**
 * Sets a value at a path, creating intermediate objects if needed
 *
 * @param state - The state object
 * @param path - Path to the property
 * @param value - Value to set
 * @returns New state with value set
 *
 * @example
 * ```typescript
 * const state = {};
 * const newState = setPath(state, ['a', 'b', 'c'], 123);
 * // { a: { b: { c: 123 } } }
 * ```
 */
export const setPath = <S>(
  state: S,
  path: readonly (string | number)[],
  value: any
): S => {
  if (path.length === 0) {
    return deepFreeze(value);
  }

  const [head, ...tail] = path;
  const current = (state as any)[head] || {};

  const newState = {
    ...(state as any),
    [head]: tail.length === 0 ? value : setPath(current, tail, value),
  };

  return deepFreeze(newState);
};

/**
 * Gets a value at a path
 *
 * @param state - The state object
 * @param path - Path to the property
 * @param defaultValue - Default value if path doesn't exist
 * @returns Value at path or default value
 *
 * @example
 * ```typescript
 * const state = { a: { b: { c: 123 } } };
 * const value = getPath(state, ['a', 'b', 'c']); // 123
 * const missing = getPath(state, ['x', 'y'], 'default'); // 'default'
 * ```
 */
export const getPath = <T = any>(
  state: any,
  path: readonly (string | number)[],
  defaultValue?: T
): T | undefined => {
  let current = state;

  for (const key of path) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }

  return current === undefined ? defaultValue : current;
};
