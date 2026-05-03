/**
 * Tests for stateUpdaters - Immutable Update Helpers
 *
 * Team B - Dev 6 (Testing & Performance)
 */

import { describe, it, expect } from '@jest/globals';
import {
  update,
  updateNested,
  updateDeep,
  updateArray,
  updateArrayWhere,
  appendToArray,
  prependToArray,
  removeFromArray,
  removeFromArrayWhere,
  insertIntoArray,
  toggleInArray,
  replaceInArray,
  mergeDeep,
  setPath,
  getPath,
  deepFreeze,
} from '../stateUpdaters';

describe('update', () => {
  it('should create shallow copy with updates', () => {
    const state = { count: 0, name: 'test' };
    const newState = update(state, { count: 1 });

    expect(newState).toEqual({ count: 1, name: 'test' });
    expect(newState).not.toBe(state);
  });

  it('should not mutate original state', () => {
    const state = { count: 0, name: 'test' };
    const newState = update(state, { count: 1 });

    expect(state.count).toBe(0);
    expect(newState.count).toBe(1);
  });
});

describe('updateNested', () => {
  it('should update nested property', () => {
    const state = { user: { name: 'John', age: 30 } };
    const newState = updateNested(state, 'user', (user) => update(user, { age: 31 }));

    expect(newState.user.age).toBe(31);
    expect(newState.user.name).toBe('John');
  });

  it('should not mutate original nested state', () => {
    const state = { user: { name: 'John', age: 30 } };
    const newState = updateNested(state, 'user', (user) => update(user, { age: 31 }));

    expect(state.user.age).toBe(30);
    expect(newState.user.age).toBe(31);
    expect(state.user).not.toBe(newState.user);
  });
});

describe('updateDeep', () => {
  it('should update deeply nested property', () => {
    const state = { a: { b: { c: 1 } } };
    const newState = updateDeep(state, ['a', 'b', 'c'], (c) => c + 1);

    expect(newState.a.b.c).toBe(2);
  });

  it('should not mutate original deep state', () => {
    const state = { a: { b: { c: 1 } } };
    const newState = updateDeep(state, ['a', 'b', 'c'], (c) => c + 1);

    expect(state.a.b.c).toBe(1);
    expect(newState.a.b.c).toBe(2);
  });

  it('should handle empty path', () => {
    const state = { count: 0 };
    const newState = updateDeep(state, [], (s) => ({ count: 1 }));

    expect(newState).toEqual({ count: 1 });
  });
});

describe('updateArray', () => {
  it('should update array item by index', () => {
    const arr = [1, 2, 3];
    const newArr = updateArray(arr, 1, (n) => n * 2);

    expect(newArr).toEqual([1, 4, 3]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3];
    const newArr = updateArray(arr, 1, (n) => n * 2);

    expect(arr).toEqual([1, 2, 3]);
    expect(newArr).not.toBe(arr);
  });
});

describe('updateArrayWhere', () => {
  it('should update matching array items', () => {
    const users = [
      { id: 1, active: false },
      { id: 2, active: false },
      { id: 3, active: false },
    ];

    const newUsers = updateArrayWhere(
      users,
      (u) => u.id === 2,
      (u) => ({ ...u, active: true })
    );

    expect(newUsers[0].active).toBe(false);
    expect(newUsers[1].active).toBe(true);
    expect(newUsers[2].active).toBe(false);
  });

  it('should not mutate original array', () => {
    const users = [{ id: 1, active: false }];
    const newUsers = updateArrayWhere(
      users,
      (u) => u.id === 1,
      (u) => ({ ...u, active: true })
    );

    expect(users[0].active).toBe(false);
    expect(newUsers[0].active).toBe(true);
  });
});

describe('appendToArray', () => {
  it('should append items to array', () => {
    const arr = [1, 2, 3];
    const newArr = appendToArray(arr, 4, 5);

    expect(newArr).toEqual([1, 2, 3, 4, 5]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3];
    const newArr = appendToArray(arr, 4, 5);

    expect(arr).toEqual([1, 2, 3]);
    expect(newArr).not.toBe(arr);
  });
});

describe('prependToArray', () => {
  it('should prepend items to array', () => {
    const arr = [3, 4, 5];
    const newArr = prependToArray(arr, 1, 2);

    expect(newArr).toEqual([1, 2, 3, 4, 5]);
  });

  it('should not mutate original array', () => {
    const arr = [3, 4, 5];
    const newArr = prependToArray(arr, 1, 2);

    expect(arr).toEqual([3, 4, 5]);
  });
});

