/**
 * Mock Data Generators for FP Testing
 *
 * Provides mock data generators for testing functional programming patterns
 * without requiring external dependencies like faker.js
 */

import type { Result } from '@/lib/api/functional/result';
import { ok, err } from '@/lib/api/functional/result';

/**
 * Simple seeded random number generator for reproducible tests
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBoolean(): boolean {
    return this.next() > 0.5;
  }

  nextChoice<T>(choices: readonly T[]): T {
    return choices[this.nextInt(0, choices.length - 1)];
  }
}

const random = new SeededRandom();

/**
 * Generate random search parameters
 */
export const generateSearchParams = (overrides?: Partial<SearchParams>): SearchParams => ({
  location: overrides?.location ?? generateLocation(),
  checkIn: overrides?.checkIn ?? generateFutureDate(),
  checkOut: overrides?.checkOut ?? generateFutureDate(7),
  guests: overrides?.guests ?? generateGuestCount(),
});

/**
 * Generate random location string
 */
export const generateLocation = (): string => {
  const cities = [
    'New York',
    'London',
    'Paris',
    'Tokyo',
    'Sydney',
    'Barcelona',
    'Rome',
    'Amsterdam',
    'Dubai',
    'Singapore',
  ] as const;

  return random.nextChoice(cities);
};

/**
 * Generate future date
 */
export const generateFutureDate = (daysFromNow: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow + random.nextInt(1, 30));
  return date;
};

/**
 * Generate past date
 */
export const generatePastDate = (daysAgo: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo - random.nextInt(1, 30));
  return date;
};

/**
 * Generate guest count
 */
export const generateGuestCount = (): number => random.nextInt(1, 8);

/**
 * Generate property data
 */
export const generateProperty = (overrides?: Partial<Property>): Property => ({
  id: overrides?.id ?? `prop-${random.nextInt(1000, 9999)}`,
  title: overrides?.title ?? `Beautiful ${random.nextChoice(['Villa', 'Apartment', 'House', 'Studio'])}`,
  description: overrides?.description ?? 'A wonderful place to stay',
  location: overrides?.location ?? generateLocation(),
  price: overrides?.price ?? random.nextInt(50, 500),
  bedrooms: overrides?.bedrooms ?? random.nextInt(1, 5),
  bathrooms: overrides?.bathrooms ?? random.nextInt(1, 3),
  maxGuests: overrides?.maxGuests ?? random.nextInt(2, 10),
  images: overrides?.images ?? [generateImageUrl()],
  amenities: overrides?.amenities ?? generateAmenities(),
  available: overrides?.available ?? true,
  rating: overrides?.rating ?? random.nextInt(3, 5),
  reviewCount: overrides?.reviewCount ?? random.nextInt(0, 200),
});

/**
 * Generate array of properties
 */
export const generateProperties = (count: number): Property[] =>
  Array.from({ length: count }, () => generateProperty());

/**
 * Generate image URL
 */
export const generateImageUrl = (): string => {
  const id = random.nextInt(1, 1000);
  return `https://picsum.photos/seed/${id}/800/600`;
};

/**
 * Generate amenities
 */
export const generateAmenities = (): string[] => {
  const allAmenities = [
    'WiFi',
    'Kitchen',
    'Washer',
    'Dryer',
    'Air conditioning',
    'Heating',
    'TV',
    'Pool',
    'Gym',
    'Parking',
  ] as const;

  const count = random.nextInt(3, 7);
  const selected: string[] = [];

  for (let i = 0; i < count; i++) {
    const amenity = random.nextChoice(allAmenities);
    if (!selected.includes(amenity)) {
      selected.push(amenity);
    }
  }

  return selected;
};

/**
 * Generate user data
 */
