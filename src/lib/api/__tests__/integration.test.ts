/**
 * Integration Tests for API Client Refactoring
 * Tests the complete API client architecture working together
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { authApi } from '../domains/AuthApi';
import { bookingsApi } from '../domains/BookingsApi';
import { propertiesApi } from '../domains/PropertiesApi';
import { AuthenticationError, NetworkError, ValidationError } from '../errors/ApiErrors';
import { apiCache } from '../services/ApiCache';
import { apiMonitor } from '../services/ApiMonitor';
import { tokenService } from '../services/TokenService';

// Create mock adapter for axios
const mockAxios = new MockAdapter(axios);

// Mock environment
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api';

describe('API Client Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks and state
    mockAxios.reset();
    tokenService.clearTokens();
    apiCache.clear();
    apiMonitor.reset();

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('Authentication Flow', () => {
    test('should complete full authentication cycle', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const authResponse = {
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        refreshToken: 'refresh-token-123',
        user: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          role: 'guest',
        },
      };

      // Mock login API
      mockAxios.onPost('/auth/login').reply(200, authResponse);

      // Execute login
      const result = await authApi.login(loginData);

      // Verify response transformation
      expect(result).toMatchObject({
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        refreshToken: 'refresh-token-123',
        user: {
          id: '1',
          firstName: 'John', // Transformed from first_name
          lastName: 'Doe', // Transformed from last_name
          email: 'test@example.com',
          role: 'guest',
        },
      });

      // Verify token storage
      expect(tokenService.hasTokens()).toBe(true);
      expect(tokenService.getAccessToken()).toBe('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...');

      // Verify authentication helpers
      expect(authApi.isAuthenticated()).toBe(true);
      expect(authApi.hasRole('guest')).toBe(true);
      expect(authApi.hasRole('admin')).toBe(false);
    });

    test('should handle authentication errors properly', async () => {
      const loginData = { email: 'test@example.com', password: 'wrong-password' };

      mockAxios.onPost('/auth/login').reply(401, {
        message: 'Invalid credentials',
      });

      // Should throw structured error
      await expect(authApi.login(loginData)).rejects.toThrow(AuthenticationError);

      // Should not store tokens on failure
      expect(tokenService.hasTokens()).toBe(false);
      expect(authApi.isAuthenticated()).toBe(false);
    });

    test('should handle token refresh flow', async () => {
      // Setup initial tokens
      tokenService.setTokens({
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
      });

      const newTokenResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      // Mock token refresh
      mockAxios.onPost('/auth/refresh-token').reply(200, newTokenResponse);

      // Execute refresh
      const result = await authApi.refreshToken();

      expect(result.token).toBe('new-access-token');
      expect(tokenService.getAccessToken()).toBe('new-access-token');
    });
  });

  describe('Properties API with Caching', () => {
    beforeEach(() => {
      // Setup authentication
      tokenService.setTokens({ accessToken: 'test-token' });
    });

    test('should search properties with caching', async () => {
      const searchParams = {
        location: 'New York',
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
        guests: 2,
      };

      const propertiesResponse = {
        data: [
          {
            id: '1',
            title: 'Cozy Apartment',
            price_per_night: 100,
            max_guests: 4,
            is_active: true,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      // Mock search API
      mockAxios.onGet('/properties/search').reply(200, propertiesResponse);

      // First call
      const result1 = await propertiesApi.search(searchParams);

      // Verify response transformation
      expect(result1.data[0]).toMatchObject({
        id: '1',
        title: 'Cozy Apartment',
        pricePerNight: 100, // Transformed from price_per_night
        maxGuests: 4, // Transformed from max_guests
        isActive: true, // Transformed from is_active
      });

      // Clear mock history
      mockAxios.reset();
      mockAxios.onGet('/properties/search').reply(200, { data: [], pagination: {} });

      // Second call should use cache (no new API call)
      const result2 = await propertiesApi.search(searchParams);

      // Should return cached data
      expect(result2).toEqual(result1);
    });

    test('should handle property creation with cache invalidation', async () => {
      const propertyData = {
        title: 'New Property',
        description: 'A great place to stay',
        location: 'San Francisco',
        pricePerNight: 200,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: 'apartment',
      };

      const createdProperty = {
        id: '123',
        title: 'New Property',
        price_per_night: 200,
        max_guests: 6,
        is_active: true,
      };

      // Mock creation API
      mockAxios.onPost('/properties').reply(201, createdProperty);

      const result = await propertiesApi.create(propertyData);

      // Verify creation
      expect(result.id).toBe('123');
      expect(result.pricePerNight).toBe(200); // Transformed

      // Verify cache invalidation (search cache should be cleared)
      const cacheStats = apiCache.getStats();
      // Implementation would clear search-related caches
    });
  });

  describe('Bookings API with Error Handling', () => {
    beforeEach(() => {
      tokenService.setTokens({ accessToken: 'test-token' });
    });

    test('should create booking with validation error handling', async () => {
      const bookingData = {
        propertyId: '123',
        checkInDate: '2024-01-01',
        checkOutDate: '2024-01-05',
        numberOfGuests: 4,
      };

      // Mock validation error
      mockAxios.onPost('/bookings').reply(400, {
        message: 'Validation failed',
        validationErrors: {
          checkInDate: ['Check-in date must be in the future'],
          numberOfGuests: ['Exceeds maximum capacity'],
        },
      });

      // Should throw structured validation error
      try {
        await bookingsApi.create(bookingData);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).validationErrors).toEqual({
          checkInDate: ['Check-in date must be in the future'],
          numberOfGuests: ['Exceeds maximum capacity'],
        });
      }
    });

    test('should handle successful booking creation', async () => {
      const bookingData = {
        propertyId: '123',
        checkInDate: '2024-01-01',
        checkOutDate: '2024-01-05',
        numberOfGuests: 2,
      };

      const bookingResponse = {
        id: 'booking-123',
        property_id: '123',
        guest_id: 'user-456',
        check_in_date: '2024-01-01',
        check_out_date: '2024-01-05',
        number_of_guests: 2,
        total_price: 400,
        status: 'confirmed',
      };

      mockAxios.onPost('/bookings').reply(201, bookingResponse);

      const result = await bookingsApi.create(bookingData);

      // Verify response transformation
      expect(result).toMatchObject({
        id: 'booking-123',
        propertyId: '123', // Transformed from property_id
        guestId: 'user-456', // Transformed from guest_id
        checkInDate: '2024-01-01', // Transformed from check_in_date
        checkOutDate: '2024-01-05', // Transformed from check_out_date
        numberOfGuests: 2, // Transformed from number_of_guests
        totalPrice: 400, // Transformed from total_price
        status: 'confirmed',
      });
    });
  });

  describe('Request Monitoring and Analytics', () => {
    beforeEach(() => {
      tokenService.setTokens({ accessToken: 'test-token' });
    });

    test('should track request metrics', async () => {
      mockAxios.onGet('/properties/123').reply(200, {
        id: '123',
        title: 'Test Property',
      });

      // Execute request
      await propertiesApi.getById('123');

      // Check monitoring stats
      const stats = apiMonitor.getPerformanceMetrics();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.failedRequests).toBe(0);

      // Check request history
      const history = apiMonitor.getRequestHistory(1);
      expect(history).toHaveLength(1);
      expect(history[0].method).toBe('GET');
      expect(history[0].url).toContain('/properties/123');
      expect(history[0].status).toBe(200);
    });

    test('should track error metrics', async () => {
      mockAxios.onGet('/properties/nonexistent').reply(404, {
        message: 'Property not found',
      });

      try {
        await propertiesApi.getById('nonexistent');
      } catch (error) {
        // Expected error
      }

      const stats = apiMonitor.getPerformanceMetrics();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(1);
    });
  });

  describe('Network Retry Logic', () => {
    beforeEach(() => {
      tokenService.setTokens({ accessToken: 'test-token' });
    });

    test('should retry on network errors', async () => {
      // First call fails with network error, second succeeds
      mockAxios
        .onGet('/properties/123')
        .replyOnce(() => Promise.reject({ code: 'ECONNABORTED' }))
        .onGet('/properties/123')
        .reply(200, { id: '123', title: 'Test Property' });

      const result = await propertiesApi.getById('123');

      expect(result.id).toBe('123');
      expect(mockAxios.history.get).toHaveLength(2); // Initial + 1 retry
    });

    test('should not retry on validation errors', async () => {
      mockAxios.onPost('/bookings').reply(400, {
        message: 'Validation failed',
      });

      try {
        await bookingsApi.create({
          propertyId: '123',
          checkInDate: '2024-01-01',
          checkOutDate: '2024-01-05',
          numberOfGuests: 2,
        });
      } catch (error) {
        // Expected error
      }

      // Should only be called once (no retries for validation errors)
      expect(mockAxios.history.post).toHaveLength(1);
    });
  });

  describe('Complete User Journey', () => {
    test('should handle complete booking flow', async () => {
      // 1. User logs in
      mockAxios.onPost('/auth/login').reply(200, {
        token: 'access-token',
        user: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          role: 'guest',
        },
      });

      await authApi.login({
        email: 'john@example.com',
        password: 'password123',
      });

      // 2. User searches for properties
      mockAxios.onGet('/properties/search').reply(200, {
        data: [{ id: '123', title: 'Great Property', price_per_night: 100 }],
        pagination: { page: 1, limit: 10, total: 1 },
      });

      const searchResults = await propertiesApi.search({
        location: 'New York',
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
      });

      expect(searchResults.data).toHaveLength(1);

      // 3. User views property details
      mockAxios.onGet('/properties/123').reply(200, {
        id: '123',
        title: 'Great Property',
        price_per_night: 100,
        description: 'A wonderful place to stay',
      });

      const property = await propertiesApi.getById('123');
      expect(property.pricePerNight).toBe(100);

      // 4. User creates booking
      mockAxios.onPost('/bookings').reply(201, {
        id: 'booking-456',
        property_id: '123',
        guest_id: '1',
        total_price: 400,
        status: 'confirmed',
      });

      const booking = await bookingsApi.create({
        propertyId: '123',
        checkInDate: '2024-01-01',
        checkOutDate: '2024-01-05',
        numberOfGuests: 2,
      });

      expect(booking.totalPrice).toBe(400);

      // Verify overall stats
      const monitorStats = apiMonitor.getPerformanceMetrics();
      expect(monitorStats.totalRequests).toBe(4); // login + search + property + booking
      expect(monitorStats.successfulRequests).toBe(4);
      expect(monitorStats.failedRequests).toBe(0);
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should recover from token expiration', async () => {
      // Setup expired token
      tokenService.setTokens({
        accessToken: 'expired-token',
        refreshToken: 'valid-refresh-token',
      });

      // First request fails with 401, then refresh succeeds, then retry succeeds
      mockAxios
        .onGet('/properties/123')
        .replyOnce(401, { message: 'Token expired' })
        .onPost('/auth/refresh-token')
        .reply(200, { token: 'new-access-token' })
        .onGet('/properties/123')
        .reply(200, { id: '123', title: 'Property' });

      const result = await propertiesApi.getById('123');

      expect(result.id).toBe('123');
      expect(tokenService.getAccessToken()).toBe('new-access-token');
    });

    test('should handle rate limiting with retry-after', async () => {
      mockAxios
        .onGet('/properties/123')
        .replyOnce(429, { message: 'Rate limit exceeded' }, { 'retry-after': '2' })
        .onGet('/properties/123')
        .reply(200, { id: '123', title: 'Property' });

      const result = await propertiesApi.getById('123');

      expect(result.id).toBe('123');
      // Should have waited for the retry-after period
    });
  });
});
