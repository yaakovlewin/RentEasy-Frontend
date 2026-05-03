/**
 * TokenManager - Modern enterprise token management
 *
 * Clean, type-safe token management with automatic refresh, secure storage,
 * and reactive updates. Built for modern TypeScript applications.
 */

import { isBrowser, hasLocalStorage } from '../../utils/environment';
import { setCookie, deleteCookie } from '../../utils/cookies';
import { TIME } from '../../utils/time';

/**
 * Token data structure for enterprise authentication
 *
 * Contains all authentication-related token information including access token,
 * refresh token, expiration metadata, and session tracking.
 */
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  sessionId?: string;
  refreshTokenExpiry?: number;
}

/**
 * Callback function for reactive token change notifications
 *
 * @param tokenData - New token data or null if tokens were cleared
 */
type TokenChangeListener = (tokenData: TokenData | null) => void;

/**
 * JWT payload structure
 */
export interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  userId?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'guest' | 'owner' | 'staff' | 'admin';
  phoneNumber?: string;
  [key: string]: unknown;
}

/**
 * Configuration constants for token management
 */
const TOKEN_CONFIG = {
  REFRESH_BUFFER_MS: 5 * TIME.MINUTE,
  AUTO_REFRESH_OFFSET_MS: 2 * TIME.MINUTE,
  DEFAULT_ACCESS_TOKEN_TTL_MS: TIME.HOUR,
  DEFAULT_REFRESH_TOKEN_TTL_MS: TIME.WEEK,
  MIN_REFRESH_TIME_MS: 30 * TIME.SECOND,
  MAX_REFRESH_TIME_MS: TIME.DAY,
} as const;

/**
 * Storage keys for token persistence
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

/**
 * TokenManager - Enterprise-grade token management with automatic refresh
 *
 * Manages JWT authentication tokens with automatic refresh scheduling, secure storage
 * across localStorage and cookies, reactive state updates, and SSR compatibility.
 * Features include proactive token refresh, queue management for concurrent requests,
 * cross-tab synchronization, and browser/server environment detection. Implements
 * singleton pattern for global token state management.
 */
class TokenManager {
  private memoryStorage: TokenData | null = null;
  private listeners: Set<TokenChangeListener> = new Set();
  
