# Functional Programming Patterns Guide

This guide provides comprehensive documentation on functional programming patterns used in the RentEasy frontend codebase.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Result Monad](#result-monad)
3. [Option Monad](#option-monad)
4. [Pure Functions](#pure-functions)
5. [Function Composition](#function-composition)
6. [Immutability](#immutability)
7. [Testing FP Code](#testing-fp-code)
8. [Migration Guide](#migration-guide)

## Core Concepts

### What is Functional Programming?

Functional Programming (FP) is a programming paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data.

### Key Principles

1. **Pure Functions**: Functions that always return the same output for the same input and have no side effects
2. **Immutability**: Data cannot be modified after creation
3. **Function Composition**: Building complex functions by combining simpler ones
4. **First-Class Functions**: Functions are treated as values
5. **Higher-Order Functions**: Functions that take or return other functions

### Why FP?

- **Predictability**: Pure functions are easy to reason about
- **Testability**: No mocks needed for pure functions
- **Composability**: Build complex behavior from simple pieces
- **Parallelization**: No shared state means safe concurrent execution
- **Type Safety**: Explicit error handling through types

## Result Monad

The Result monad represents computations that may fail, providing explicit error handling without exceptions.

### Basic Usage

```typescript
import { Result, ok, err } from '@/lib/api/functional/result';

// Creating Results
const success = ok(42);
const failure = err('Something went wrong');

// Type-safe checking
if (Result.isOk(success)) {
  console.log(success.value); // 42
}

if (Result.isErr(failure)) {
  console.log(failure.error); // 'Something went wrong'
}
```

### Transforming Results

```typescript
import { map, flatMap, match } from '@/lib/api/functional/result';

// Map transforms success values
const doubled = map((x: number) => x * 2)(ok(5)); // Ok(10)

// FlatMap chains operations that return Results
const divide = (a: number) => (b: number) =>
  b === 0 ? err('Division by zero') : ok(a / b);

const result = flatMap(divide(10))(ok(2)); // Ok(5)

// Match handles both cases
const message = match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`,
})(result);
```

### Common Patterns

#### API Calls

```typescript
import { fromPromise } from '@/lib/api/functional/result';

const fetchUser = async (id: string) => {
  const result = await fromPromise(fetch(`/api/users/${id}`));

  return map((response: Response) => response.json())(result);
};
```

#### Validation

```typescript
const validateEmail = (email: string): Result<string, string> =>
  email.includes('@')
    ? ok(email)
    : err('Invalid email format');

const validateLength = (min: number) => (value: string): Result<string, string> =>
  value.length >= min
    ? ok(value)
    : err(`Must be at least ${min} characters`);

// Chain validations
const validateUserEmail = (email: string) =>
  flatMap(validateLength(5))(validateEmail(email));
```

#### Error Recovery

```typescript
import { getOrElse, mapError } from '@/lib/api/functional/result';

// Provide default value
const value = getOrElse(0)(result);

// Transform errors
const friendlyError = mapError((e: Error) => e.message)(result);
```

## Option Monad

The Option monad represents optional values, replacing null/undefined checks.

### Basic Usage

```typescript
// Currently using null for Option
// Future: Implement dedicated Option type

type Option<T> = T | null;

const findUser = (id: string): Option<User> => {
  // Returns User or null
};

// Using with Result
import { toOption } from '@/lib/api/functional/result';

const userOption = toOption(result); // T | null
```

## Pure Functions

### Definition

A pure function:
1. Always returns the same output for the same input
2. Has no side effects (no mutation, no I/O, no randomness)

### Examples

```typescript
// Pure
const add = (a: number, b: number): number => a + b;

const formatPrice = (price: number): string =>
  `$${price.toFixed(2)}`;

// Impure
let total = 0;
const addToTotal = (value: number): void => {
  total += value; // Mutation!
};

const getCurrentTime = (): Date => new Date(); // Non-deterministic!
```

### Best Practices

```typescript
// Return new objects, don't mutate
const updateUser = (user: User, name: string): User => ({
  ...user,
  name,
});

// Use const for immutability
const users = Object.freeze([user1, user2, user3]);

// Avoid let, prefer const
const transform = (data: Data) => {
  const processed = processData(data);
  const validated = validateData(processed);
  return validated;
};
```

## Function Composition

### Pipe and Compose

```typescript
// Pipe: left-to-right composition
const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

// Usage
const processUser = pipe(
  validateUser,
  normalizeUser,
  enrichUser
);

// Compose: right-to-left composition
const compose = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value);
```

### Point-Free Style

```typescript
// With explicit parameters
const getNames = (users: User[]) =>
  users.map(user => user.name);

// Point-free
const getNames = map((user: User) => user.name);
```

## Immutability

### Object Immutability

```typescript
// Freeze objects
const user = Object.freeze({
  id: '123',
  name: 'John',
});

// Attempting to modify throws in strict mode
user.name = 'Jane'; // Error!

// Create new objects for updates
const updatedUser = Object.freeze({
  ...user,
  name: 'Jane',
});
```

### Array Immutability

```typescript
// Use non-mutating methods
const numbers = [1, 2, 3];

// Good: Returns new array
const doubled = numbers.map(x => x * 2);
const filtered = numbers.filter(x => x > 1);
const combined = [...numbers, 4, 5];

// Bad: Mutates original
numbers.push(4); // Avoid!
numbers.sort(); // Avoid!

// Use freeze for immutable arrays
const immutableNumbers = Object.freeze([1, 2, 3]);
```

## Testing FP Code

### Pure Function Testing

```typescript
import { testPureFunction } from '@/lib/testing';

test('add is pure', () => {
  testPureFunction(add, [
    [[2, 3], 5],
    [[0, 0], 0],
    [[-1, 1], 0],
  ]);
});
```

### Result Testing

```typescript
import { expectOk, expectErr } from '@/lib/testing';

test('validates email correctly', () => {
  const result = validateEmail('test@example.com');

  expect(result).toBeOk();
  const email = expectOk(result);
  expect(email).toBe('test@example.com');
});

test('rejects invalid email', () => {
  const result = validateEmail('invalid');

  expect(result).toBeErr();
  const error = expectErr(result);
  expect(error).toContain('Invalid');
});
```

### Property-Based Testing

```typescript
import { propertyTest } from '@/lib/testing';

test('formatCurrency always returns valid format', () => {
  propertyTest.check(
    () => propertyTest.randomInt(0, 1000000),
    (value) => {
      const formatted = formatCurrency(value);
      return /^\$[\d,]+\.\d{2}$/.test(formatted);
    },
    100
  );
});
```

## Migration Guide

### From Imperative to Functional

#### Before (Imperative)

```typescript
function processUsers(users: User[]): User[] {
  const result = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.active) {
      const processed = {
        ...user,
        name: user.name.toUpperCase(),
      };
      result.push(processed);
    }
  }

  return result;
}
```

#### After (Functional)

```typescript
const processUsers = (users: readonly User[]): readonly User[] =>
  users
    .filter(user => user.active)
    .map(user => ({
      ...user,
      name: user.name.toUpperCase(),
    }));
```

### From Try-Catch to Result

#### Before (Try-Catch)

```typescript
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

#### After (Result)

```typescript
import { fromPromise, map, flatMap } from '@/lib/api/functional/result';

const fetchUser = async (id: string): Promise<Result<User, Error>> => {
  const response = await fromPromise(fetch(`/api/users/${id}`));

  return flatMap((res: Response) =>
    fromPromise(res.json())
  )(response);
};
```

### From Null Checks to Option

#### Before (Null Checks)

```typescript
function getUserName(userId: string): string {
  const user = findUser(userId);

  if (user === null) {
    return 'Unknown';
  }

  return user.name;
}
```

#### After (Option with Result)

```typescript
import { toOption, map, getOrElse } from '@/lib/api/functional/result';

const getUserName = (userId: string): string => {
  const userResult = findUser(userId);
  const userName = map((user: User) => user.name)(userResult);

  return getOrElse('Unknown')(userName);
};
```

## Best Practices

### Do's

1. Write small, focused pure functions
2. Use Result for operations that can fail
3. Freeze objects and arrays for immutability
4. Compose functions to build complex behavior
5. Test functions with property-based testing
6. Use TypeScript's strict mode
7. Prefer const over let
8. Use functional array methods (map, filter, reduce)

### Don'ts

1. Don't mutate function parameters
2. Don't use global state
3. Don't use try-catch for flow control
4. Don't use null/undefined without Option type
5. Don't write functions with side effects
6. Don't use loops, prefer array methods
7. Don't reassign variables
8. Don't use classes for data structures

## Performance Considerations

### When to Use FP

- Business logic and data transformations
- Validation and error handling
- API response processing
- State management

### When to Be Careful

- High-frequency operations (use memoization)
- Large array transformations (consider chunking)
- Deep object freezing (performance impact)

### Optimization Techniques

```typescript
// Memoization
import { memo } from 'react';

const expensiveComputation = memo((data: Data) => {
  // Heavy computation
});

// Lazy evaluation
const lazyValue = () => expensiveComputation(data);

// Only computed when needed
const result = someCondition ? lazyValue() : defaultValue;
```

## Resources

- [TypeScript Handbook - Type Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Fantasy Land Specification](https://github.com/fantasyland/fantasy-land)
- [fp-ts Documentation](https://gcanti.github.io/fp-ts/)

## Next Steps

1. Review [FP_EXAMPLES.md](./FP_EXAMPLES.md) for code examples
2. Explore the Result monad in `src/lib/api/functional/result.ts`
3. Use FP testing utilities in `src/lib/testing/`
4. Apply ESLint FP rules with `.eslintrc.fp.js`
