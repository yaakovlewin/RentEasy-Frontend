/**
 * AuthClient - Enterprise-Grade Authentication API Client
 * 
 * Google/Netflix/Airbnb-tier authentication client with:
 * - Automatic response format normalization
 * - Enterprise token management
 * - Comprehensive error handling
 * - Performance monitoring integration
 * - Type-safe operations with unified type system
 */

import { HttpClient, ApiResponse } from '../core/HttpClient';
import { tokenManager } from '../core/TokenManager';
import { DataTransformer } from '../core/DataTransformer';

// Import enterprise-grade unified types
import {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthError,
  AuthErrorType,
  AuthEvent,
  AuthPerformanceMetric,
} from '../../../types/auth-enterprise';

class AuthClient {
  private dataTransformer: DataTransformer;
  
  constructor(private http: HttpClient) {
    this.dataTransformer = new DataTransformer();
  }

  /**
   * Login with email and password
   * ENTERPRISE GRADE: Handles both nested and flat token response formats
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const startTime = performance.now();
    
    try {
      // Make the API request
      const response = await this.http.post('/auth/login', credentials);
      
      // CRITICAL FIX: Transform backend response to frontend format
      const transformedData = this.dataTransformer.transformAuthResponse(response.data);
      
      // Validate transformation was successful
      if (!transformedData.token || !transformedData.user) {
        throw new Error('Invalid authentication response format after transformation');
      }
      
      // Store tokens automatically with enhanced token management
      tokenManager.setTokens({
        accessToken: transformedData.token,
        refreshToken: transformedData.refreshToken,
        expiresAt: transformedData.tokenExpiry || tokenManager.calculateTokenExpiration(transformedData.token),
      });

      // Store user info for quick access with session ID
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(transformedData.user));
        if (transformedData.sessionId) {
          localStorage.setItem('sessionId', transformedData.sessionId);
        }
      }

      // Record performance metrics for monitoring
      this.recordPerformanceMetric('login', performance.now() - startTime, true, {
        userId: transformedData.user.id,
        hasRefreshToken: !!transformedData.refreshToken,
        hasSessionId: !!transformedData.sessionId
      });

      return transformedData as AuthResponse;
      
    } catch (error) {
      // Record failed login attempt
      this.recordPerformanceMetric('login', performance.now() - startTime, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw this.enhanceAuthError(error, 'LOGIN_FAILED');
    }
  }

  /**
   * Register new user account
   * ENTERPRISE GRADE: Handles both nested and flat token response formats
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const startTime = performance.now();
    
    try {
      // Transform request data to backend format
      const backendData = this.dataTransformer.transformRegistrationRequest(userData);
      
      // Make the API request
      const response = await this.http.post('/auth/register', backendData);
      
      // CRITICAL FIX: Transform backend response to frontend format
      const transformedData = this.dataTransformer.transformAuthResponse(response.data);
      
      // Validate transformation was successful
      if (!transformedData.token || !transformedData.user) {
        throw new Error('Invalid authentication response format after transformation');
      }
      
      // Store tokens automatically with enhanced token management
      tokenManager.setTokens({
        accessToken: transformedData.token,
        refreshToken: transformedData.refreshToken,
        expiresAt: transformedData.tokenExpiry || tokenManager.calculateTokenExpiration(transformedData.token),
      });

      // Store user info and session data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(transformedData.user));
        if (transformedData.sessionId) {
          localStorage.setItem('sessionId', transformedData.sessionId);
        }
      }

      // Record performance metrics for monitoring
      this.recordPerformanceMetric('register', performance.now() - startTime, true, {
        userId: transformedData.user.id,
        role: transformedData.user.role,
        hasRefreshToken: !!transformedData.refreshToken
      });

      return transformedData as AuthResponse;
      
    } catch (error) {
      // Record failed registration attempt
      this.recordPerformanceMetric('register', performance.now() - startTime, false, {
        email: userData.email,
        role: userData.role,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw this.enhanceAuthError(error, 'REGISTRATION_FAILED');
    }
  }

  /**
   * Logout user and clear all tokens
   */
  async logout(): Promise<void> {
    try {
      await this.http.post('/auth/logout');
    } finally {
      // Always clear tokens and user data
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await this.http.get<User>('/auth/profile', {
      cache: {
        ttl: 10 * 60 * 1000, // 10 minutes
        tags: ['user-profile'],
      },
    });

    // Update stored user info
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    const response = await this.http.put<User>('/users/me', userData);
    
    // Update stored user info
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.http.post<{ imageUrl: string }>(
      '/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(request: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await this.http.post<{ message: string }>('/auth/forgot-password', request);
    return response.data;
  }

  /**
   * Reset password with token
   */
  async confirmPasswordReset(request: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await this.http.post<{ message: string }>('/auth/reset-password', request);
    return response.data;
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await this.http.put<{ message: string }>('/auth/change-password', request);
    return response.data;
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.http.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<{ message: string }> {
    const response = await this.http.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  }

  /**
   * Refresh access token
   * ENTERPRISE GRADE: Handles response transformation and enhanced error handling
   */
  async refreshToken(): Promise<RefreshResponse> {
    const startTime = performance.now();
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw this.enhanceAuthError(new Error('No refresh token available'), 'REFRESH_TOKEN_MISSING');
    }

    try {
      const response = await this.http.post(
        '/auth/refresh-token',
        { refreshToken },
        { skipMonitoring: true }
      );

      // Transform response if it contains nested tokens structure
      let transformedData;
      if (response.data.tokens) {
        transformedData = this.dataTransformer.transformAuthResponse(response.data);
      } else {
        transformedData = response.data;
      }

      // Update stored tokens with enhanced management
      tokenManager.setTokens({
        accessToken: transformedData.token,
        refreshToken: transformedData.refreshToken || refreshToken, // Keep existing if not provided
        expiresAt: transformedData.tokenExpiry || tokenManager.calculateTokenExpiration(transformedData.token),
      });

      // Record performance metrics
      this.recordPerformanceMetric('refresh_token', performance.now() - startTime, true);

      return transformedData as RefreshResponse;
      
    } catch (error) {
      // Record failed refresh attempt
      this.recordPerformanceMetric('refresh_token', performance.now() - startTime, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw this.enhanceAuthError(error, 'REFRESH_FAILED');
    }
  }

  /**
   * Verify current authentication status
   */
  async verifyAuth(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getProfile();
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  }

  // Utility methods
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.hasTokens() && !tokenManager.isAccessTokenExpired();
  }

  /**
   * Get current user from stored data (no API call)
   */
  getCurrentUser(): User | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      }
      
      // Fallback: decode from token
      const payload = tokenManager.getTokenPayload();
      if (payload) {
        return {
          id: payload.userId || payload.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          role: payload.role,
          phoneNumber: payload.phoneNumber,
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Check if token needs refresh soon
   */
  needsTokenRefresh(): boolean {
    return tokenManager.needsRefresh();
  }

  /**
   * Clear authentication state
   */
  clearAuth(): void {
    tokenManager.clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  /**
   * Subscribe to authentication changes
   */
  onAuthChange(callback: (user: User | null) => void): () => void {
    return tokenManager.onTokenChange((tokenData) => {
      if (tokenData) {
        // Token updated - get current user
        const user = this.getCurrentUser();
        callback(user);
      } else {
        // Token cleared
        callback(null);
      }
    });
  }

  // =============================================================================
  // ENTERPRISE UTILITY METHODS
  // =============================================================================

  /**
   * Enhanced error handling for authentication operations
   * Provides structured error information for better debugging and UX
   */
  private enhanceAuthError(error: any, type: string): AuthError {
    const authError: AuthError = {
      type: type as AuthErrorType,
      message: error?.message || 'Unknown authentication error',
      timestamp: new Date().toISOString(),
    };

    // Extract additional error information
    if (error?.response) {
      authError.statusCode = error.response.status;
      authError.code = error.response.data?.code || error.response.statusText;
      authError.details = error.response.data;
    }

    // Add request ID if available for tracing
    if (error?.response?.headers?.['x-request-id']) {
      authError.requestId = error.response.headers['x-request-id'];
    }

    return authError;
  }

  /**
   * Record performance metrics for authentication operations
   * Enterprise-grade monitoring integration
   */
  private recordPerformanceMetric(
    operation: string, 
    duration: number, 
    success: boolean, 
    metadata?: Record<string, any>
  ): void {
    const metric: AuthPerformanceMetric = {
      operation,
      duration,
      success,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // In development, log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug(`AuthClient Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        success,
        ...metadata,
      });
    }

    // In production, integrate with monitoring service
    if (typeof window !== 'undefined' && (window as any).analytics) {
      try {
        (window as any).analytics.track('Authentication Performance', metric);
      } catch (e) {
        // Silently fail if analytics not available
      }
    }
  }

  /**
   * Enhanced session cleanup with comprehensive storage clearing
   */
  private clearAllAuthData(): void {
    tokenManager.clearTokens();
    
    if (typeof window !== 'undefined') {
      // Clear all auth-related localStorage items
      const authKeys = ['user', 'sessionId', 'deviceId', 'lastActivity'];
      authKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear any cached auth data
      sessionStorage.removeItem('authState');
    }
  }

  /**
   * Advanced token validation with expiry prediction
   */
  private validateTokens(): boolean {
    const hasTokens = tokenManager.hasTokens();
    const isExpired = tokenManager.isAccessTokenExpired();
    const needsRefresh = tokenManager.needsRefresh();
    
    // Log token state in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('AuthClient Token Validation:', {
        hasTokens,
        isExpired,
        needsRefresh,
        expiryTime: tokenManager.getTokenExpiry(),
      });
    }
    
    return hasTokens && !isExpired;
  }

  /**
   * Get session information for monitoring
   */
  getSessionInfo(): {
    hasTokens: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    expiryTime: number | null;
    sessionId: string | null;
    userId: string | null;
  } {
    const user = this.getCurrentUser();
    const sessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('sessionId') 
      : null;
    
    return {
      hasTokens: tokenManager.hasTokens(),
      isExpired: tokenManager.isAccessTokenExpired(),
      needsRefresh: tokenManager.needsRefresh(),
      expiryTime: tokenManager.getTokenExpiry(),
      sessionId,
      userId: user?.id || null,
    };
  }
}

export { AuthClient };

// Re-export enterprise types for convenience
export type { 
  LoginRequest, 
  RegisterRequest, 
  User, 
  AuthResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthError,
  AuthErrorType,
  AuthEvent,
  AuthPerformanceMetric,
} from '../../../types/auth-enterprise';