/**
 * Functional API Client
 *
 * Pure function-based API client using composition and Result monad.
 * Replaces OOP-based PropertiesClient, BookingsClient, and AuthClient.
 *
 * All operations return Result<T, ApiError> for explicit error handling.
 * Functions are curried for partial application and composition.
 */

import { Result, ok, err, fromPromise } from './result';
import { pipe } from './compose';
import { HttpClient } from '../core/HttpClient';

/**
 * API Error type
 */
export interface ApiError {
  readonly message: string;
  readonly status?: number;
  readonly code?: string;
  readonly details?: any;
}

/**
 * Create an API error
 */
const createApiError = (
  message: string,
  status?: number,
  code?: string,
  details?: any
): ApiError =>
  Object.freeze({ message, status, code, details });

/**
 * Convert axios error to ApiError
 */
const mapAxiosError = (error: any): ApiError => {
  if (error.response) {
    return createApiError(
      error.response.data?.message || error.message,
      error.response.status,
      error.response.data?.code,
      error.response.data
    );
  }

  if (error.request) {
    return createApiError('Network error - no response received', undefined, 'NETWORK_ERROR');
  }

  return createApiError(error.message || 'Unknown error', undefined, 'UNKNOWN_ERROR');
};

/**
 * Clean object parameters by removing null/undefined/empty values
 */
const cleanParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = Object.freeze([...value]);
      } else if (!Array.isArray(value)) {
        cleaned[key] = value;
      }
    }
  });

  return Object.freeze(cleaned);
};

/**
 * HTTP request wrapper that converts to Result
 */
const httpRequest = <T>(requestPromise: Promise<{ data: T }>): Promise<Result<T, ApiError>> =>
  fromPromise(requestPromise)
    .then(result =>
      Result.isOk(result)
        ? ok(result.value.data)
        : err(mapAxiosError(result.error))
    )
    .catch(error => Promise.resolve(err(mapAxiosError(error))));

// =============================================================================
// PROPERTIES API - Functional Implementation
// =============================================================================

/**
 * Search properties with filters
 * Returns Result<PaginatedResponse<Property>, ApiError>
 */
export const searchProperties = (http: HttpClient) =>
  (params: {
    readonly location?: string;
    readonly checkIn?: string;
    readonly checkOut?: string;
    readonly guests?: number;
    readonly minPrice?: number;
    readonly maxPrice?: number;
    readonly bedrooms?: number;
    readonly bathrooms?: number;
    readonly amenities?: readonly string[];
    readonly page?: number;
    readonly limit?: number;
  } = {}): Promise<Result<any, ApiError>> => {
    const cleanedParams = cleanParams(params);

    return httpRequest(
      http.get('/properties/search', {
        params: cleanedParams,
        cache: {
          ttl: 5 * 60 * 1000, // 5 minutes
          tags: ['properties', 'search'],
        },
      })
    );
  };

/**
 * Get property by ID
 */
export const getPropertyById = (http: HttpClient) =>
  (id: string): Promise<Result<any, ApiError>> =>
    httpRequest(
      http.get(`/properties/${id}`, {
        cache: {
          ttl: 15 * 60 * 1000, // 15 minutes
          tags: ['properties', `property-${id}`],
        },
      })
    );

/**
 * Create new property
 */
export const createProperty = (http: HttpClient) =>
  (propertyData: {
    readonly title: string;
    readonly description: string;
    readonly location: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly pricePerNight: number;
    readonly maxGuests: number;
    readonly bedrooms: number;
    readonly bathrooms: number;
    readonly images?: readonly string[];
    readonly amenities?: readonly string[];
  }): Promise<Result<any, ApiError>> =>
    httpRequest(http.post('/properties', propertyData));

/**
 * Update existing property
 */