describe('removeFromArray', () => {
  it('should remove item by index', () => {
    const arr = [1, 2, 3];
    const newArr = removeFromArray(arr, 1);

    expect(newArr).toEqual([1, 3]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3];
    const newArr = removeFromArray(arr, 1);

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('removeFromArrayWhere', () => {
  it('should remove matching items', () => {
    const arr = [1, 2, 3, 4, 5];
    const newArr = removeFromArrayWhere(arr, (n) => n % 2 === 0);

    expect(newArr).toEqual([1, 3, 5]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const newArr = removeFromArrayWhere(arr, (n) => n % 2 === 0);

    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('insertIntoArray', () => {
  it('should insert items at index', () => {
    const arr = [1, 4, 5];
    const newArr = insertIntoArray(arr, 1, 2, 3);

    expect(newArr).toEqual([1, 2, 3, 4, 5]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 4, 5];
    const newArr = insertIntoArray(arr, 1, 2, 3);

    expect(arr).toEqual([1, 4, 5]);
  });
});

describe('toggleInArray', () => {
  it('should add item if not present', () => {
    const arr = [1, 2, 3];
    const newArr = toggleInArray(arr, 4);

    expect(newArr).toEqual([1, 2, 3, 4]);
  });

  it('should remove item if present', () => {
    const arr = [1, 2, 3];
    const newArr = toggleInArray(arr, 2);

    expect(newArr).toEqual([1, 3]);
  });

  it('should work with custom comparator', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    const newArr = toggleInArray(
      arr,
      { id: 2 },
      (a, b) => a.id === b.id
    );

    expect(newArr).toEqual([{ id: 1 }]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3];
    const newArr = toggleInArray(arr, 4);

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('replaceInArray', () => {
  it('should replace matching item', () => {
    const arr = [1, 2, 3];
    const newArr = replaceInArray(arr, 2, 5);

    expect(newArr).toEqual([1, 5, 3]);
  });

  it('should work with custom comparator', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const newArr = replaceInArray(
      arr,
      { id: 2 },
      { id: 5 },
      (a, b) => a.id === b.id
    );

    expect(newArr).toEqual([{ id: 1 }, { id: 5 }, { id: 3 }]);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3];
    const newArr = replaceInArray(arr, 2, 5);

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('mergeDeep', () => {
  it('should merge objects deeply', () => {
    const obj1 = { a: { b: 1, c: 2 }, d: 3 };
    const obj2 = { a: { b: 3 }, e: 4 };
    const merged = mergeDeep(obj1, obj2);

    expect(merged).toEqual({
      a: { b: 3, c: 2 },
      d: 3,
      e: 4,
    });
  });

  it('should handle nested objects', () => {
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: { d: 2 } } };
    const merged = mergeDeep(obj1, obj2);

    expect(merged).toEqual({
      a: { b: { c: 1, d: 2 } },
    });
  });

  it('should not mutate original objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const merged = mergeDeep(obj1, obj2);

    expect(obj1).toEqual({ a: { b: 1 } });
    expect(merged).toEqual({ a: { b: 1, c: 2 } });
  });
});

describe('setPath', () => {
  it('should set value at path', () => {
    const state = {};
    const newState = setPath(state, ['a', 'b', 'c'], 123);

    expect(newState).toEqual({ a: { b: { c: 123 } } });
  });

  it('should update existing path', () => {
    const state = { a: { b: { c: 1 } } };
    const newState = setPath(state, ['a', 'b', 'c'], 2);

    expect(newState).toEqual({ a: { b: { c: 2 } } });
  });

  it('should handle empty path', () => {
    const state = { a: 1 };
    const newState = setPath(state, [], { b: 2 });

    expect(newState).toEqual({ b: 2 });
  });

  it('should not mutate original state', () => {
    const state = { a: { b: 1 } };
    const newState = setPath(state, ['a', 'b'], 2);

    expect(state).toEqual({ a: { b: 1 } });
    expect(newState).toEqual({ a: { b: 2 } });
  });
});

describe('getPath', () => {
  it('should get value at path', () => {
    const state = { a: { b: { c: 123 } } };
    const value = getPath(state, ['a', 'b', 'c']);

    expect(value).toBe(123);
  });

  it('should return undefined for missing path', () => {
    const state = { a: { b: 1 } };
    const value = getPath(state, ['a', 'c']);

    expect(value).toBeUndefined();
  });

  it('should return default value for missing path', () => {
    const state = { a: { b: 1 } };
    const value = getPath(state, ['a', 'c'], 'default');

    expect(value).toBe('default');
  });

  it('should handle null/undefined in path', () => {
    const state = { a: null };
    const value = getPath(state, ['a', 'b'], 'default');

    expect(value).toBe('default');
  });
});

describe('deepFreeze', () => {
  it('should freeze object in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const obj = { a: { b: 1 } };
    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.a)).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it('should not freeze in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const obj = { a: { b: 1 } };
    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });
});
