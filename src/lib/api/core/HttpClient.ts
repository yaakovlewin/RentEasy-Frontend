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

export interface ApiResponse<T = any> extends AxiosResponse<T> {
  fromCache?: boolean;
  requestId?: string;
}

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  enableCache?: boolean;
  enableMonitoring?: boolean;
  enableTransform?: boolean;
  retries?: number;
  retryDelay?: number;
}

class HttpClient {
  private axios: AxiosInstance;
  private config: Required<HttpClientConfig>;
  private cache?: ApiCache;
  private monitor?: ApiMonitor;
  
  // Token refresh management
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

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
   * GET request with intelligent caching
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
   * POST request with cache invalidation
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
   * PUT request with cache invalidation
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
   * DELETE request with cache invalidation
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
   * Execute request with retry logic and error handling
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
   * Setup request and response interceptors
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
   * Handle token refresh with proper queue management
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
   * Perform the actual token refresh
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
   * Handle authentication failure
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
   * Invalidate cache entries related to the request
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
   * Check if request should be retried
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
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      cache: this.cache?.getStats(),
      monitor: this.monitor?.getPerformanceMetrics(),
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache?.clear();
  }
}

export { HttpClient };
export type { RequestConfig, ApiResponse, HttpClientConfig };