export const updateProperty = (http: HttpClient) =>
  (id: string) =>
  (propertyData: Partial<{
    readonly title: string;
    readonly description: string;
    readonly location: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly pricePerNight: number;
    readonly maxGuests: number;
    readonly bedrooms: number;
    readonly bathrooms: number;
    readonly images: readonly string[];
    readonly amenities: readonly string[];
    readonly isActive: boolean;
  }>): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/properties/${id}`, propertyData));

/**
 * Delete property
 */
export const deleteProperty = (http: HttpClient) =>
  (id: string): Promise<Result<{ readonly message: string }, ApiError>> =>
    httpRequest(http.delete(`/properties/${id}`));

/**
 * Get current user's properties
 */
export const getMyProperties = (http: HttpClient) =>
  (): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get('/properties/user/properties', {
        cache: {
          ttl: 2 * 60 * 1000, // 2 minutes
          tags: ['properties', 'my-properties'],
        },
      })
    );

/**
 * Check property availability
 */
export const checkAvailability = (http: HttpClient) =>
  (id: string) =>
  (checkIn: string) =>
  (checkOut: string): Promise<Result<any, ApiError>> =>
    httpRequest(
      http.get(`/properties/${id}/availability`, {
        params: { checkIn, checkOut },
        cache: {
          ttl: 1 * 60 * 1000, // 1 minute
          tags: [`property-${id}`, 'availability'],
        },
      })
    );

/**
 * Get featured properties
 */
export const getFeaturedProperties = (http: HttpClient) =>
  (limit: number = 6): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get('/properties/featured', {
        params: { limit },
        cache: {
          ttl: 30 * 60 * 1000, // 30 minutes
          tags: ['properties', 'featured'],
        },
      })
    );

/**
 * Get similar properties
 */
export const getSimilarProperties = (http: HttpClient) =>
  (propertyId: string) =>
  (limit: number = 4): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get(`/properties/${propertyId}/similar`, {
        params: { limit },
        cache: {
          ttl: 15 * 60 * 1000, // 15 minutes
          tags: ['properties', `similar-${propertyId}`],
        },
      })
    );

/**
 * Get properties by location
 */
export const getPropertiesByLocation = (http: HttpClient) =>
  (latitude: number) =>
  (longitude: number) =>
  (radiusKm: number = 10) =>
  (limit: number = 20): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get('/properties/nearby', {
        params: { latitude, longitude, radius: radiusKm, limit },
        cache: {
          ttl: 10 * 60 * 1000, // 10 minutes
          tags: ['properties', 'location'],
        },
      })
    );

// =============================================================================
// BOOKINGS API - Functional Implementation
// =============================================================================

/**
 * Create new booking
 */
export const createBooking = (http: HttpClient) =>
  (bookingData: {
    readonly propertyId: string;
    readonly checkInDate: string;
    readonly checkOutDate: string;
    readonly numberOfGuests: number;
    readonly specialRequests?: string;
  }): Promise<Result<any, ApiError>> =>
    httpRequest(http.post('/bookings', bookingData));

/**
 * Get booking by ID
 */
export const getBookingById = (http: HttpClient) =>
  (id: string): Promise<Result<any, ApiError>> =>
    httpRequest(
      http.get(`/bookings/${id}`, {
        cache: {
          ttl: 5 * 60 * 1000, // 5 minutes
          tags: ['bookings', `booking-${id}`],
        },
      })
    );

/**
 * Get current user's bookings
 */
export const getMyBookings = (http: HttpClient) =>
  (filters: {
    readonly status?: string;
    readonly paymentStatus?: string;
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly page?: number;
    readonly limit?: number;
  } = {}): Promise<Result<any, ApiError>> => {
    const cleanedFilters = cleanParams(filters);

    return httpRequest(
      http.get('/bookings/my-bookings', {
        params: cleanedFilters,
        cache: {
          ttl: 2 * 60 * 1000, // 2 minutes
          tags: ['bookings', 'my-bookings'],
        },
      })
    );
  };

/**
 * Get bookings for host's properties
 */
export const getHostBookings = (http: HttpClient) =>
  (filters: {
    readonly status?: string;
    readonly paymentStatus?: string;
    readonly propertyId?: string;
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly page?: number;
    readonly limit?: number;
  } = {}): Promise<Result<any, ApiError>> => {
    const cleanedFilters = cleanParams(filters);

    return httpRequest(
      http.get('/bookings/host-bookings', {
        params: cleanedFilters,
        cache: {
          ttl: 2 * 60 * 1000, // 2 minutes
          tags: ['bookings', 'host-bookings'],
        },
      })
    );
  };

/**
 * Get bookings for specific property
 */
export const getPropertyBookings = (http: HttpClient) =>
  (propertyId: string): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get(`/bookings/property/${propertyId}`, {
        cache: {
          ttl: 5 * 60 * 1000, // 5 minutes
          tags: ['bookings', `property-${propertyId}`],
        },
      })
    );

/**
 * Cancel booking
 */
export const cancelBooking = (http: HttpClient) =>
  (id: string) =>
  (cancelData: {
    readonly reason?: string;
    readonly refundRequested?: boolean;
  } = {}): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/bookings/${id}/cancel`, cancelData));

