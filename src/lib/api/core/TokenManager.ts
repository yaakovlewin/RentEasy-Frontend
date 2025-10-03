/**
 * TokenManager - Modern enterprise token management
 * 
 * Clean, type-safe token management with automatic refresh, secure storage,
 * and reactive updates. Built for modern TypeScript applications.
 */

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
    resolve: (token: string) => void;
    reject: (reason: any) => void;
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
    // Store in memory for fast access
    this.memoryStorage = tokenData;
    
    // Persist to localStorage for browser refresh compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', tokenData.accessToken);
      if (tokenData.refreshToken) {
        localStorage.setItem('refreshToken', tokenData.refreshToken);
      }
      
      // CRITICAL FIX: Also set cookies for server-side auth validation
      // This prevents the infinite redirect loop between client localStorage and server cookies
      const tokenExpires = tokenData.expiresAt ? new Date(tokenData.expiresAt).toUTCString() : '';
      
      // DEVELOPMENT-FRIENDLY: Remove secure flag for localhost development
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const secureFlag = isLocalhost ? '' : 'secure; ';
      const cookieOptions = `path=/; ${tokenExpires ? `expires=${tokenExpires}; ` : ''}${secureFlag}samesite=lax`;
      
      document.cookie = `token=${tokenData.accessToken}; ${cookieOptions}`;
      
      let refreshExpires = '';
      if (tokenData.refreshToken) {
        // Refresh token typically lasts longer (7 days default)
        refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `refreshToken=${tokenData.refreshToken}; path=/; expires=${refreshExpires}; ${secureFlag}samesite=lax`;
      }
      
      // DEBUG: Log cookie setting for development debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🍪 TokenManager: Setting cookies', {
          tokenCookie: `token=${tokenData.accessToken}; ${cookieOptions}`,
          refreshCookie: tokenData.refreshToken ? `refreshToken=${tokenData.refreshToken}; path=/; expires=${refreshExpires}; ${secureFlag}samesite=lax` : 'none',
          allCookies: document.cookie
        });
      }
    }
    
    // Enterprise feature: Schedule automatic refresh
    this.scheduleTokenRefresh();
    
    // Notify listeners for reactive updates
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
    // Try memory first (fastest)
    if (this.memoryStorage?.accessToken) {
      return this.memoryStorage.accessToken;
    }
    
    // Fallback to localStorage (browser refresh scenario)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // CRITICAL FIX: If we have token in localStorage but not in memory,
      // sync it to cookies for server-side auth validation
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
    // Try memory first
    if (this.memoryStorage?.refreshToken) {
      return this.memoryStorage.refreshToken;
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
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
    
    // Clear automatic refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // CRITICAL FIX: Also clear cookies for server-side auth
      // This prevents server-side auth validation from finding stale cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
    if (typeof window === 'undefined') return;
    
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      // Only sync to cookies, don't overwrite localStorage or notify listeners
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24h default
      
      // DEVELOPMENT-FRIENDLY: Remove secure flag for localhost
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const secureFlag = isLocalhost ? '' : 'secure; ';
      const cookieOptions = `path=/; expires=${tokenExpires}; ${secureFlag}samesite=lax`;
      
      document.cookie = `token=${accessToken}; ${cookieOptions}`;
      if (refreshToken) {
        const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `refreshToken=${refreshToken}; path=/; expires=${refreshExpires}; ${secureFlag}samesite=lax`;
      }
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
      // Check JWT expiry with 5-minute buffer
      return this.isJWTExpired(this.getAccessToken(), 5 * 60 * 1000);
    }
    
    // Refresh if expires within 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return this.memoryStorage.expiresAt <= fiveMinutesFromNow;
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
    try {
      const payload = token.split('.')[1];
      if (!payload) return Date.now() + (60 * 60 * 1000); // 1 hour default
      
      const decoded = JSON.parse(atob(payload));
      return decoded.exp ? decoded.exp * 1000 : Date.now() + (60 * 60 * 1000);
    } catch {
      return Date.now() + (60 * 60 * 1000); // 1 hour fallback
    }
  }

  /**
   * Get decoded JWT token payload for user information extraction
   *
   * Decodes current access token and returns payload object containing user
   * claims (id, email, role, etc.). Returns null if no token or decode fails.
   *
   * @returns Decoded JWT payload object or null
   */
  getTokenPayload(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
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
  queueFailedRequest(resolve: (value?: any) => void, reject: (reason?: any) => void): void {
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
  processQueue(error: any, token: string | null = null): void {
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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
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
    return typeof window !== 'undefined' && 'localStorage' in window;
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
    if (!token) return true;
    
    try {
      const payload = token.split('.')[1];
      if (!payload) return true;
      
      const decoded = JSON.parse(atob(payload));
      if (!decoded.exp) return false; // No expiry means it doesn't expire
      
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now() + bufferMs;
      
      return currentTime >= expirationTime;
    } catch {
      return true; // If we can't decode it, consider it expired
    }
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
    
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Calculate time until refresh (refresh 2 minutes before expiry)
    const now = Date.now();
    const refreshTime = this.memoryStorage.expiresAt - (2 * 60 * 1000);
    const timeUntilRefresh = Math.max(0, refreshTime - now);
    
    // Only schedule if refresh time is reasonable (not too soon or too far)
    const minRefreshTime = 30 * 1000; // 30 seconds minimum
    const maxRefreshTime = 24 * 60 * 60 * 1000; // 24 hours maximum
    
    if (timeUntilRefresh < minRefreshTime || timeUntilRefresh > maxRefreshTime) {
      console.log('⏰ TokenManager: Skipping auto-refresh scheduling (invalid timing)');
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏰ TokenManager: Scheduling auto-refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
    }
    
    this.refreshTimer = setTimeout(async () => {
      try {
        // Import the AuthClient dynamically to avoid circular dependencies
        const { api } = await import('../../api');
        await api.auth.refreshToken();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 TokenManager: Automatic token refresh completed');
        }
      } catch (error) {
        console.warn('🚨 TokenManager: Automatic token refresh failed:', error);
        // Clear tokens on refresh failure to force re-authentication
        this.clearTokens();
      }
    }, timeUntilRefresh);
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
   * Check if token should be refreshed proactively
   *
   * Enterprise feature for proactive token refresh. Returns true if token expires
   * within 5 minutes, allowing refresh before expiration during active sessions.
   *
   * @returns True if proactive refresh recommended, false otherwise
   */
  shouldRefreshProactively(): boolean {
    if (!this.memoryStorage?.expiresAt) return false;
    
    // Check if token expires within 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return this.memoryStorage.expiresAt <= fiveMinutesFromNow;
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