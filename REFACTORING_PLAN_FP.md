# Frontend Refactoring Plan - Functional Programming Paradigm

**Project**: RentEasy Frontend Optimization (FP-First Approach)
**Timeline**: 4 weeks (48 hours total effort)
**Team Structure**: 4 parallel subagent teams
**Paradigm**: Functional Programming with immutability, pure functions, and composition
**Last Updated**: 2025-10-04

---

## Functional Programming Principles Applied

### Core FP Tenets
1. **Pure Functions**: All business logic implemented as pure, testable functions
2. **Immutability**: No mutation of state, use immutable data structures
3. **Composition**: Build complex behavior from simple functions
4. **Higher-Order Functions**: Functions that take/return functions
5. **Declarative Code**: What, not how
6. **No Side Effects**: Isolate effects to boundaries (API calls, storage)

### FP Patterns Used
- **Function Composition**: `compose`, `pipe` for combining operations
- **Partial Application**: Currying for reusable function factories
- **Monads**: `Option`, `Result` for safe error handling
- **Functors**: `map`, `filter`, `reduce` for data transformation
- **Lenses**: For immutable state updates
- **Algebraic Data Types**: Union types for state machines

---

## Team Organization

### Team A: Pure Functions & Data Layer (FP Core)
**Focus**: Pure business logic, data transformations, utilities
**Skills Required**: FP principles, TypeScript, functional composition
**Estimated Effort**: 20 hours

### Team B: State Management (FP State)
**Focus**: Immutable state, reducers, pure state transitions
**Skills Required**: Functional state management, immutability patterns
**Estimated Effort**: 14 hours

### Team C: Component Composition (FP UI)
**Focus**: Functional components, render props, composition patterns
**Skills Required**: React functional patterns, hooks composition
**Estimated Effort**: 10 hours

### Team D: Effects & Integration (FP Boundaries)
**Focus**: Side effects isolation, API integration, I/O boundaries
**Skills Required**: Effect management, functional architecture boundaries
**Estimated Effort**: 4 hours

---

## Week 1: Pure Functions & Core Utilities

### Team A - Week 1 (10 hours)

#### Task A1: Create Functional API Client Layer (6h)
**Priority**: CRITICAL
**Paradigm Shift**: From OOP classes to pure functions and composition

**Files to Create**:
- `Front end/src/lib/api/functional/apiClient.ts`
- `Front end/src/lib/api/functional/compose.ts`
- `Front end/src/lib/api/functional/result.ts`
- `Front end/src/lib/api/functional/validators.ts`

**Old Approach (OOP)**:
```typescript
class PropertiesClient extends BaseClient {
  async searchProperties(params: SearchParams) {
    const cleaned = this.cleanParams(params);
    return this.http.get('/properties/search', { params: cleaned });
  }
}
```

**New Approach (FP)**:
```typescript
// Pure function composition
import { pipe } from '@/lib/api/functional/compose';
import { Result } from '@/lib/api/functional/result';

// Pure validators
const isValidSearchParams = (params: unknown): params is SearchParams => {
  // Validation logic
};

const cleanParams = (params: Record<string, any>): Record<string, any> =>
  Object.entries(params).reduce((acc, [key, value]) => {
    const isValid = value !== null &&
                    value !== undefined &&
                    value !== '' &&
                    (!Array.isArray(value) || value.length > 0);
    return isValid ? { ...acc, [key]: value } : acc;
  }, {});

// Cache configuration as pure data
type CacheConfig = {
  readonly ttl: number;
  readonly tags: ReadonlyArray<string>;
};

const createCacheConfig = (resource: string) => (ttl?: number): CacheConfig => ({
  ttl: ttl ?? DEFAULT_CACHE_TTL[resource] ?? 5 * 60 * 1000,
  tags: ['properties', resource] as const,
});

// API client as composed pure functions
const searchProperties = (http: HttpClient) =>
  (params: SearchParams): Promise<Result<Property[], ApiError>> =>
    pipe(
      params,
      cleanParams,
      (cleaned) => http.get<Property[]>('/properties/search', {
        params: cleaned,
        cache: createCacheConfig('search')(),
      }),
      (promise) => promise
        .then(response => Result.ok(response.data))
        .catch(error => Result.err(mapApiError(error)))
    );

// Usage
const search = searchProperties(httpClient);
const result = await search({ location: 'Paris', guests: 2 });

result.match({
  ok: (properties) => console.log('Found properties:', properties),
  err: (error) => console.error('Search failed:', error),
});
```

**Implementation Steps**:

1. **Create Result Monad** (`result.ts`):
```typescript
export type Result<T, E> =
  | { readonly tag: 'ok'; readonly value: T }
  | { readonly tag: 'err'; readonly error: E };

export const Result = {
  ok: <T, E = never>(value: T): Result<T, E> => ({ tag: 'ok', value }),
  err: <E, T = never>(error: E): Result<T, E> => ({ tag: 'err', error }),

  isOk: <T, E>(result: Result<T, E>): result is { tag: 'ok'; value: T } =>
    result.tag === 'ok',

  isErr: <T, E>(result: Result<T, E>): result is { tag: 'err'; error: E } =>
    result.tag === 'err',

  map: <T, U, E>(fn: (value: T) => U) =>
    (result: Result<T, E>): Result<U, E> =>
      result.tag === 'ok'
        ? Result.ok(fn(result.value))
        : result,

  flatMap: <T, U, E>(fn: (value: T) => Result<U, E>) =>
    (result: Result<T, E>): Result<U, E> =>
      result.tag === 'ok'
        ? fn(result.value)
        : result,

  match: <T, E, R>(handlers: {
    ok: (value: T) => R;
    err: (error: E) => R;
  }) => (result: Result<T, E>): R =>
    result.tag === 'ok'
      ? handlers.ok(result.value)
      : handlers.err(result.error),

  getOrElse: <T, E>(defaultValue: T) =>
    (result: Result<T, E>): T =>
      result.tag === 'ok' ? result.value : defaultValue,

  toOption: <T, E>(result: Result<T, E>): Option<T> =>
    result.tag === 'ok' ? Option.some(result.value) : Option.none(),
};
```

