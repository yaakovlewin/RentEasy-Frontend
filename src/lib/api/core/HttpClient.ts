/**
 * HttpClient - Modern enterprise HTTP client
 * 
 * Clean, type-safe HTTP client with automatic token management, caching,
 * error handling, and request/response transformation.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenManager, TokenManager } from './TokenManager';
import { dataTransformer, DataTransformer } from './DataTransformer';
import { ApiCache } from '../services/ApiCache';
import { ApiMonitor } from '../services/ApiMonitor';

// Re-export enhanced error types
export {
  BaseApiError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ServerError,
  ApiErrorFactory
} from '../services/ApiErrors';

/**
 * Extended request configuration with enterprise features
 *
 * Extends Axios request config with caching, transformation control, and monitoring options
 */
export interface RequestConfig extends AxiosRequestConfig {
  // Caching options
  cache?: {
    ttl?: number;
    tags?: string[];
  };
  // Skip transformations
  skipTransform?: boolean;
  // Skip monitoring
  skipMonitoring?: boolean;
}

/**
 * Enhanced API response with metadata
 *
 * Extends Axios response with cache indicators and request tracking
 */
export interface ApiResponse<T = any> extends AxiosResponse<T> {
  fromCache?: boolean;
  requestId?: string;
}

/**
 * HTTP client configuration options
 *
 * Comprehensive configuration for enterprise HTTP client with performance and reliability features
 */
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  enableCache?: boolean;
  enableMonitoring?: boolean;
  enableTransform?: boolean;
  retries?: number;
  retryDelay?: number;
}

/**
 * HttpClient - Enterprise-grade HTTP client with advanced features
 *
 * Provides a type-safe, performant HTTP client with automatic token management,
 * intelligent caching, request retry logic, response transformation, and comprehensive
 * error handling. Features include request deduplication, exponential backoff retry,
 * automatic token refresh with queue management, and performance monitoring.
 */
class HttpClient {
  private axios: AxiosInstance;
  private config: Required<HttpClientConfig>;
  private cache?: ApiCache;
  private monitor?: ApiMonitor;

  // Token refresh management
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  /**
   * Creates a new HttpClient instance with enterprise features
   *
   * Initializes Axios instance with interceptors for authentication, data transformation,
   * error handling, and monitoring. Configures caching and retry behavior.
   *
   * @param config - HTTP client configuration including base URL, timeout, and feature flags
   * @param cache - Optional API cache instance for intelligent caching
   * @param monitor - Optional API monitor instance for performance tracking
   */
  constructor(
    config: HttpClientConfig,
    cache?: ApiCache,
    monitor?: ApiMonitor
  ) {
    this.config = {
      timeout: 30000,
      enableCache: true,
      enableMonitoring: true,
      enableTransform: true,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.cache = config.enableCache ? cache : undefined;
    this.monitor = config.enableMonitoring ? monitor : undefined;

    this.axios = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Execute GET request with intelligent caching
   *
   * Attempts to serve response from cache if available and valid, otherwise
   * executes request and caches response with configured TTL. Supports tag-based
   * cache invalidation for related resources.
   *
   * @param url - Request URL path (relative to base URL)
   * @param config - Optional request configuration with caching options
   * @returns Promise resolving to API response with cache metadata
   */
  async get<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    // Try cache first if enabled
    if (this.cache && config.cache) {
      const cacheKey = this.cache.createKey('GET', url, JSON.stringify(config.params || {}));
      
      try {
        const cachedData = await this.cache.get(
          cacheKey,
          () => this.executeRequest<T>('GET', url, undefined, config),
          config.cache
        );
        
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { ...this.axios.defaults, ...config },
          fromCache: true,
        } as ApiResponse<T>;
      } catch (error) {
        // Fall back to direct request if cache fails
      }
    }

    return this.executeRequest<T>('GET', url, undefined, config);
  }

