import { describe, expect, it } from '@jest/globals';

import { sanitizeKeys, safeObjectMerge } from '../objectSecurity';

// Helper to check if object has own property (not inherited)
const hasOwnProp = (obj: unknown, prop: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

describe('Object Security Utilities', () => {
  describe('sanitizeKeys', () => {
    describe('__proto__ pollution protection', () => {
      it('should remove __proto__ from flat objects', () => {
        const unsafe = {
          name: 'John',
          __proto__: { isAdmin: true },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({ name: 'John' });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
      });

      it('should remove __proto__ from nested objects', () => {
        const unsafe = {
          user: {
            name: 'John',
            __proto__: { isAdmin: true },
            profile: { bio: 'Developer' },
          },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          user: {
            name: 'John',
            profile: { bio: 'Developer' },
          },
        });
        expect(hasOwnProp(result.user, '__proto__')).toBe(false);
      });

      it('should remove __proto__ from deeply nested objects', () => {
        const unsafe = {
          level1: {
            level2: {
              level3: {
                name: 'Deep',
                __proto__: { malicious: true },
              },
            },
          },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          level1: {
            level2: {
              level3: {
                name: 'Deep',
              },
            },
          },
        });
      });
    });

    describe('constructor pollution protection', () => {
      it('should remove constructor from flat objects', () => {
        const unsafe = {
          name: 'John',
          constructor: { prototype: {} },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({ name: 'John' });
        expect(hasOwnProp(result, 'constructor')).toBe(false);
      });

      it('should remove constructor from nested objects', () => {
        const unsafe = {
          user: {
            name: 'John',
            constructor: { prototype: {} },
          },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          user: { name: 'John' },
        });
        expect(hasOwnProp(result.user, 'constructor')).toBe(false);
      });
    });

    describe('prototype pollution protection', () => {
      it('should remove prototype from flat objects', () => {
        const unsafe = {
          name: 'John',
          prototype: { isAdmin: true },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({ name: 'John' });
        expect(result).not.toHaveProperty('prototype');
      });

      it('should remove prototype from nested objects', () => {
        const unsafe = {
          user: {
            name: 'John',
            prototype: { isAdmin: true },
          },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          user: { name: 'John' },
        });
        expect(result.user).not.toHaveProperty('prototype');
      });
    });

    describe('multiple attack vectors', () => {
      it('should remove all dangerous keys from same object', () => {
        const unsafe = {
          name: 'John',
          __proto__: { isAdmin: true },
          constructor: { prototype: {} },
          prototype: { malicious: true },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({ name: 'John' });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
        expect(hasOwnProp(result, 'constructor')).toBe(false);
        expect(hasOwnProp(result, 'prototype')).toBe(false);
      });

      it('should handle mixed attack vectors in nested structure', () => {
        const unsafe = {
          user: {
            name: 'John',
            __proto__: { isAdmin: true },
          },
          admin: {
            role: 'superuser',
            constructor: { prototype: {} },
          },
          settings: {
            theme: 'dark',
            prototype: { override: true },
          },
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          user: { name: 'John' },
          admin: { role: 'superuser' },
          settings: { theme: 'dark' },
        });
      });
    });

    describe('array handling', () => {
      it('should sanitize objects within arrays', () => {
        const unsafe = {
          users: [
            { name: 'John', __proto__: { isAdmin: true } },
            { name: 'Jane', constructor: {} },
          ],
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          users: [{ name: 'John' }, { name: 'Jane' }],
        });
      });

      it('should preserve primitive values in arrays', () => {
        const unsafe = {
          tags: ['tag1', 'tag2', 'tag3'],
          numbers: [1, 2, 3],
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          tags: ['tag1', 'tag2', 'tag3'],
          numbers: [1, 2, 3],
        });
      });

      it('should sanitize nested arrays with objects', () => {
        const unsafe = {
          matrix: [
            [
              { x: 1, __proto__: {} },
              { x: 2, constructor: {} },
            ],
          ],
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          matrix: [[{ x: 1 }, { x: 2 }]],
        });

        const matrixResult = result.matrix as Array<Array<Record<string, unknown>>>;
        expect(hasOwnProp(matrixResult[0][0], '__proto__')).toBe(false);
        expect(hasOwnProp(matrixResult[0][1], 'constructor')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty objects', () => {
        const result = sanitizeKeys({});
        expect(result).toEqual({});
      });

      it('should preserve null values', () => {
        const unsafe = {
          name: 'John',
          nullValue: null,
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          name: 'John',
          nullValue: null,
        });
      });

      it('should preserve undefined values', () => {
        const unsafe = {
          name: 'John',
          undefinedValue: undefined,
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          name: 'John',
          undefinedValue: undefined,
        });
      });

      it('should handle boolean values', () => {
        const unsafe = {
          isActive: true,
          isDeleted: false,
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          isActive: true,
          isDeleted: false,
        });
      });

      it('should handle number values including zero', () => {
        const unsafe = {
          count: 0,
          price: 99.99,
          negative: -5,
        };
        const result = sanitizeKeys(unsafe);

        expect(result).toEqual({
          count: 0,
          price: 99.99,
          negative: -5,
        });
      });
    });

    describe('immutability (pure function)', () => {
      it('should not mutate the original object', () => {
        const original = {
          name: 'John',
          __proto__: { isAdmin: true },
        };
        const originalCopy = JSON.parse(JSON.stringify(original));

        sanitizeKeys(original);

        expect(original).toEqual(originalCopy);
      });

      it('should return a new object reference', () => {
        const original = { name: 'John' };
        const result = sanitizeKeys(original);

        expect(result).not.toBe(original);
      });
    });
  });

  describe('safeObjectMerge', () => {
    describe('basic merging', () => {
      it('should merge two safe objects', () => {
        const target = { name: 'John', age: 30 };
        const source = { age: 31, city: 'NYC' };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 31,
          city: 'NYC',
        });
      });

      it('should override target properties with source properties', () => {
        const target = { name: 'John', role: 'user' };
        const source = { role: 'admin' };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          role: 'admin',
        });
      });
    });

    describe('__proto__ pollution protection', () => {
      it('should remove __proto__ from source during merge', () => {
        const target = { name: 'John' };
        const source = {
          age: 30,
          __proto__: { isAdmin: true },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
      });

      it('should remove __proto__ from target during merge', () => {
        const target = {
          name: 'John',
          __proto__: { isAdmin: true },
        };
        const source = { age: 30 };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
      });

      it('should remove __proto__ from both objects', () => {
        const target = {
          name: 'John',
          __proto__: { isAdmin: true },
        };
        const source = {
          age: 30,
          __proto__: { isSuperAdmin: true },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
      });
    });

    describe('constructor pollution protection', () => {
      it('should remove constructor from source during merge', () => {
        const target = { name: 'John' };
        const source = {
          age: 30,
          constructor: { prototype: {} },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
        expect(hasOwnProp(result, 'constructor')).toBe(false);
      });
    });

    describe('prototype pollution protection', () => {
      it('should remove prototype from source during merge', () => {
        const target = { name: 'John' };
        const source = {
          age: 30,
          prototype: { isAdmin: true },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
        expect(result).not.toHaveProperty('prototype');
      });
    });

    describe('deep merging', () => {
      it('should deep merge nested objects', () => {
        const target = {
          user: { name: 'John', age: 30 },
        };
        const source = {
          user: { age: 31, city: 'NYC' },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          user: {
            name: 'John',
            age: 31,
            city: 'NYC',
          },
        });
      });

      it('should remove dangerous keys from nested objects during merge', () => {
        const target = {
          user: { name: 'John' },
        };
        const source = {
          user: { age: 30, constructor: {} },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          user: {
            name: 'John',
            age: 30,
          },
        });
        expect(hasOwnProp(result.user, 'constructor')).toBe(false);
      });

      it('should handle deeply nested merges with attack vectors', () => {
        const target = {
          level1: {
            level2: {
              name: 'Deep',
            },
          },
        };
        const source = {
          level1: {
            level2: {
              age: 30,
              __proto__: { malicious: true },
            },
          },
        };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          level1: {
            level2: {
              name: 'Deep',
              age: 30,
            },
          },
        });
      });
    });

    describe('immutability (pure function)', () => {
      it('should not mutate the target object', () => {
        const target = { name: 'John' };
        const targetCopy = { ...target };
        const source = { age: 30 };

        safeObjectMerge(target, source);

        expect(target).toEqual(targetCopy);
      });

      it('should not mutate the source object', () => {
        const target = { name: 'John' };
        const source = { age: 30 };
        const sourceCopy = { ...source };

        safeObjectMerge(target, source);

        expect(source).toEqual(sourceCopy);
      });

      it('should return a new object reference', () => {
        const target = { name: 'John' };
        const source = { age: 30 };
        const result = safeObjectMerge(target, source);

        expect(result).not.toBe(target);
        expect(result).not.toBe(source);
      });
    });

    describe('edge cases', () => {
      it('should handle empty target object', () => {
        const target = {};
        const source = { name: 'John', age: 30 };
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
      });

      it('should handle empty source object', () => {
        const target = { name: 'John', age: 30 };
        const source = {};
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({
          name: 'John',
          age: 30,
        });
      });

      it('should handle both empty objects', () => {
        const target = {};
        const source = {};
        const result = safeObjectMerge(target, source);

        expect(result).toEqual({});
      });
    });

    describe('real-world attack scenarios', () => {
      it('should prevent JSON.parse attack vector', () => {
        const maliciousJSON = '{"name":"John","__proto__":{"isAdmin":true}}';
        const parsed = JSON.parse(maliciousJSON);
        const target = { role: 'user' };
        const result = safeObjectMerge(target, parsed);

        expect(result).toEqual({
          role: 'user',
          name: 'John',
        });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
      });

      it('should prevent URL query parameter pollution', () => {
        const userInput = {
          name: 'John',
          age: 30,
          '__proto__': { isAdmin: true },
        };
        const defaults = { role: 'user', verified: false };
        const result = safeObjectMerge(defaults, userInput);

        expect(result).toEqual({
          role: 'user',
          verified: false,
          name: 'John',
          age: 30,
        });
        expect(hasOwnProp(result, '__proto__')).toBe(false);
      });

      it('should prevent form data pollution', () => {
        const formData = {
          username: 'john_doe',
          email: 'john@example.com',
          constructor: { prototype: { isAdmin: true } },
        };
        const userDefaults = { role: 'guest', permissions: [] };
        const result = safeObjectMerge(userDefaults, formData);

        expect(result).toEqual({
          role: 'guest',
          permissions: [],
          username: 'john_doe',
          email: 'john@example.com',
        });
        expect(hasOwnProp(result, 'constructor')).toBe(false);
      });
    });
  });
});