/**
 * Confirm booking
 */
export const confirmBooking = (http: HttpClient) =>
  (id: string): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/bookings/${id}/confirm`));

/**
 * Complete booking
 */
export const completeBooking = (http: HttpClient) =>
  (id: string): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/bookings/${id}/complete`));

/**
 * Check in to booking
 */
export const checkIn = (http: HttpClient) =>
  (id: string): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/bookings/${id}/checkin`));

/**
 * Check out from booking
 */
export const checkOut = (http: HttpClient) =>
  (id: string): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/bookings/${id}/checkout`));

/**
 * Update booking details
 */
export const updateBooking = (http: HttpClient) =>
  (id: string) =>
  (updates: {
    readonly checkInDate?: string;
    readonly checkOutDate?: string;
    readonly numberOfGuests?: number;
    readonly specialRequests?: string;
  }): Promise<Result<any, ApiError>> =>
    httpRequest(http.put(`/bookings/${id}`, updates));

/**
 * Calculate booking total
 */
export const calculateBookingTotal = (http: HttpClient) =>
  (propertyId: string) =>
  (checkInDate: string) =>
  (checkOutDate: string) =>
  (numberOfGuests: number): Promise<Result<any, ApiError>> =>
    httpRequest(
      http.post('/bookings/calculate-total', {
        propertyId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
      })
    );

/**
 * Get upcoming bookings
 */
export const getUpcomingBookings = (http: HttpClient) =>
  (limit: number = 5): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get('/bookings/upcoming', {
        params: { limit },
        cache: {
          ttl: 2 * 60 * 1000, // 2 minutes
          tags: ['bookings', 'upcoming'],
        },
      })
    );

/**
 * Get booking history
 */
export const getBookingHistory = (http: HttpClient) =>
  (limit: number = 10): Promise<Result<readonly any[], ApiError>> =>
    httpRequest(
      http.get('/bookings/history', {
        params: { limit },
        cache: {
          ttl: 10 * 60 * 1000, // 10 minutes
          tags: ['bookings', 'history'],
        },
      })
    );

// =============================================================================
// AUTHENTICATION API - Functional Implementation
// =============================================================================

/**
 * Login with credentials
 */
export const login = (http: HttpClient) =>
  (credentials: {
    readonly email: string;
    readonly password: string;
  }): Promise<Result<any, ApiError>> =>
    httpRequest(http.post('/auth/login', credentials));

/**
 * Register new user
 */
export const register = (http: HttpClient) =>
  (userData: {
    readonly email: string;
    readonly password: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phoneNumber?: string;
    readonly role: string;
  }): Promise<Result<any, ApiError>> =>
    httpRequest(http.post('/auth/register', userData));

/**
 * Logout user
 */
export const logout = (http: HttpClient) =>
  (): Promise<Result<void, ApiError>> =>
    httpRequest(http.post('/auth/logout'));

/**
 * Get user profile
 */
export const getProfile = (http: HttpClient) =>
  (): Promise<Result<any, ApiError>> =>
    httpRequest(
      http.get('/auth/profile', {
        cache: {
          ttl: 10 * 60 * 1000, // 10 minutes
          tags: ['user-profile'],
        },
      })
    );