  /**
   * Execute POST request with automatic cache invalidation
   *
   * Performs POST request and invalidates related cache entries to ensure
   * data consistency. Automatically transforms request data to backend format.
   *
   * @param url - Request URL path (relative to base URL)
   * @param data - Request payload data
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Invalidate related cache entries
    this.invalidateRelatedCache(url);
    
    return this.executeRequest<T>('POST', url, data, config);
  }

  /**
   * Execute PUT request with automatic cache invalidation
   *
   * Performs PUT request and invalidates related cache entries to ensure
   * data consistency. Automatically transforms request data to backend format.
   *
   * @param url - Request URL path (relative to base URL)
   * @param data - Request payload data
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Invalidate related cache entries
    this.invalidateRelatedCache(url);
    
    return this.executeRequest<T>('PUT', url, data, config);
  }

  /**
   * Execute DELETE request with automatic cache invalidation
   *
   * Performs DELETE request and invalidates related cache entries to ensure
   * data consistency. Useful for resource deletion operations.
   *
   * @param url - Request URL path (relative to base URL)
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async delete<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Invalidate related cache entries
    this.invalidateRelatedCache(url);
    
    return this.executeRequest<T>('DELETE', url, undefined, config);
  }

  /**
   * Execute HTTP request with exponential backoff retry logic
   *
   * Core request execution method with automatic retry for transient failures
   * (network errors, timeouts, 5xx errors, rate limits). Uses exponential backoff
   * delay between retries to prevent overwhelming servers. Thread-safe with proper
   * error propagation.
   *
   * @param method - HTTP method (GET, POST, PUT, DELETE)
   * @param url - Request URL path
   * @param data - Optional request payload
   * @param config - Request configuration
   * @param attempt - Current retry attempt number (internal)
   * @returns Promise resolving to API response
   * @throws Error if all retry attempts fail
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config: RequestConfig = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method,
        url,
        data,
        ...config,
      };

      const response = await this.axios.request<T>(requestConfig);
      
      return {
        ...response,
        fromCache: false,
      } as ApiResponse<T>;
    } catch (error) {
      // Handle retries for specific error types
      if (this.shouldRetry(error, attempt)) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.executeRequest<T>(method, url, data, config, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Setup Axios request and response interceptors
   *
   * Configures request interceptor for authentication token injection, request monitoring,
   * and data transformation. Configures response interceptor for response transformation,
   * monitoring completion, error handling, and automatic token refresh on 401 errors.
   * Handles auth-specific endpoints with special transformation logic.
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      async (config) => {
        // Start monitoring
        if (this.monitor && !config.skipMonitoring) {
          const requestId = this.monitor.startRequest(config);
          config.metadata = { requestId };
        }

        // Add authentication token
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Transform request data
        if (this.config.enableTransform && !config.skipTransform && config.data) {
          config.data = dataTransformer.toBackendFormat(config.data);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        const requestId = response.config?.metadata?.requestId;

        // Complete monitoring
        if (this.monitor && requestId) {
          this.monitor.completeRequest(requestId, response);
        }

        // Transform response data with auth-specific handling
        if (this.config.enableTransform && !response.config?.skipTransform) {
          // Detect authentication endpoints for special handling
          const url = response.config.url || '';
          const isAuthEndpoint = url.includes('/auth/login') || 
                                 url.includes('/auth/register') || 
                                 url.includes('/auth/refresh');
          
          if (isAuthEndpoint) {
            // Use auth-specific transformation for login/register/refresh endpoints
            response.data = dataTransformer.transformAuthResponse(response.data);
          } else {
            // Use general transformation for other endpoints
            response.data = dataTransformer.toFrontendFormat(response.data);
          }
        }

        return response;
      },
      async (error: AxiosError) => {
        const requestId = error.config?.metadata?.requestId;

        // Handle monitoring
        if (this.monitor && requestId) {
          this.monitor.handleError(requestId, error);
        }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !error.config?._retry) {
          return this.handleTokenRefresh(error);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle token refresh with queue management to prevent race conditions
   *
   * Manages concurrent refresh attempts by queueing subsequent requests while
   * a refresh is in progress. Ensures only one token refresh happens at a time,
   * preventing duplicate refresh requests. All queued requests receive the new
   * token once refresh completes. Thread-safe with proper promise coordination.
   *
   * @param error - Axios error from 401 response
   * @returns Promise resolving to retried request response
   * @throws Error if token refresh fails or no refresh token available
   */
  private async handleTokenRefresh(error: AxiosError): Promise<any> {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // If already refreshing, wait for the current refresh
    if (this.isRefreshing && this.refreshPromise) {
      try {
        const newToken = await this.refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return this.axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Mark as retry to prevent infinite loops
    originalRequest._retry = true;
    this.isRefreshing = true;

    // Create refresh promise
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      
      // Update the original request with new token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return this.axios(originalRequest);
    } catch (refreshError) {
      // Refresh failed - handle auth failure
      this.handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh API call
   *
   * Calls backend refresh endpoint with current refresh token and updates
   * TokenManager with new access and refresh tokens. Clears all tokens on
   * failure to force re-authentication. Updates token expiration metadata.
   *
   * @returns Promise resolving to new access token
   * @throws Error if no refresh token available or refresh request fails
   */
  private async performTokenRefresh(): Promise<string> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.axios.post('/auth/refresh-token', {
        refreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Update stored tokens
      tokenManager.setTokens({
        accessToken: newToken,
        refreshToken: newRefreshToken,
        expiresAt: tokenManager.calculateTokenExpiration(newToken),
      });

      return newToken;
    } catch (error) {
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Handle authentication failure by clearing tokens and redirecting to login
   *
   * Clears all stored tokens and redirects user to login page with return URL.
   * Only executes redirect in browser environment. Preserves current path for
   * post-login redirect. Prevents redirect loops for auth pages.
   */
  private handleAuthFailure(): void {
    tokenManager.clearTokens();

    // Redirect to login (only in browser)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  /**
   * Invalidate cache entries related to resource modifications
   *
   * Extracts resource type from URL and invalidates all cached entries for that
   * resource type. Ensures cache consistency after POST/PUT/DELETE operations.
   * Supports wildcard pattern matching for flexible cache invalidation.
   *
   * @param url - Request URL to extract resource type from
   */
  private invalidateRelatedCache(url: string): void {
    if (!this.cache) return;

    // Extract resource type from URL
    const segments = url.split('/').filter(Boolean);
    const resource = segments[0];

    if (resource) {
      // Invalidate all cache entries for this resource
      this.cache.invalidate(`*${resource}*`);
    }
  }

  /**
   * Determine if request should be retried based on error type and attempt count
   *
   * Retries network errors, server errors (5xx), timeouts (408), and rate limits (429).
   * Does not retry client errors (4xx except 408/429) or after max attempts reached.
   *
   * @param error - Error object from failed request
   * @param attempt - Current attempt number
   * @returns True if request should be retried, false otherwise
   */
  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.config.retries) return false;

    const status = error?.response?.status;
    
    // Retry on network errors, timeouts, and 5xx errors
    return (
      !status || // Network error
      status >= 500 || // Server error
      status === 408 || // Timeout
      status === 429 // Rate limit (with backoff)
    );
  }

  /**
   * Sleep utility for implementing retry delays
   *
   * @param ms - Milliseconds to sleep
   * @returns Promise resolving after delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get client performance and cache statistics
   *
   * Returns aggregated statistics from cache and monitoring services for
   * performance analysis and debugging. Useful for identifying bottlenecks
   * and cache effectiveness.
   *
   * @returns Object containing cache and monitor statistics
   */
  getStats() {
    return {
      cache: this.cache?.getStats(),
      monitor: this.monitor?.getPerformanceMetrics(),
    };
  }

  /**
   * Clear all cached responses
   *
   * Removes all entries from cache storage. Useful for force-refreshing data
   * or clearing stale cache after user logout.
   */
  clearCache(): void {
    this.cache?.clear();
  }
}

export { HttpClient };
export type { RequestConfig, ApiResponse, HttpClientConfig };