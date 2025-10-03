/**
 * RentEasy API Client - Modern, Enterprise-Grade Architecture
 * 
 * Single source of truth for all API operations with clean TypeScript interfaces,
 * intelligent caching, automatic token management, and comprehensive error handling.
 * 
 * Features:
 * - Type-safe API clients for all domains (Auth, Properties, Bookings)
 * - Automatic token refresh with request queuing
 * - Intelligent caching with TTL and tag-based invalidation
 * - Performance monitoring and request tracking
 * - Structured error handling with recovery strategies
 * - Full SSR compatibility
 */

import { HttpClient } from './api/core/HttpClient';
import { tokenManager } from './api/core/TokenManager';
import { dataTransformer } from './api/core/DataTransformer';
import { ApiCache } from './api/services/ApiCache';
import { ApiMonitor } from './api/services/ApiMonitor';

// Initialize services
const apiCache = new ApiCache();
const apiMonitor = new ApiMonitor();

// Import API clients
import { AuthClient } from './api/clients/AuthClient';
import { PropertiesClient } from './api/clients/PropertiesClient';
import { BookingsClient } from './api/clients/BookingsClient';

// Re-export all types for easy importing
export type * from './api/clients/AuthClient';
export type * from './api/clients/PropertiesClient';
export type * from './api/clients/BookingsClient';
export type * from './api/core/HttpClient';
export type * from './api/core/TokenManager';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not defined. Please set it in your .env.local file. ' +
    'See .env.example for reference.'
  );
}

// Initialize HTTP client with enterprise configuration
const httpClient = new HttpClient(
  {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    enableCache: true,
    enableMonitoring: true,
    enableTransform: true,
    retries: 3,
    retryDelay: 1000,
  },
  apiCache,
  apiMonitor
);

// Initialize domain-specific API clients
const authClient = new AuthClient(httpClient);
const propertiesClient = new PropertiesClient(httpClient);
const bookingsClient = new BookingsClient(httpClient);

/**
 * Main API object - single entry point for all API operations
 */
export const api = {
  // Domain-specific clients
  auth: authClient,
  properties: propertiesClient,
  bookings: bookingsClient,

  // System utilities
  getMetrics: () => ({
    performance: apiMonitor.getPerformanceMetrics(),
    cache: apiCache.getStats(),
    activeRequests: apiMonitor.getActiveRequests().length,
  }),

  clearCache: (pattern?: string) => {
    if (pattern) {
      apiCache.invalidate(pattern);
    } else {
      apiCache.clear();
    }
  },

  // Authentication helpers
  isAuthenticated: () => authClient.isAuthenticated(),
  getCurrentUser: () => authClient.getCurrentUser(),
  needsTokenRefresh: () => authClient.needsTokenRefresh(),
  clearAuth: () => authClient.clearAuth(),
  onAuthChange: (callback: (user: any) => void) => authClient.onAuthChange(callback),

  // Health check
  checkHealth: async () => {
    const startTime = Date.now();
    
    try {
      await authClient.verifyAuth();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy' as const,
        responseTime,
        metrics: api.getMetrics()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy' as const,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: api.getMetrics()
      };
    }
  },
};

// Legacy-compatible named exports (for gradual migration)
export const authAPI = {
  login: authClient.login.bind(authClient),
  register: authClient.register.bind(authClient),
  logout: authClient.logout.bind(authClient),
  refreshToken: authClient.refreshToken.bind(authClient),
  getProfile: authClient.getProfile.bind(authClient),
  forgotPassword: authClient.requestPasswordReset.bind(authClient),
  resetPassword: authClient.confirmPasswordReset.bind(authClient),
};

export const propertiesAPI = {
  search: propertiesClient.searchProperties.bind(propertiesClient),
  getById: propertiesClient.getPropertyById.bind(propertiesClient),
  create: propertiesClient.createProperty.bind(propertiesClient),
  getUserProperties: propertiesClient.getMyProperties.bind(propertiesClient),
  update: propertiesClient.updateProperty.bind(propertiesClient),
  delete: propertiesClient.deleteProperty.bind(propertiesClient),
  checkAvailability: propertiesClient.checkAvailability.bind(propertiesClient),
  getFeaturedProperties: propertiesClient.getFeaturedProperties.bind(propertiesClient),
};

export const bookingsAPI = {
  getMyBookings: bookingsClient.getMyBookings.bind(bookingsClient),
  create: bookingsClient.createBooking.bind(bookingsClient),
  getById: bookingsClient.getBookingById.bind(bookingsClient),
  cancel: bookingsClient.cancelBooking.bind(bookingsClient),
  confirmBooking: bookingsClient.confirmBooking.bind(bookingsClient),
  getPropertyBookings: bookingsClient.getPropertyBookings.bind(bookingsClient),
};

export const usersAPI = {
  getProfile: authClient.getProfile.bind(authClient),
  updateProfile: authClient.updateProfile.bind(authClient),
  uploadProfileImage: authClient.uploadAvatar.bind(authClient),
};

// Export individual clients for advanced usage
export { authClient, propertiesClient, bookingsClient };

// Export core services for power users
export { tokenManager, dataTransformer, apiCache, apiMonitor };

// Export error types
export {
  BaseApiError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ServerError,
} from './api/core/HttpClient';

// Default export (modern API)
export default api;

/**
 * Legacy types for backward compatibility
 */
export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'guest' | 'owner';
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phoneNumber?: string;
  };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  amenities?: string[];
  isActive: boolean;
  rating?: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  property?: Property;
}

export interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}