export const generateUser = (overrides?: Partial<User>): User => ({
  id: overrides?.id ?? `user-${random.nextInt(1000, 9999)}`,
  email: overrides?.email ?? `user${random.nextInt(100, 999)}@example.com`,
  name: overrides?.name ?? random.nextChoice(['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams']),
  role: overrides?.role ?? random.nextChoice(['guest', 'owner', 'staff', 'admin'] as const),
  createdAt: overrides?.createdAt ?? generatePastDate().toISOString(),
});

/**
 * Generate booking data
 */
export const generateBooking = (overrides?: Partial<Booking>): Booking => ({
  id: overrides?.id ?? `booking-${random.nextInt(1000, 9999)}`,
  propertyId: overrides?.propertyId ?? `prop-${random.nextInt(1000, 9999)}`,
  userId: overrides?.userId ?? `user-${random.nextInt(1000, 9999)}`,
  checkIn: overrides?.checkIn ?? generateFutureDate().toISOString(),
  checkOut: overrides?.checkOut ?? generateFutureDate(7).toISOString(),
  guests: overrides?.guests ?? generateGuestCount(),
  totalPrice: overrides?.totalPrice ?? random.nextInt(200, 2000),
  status: overrides?.status ?? random.nextChoice(['pending', 'confirmed', 'cancelled'] as const),
  createdAt: overrides?.createdAt ?? new Date().toISOString(),
});

/**
 * Generate Result with Ok value
 */
export const generateOk = <T>(value: T): Result<T, never> => ok(value);

/**
 * Generate Result with Err value
 */
export const generateErr = <E>(error: E): Result<never, E> => err(error);

/**
 * Generate random Result (50/50 Ok or Err)
 */
export const generateResult = <T, E>(
  okValue: T,
  errValue: E
): Result<T, E> =>
  random.nextBoolean() ? ok(okValue) : err(errValue);

/**
 * Generate API error
 */
export const generateApiError = (overrides?: Partial<ApiError>): ApiError => ({
  message: overrides?.message ?? random.nextChoice([
    'Network error',
    'Server error',
    'Not found',
    'Unauthorized',
  ]),
  code: overrides?.code ?? random.nextChoice([400, 401, 404, 500]),
  details: overrides?.details,
});

/**
 * Generate validation error
 */
export const generateValidationError = (): ValidationError => ({
  field: random.nextChoice(['email', 'password', 'name', 'location']),
  message: random.nextChoice([
    'Field is required',
    'Invalid format',
    'Too short',
    'Too long',
  ]),
});

/**
 * Generate array of items with generator function
 */
export const generateArray = <T>(
  generator: () => T,
  count: number
): T[] => Array.from({ length: count }, generator);

/**
 * Generate random string
 */
export const generateString = (length: number = 10): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(
    { length },
    () => chars[random.nextInt(0, chars.length - 1)]
  ).join('');
};

/**
 * Generate random email
 */
export const generateEmail = (): string =>
  `${generateString(8)}@${generateString(6)}.com`.toLowerCase();

/**
 * Generate random number in range
 */
export const generateNumber = (min: number = 0, max: number = 100): number =>
  random.nextInt(min, max);

/**
 * Generate random boolean
 */
export const generateBoolean = (): boolean => random.nextBoolean();

/**
 * Mock data type definitions
 */
export interface SearchParams {
  location: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images: string[];
  amenities: string[];
  available: boolean;
  rating: number;
  reviewCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'owner' | 'staff' | 'admin';
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ApiError {
  message: string;
  code: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Reset random seed for reproducible tests
 */
export const resetSeed = (seed: number = 12345): void => {
  random['seed'] = seed;
};

/**
 * Batch generators for common test scenarios
 */
export const mockData = {
  searchParams: generateSearchParams,
  property: generateProperty,
  properties: generateProperties,
  user: generateUser,
  booking: generateBooking,
  ok: generateOk,
  err: generateErr,
  result: generateResult,
  apiError: generateApiError,
  validationError: generateValidationError,
  array: generateArray,
  string: generateString,
  email: generateEmail,
  number: generateNumber,
  boolean: generateBoolean,
  resetSeed,
};