2. **Create Option Monad** (`option.ts`):
```typescript
export type Option<T> =
  | { readonly tag: 'some'; readonly value: T }
  | { readonly tag: 'none' };

export const Option = {
  some: <T>(value: T): Option<T> => ({ tag: 'some', value }),
  none: <T = never>(): Option<T> => ({ tag: 'none' }),

  fromNullable: <T>(value: T | null | undefined): Option<T> =>
    value != null ? Option.some(value) : Option.none(),

  map: <T, U>(fn: (value: T) => U) =>
    (option: Option<T>): Option<U> =>
      option.tag === 'some'
        ? Option.some(fn(option.value))
        : Option.none(),

  flatMap: <T, U>(fn: (value: T) => Option<U>) =>
    (option: Option<T>): Option<U> =>
      option.tag === 'some'
        ? fn(option.value)
        : Option.none(),

  getOrElse: <T>(defaultValue: T) =>
    (option: Option<T>): T =>
      option.tag === 'some' ? option.value : defaultValue,

  match: <T, R>(handlers: {
    some: (value: T) => R;
    none: () => R;
  }) => (option: Option<T>): R =>
    option.tag === 'some'
      ? handlers.some(option.value)
      : handlers.none(),
};
```

3. **Create Composition Utilities** (`compose.ts`):
```typescript
// Function composition (right to left)
export const compose = <A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
) => (a: A): C => f(g(a));

// Pipe (left to right - more readable)
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C
): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): D;
export function pipe(value: any, ...fns: Function[]): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// Curry
export const curry = <A, B, C>(fn: (a: A, b: B) => C) =>
  (a: A) => (b: B) => fn(a, b);

// Partial application
export const partial = <A extends any[], R>(
  fn: (...args: A) => R,
  ...partialArgs: Partial<A>
) => (...restArgs: any[]): R =>
  fn(...[...partialArgs, ...restArgs] as A);
```

4. **Create Pure Validators** (`validators.ts`):
```typescript
import { Result } from './result';

type ValidationError = {
  readonly field: string;
  readonly message: string;
};

type Validator<T> = (value: unknown) => Result<T, ValidationError>;

// Validator combinators
export const Validators = {
  string: (): Validator<string> => (value) =>
    typeof value === 'string'
      ? Result.ok(value)
      : Result.err({ field: 'unknown', message: 'Expected string' }),

  number: (): Validator<number> => (value) =>
    typeof value === 'number' && !isNaN(value)
      ? Result.ok(value)
      : Result.err({ field: 'unknown', message: 'Expected number' }),

  minLength: (min: number) => (value: string): Result<string, ValidationError> =>
    value.length >= min
      ? Result.ok(value)
      : Result.err({ field: 'unknown', message: `Min length ${min}` }),

  maxLength: (max: number) => (value: string): Result<string, ValidationError> =>
    value.length <= max
      ? Result.ok(value)
      : Result.err({ field: 'unknown', message: `Max length ${max}` }),

  compose: <T>(
    ...validators: Validator<T>[]
  ): Validator<T> => (value) =>
    validators.reduce(
      (acc, validator) =>
        Result.flatMap(validator)(acc),
      Result.ok(value as T)
    ),
};

// Usage
const validateLocation = Validators.compose(
  Validators.string(),
  Validators.minLength(2),
  Validators.maxLength(100)
);

const locationResult = validateLocation('Paris');
```

5. **Create Functional API Client** (`apiClient.ts`):
```typescript
import { pipe } from './compose';
import { Result } from './result';
import { Option } from './option';

// Pure data structures
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type RequestConfig = {
  readonly method: HttpMethod;
  readonly url: string;
  readonly params?: Readonly<Record<string, any>>;
  readonly data?: unknown;
  readonly cache?: CacheConfig;
};

type ApiResponse<T> = {
  readonly data: T;
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
};

// Pure parameter cleaning
const cleanParams = (params: Record<string, any>): Record<string, any> =>
  Object.entries(params).reduce((acc, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return acc;
    }
    if (Array.isArray(value) && value.length === 0) {
      return acc;
    }
    return { ...acc, [key]: value };
  }, {});

// Cache configuration factory (curried)
const createCacheConfig = (defaultTTL: number) =>
  (resource: string) =>
  (ttl?: number): CacheConfig => ({
    ttl: ttl ?? defaultTTL,
    tags: Object.freeze(['api', resource]),
  });

const propertiesCacheConfig = createCacheConfig(5 * 60 * 1000);
const bookingsCacheConfig = createCacheConfig(5 * 60 * 1000);
const profileCacheConfig = createCacheConfig(10 * 60 * 1000);

// Error mapping (pure function)
const mapApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      type: 'network_error' as const,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
  return {
    type: 'unknown_error' as const,
    message: 'An unknown error occurred',
    timestamp: new Date().toISOString(),
  };
};

// HTTP client interface (dependency injection)
type HttpClient = {
  readonly request: <T>(config: RequestConfig) => Promise<ApiResponse<T>>;
};

// API operations as pure function factories
export const createApiClient = (http: HttpClient) => {
  // Properties API
  const properties = {
    search: (params: SearchParams): Promise<Result<Property[], ApiError>> =>
      pipe(
        params,
        cleanParams,
        (cleaned) => http.request<Property[]>({
          method: 'GET',
          url: '/properties/search',
          params: cleaned,
          cache: propertiesCacheConfig('search')(),
        }),
        (promise) => promise
          .then(response => Result.ok(response.data))
          .catch(error => Result.err(mapApiError(error)))
      ),

    getById: (id: string): Promise<Result<Property, ApiError>> =>
      http.request<Property>({
        method: 'GET',
        url: `/properties/${id}`,
        cache: propertiesCacheConfig('property')(15 * 60 * 1000),
      })
        .then(response => Result.ok(response.data))
        .catch(error => Result.err(mapApiError(error))),
  };

  // Bookings API
  const bookings = {
    list: (filters?: BookingFilters): Promise<Result<Booking[], ApiError>> =>
      pipe(
        filters ?? {},
        cleanParams,
        (cleaned) => http.request<Booking[]>({
          method: 'GET',
          url: '/bookings',
          params: cleaned,
          cache: bookingsCacheConfig('list')(),
        }),
        (promise) => promise
          .then(response => Result.ok(response.data))
          .catch(error => Result.err(mapApiError(error)))
      ),

    create: (data: CreateBookingData): Promise<Result<Booking, ApiError>> =>
      http.request<Booking>({
        method: 'POST',
        url: '/bookings',
        data,
      })
        .then(response => Result.ok(response.data))
        .catch(error => Result.err(mapApiError(error))),
  };

  // Auth API
  const auth = {
    login: (credentials: LoginCredentials): Promise<Result<AuthResponse, ApiError>> =>
      http.request<AuthResponse>({
        method: 'POST',
        url: '/auth/login',
        data: credentials,
      })
        .then(response => Result.ok(response.data))
        .catch(error => Result.err(mapApiError(error))),

    getProfile: (): Promise<Result<UserProfile, ApiError>> =>
      http.request<UserProfile>({
        method: 'GET',
        url: '/auth/profile',
        cache: profileCacheConfig('profile')(),
      })
        .then(response => Result.ok(response.data))
        .catch(error => Result.err(mapApiError(error))),
  };

  return Object.freeze({ properties, bookings, auth });
};

// Usage
const api = createApiClient(httpClient);

const searchResult = await api.properties.search({
  location: 'Paris',
  guests: 2,
});

searchResult.match({
  ok: (properties) => console.log('Found:', properties),
  err: (error) => console.error('Error:', error),
});
```

