# Functional Programming Examples

Real-world code examples demonstrating functional programming patterns in the RentEasy codebase.

## Table of Contents

1. [Basic Result Usage](#basic-result-usage)
2. [API Integration](#api-integration)
3. [Form Validation](#form-validation)
4. [Data Transformation](#data-transformation)
5. [Error Handling](#error-handling)
6. [Before & After Comparisons](#before--after-comparisons)
7. [Common Gotchas](#common-gotchas)

## Basic Result Usage

### Creating Results

```typescript
import { ok, err, Result } from '@/lib/api/functional/result';

// Success case
const successResult: Result<number, string> = ok(42);

// Failure case
const failureResult: Result<number, string> = err('Something went wrong');

// Type inference
const inferredOk = ok(100); // Result<number, never>
const inferredErr = err('error'); // Result<never, string>
```

### Checking Results

```typescript
import { isOk, isErr } from '@/lib/api/functional/result';

const result = ok(42);

if (isOk(result)) {
  console.log('Success:', result.value); // TypeScript knows result has 'value'
}

if (isErr(result)) {
  console.log('Error:', result.error); // TypeScript knows result has 'error'
}
```

### Pattern Matching

```typescript
import { match } from '@/lib/api/functional/result';

const result = ok(42);

const message = match({
  ok: (value) => `Got value: ${value}`,
  err: (error) => `Got error: ${error}`,
})(result);

console.log(message); // "Got value: 42"
```

## API Integration

### Fetching Data

```typescript
import { fromPromise, map, flatMap } from '@/lib/api/functional/result';
import type { Result } from '@/lib/api/functional/result';

interface User {
  id: string;
  name: string;
  email: string;
}

// Fetch user from API
const fetchUser = async (userId: string): Promise<Result<User, Error>> => {
  const response = await fromPromise(
    fetch(`/api/users/${userId}`)
  );

  return flatMap((res: Response) =>
    fromPromise(res.json())
  )(response);
};

// Usage
const userResult = await fetchUser('123');

match({
  ok: (user) => console.log('User:', user.name),
  err: (error) => console.error('Failed:', error.message),
})(userResult);
```

### Chaining API Calls

```typescript
import { flatMap, map } from '@/lib/api/functional/result';

const getUserProfile = async (userId: string) => {
  // Fetch user
  const userResult = await fetchUser(userId);

  // Fetch user's posts (only if user fetch succeeded)
  return flatMap(async (user: User) => {
    const postsResult = await fetchPosts(user.id);

    return map((posts: Post[]) => ({
      user,
      posts,
    }))(postsResult);
  })(userResult);
};
```

### Handling Multiple Requests

```typescript
import { all } from '@/lib/api/functional/result';

const fetchDashboard = async () => {
  const [userResult, postsResult, notificationsResult] = await Promise.all([
    fetchUser('123'),
    fetchPosts('123'),
    fetchNotifications('123'),
  ]);

  // Combine results - fails if any request failed
  return all([userResult, postsResult, notificationsResult]);
};

// Usage
const dashboardResult = await fetchDashboard();

match({
  ok: ([user, posts, notifications]) => {
    console.log('Dashboard loaded:', { user, posts, notifications });
  },
  err: (error) => {
    console.error('Dashboard failed to load:', error);
  },
})(dashboardResult);
```

## Form Validation

### Single Field Validation

```typescript
import { ok, err } from '@/lib/api/functional/result';
import type { Result } from '@/lib/api/functional/result';

type ValidationError = string;

const validateEmail = (email: string): Result<string, ValidationError> =>
  email.includes('@') && email.includes('.')
    ? ok(email)
    : err('Invalid email format');

const validatePassword = (password: string): Result<string, ValidationError> =>
  password.length >= 8
    ? ok(password)
    : err('Password must be at least 8 characters');

const validateRequired = (value: string): Result<string, ValidationError> =>
  value.trim().length > 0
    ? ok(value)
    : err('This field is required');
```

### Chaining Validations

```typescript
import { flatMap } from '@/lib/api/functional/result';

const validateUserEmail = (email: string): Result<string, ValidationError> =>
  flatMap(validateEmail)(validateRequired(email));

const validateUserPassword = (password: string): Result<string, ValidationError> =>
  flatMap(validatePassword)(validateRequired(password));
```

### Complete Form Validation

```typescript
import { map2, all } from '@/lib/api/functional/result';

interface LoginForm {
  email: string;
  password: string;
}

interface ValidatedLoginForm {
  email: string;
  password: string;
}

const validateLoginForm = (
  form: LoginForm
): Result<ValidatedLoginForm, ValidationError[]> => {
  const emailResult = validateUserEmail(form.email);
  const passwordResult = validateUserPassword(form.password);

  // Collect all errors or return valid form
  const results = [emailResult, passwordResult];
  const errors = results
    .filter(isErr)
    .map(r => (r as any).error);

  if (errors.length > 0) {
    return err(errors);
  }

  return ok({
    email: expectOk(emailResult),
    password: expectOk(passwordResult),
  });
};

// Usage
const form = { email: 'test@example.com', password: 'secret123' };
const validationResult = validateLoginForm(form);

match({
  ok: (validForm) => {
    console.log('Form is valid:', validForm);
    // Submit form
  },
  err: (errors) => {
    console.log('Validation errors:', errors);
    // Show errors to user
  },
})(validationResult);
```

## Data Transformation

### Transforming API Responses

```typescript
import { map } from '@/lib/api/functional/result';

interface ApiUser {
  user_id: string;
  user_name: string;
  email_address: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const transformApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.user_id,
  name: apiUser.user_name,
  email: apiUser.email_address,
});

const fetchAndTransformUser = async (userId: string): Promise<Result<User, Error>> => {
  const apiUserResult = await fetchUser(userId);

  return map(transformApiUser)(apiUserResult);
};
```

### Processing Collections

```typescript
const processUsers = (users: readonly User[]): readonly User[] =>
  users
    .filter(user => user.active)
    .map(user => ({
      ...user,
      name: user.name.toUpperCase(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

// With Result
import { map, all } from '@/lib/api/functional/result';

const validateUsers = (
  users: readonly User[]
): Result<readonly User[], ValidationError[]> => {
  const results = users.map(validateUser);
  return all(results);
};
```

### Combining Operations

```typescript
import { map, flatMap } from '@/lib/api/functional/result';

const getUserWithPosts = async (userId: string) => {
  const userResult = await fetchUser(userId);

  return flatMap(async (user: User) => {
    const postsResult = await fetchPosts(user.id);

    return map((posts: Post[]) => ({
      ...user,
      posts,
      postCount: posts.length,
    }))(postsResult);
  })(userResult);
};
```

## Error Handling

### Providing Defaults

```typescript
import { getOrElse } from '@/lib/api/functional/result';

const getUserName = (userId: string): Promise<string> =>
  fetchUser(userId).then(
    getOrElse({ id: userId, name: 'Unknown User', email: '' })
  ).then(user => user.name);
```

### Error Recovery

```typescript
import { mapError, any } from '@/lib/api/functional/result';

// Try multiple endpoints
const fetchUserFromAnySource = async (userId: string) => {
  const [primary, backup, cache] = await Promise.all([
    fetchUserFromPrimary(userId),
    fetchUserFromBackup(userId),
    fetchUserFromCache(userId),
  ]);

  // Return first successful result
  return any([primary, backup, cache]);
};

// Transform errors
const normalizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const fetchUserWithNormalizedError = async (userId: string) => {
  const result = await fetchUser(userId);
  return mapError(normalizeError)(result);
};
```

### Side Effects with Tap

```typescript
import { tap, tapError } from '@/lib/api/functional/result';

const fetchUserWithLogging = async (userId: string) => {
  const result = await fetchUser(userId);

  return tapError((error: Error) => {
    console.error('Failed to fetch user:', error);
    // Could also send to error tracking service
  })(
    tap((user: User) => {
      console.log('Successfully fetched user:', user.id);
    })(result)
  );
};
```

## Before & After Comparisons

### Example 1: User Registration

#### Before (Imperative)

```typescript
async function registerUser(email: string, password: string) {
  try {
    // Validate
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }

    if (password.length < 8) {
      throw new Error('Password too short');
    }

    // Check if exists
    const existingUser = await checkUserExists(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await createUser({ email, password });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Continue anyway
    }

    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

#### After (Functional)

```typescript
import { ok, err, flatMap, map, tap, tapError } from '@/lib/api/functional/result';

const registerUser = async (
  email: string,
  password: string
): Promise<Result<User, string>> => {
  // Validate inputs
  const emailResult = validateUserEmail(email);
  const passwordResult = validateUserPassword(password);

  if (isErr(emailResult)) return emailResult;
  if (isErr(passwordResult)) return passwordResult;

  // Check if user exists
  const existsResult = await checkUserExists(email);

  return flatMap(async (exists: boolean) => {
    if (exists) {
      return err('User already exists');
    }

    // Create user
    const userResult = await createUser({
      email: expectOk(emailResult),
      password: expectOk(passwordResult),
    });

    // Send welcome email (don't fail if this fails)
    tap(async (user: User) => {
      await sendWelcomeEmail(user.email).catch(console.error);
    })(userResult);

    return userResult;
  })(existsResult);
};
```

### Example 2: Search Properties

#### Before (Imperative)

```typescript
async function searchProperties(params: SearchParams) {
  try {
    // Build query
    let query = '/api/properties?';

    if (params.location) {
      query += `location=${encodeURIComponent(params.location)}&`;
    }

    if (params.checkIn) {
      query += `checkIn=${params.checkIn.toISOString()}&`;
    }

    if (params.checkOut) {
      query += `checkOut=${params.checkOut.toISOString()}&`;
    }

    if (params.guests) {
      query += `guests=${params.guests}`;
    }

    // Fetch
    const response = await fetch(query);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Transform
    const properties = data.map((p: any) => ({
      id: p.property_id,
      title: p.property_title,
      price: p.price_per_night,
      images: p.image_urls,
    }));

    return properties;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
```

#### After (Functional)

```typescript
import { fromPromise, map, flatMap, getOrElse } from '@/lib/api/functional/result';

const buildSearchQuery = (params: SearchParams): string => {
  const queryParams = new URLSearchParams();

  if (params.location) queryParams.set('location', params.location);
  if (params.checkIn) queryParams.set('checkIn', params.checkIn.toISOString());
  if (params.checkOut) queryParams.set('checkOut', params.checkOut.toISOString());
  if (params.guests) queryParams.set('guests', String(params.guests));

  return `/api/properties?${queryParams.toString()}`;
};

const transformProperty = (apiProperty: ApiProperty): Property => ({
  id: apiProperty.property_id,
  title: apiProperty.property_title,
  price: apiProperty.price_per_night,
  images: apiProperty.image_urls,
});

const searchProperties = async (
  params: SearchParams
): Promise<Result<Property[], Error>> => {
  const query = buildSearchQuery(params);

  const responseResult = await fromPromise(fetch(query));

  return flatMap(async (response: Response) => {
    if (!response.ok) {
      return err(new Error(`HTTP ${response.status}`));
    }

    const dataResult = await fromPromise(response.json());

    return map((data: ApiProperty[]) =>
      data.map(transformProperty)
    )(dataResult);
  })(responseResult);
};

// Usage with default value
const properties = await searchProperties(params)
  .then(getOrElse([] as Property[]));
```

## Common Gotchas

### 1. Forgetting to Handle Errors

```typescript
// Wrong - ignores errors
const result = await fetchUser('123');
const user = result.value; // May be undefined!

// Correct - handle both cases
const result = await fetchUser('123');

match({
  ok: (user) => console.log(user),
  err: (error) => console.error(error),
})(result);
```

### 2. Nested Results

```typescript
// Wrong - Result<Result<User, Error>, Error>
const nested = map(async (id: string) =>
  await fetchUser(id)
)(ok('123'));

// Correct - use flatMap for async operations
const flat = flatMap(async (id: string) =>
  await fetchUser(id)
)(ok('123'));
```

### 3. Breaking Purity

```typescript
// Wrong - side effect in map
const result = map((user: User) => {
  console.log(user); // Side effect!
  return user;
})(userResult);

// Correct - use tap for side effects
const result = tap((user: User) => {
  console.log(user);
})(userResult);
```

### 4. Mutation

```typescript
// Wrong - mutates input
const updateUser = (user: User, name: string) => {
  user.name = name; // Mutation!
  return user;
};

// Correct - returns new object
const updateUser = (user: User, name: string): User => ({
  ...user,
  name,
});
```

### 5. Missing Type Annotations

```typescript
// Wrong - types not inferred correctly
const result = ok({ name: 'John' });
// Type: Result<{ name: string }, never>

// Better - explicit types
const result: Result<User, Error> = ok({ id: '123', name: 'John', email: 'john@example.com' });
```

## Testing Examples

### Testing Pure Functions

```typescript
import { testPureFunction } from '@/lib/testing';

test('transformProperty is pure', () => {
  const apiProperty = {
    property_id: '123',
    property_title: 'Nice House',
    price_per_night: 100,
    image_urls: ['img1.jpg'],
  };

  testPureFunction(transformProperty, [
    [apiProperty, {
      id: '123',
      title: 'Nice House',
      price: 100,
      images: ['img1.jpg'],
    }],
  ]);
});
```

### Testing Results

```typescript
import { expectOk, expectErr } from '@/lib/testing';

test('validates email correctly', () => {
  const validResult = validateEmail('test@example.com');
  const invalidResult = validateEmail('invalid');

  expect(validResult).toBeOk();
  expect(expectOk(validResult)).toBe('test@example.com');

  expect(invalidResult).toBeErr();
  expect(expectErr(invalidResult)).toContain('Invalid');
});
```

## Next Steps

1. Read [FP_PATTERNS.md](./FP_PATTERNS.md) for detailed pattern explanations
2. Explore the Result monad implementation in `src/lib/api/functional/result.ts`
3. Use FP testing utilities from `src/lib/testing/`
4. Apply these patterns to your own code