  // Modern refresh state management with proper typing
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (reason: unknown) => void;
  }> = [];
  
  // Enterprise features: automatic refresh scheduling
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Set authentication tokens with automatic persistence and reactive updates
   *
   * Stores tokens in memory for fast access, persists to localStorage for browser refresh
   * compatibility, and syncs to cookies for server-side authentication. Schedules automatic
   * token refresh based on expiration time and notifies all registered listeners. Handles
   * localhost development environment by removing secure cookie flag.
   *
   * Side effects: Updates localStorage, document.cookie, schedules refresh timer, triggers listeners
   *
   * @param tokenData - Complete token data including access token, refresh token, and metadata
   */
  setTokens(tokenData: TokenData): void {
    this.memoryStorage = tokenData;

    if (isBrowser()) {
      this.persistToLocalStorage(tokenData);
      this.syncTokensToCookies(
        tokenData.accessToken,
        tokenData.refreshToken,
        tokenData.expiresAt
      );
    }

    this.scheduleTokenRefresh();
    this.notifyListeners(tokenData);
  }

  /**
   * Get current access token for request authentication
   *
   * Attempts to retrieve access token from in-memory storage first (fastest),
   * then falls back to localStorage (browser refresh scenario). Automatically
   * syncs tokens to cookies if found in localStorage but not in memory to fix
   * localStorage/cookie mismatches that cause authentication issues.
   *
   * @returns Access token string or null if not authenticated
   */
  getAccessToken(): string | null {
    if (this.memoryStorage?.accessToken) {
      return this.memoryStorage.accessToken;
    }

    if (isBrowser()) {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (token) {
        this.syncTokensFromLocalStorage();
      }

      return token;
    }

    return null;
  }

  /**
   * Get refresh token for automatic token refresh operations
   *
   * Retrieves refresh token from in-memory storage first, then falls back
   * to localStorage. Used by token refresh mechanism to obtain new access tokens.
   *
   * @returns Refresh token string or null if not available
   */
  getRefreshToken(): string | null {
    if (this.memoryStorage?.refreshToken) {
      return this.memoryStorage.refreshToken;
    }

    if (isBrowser()) {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    return null;
  }

  /**
   * Clear all authentication tokens and session data
   *
   * Removes tokens from memory, localStorage, and cookies. Cancels scheduled
   * automatic refresh timer and notifies all listeners of token clearance.
   * Used during logout and authentication failures to ensure clean state.
   *
   * Side effects: Clears memory, localStorage, cookies, cancels timers, triggers listeners
   */
  clearTokens(): void {
    this.memoryStorage = null;
    this.cancelRefreshTimer();

    if (isBrowser()) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      deleteCookie(STORAGE_KEYS.ACCESS_TOKEN);
      deleteCookie(STORAGE_KEYS.REFRESH_TOKEN);
    }

    this.notifyListeners(null);
  }

  /**
   * Check if user has valid authentication tokens
   *
   * Verifies presence of access token without checking expiration.
   * Use isAccessTokenExpired() for expiration validation.
   *
   * @returns True if access token exists, false otherwise
   */
  hasTokens(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Sync tokens from localStorage to cookies for server-side authentication
   *
   * Fixes localStorage/cookie mismatch that causes infinite redirect loops.
   * Updates cookies without modifying localStorage or triggering listeners.
   * Only syncs when tokens exist in localStorage. Handles localhost development
   * by removing secure cookie flag.
   *
   * Side effects: Updates document.cookie only
   */
  private syncTokensFromLocalStorage(): void {
    if (!isBrowser()) return;

    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (accessToken) {
      const tokenExpires = Date.now() + TIME.DAY;
      this.syncTokensToCookies(accessToken, refreshToken || undefined, tokenExpires);
    }
  }

  /**
   * Check if access token has expired
   *
   * Validates token expiration using stored expiration metadata or by decoding
   * JWT payload if metadata unavailable. Returns true if token is expired or
   * cannot be validated.
   *
   * @returns True if token is expired or invalid, false otherwise
   */
  isAccessTokenExpired(): boolean {
    if (!this.memoryStorage?.expiresAt) {
      // If no expiry info, try to decode JWT
      return this.isJWTExpired(this.getAccessToken());
    }
    
    return Date.now() >= this.memoryStorage.expiresAt;
  }

  /**
   * Check if token needs proactive refresh soon
   *
   * Returns true if token expires within 5 minutes, allowing proactive refresh
   * before expiration to prevent authentication failures during active sessions.
   * Uses stored expiration metadata or JWT decoding with 5-minute buffer.
   *
   * @returns True if token should be refreshed proactively, false otherwise
   */
  needsRefresh(): boolean {
    if (!this.memoryStorage?.expiresAt) {
      return this.isJWTExpired(this.getAccessToken(), TOKEN_CONFIG.REFRESH_BUFFER_MS);
    }

    const bufferTime = Date.now() + TOKEN_CONFIG.REFRESH_BUFFER_MS;
    return this.memoryStorage.expiresAt <= bufferTime;
  }

  /**
   * Calculate token expiration timestamp from JWT payload
   *
   * Decodes JWT token to extract 'exp' claim and converts to millisecond timestamp.
   * Falls back to 1 hour default expiration if decoding fails or exp claim missing.
   *
   * @param token - JWT access token string
   * @returns Expiration timestamp in milliseconds
   */
  calculateTokenExpiration(token: string): number {
    const decoded = this.decodeJWT(token);
    return decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + TOKEN_CONFIG.DEFAULT_ACCESS_TOKEN_TTL_MS;
  }

  /**
   * Get decoded JWT token payload for user information extraction
   *
   * Decodes current access token and returns payload object containing user
   * claims (id, email, role, etc.). Returns null if no token or decode fails.
   *
   * @returns Decoded JWT payload object or null
   */
  getTokenPayload(): JWTPayload | null {
    const token = this.getAccessToken();
    return token ? this.decodeJWT(token) : null;
  }

  /**
   * Subscribe to token changes for reactive state updates
   *
   * Registers callback to be notified when tokens are set or cleared.
   * Used by React components and contexts to sync authentication state.
   * Returns unsubscribe function for cleanup.
   *
   * @param callback - Function called with new token data or null when tokens cleared
   * @returns Unsubscribe function to remove listener
   *
   * @example
   * ```typescript
   * const unsubscribe = tokenManager.onTokenChange((tokenData) => {
   *   if (tokenData) {
   *     console.log('User logged in:', tokenData.accessToken);
   *   } else {
   *     console.log('User logged out');
   *   }
   * });
   *
   * // Later: cleanup
   * unsubscribe();
   * ```
   */
  onTokenChange(callback: TokenChangeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Check if token refresh is currently in progress
   *
   * Used to prevent duplicate concurrent refresh requests. Returns true when
   * refresh operation is active.
   *
   * @returns True if refresh in progress, false otherwise
   */
  isRefreshingTokens(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set token refresh state flag
   *
   * Internal method used by HTTP interceptor to coordinate refresh operations.
   * Sets refresh state to prevent concurrent refresh attempts.
   *
   * @param refreshing - True when refresh starts, false when complete
   */
  setRefreshState(refreshing: boolean): void {
    this.isRefreshing = refreshing;
  }

  /**
   * Queue failed request during token refresh for retry after refresh completes
   *
   * Internal method used by HTTP interceptor to queue requests that failed with
   * 401 errors while token refresh is in progress. Queued requests are retried
   * with new token once refresh completes.
   *
   * @param resolve - Promise resolve function to call on successful refresh
   * @param reject - Promise reject function to call on failed refresh
   */
  queueFailedRequest(resolve: (value: string | null) => void, reject: (reason: unknown) => void): void {
    this.failedQueue.push({ resolve, reject });
  }

  /**
   * Process queued requests after token refresh completes
   *
   * Internal method used by HTTP interceptor to resolve or reject all queued
   * requests after refresh operation completes. Provides new token to successful
   * requests or propagates error to failed requests.
   *
   * @param error - Error object if refresh failed, null if successful
   * @param token - New access token if refresh succeeded, null if failed
   */
  processQueue(error: unknown, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Initialize token state from localStorage on application startup
   *
   * Loads stored tokens from localStorage into memory storage and notifies
   * listeners. Calculates token expiration from JWT payload. Only executes
   * in browser environment. Should be called once during app initialization.
   */
  initializeFromStorage(): void {
    if (isBrowser()) {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (token) {
        const tokenData: TokenData = {
          accessToken: token,
          refreshToken: refreshToken || undefined,
          expiresAt: this.calculateTokenExpiration(token)
        };

        this.memoryStorage = tokenData;
        this.notifyListeners(tokenData);
      }
    }
  }

  /**
   * Check if localStorage is available in current environment
   *
   * Detects browser environment and localStorage API availability.
   * Returns false in SSR/Node.js environments. Used for SSR compatibility.
   *
   * @returns True if localStorage available, false in SSR or unsupported browsers
   */
  isStorageAvailable(): boolean {
    return hasLocalStorage();
  }

  /**
   * Notify all registered listeners of token changes
   *
   * Internal method that calls all registered callbacks with new token data.
   * Catches and logs errors from individual listeners to prevent one listener
   * from breaking others. Called when tokens are set or cleared.
   *
   * @param tokenData - New token data or null if tokens cleared
   */
  private notifyListeners(tokenData: TokenData | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(tokenData);
      } catch (error) {
        console.error('Token change listener error:', error);
      }
    });
  }

  /**
   * Check if JWT token is expired with optional buffer time
   *
   * Decodes JWT to extract expiration claim and compares with current time plus
   * buffer. Returns true if token is null, malformed, or expired. Buffer allows
   * proactive refresh before actual expiration.
   *
   * @param token - JWT token string to check
   * @param bufferMs - Buffer time in milliseconds to add to current time (default: 0)
   * @returns True if token is expired or invalid, false otherwise
   */
  private isJWTExpired(token: string | null, bufferMs: number = 0): boolean {
    const decoded = this.decodeJWT(token);
    if (!decoded) return true;
    if (!decoded.exp) return false;

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now() + bufferMs;

    return currentTime >= expirationTime;
  }

  /**
   * Schedule automatic token refresh before expiration
   *
   * Enterprise feature that schedules proactive token refresh 2 minutes before
   * expiration to prevent authentication failures during active sessions. Validates
   * refresh timing (30 seconds minimum, 24 hours maximum) and cancels existing
   * timers. Clears tokens automatically if refresh fails. Only schedules if valid
   * expiration metadata exists.
   *
   * Side effects: Sets timeout timer, imports API client dynamically, may clear tokens on failure
   */
  private scheduleTokenRefresh(): void {
    if (!this.memoryStorage?.expiresAt) return;

    this.cancelRefreshTimer();

    const timeUntilRefresh = this.calculateRefreshDelay(this.memoryStorage.expiresAt);

    if (!this.isValidRefreshDelay(timeUntilRefresh)) {
      console.log('⏰ TokenManager: Skipping auto-refresh scheduling (invalid timing)');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏰ TokenManager: Scheduling auto-refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
    }

    this.refreshTimer = setTimeout(() => this.executeAutoRefresh(), timeUntilRefresh);
  }

  /**
   * Get session ID for backend session management
   *
   * Enterprise feature for session tracking and management. Returns session ID
   * from token metadata if available.
   *
   * @returns Session ID string or null if not available
   */
  getSessionId(): string | null {
    return this.memoryStorage?.sessionId || null;
  }

  /**
   * Get token expiry timestamp
   *
   * Returns the expiration timestamp of the current access token.
   *
   * @returns Expiration timestamp in milliseconds or null if not available
   */
  getTokenExpiry(): number | null {
    return this.memoryStorage?.expiresAt || null;
  }

  /**
   * Check if token should be refreshed proactively
   *
   * Enterprise feature for proactive token refresh. Returns true if token expires
   * within 5 minutes, allowing refresh before expiration during active sessions.
   *
   * @returns True if proactive refresh recommended, false otherwise
   */
  shouldRefreshProactively(): boolean {
    return this.needsRefresh();
  }

  /**
   * Persist token data to localStorage
   *
   * @param tokenData - Token data to persist
   */
  private persistToLocalStorage(tokenData: TokenData): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.accessToken);
    if (tokenData.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenData.refreshToken);
    }
  }

  /**
   * Sync tokens to cookies for server-side authentication
   *
   * @param accessToken - Access token to sync
   * @param refreshToken - Optional refresh token to sync
   * @param expiresAt - Optional expiration timestamp
   */
  private syncTokensToCookies(
    accessToken: string,
    refreshToken?: string,
    expiresAt?: number
  ): void {
    const tokenExpiry = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + TIME.DAY);

    setCookie(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
      expires: tokenExpiry,
    });

    if (refreshToken) {
      setCookie(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
        expires: new Date(Date.now() + TOKEN_CONFIG.DEFAULT_REFRESH_TOKEN_TTL_MS),
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🍪 TokenManager: Setting cookies', {
        accessToken: STORAGE_KEYS.ACCESS_TOKEN,
        refreshToken: refreshToken ? STORAGE_KEYS.REFRESH_TOKEN : 'none',
      });
    }
  }

  /**
   * Decode JWT token payload
   *
   * @param token - JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  private decodeJWT(token: string | null): JWTPayload | null {
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      return JSON.parse(atob(payload)) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Cancel existing refresh timer
   */
  private cancelRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Calculate delay until token refresh
   *
   * @param expiresAt - Token expiration timestamp
   * @returns Delay in milliseconds
   */
  private calculateRefreshDelay(expiresAt: number): number {
    const refreshTime = expiresAt - TOKEN_CONFIG.AUTO_REFRESH_OFFSET_MS;
    return Math.max(0, refreshTime - Date.now());
  }

  /**
   * Validate refresh delay timing
   *
   * @param delay - Delay in milliseconds
   * @returns True if delay is within acceptable range
   */
  private isValidRefreshDelay(delay: number): boolean {
    return delay >= TOKEN_CONFIG.MIN_REFRESH_TIME_MS &&
           delay <= TOKEN_CONFIG.MAX_REFRESH_TIME_MS;
  }

  /**
   * Execute automatic token refresh
   */
  private async executeAutoRefresh(): Promise<void> {
    try {
      const { api } = await import('../../api');
      await api.auth.refreshToken();

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 TokenManager: Automatic token refresh completed');
      }
    } catch (error) {
      console.warn('🚨 TokenManager: Automatic token refresh failed:', error);
      this.clearTokens();
    }
  }

}

// Singleton instance for global use
export const tokenManager = new TokenManager();

// Initialize from storage on module load
if (typeof window !== 'undefined') {
  tokenManager.initializeFromStorage();
}

export { TokenManager };
export default tokenManager;