**Acceptance Criteria**:
- All API operations return `Result<T, E>` for safe error handling
- Zero classes, all pure functions
- Immutable data structures (readonly, Object.freeze)
- Composable API client using function factories
- Parameter cleaning as pure function
- Cache configuration as data, not behavior

---

#### Task A2: Pure Utility Functions (2h)
**Priority**: HIGH
**Dependencies**: None

**Files to Create**:
- `Front end/src/lib/utils/functional/formatting.ts`
- `Front end/src/lib/utils/functional/dateUtils.ts`
- `Front end/src/lib/utils/functional/calculations.ts`

**FP Approach**: All utilities as pure, composable functions

**Implementation**:

```typescript
// formatting.ts - Pure formatting functions
import { pipe } from '@/lib/api/functional/compose';

type Currency = 'USD' | 'EUR' | 'GBP';
type Locale = 'en-US' | 'en-GB' | 'fr-FR';

// Curried price formatter
export const formatPrice = (currency: Currency) =>
  (locale: Locale) =>
  (price: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(price);

// Pre-configured formatters
export const formatUSD = formatPrice('USD')('en-US');
export const formatEUR = formatPrice('EUR')('en-US');

// Rating calculation as pure function
type Review = { readonly rating: number };

export const calculateAverageRating = (reviews: readonly Review[]): number =>
  reviews.length === 0
    ? 0
    : pipe(
        reviews,
        (rs) => rs.reduce((sum, r) => sum + r.rating, 0),
        (sum) => sum / reviews.length,
        (avg) => Number(avg.toFixed(1))
      );

// Compose formatters
export const formatRatingDisplay = (reviews: readonly Review[]): string =>
  pipe(
    reviews,
    calculateAverageRating,
    (avg) => avg > 0 ? `${avg} / 5.0` : 'No ratings yet'
  );

// dateUtils.ts - Pure date functions
type DateString = string; // ISO 8601 format

// Pure date calculations
export const calculateNights = (checkIn: DateString) =>
  (checkOut: DateString): number =>
    pipe(
      [new Date(checkIn), new Date(checkOut)] as const,
      ([start, end]) => end.getTime() - start.getTime(),
      (diff) => diff / (1000 * 3600 * 24),
      Math.ceil
    );

export const getHoursUntil = (date: DateString): number =>
  pipe(
    new Date(date).getTime() - Date.now(),
    (diff) => diff / (1000 * 3600)
  );

// Curried date formatter
export const formatDateRange = (locale: Locale) =>
  (checkIn: DateString) =>
  (checkOut: DateString): string => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: startDate.getFullYear() !== endDate.getFullYear()
        ? 'numeric'
        : undefined,
    });
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  };

export const formatDateRangeUS = formatDateRange('en-US');

// Date predicates (pure functions returning boolean)
export const isDateInPast = (date: DateString): boolean =>
  new Date(date).getTime() < Date.now();

export const isDateInFuture = (date: DateString): boolean =>
  new Date(date).getTime() > Date.now();

export const isWithinHours = (hours: number) =>
  (date: DateString): boolean =>
    getHoursUntil(date) <= hours;

// calculations.ts - Pure business calculations
type Booking = {
  readonly checkInDate: DateString;
  readonly checkOutDate: DateString;
  readonly pricePerNight: number;
  readonly cleaningFee: number;
  readonly serviceFee: number;
};

// Compose calculation pipeline
export const calculateTotalPrice = (booking: Booking): number =>
  pipe(
    booking,
    (b) => ({
      nights: calculateNights(b.checkInDate)(b.checkOutDate),
      pricePerNight: b.pricePerNight,
      cleaningFee: b.cleaningFee,
      serviceFee: b.serviceFee,
    }),
    ({ nights, pricePerNight, cleaningFee, serviceFee }) =>
      nights * pricePerNight + cleaningFee + serviceFee
  );

export const calculatePriceBreakdown = (booking: Booking) => {
  const nights = calculateNights(booking.checkInDate)(booking.checkOutDate);
  const nightsTotal = nights * booking.pricePerNight;

  return Object.freeze({
    nights,
    nightsTotal,
    cleaningFee: booking.cleaningFee,
    serviceFee: booking.serviceFee,
    total: nightsTotal + booking.cleaningFee + booking.serviceFee,
  });
};
```

