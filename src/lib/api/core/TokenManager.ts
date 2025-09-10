/**
 * TokenManager - Modern enterprise token management
 * 
 * Clean, type-safe token management with automatic refresh, secure storage,
 * and reactive updates. Built for modern TypeScript applications.
 */

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  sessionId?: string;
  refreshTokenExpiry?: number;
}

type TokenChangeListener = (tokenData: TokenData | null) => void;

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
   * Set tokens with automatic persistence and reactive updates
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
   * Get access token - primary method for authentication
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
   * Get refresh token for automatic token refresh
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
   * Clear all tokens - used by logout and auth failures
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
   * Check if user has valid tokens
   */
  hasTokens(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Sync tokens from localStorage to cookies (for server-side auth)
   * This fixes the localStorage/cookie mismatch that causes infinite redirects
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
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    if (!this.memoryStorage?.expiresAt) {
      // If no expiry info, try to decode JWT
      return this.isJWTExpired(this.getAccessToken());
    }
    
    return Date.now() >= this.memoryStorage.expiresAt;
  }

  /**
   * Check if token needs refresh soon (proactive refresh)
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
   * Calculate token expiration from JWT payload
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
   * Get token payload (for user info extraction)
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
   * Subscribe to token changes (reactive updates)
   */
  onTokenChange(callback: TokenChangeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Check if token refresh is in progress (prevents duplicate requests)
   */
  isRefreshingTokens(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set refresh state (used by interceptor)
   */
  setRefreshState(refreshing: boolean): void {
    this.isRefreshing = refreshing;
  }

  /**
   * Queue failed requests during token refresh
   */
  queueFailedRequest(resolve: (value?: any) => void, reject: (reason?: any) => void): void {
    this.failedQueue.push({ resolve, reject });
  }

  /**
   * Process queued requests after successful token refresh
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
   * Initialize tokens from storage on app startup
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
   * Check if storage is available (SSR compatibility)
   */
  isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }

  // Private helper methods
  private notifyListeners(tokenData: TokenData | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(tokenData);
      } catch (error) {
        console.error('Token change listener error:', error);
      }
    });
  }

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
   * ENTERPRISE FEATURE: Schedule automatic token refresh
   * Refreshes tokens 2 minutes before expiry to prevent auth failures
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
   * ENTERPRISE FEATURE: Get session ID for backend session management
   */
  getSessionId(): string | null {
    return this.memoryStorage?.sessionId || null;
  }

  /**
   * ENTERPRISE FEATURE: Check if token needs proactive refresh
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