/**
 * Update user profile
 */
export const updateProfile = (http: HttpClient) =>
  (userData: {
    readonly firstName?: string;
    readonly lastName?: string;
    readonly phoneNumber?: string;
    readonly email?: string;
  }): Promise<Result<any, ApiError>> =>
    httpRequest(http.put('/users/me', userData));

/**
 * Request password reset
 */
export const requestPasswordReset = (http: HttpClient) =>
  (request: {
    readonly email: string;
  }): Promise<Result<{ readonly message: string }, ApiError>> =>
    httpRequest(http.post('/auth/forgot-password', request));

/**
 * Confirm password reset
 */
export const confirmPasswordReset = (http: HttpClient) =>
  (request: {
    readonly token: string;
    readonly newPassword: string;
  }): Promise<Result<{ readonly message: string }, ApiError>> =>
    httpRequest(http.post('/auth/reset-password', request));

/**
 * Change password
 */
export const changePassword = (http: HttpClient) =>
  (request: {
    readonly currentPassword: string;
    readonly newPassword: string;
  }): Promise<Result<{ readonly message: string }, ApiError>> =>
    httpRequest(http.put('/auth/change-password', request));

/**
 * Refresh access token
 */
export const refreshToken = (http: HttpClient) =>
  (refreshTokenValue: string): Promise<Result<any, ApiError>> =>
    httpRequest(
      http.post('/auth/refresh-token', { refreshToken: refreshTokenValue }, { skipMonitoring: true })
    );

/**
 * Verify email
 */
export const verifyEmail = (http: HttpClient) =>
  (token: string): Promise<Result<{ readonly message: string }, ApiError>> =>
    httpRequest(http.post('/auth/verify-email', { token }));

// =============================================================================
// FACTORY FUNCTIONS - Create API clients with HTTP instance
// =============================================================================

/**
 * Create properties API client
 */
export const createPropertiesApi = (http: HttpClient) =>
  Object.freeze({
    searchProperties: searchProperties(http),
    getPropertyById: getPropertyById(http),
    createProperty: createProperty(http),
    updateProperty: updateProperty(http),
    deleteProperty: deleteProperty(http),
    getMyProperties: getMyProperties(http),
    checkAvailability: checkAvailability(http),
    getFeaturedProperties: getFeaturedProperties(http),
    getSimilarProperties: getSimilarProperties(http),
    getPropertiesByLocation: getPropertiesByLocation(http),
  });

/**
 * Create bookings API client
 */
export const createBookingsApi = (http: HttpClient) =>
  Object.freeze({
    createBooking: createBooking(http),
    getBookingById: getBookingById(http),
    getMyBookings: getMyBookings(http),
    getHostBookings: getHostBookings(http),
    getPropertyBookings: getPropertyBookings(http),
    cancelBooking: cancelBooking(http),
    confirmBooking: confirmBooking(http),
    completeBooking: completeBooking(http),
    checkIn: checkIn(http),
    checkOut: checkOut(http),
    updateBooking: updateBooking(http),
    calculateBookingTotal: calculateBookingTotal(http),
    getUpcomingBookings: getUpcomingBookings(http),
    getBookingHistory: getBookingHistory(http),
  });

/**
 * Create authentication API client
 */
export const createAuthApi = (http: HttpClient) =>
  Object.freeze({
    login: login(http),
    register: register(http),
    logout: logout(http),
    getProfile: getProfile(http),
    updateProfile: updateProfile(http),
    requestPasswordReset: requestPasswordReset(http),
    confirmPasswordReset: confirmPasswordReset(http),
    changePassword: changePassword(http),
    refreshToken: refreshToken(http),
    verifyEmail: verifyEmail(http),
  });

/**
 * Create complete API client with all endpoints
 */
export const createApiClient = (http: HttpClient) =>
  Object.freeze({
    properties: createPropertiesApi(http),
    bookings: createBookingsApi(http),
    auth: createAuthApi(http),
  });