**Usage Examples**:
```typescript
// Currying and partial application
const formatPriceUSD = formatPrice('USD')('en-US');
console.log(formatPriceUSD(99.99)); // "$99.99"

// Composition
const nights = calculateNights('2025-10-01')('2025-10-05'); // 4

// Pure pipeline
const breakdown = calculatePriceBreakdown({
  checkInDate: '2025-10-01',
  checkOutDate: '2025-10-05',
  pricePerNight: 100,
  cleaningFee: 50,
  serviceFee: 25,
});
```

**Acceptance Criteria**:
- All functions pure (no side effects)
- All functions curried for partial application
- All data immutable (readonly)
- Composable using pipe/compose
- Zero dependencies on external state

---

#### Task A3: Pure Business Rules (2h)
**Priority**: HIGH
**Dependencies**: Task A2

**Files to Create**:
- `Front end/src/lib/domain/bookingRules.ts`
- `Front end/src/lib/domain/propertyRules.ts`

**FP Approach**: Business rules as pure predicate functions

**Implementation**:

```typescript
// bookingRules.ts - Pure business logic
import { pipe } from '@/lib/api/functional/compose';
import { Result } from '@/lib/api/functional/result';
import { getHoursUntil, isDateInPast } from '@/lib/utils/functional/dateUtils';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';

type Booking = {
  readonly id: string;
  readonly status: BookingStatus;
  readonly checkInDate: string;
  readonly checkOutDate: string;
  readonly createdAt: string;
};

// Policy constants as immutable data
export const BOOKING_POLICIES = Object.freeze({
  CANCELLATION_WINDOW_HOURS: 24,
  MODIFICATION_WINDOW_HOURS: 48,
  REFUND_PERCENTAGE_RANGES: Object.freeze([
    { minHours: 168, percentage: 100 }, // 7 days: full refund
    { minHours: 72, percentage: 50 },   // 3 days: 50% refund
    { minHours: 24, percentage: 0 },    // 1 day: no refund
  ]),
});

// Pure predicates
const isFinalized = (status: BookingStatus): boolean =>
  status === 'cancelled' || status === 'completed';

const isModifiable = (status: BookingStatus): boolean =>
  status === 'confirmed' || status === 'pending';

// Rule result type
type RuleResult = {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly metadata?: Readonly<Record<string, any>>;
};

const createRuleResult = (
  allowed: boolean,
  reason?: string,
  metadata?: Record<string, any>
): RuleResult =>
  Object.freeze({
    allowed,
    reason,
    metadata: metadata ? Object.freeze(metadata) : undefined,
  });

// Cancellation rules as pure functions
export const canCancelBooking = (booking: Booking): RuleResult =>
  pipe(
    booking,
    (b) => {
      if (isFinalized(b.status)) {
        return createRuleResult(false, 'Booking is already finalized');
      }

      const hoursUntilCheckIn = getHoursUntil(b.checkInDate);
      const withinWindow = hoursUntilCheckIn > BOOKING_POLICIES.CANCELLATION_WINDOW_HOURS;

      return createRuleResult(
        withinWindow,
        withinWindow
          ? undefined
          : `Cancellation requires ${BOOKING_POLICIES.CANCELLATION_WINDOW_HOURS}h notice`,
        { hoursUntilCheckIn, requiredHours: BOOKING_POLICIES.CANCELLATION_WINDOW_HOURS }
      );
    }
  );

// Modification rules
export const canModifyBooking = (booking: Booking): RuleResult => {
  if (!isModifiable(booking.status)) {
    return createRuleResult(
      false,
      `Cannot modify ${booking.status} bookings`
    );
  }

  const hoursUntilCheckIn = getHoursUntil(booking.checkInDate);
  const withinWindow = hoursUntilCheckIn > BOOKING_POLICIES.MODIFICATION_WINDOW_HOURS;

  return createRuleResult(
    withinWindow,
    withinWindow
      ? undefined
      : `Modification requires ${BOOKING_POLICIES.MODIFICATION_WINDOW_HOURS}h notice`,
    { hoursUntilCheckIn, requiredHours: BOOKING_POLICIES.MODIFICATION_WINDOW_HOURS }
  );
};

// Refund calculation as pure function
export const calculateRefundPercentage = (booking: Booking): number =>
  pipe(
    getHoursUntil(booking.checkInDate),
    (hoursUntilCheckIn) =>
      BOOKING_POLICIES.REFUND_PERCENTAGE_RANGES.find(
        range => hoursUntilCheckIn >= range.minHours
      ),
    (range) => range?.percentage ?? 0
  );

export const calculateRefundAmount = (booking: Booking) =>
  (totalPaid: number): number =>
    pipe(
      calculateRefundPercentage(booking),
      (percentage) => (totalPaid * percentage) / 100
    );

// Compose complex rules
export const getCancellationInfo = (booking: Booking) => (totalPaid: number) => {
  const canCancel = canCancelBooking(booking);
  const refundPercentage = calculateRefundPercentage(booking);
  const refundAmount = calculateRefundAmount(booking)(totalPaid);

  return Object.freeze({
    canCancel: canCancel.allowed,
    reason: canCancel.reason,
    refundPercentage,
    refundAmount,
    hoursUntilCheckIn: canCancel.metadata?.hoursUntilCheckIn,
  });
};

// Policy message generator (pure)
export const getPolicyMessage = (action: 'cancel' | 'modify'): string => {
  const hours = action === 'cancel'
    ? BOOKING_POLICIES.CANCELLATION_WINDOW_HOURS
    : BOOKING_POLICIES.MODIFICATION_WINDOW_HOURS;

  return `You can ${action} your booking up to ${hours} hours before check-in.`;
};

// Validation pipeline
export const validateBookingAction = (
  action: 'cancel' | 'modify'
) => (booking: Booking): Result<Booking, string> => {
  const ruleCheck = action === 'cancel'
    ? canCancelBooking(booking)
    : canModifyBooking(booking);

  return ruleCheck.allowed
    ? Result.ok(booking)
    : Result.err(ruleCheck.reason ?? 'Action not allowed');
};
```

**Usage**:
```typescript
// Pure function calls
const booking = {
  id: '123',
  status: 'confirmed',
  checkInDate: '2025-10-10',
  checkOutDate: '2025-10-15',
  createdAt: '2025-09-01',
};

const cancelResult = canCancelBooking(booking);
console.log(cancelResult);
// { allowed: true, reason: undefined, metadata: { hoursUntilCheckIn: 144 } }

const cancellationInfo = getCancellationInfo(booking)(500);
console.log(cancellationInfo);
// { canCancel: true, refundPercentage: 100, refundAmount: 500, ... }

// With Result monad
const validationResult = validateBookingAction('cancel')(booking);
validationResult.match({
  ok: (b) => console.log('Can proceed with cancellation'),
  err: (reason) => console.error('Cannot cancel:', reason),
});
```

**Acceptance Criteria**:
- All business rules as pure predicates
- Policy constants immutable
- Composable rule functions
- Type-safe with discriminated unions
- Zero side effects

---

### Team B - Week 1 (8 hours)

#### Task B1: Functional State Management Setup (4h)
**Priority**: CRITICAL
**Dependencies**: None

**Files to Create**:
- `Front end/src/lib/state/createReducer.ts`
- `Front end/src/lib/state/stateUpdaters.ts`
- `Front end/src/lib/state/lenses.ts`

**FP Approach**: Immutable state updates using reducers and lenses

**Implementation**:

```typescript
// createReducer.ts - Type-safe reducer factory
type Action<T extends string = string, P = any> = {
  readonly type: T;
  readonly payload: P;
};

type ActionCreator<T extends string, P> = (payload: P) => Action<T, P>;

type Reducer<S, A extends Action = Action> = (
  state: S,
  action: A
) => S;

type ActionHandlers<S, A extends Action = Action> = {
  [K in A['type']]: (
    state: S,
    action: Extract<A, { type: K }>
  ) => S;
};

// Create type-safe reducer
export const createReducer = <S, A extends Action = Action>(
  initialState: S,
  handlers: Partial<ActionHandlers<S, A>>
): Reducer<S, A> => (state = initialState, action): S => {
  const handler = handlers[action.type];
  return handler ? handler(state, action as any) : state;
};

// Action creator factory
export const createAction = <T extends string, P = void>(
  type: T
): ActionCreator<T, P> => (payload: P) => ({ type, payload });

// stateUpdaters.ts - Immutable update helpers
export const update = <T extends object>(
  obj: T,
  updates: Partial<T>
): T => Object.freeze({ ...obj, ...updates });

export const updateNested = <T extends object, K extends keyof T>(
  obj: T,
  key: K,
  updater: (value: T[K]) => T[K]
): T => Object.freeze({
  ...obj,
  [key]: updater(obj[key]),
});

export const updateArray = <T>(
  arr: readonly T[],
  index: number,
  updater: (item: T) => T
): readonly T[] =>
  Object.freeze(arr.map((item, i) => i === index ? updater(item) : item));

export const appendToArray = <T>(
  arr: readonly T[],
  item: T
): readonly T[] =>
  Object.freeze([...arr, item]);

export const removeFromArray = <T>(
  arr: readonly T[],
  predicate: (item: T) => boolean
): readonly T[] =>
  Object.freeze(arr.filter(item => !predicate(item)));

// lenses.ts - Functional lenses for deep updates
type Lens<S, A> = {
  get: (s: S) => A;
  set: (a: A) => (s: S) => S;
};

export const lens = <S, A>(
  get: (s: S) => A,
  set: (a: A) => (s: S) => S
): Lens<S, A> => ({ get, set });

// Lens for object property
export const prop = <S, K extends keyof S>(key: K): Lens<S, S[K]> =>
  lens(
    (s) => s[key],
    (value) => (s) => Object.freeze({ ...s, [key]: value })
  );

// Compose lenses
export const composeLens = <S, A, B>(
  lens1: Lens<S, A>,
  lens2: Lens<A, B>
): Lens<S, B> =>
  lens(
    (s) => lens2.get(lens1.get(s)),
    (b) => (s) => lens1.set(lens2.set(b)(lens1.get(s)))(s)
  );

// Lens utilities
export const view = <S, A>(lens: Lens<S, A>) => (s: S): A => lens.get(s);

export const set = <S, A>(lens: Lens<S, A>) => (a: A) => (s: S): S => lens.set(a)(s);

export const over = <S, A>(lens: Lens<S, A>) =>
  (fn: (a: A) => A) =>
  (s: S): S => lens.set(fn(lens.get(s)))(s);
```

**Example Usage**:
```typescript
// Define state type
type SearchState = {
  readonly location: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly guests: number;
  readonly filters: {
    readonly priceRange: readonly [number, number];
    readonly propertyTypes: readonly string[];
  };
};

// Define actions
type SearchAction =
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_DATES'; payload: { checkIn: string; checkOut: string } }
  | { type: 'SET_GUESTS'; payload: number }
  | { type: 'UPDATE_PRICE_RANGE'; payload: [number, number] }
  | { type: 'TOGGLE_PROPERTY_TYPE'; payload: string }
  | { type: 'RESET' };

// Action creators
const setLocation = createAction<'SET_LOCATION', string>('SET_LOCATION');
const setDates = createAction<'SET_DATES', { checkIn: string; checkOut: string }>('SET_DATES');

// Initial state (immutable)
const initialState: SearchState = Object.freeze({
  location: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  filters: Object.freeze({
    priceRange: Object.freeze([0, 1000] as const),
    propertyTypes: Object.freeze([]),
  }),
});

// Reducer using immutable updates
const searchReducer = createReducer<SearchState, SearchAction>(
  initialState,
  {
    SET_LOCATION: (state, action) =>
      update(state, { location: action.payload }),

    SET_DATES: (state, action) =>
      update(state, {
        checkIn: action.payload.checkIn,
        checkOut: action.payload.checkOut,
      }),

    SET_GUESTS: (state, action) =>
      update(state, { guests: action.payload }),

    UPDATE_PRICE_RANGE: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, { priceRange: Object.freeze(action.payload) })
      ),

    TOGGLE_PROPERTY_TYPE: (state, action) => {
      const currentTypes = state.filters.propertyTypes;
      const newTypes = currentTypes.includes(action.payload)
        ? removeFromArray(currentTypes, (t) => t === action.payload)
        : appendToArray(currentTypes, action.payload);

      return updateNested(state, 'filters', (filters) =>
        update(filters, { propertyTypes: newTypes })
      );
    },

    RESET: () => initialState,
  }
);

// Using lenses for deep updates
const filtersLens = prop<SearchState, 'filters'>('filters');
const priceRangeLens = prop<SearchState['filters'], 'priceRange'>('priceRange');
const priceRangeLensComposed = composeLens(filtersLens, priceRangeLens);

// Update price range using lens
const updatePriceRange = (range: [number, number]) =>
  set(priceRangeLensComposed)(Object.freeze(range));

const newState = updatePriceRange([100, 500])(initialState);
```

**Acceptance Criteria**:
- All state updates immutable
- Type-safe reducers
- Lens-based deep updates
- Zero mutations
- Pure functions only

---

#### Task B2: Rewrite SearchContext Functionally (4h)
**Priority**: CRITICAL
**Dependencies**: Task B1

**File to Rewrite**:
- `Front end/src/contexts/SearchContext.tsx`

**FP Approach**: Context with reducer, pure state transitions

**Implementation**:

```typescript
// contexts/SearchContext.tsx
import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { createReducer, createAction, update, updateNested } from '@/lib/state';
import { pipe } from '@/lib/api/functional/compose';

// Immutable state type
type SearchState = {
  readonly formData: {
    readonly location: string;
    readonly checkIn: string;
    readonly checkOut: string;
    readonly guests: number;
  };
  readonly results: {
    readonly properties: readonly Property[];
    readonly totalCount: number;
    readonly loading: boolean;
    readonly error: string | null;
    readonly lastFetched: number | null;
  };
  readonly filters: {
    readonly priceRange: readonly [number, number];
    readonly propertyTypes: readonly string[];
    readonly amenities: readonly string[];
  };
  readonly sortBy: 'price_low_high' | 'price_high_low' | 'rating' | 'newest';
  readonly history: readonly SearchHistoryItem[];
};

type SearchHistoryItem = {
  readonly location: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly guests: number;
  readonly timestamp: number;
};

// Action types
type SearchAction =
  | { type: 'UPDATE_LOCATION'; payload: string }
  | { type: 'UPDATE_DATES'; payload: { checkIn: string; checkOut: string } }
  | { type: 'UPDATE_GUESTS'; payload: number }
  | { type: 'UPDATE_FILTERS'; payload: Partial<SearchState['filters']> }
  | { type: 'TOGGLE_PROPERTY_TYPE'; payload: string }
  | { type: 'TOGGLE_AMENITY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: SearchState['sortBy'] }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: { properties: Property[]; totalCount: number } }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'ADD_TO_HISTORY'; payload: SearchHistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'RESET' };

// Action creators
const actions = {
  updateLocation: createAction<'UPDATE_LOCATION', string>('UPDATE_LOCATION'),
  updateDates: createAction<'UPDATE_DATES', { checkIn: string; checkOut: string }>('UPDATE_DATES'),
  updateGuests: createAction<'UPDATE_GUESTS', number>('UPDATE_GUESTS'),
  togglePropertyType: createAction<'TOGGLE_PROPERTY_TYPE', string>('TOGGLE_PROPERTY_TYPE'),
  toggleAmenity: createAction<'TOGGLE_AMENITY', string>('TOGGLE_AMENITY'),
  setSortBy: createAction<'SET_SORT_BY', SearchState['sortBy']>('SET_SORT_BY'),
  searchStart: createAction<'SEARCH_START', void>('SEARCH_START'),
  searchSuccess: createAction<'SEARCH_SUCCESS', { properties: Property[]; totalCount: number }>('SEARCH_SUCCESS'),
  searchError: createAction<'SEARCH_ERROR', string>('SEARCH_ERROR'),
  clearResults: createAction<'CLEAR_RESULTS', void>('CLEAR_RESULTS'),
  reset: createAction<'RESET', void>('RESET'),
};

// Initial state (immutable)
const initialState: SearchState = Object.freeze({
  formData: Object.freeze({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  }),
  results: Object.freeze({
    properties: Object.freeze([]),
    totalCount: 0,
    loading: false,
    error: null,
    lastFetched: null,
  }),
  filters: Object.freeze({
    priceRange: Object.freeze([0, 1000] as const),
    propertyTypes: Object.freeze([]),
    amenities: Object.freeze([]),
  }),
  sortBy: 'price_low_high',
  history: Object.freeze([]),
});

// Pure helper functions
const toggleInArray = <T>(arr: readonly T[], item: T): readonly T[] =>
  arr.includes(item)
    ? Object.freeze(arr.filter(i => i !== item))
    : Object.freeze([...arr, item]);

const addToHistory = (
  history: readonly SearchHistoryItem[],
  item: SearchHistoryItem
): readonly SearchHistoryItem[] =>
  pipe(
    history,
    (h) => h.filter(entry => entry.location !== item.location),
    (filtered) => Object.freeze([item, ...filtered].slice(0, 10))
  );

// Reducer with pure state transitions
const searchReducer = createReducer<SearchState, SearchAction>(
  initialState,
  {
    UPDATE_LOCATION: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        update(formData, { location: action.payload })
      ),

    UPDATE_DATES: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        update(formData, {
          checkIn: action.payload.checkIn,
          checkOut: action.payload.checkOut,
        })
      ),

    UPDATE_GUESTS: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        update(formData, { guests: action.payload })
      ),

    UPDATE_FILTERS: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, action.payload)
      ),

    TOGGLE_PROPERTY_TYPE: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, {
          propertyTypes: toggleInArray(filters.propertyTypes, action.payload),
        })
      ),

    TOGGLE_AMENITY: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, {
          amenities: toggleInArray(filters.amenities, action.payload),
        })
      ),

    SET_SORT_BY: (state, action) =>
      update(state, { sortBy: action.payload }),

    SEARCH_START: (state) =>
      updateNested(state, 'results', (results) =>
        update(results, {
          loading: true,
          error: null,
        })
      ),

    SEARCH_SUCCESS: (state, action) =>
      updateNested(state, 'results', (results) =>
        update(results, {
          properties: Object.freeze(action.payload.properties),
          totalCount: action.payload.totalCount,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        })
      ),

    SEARCH_ERROR: (state, action) =>
      updateNested(state, 'results', (results) =>
        update(results, {
          loading: false,
          error: action.payload,
        })
      ),

    CLEAR_RESULTS: (state) =>
      update(state, { results: initialState.results }),

    ADD_TO_HISTORY: (state, action) =>
      update(state, {
        history: addToHistory(state.history, action.payload),
      }),

    CLEAR_HISTORY: (state) =>
      update(state, { history: Object.freeze([]) }),

    RESET: () => initialState,
  }
);

// Context type
type SearchContextType = {
  readonly state: SearchState;
  readonly updateLocation: (location: string) => void;
  readonly updateDates: (checkIn: string, checkOut: string) => void;
  readonly updateGuests: (guests: number) => void;
  readonly togglePropertyType: (type: string) => void;
  readonly toggleAmenity: (amenity: string) => void;
  readonly setSortBy: (sort: SearchState['sortBy']) => void;
  readonly executeSearch: () => Promise<void>;
  readonly clearResults: () => void;
  readonly clearHistory: () => void;
  readonly reset: () => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Memoized action dispatchers (callbacks with no deps - they only dispatch)
  const updateLocation = useCallback(
    (location: string) => dispatch(actions.updateLocation(location)),
    []
  );

  const updateDates = useCallback(
    (checkIn: string, checkOut: string) =>
      dispatch(actions.updateDates({ checkIn, checkOut })),
    []
  );

  const updateGuests = useCallback(
    (guests: number) => dispatch(actions.updateGuests(guests)),
    []
  );

  const togglePropertyType = useCallback(
    (type: string) => dispatch(actions.togglePropertyType(type)),
    []
  );

  const toggleAmenity = useCallback(
    (amenity: string) => dispatch(actions.toggleAmenity(amenity)),
    []
  );

  const setSortBy = useCallback(
    (sort: SearchState['sortBy']) => dispatch(actions.setSortBy(sort)),
    []
  );

  const clearResults = useCallback(
    () => dispatch(actions.clearResults()),
    []
  );

  const clearHistory = useCallback(
    () => dispatch(actions.clearHistory()),
    []
  );

  const reset = useCallback(
    () => dispatch(actions.reset()),
    []
  );

  // Search execution (side effect isolated)
  const executeSearch = useCallback(async () => {
    dispatch(actions.searchStart());

    try {
      const result = await api.properties.search({
        ...state.formData,
        ...state.filters,
        sortBy: state.sortBy,
      });

      result.match({
        ok: (properties) => {
          dispatch(actions.searchSuccess({
            properties,
            totalCount: properties.length,
          }));

          // Add to history
          dispatch(actions.addToHistory({
            ...state.formData,
            timestamp: Date.now(),
          }));
        },
        err: (error) => {
          dispatch(actions.searchError(error.message));
        },
      });
    } catch (error) {
      dispatch(actions.searchError('Search failed'));
    }
  }, [state.formData, state.filters, state.sortBy]);

  // Memoize context value (only re-create when state changes)
  const value = useMemo<SearchContextType>(
    () => ({
      state,
      updateLocation,
      updateDates,
      updateGuests,
      togglePropertyType,
      toggleAmenity,
      setSortBy,
      executeSearch,
      clearResults,
      clearHistory,
      reset,
    }),
    [
      state,
      updateLocation,
      updateDates,
      updateGuests,
      togglePropertyType,
      toggleAmenity,
      setSortBy,
      executeSearch,
      clearResults,
      clearHistory,
      reset,
    ]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

// Custom hook
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

// Selector hooks (derived state)
export const useSearchFormData = () => {
  const { state } = useSearch();
  return state.formData;
};

export const useSearchResults = () => {
  const { state } = useSearch();
  return state.results;
};

export const useSearchFilters = () => {
  const { state } = useSearch();
  return state.filters;
};

export const useSearchHistory = () => {
  const { state } = useSearch();
  return state.history;
};
```

**Acceptance Criteria**:
- All state immutable
- Pure reducer functions
- No direct state mutations
- Memoized context value
- Selector hooks for derived state
- Type-safe actions

---

### Team C - Week 1 (0 hours)
**Status**: Waiting for Week 2

---

### Team D - Week 1 (2 hours)

#### Task D1: Remove SearchBar Duplicates (2h)
**Priority**: CRITICAL
**Dependencies**: None

Same as OOP plan - this is deletion task, no paradigm change needed.

---

## Week 2: Functional Composition & Effects

### Team A - Week 2 (10 hours)

#### Task A4: Create Effect Management System (4h)
**Priority**: CRITICAL
**Dependencies**: None

**Files to Create**:
- `Front end/src/lib/effects/createEffect.ts`
- `Front end/src/lib/effects/Task.ts`
- `Front end/src/lib/effects/useTask.ts`

**FP Approach**: Isolate side effects using Task monad

**Implementation**:

```typescript
// Task.ts - Task monad for async effects
export type Task<E, A> = () => Promise<Result<A, E>>;

export const Task = {
  // Create a Task from a Promise
  fromPromise: <A, E = Error>(promise: () => Promise<A>): Task<E, A> =>
    async () => {
      try {
        const value = await promise();
        return Result.ok(value);
      } catch (error) {
        return Result.err(error as E);
      }
    },

  // Create a successful Task
  succeed: <A, E = never>(value: A): Task<E, A> =>
    async () => Result.ok(value),

  // Create a failed Task
  fail: <E, A = never>(error: E): Task<E, A> =>
    async () => Result.err(error),

  // Map over the success value
  map: <A, B, E>(fn: (a: A) => B) =>
    (task: Task<E, A>): Task<E, B> =>
      async () => {
        const result = await task();
        return Result.map(fn)(result);
      },

  // Chain tasks
  flatMap: <A, B, E>(fn: (a: A) => Task<E, B>) =>
    (task: Task<E, A>): Task<E, B> =>
      async () => {
        const result = await task();
        if (Result.isErr(result)) {
          return result;
        }
        const nextTask = fn(result.value);
        return await nextTask();
      },

  // Run multiple tasks in parallel
  parallel: <E, A>(tasks: Task<E, A>[]): Task<E, A[]> =>
    async () => {
      const results = await Promise.all(tasks.map(task => task()));

      // Check if any failed
      const errors = results.filter(Result.isErr);
      if (errors.length > 0) {
        return errors[0];
      }

      // All succeeded
      const values = results
        .filter(Result.isOk)
        .map(r => r.value);

      return Result.ok(values);
    },

  // Run multiple tasks in sequence
  sequence: <E, A>(tasks: Task<E, A>[]): Task<E, A[]> =>
    async () => {
      const results: A[] = [];

      for (const task of tasks) {
        const result = await task();
        if (Result.isErr(result)) {
          return result;
        }
        results.push(result.value);
      }

      return Result.ok(results);
    },

  // Retry a task
  retry: <E, A>(
    maxAttempts: number,
    delay: number = 1000
  ) => (task: Task<E, A>): Task<E, A> =>
    async () => {
      let attempt = 0;
      let lastError: E | null = null;

      while (attempt < maxAttempts) {
        const result = await task();
        if (Result.isOk(result)) {
          return result;
        }

        lastError = result.error;
        attempt++;

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }

      return Result.err(lastError!);
    },

  // Timeout a task
  timeout: <E, A>(ms: number) =>
    (task: Task<E, A>): Task<E | 'timeout', A> =>
      async () => {
        const timeoutPromise = new Promise<Result<A, 'timeout'>>(resolve =>
          setTimeout(() => resolve(Result.err('timeout' as const)), ms)
        );

        const taskPromise = task();

        return Promise.race([taskPromise, timeoutPromise]);
      },
};

// createEffect.ts - Effect creator
type Effect<A> = Task<Error, A>;

type EffectOptions = {
  retry?: number;
  timeout?: number;
  onSuccess?: (value: any) => void;
  onError?: (error: Error) => void;
};

export const createEffect = <A>(
  fn: () => Promise<A>,
  options: EffectOptions = {}
): Effect<A> => {
  let task = Task.fromPromise(fn);

  // Apply retry
  if (options.retry) {
    task = Task.retry(options.retry)(task);
  }

  // Apply timeout
  if (options.timeout) {
    task = Task.timeout(options.timeout)(task);
  }

  // Add callbacks
  const taskWithCallbacks: Effect<A> = async () => {
    const result = await task();

    result.match({
      ok: (value) => options.onSuccess?.(value),
      err: (error) => options.onError?.(error as Error),
    });

    return result;
  };

  return taskWithCallbacks;
};

// useTask.ts - React hook for Task execution
import { useState, useCallback, useEffect, useRef } from 'react';

type TaskState<A, E> = {
  readonly status: 'idle' | 'loading' | 'success' | 'error';
  readonly data: A | null;
  readonly error: E | null;
};

export const useTask = <A, E = Error>(task: Task<E, A>) => {
  const [state, setState] = useState<TaskState<A, E>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const taskRef = useRef(task);
  taskRef.current = task;

  const execute = useCallback(async () => {
    setState({
      status: 'loading',
      data: null,
      error: null,
    });

    const result = await taskRef.current();

    result.match({
      ok: (data) => {
        setState({
          status: 'success',
          data,
          error: null,
        });
      },
      err: (error) => {
        setState({
          status: 'error',
          data: null,
          error,
        });
      },
    });

    return result;
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    isIdle: state.status === 'idle',
  };
};

// Auto-execute on mount
export const useTaskAuto = <A, E = Error>(task: Task<E, A>) => {
  const taskState = useTask(task);

  useEffect(() => {
    taskState.execute();
  }, []);

  return taskState;
};
```

**Usage Example**:
```typescript
// Define effect
const fetchProperties = (params: SearchParams): Task<ApiError, Property[]> =>
  pipe(
    Task.fromPromise(() => api.properties.search(params)),
    Task.map((result) => result.data),
    Task.retry(3),
    Task.timeout(10000)
  );

// Use in component
function SearchPage() {
  const { state } = useSearch();

  const searchTask = useMemo(
    () => fetchProperties(state.formData),
    [state.formData]
  );

  const { data, isLoading, error, execute } = useTask(searchTask);

  return (
    <div>
      <button onClick={execute} disabled={isLoading}>
        Search
      </button>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay error={error} />}
      {data && <PropertyList properties={data} />}
    </div>
  );
}
```

**Acceptance Criteria**:
- All async effects wrapped in Task monad
- Side effects isolated to Task execution
- Composable effect operations
- Type-safe error handling
- React hooks for Task integration

---

(Continuing with remaining tasks following the same FP pattern - shall I continue with the full 50+ page detailed plan, or would you like me to focus on specific sections?)

**Key FP Transformations Summary**:

1. **Classes → Pure Functions + Composition**
2. **Mutations → Immutable Updates**
3. **Imperative Loops → map/filter/reduce/pipe**
4. **Try/Catch → Result/Option Monads**
5. **Promises → Task Monad**
6. **useState → useReducer with Pure Reducers**
7. **Object Methods → Curried Functions**
8. **Inheritance → Composition**
9. **Side Effects → Effect System (Task)**
10. **Validation → Algebraic Data Types**

This approach gives you:
- **Better testability** (pure functions)
- **Better composability** (function composition)
- **Better type safety** (ADTs, monads)
- **Better predictability** (immutability)
- **Better error handling** (Result monad)
- **Better async handling** (Task monad)

Would you like me to continue with the complete detailed plan for all 4 weeks?
