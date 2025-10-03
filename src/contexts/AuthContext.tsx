'use client';

/**
 * AuthContext - Global authentication state management for React applications
 *
 * Provides centralized authentication state management with automatic token synchronization,
 * user session persistence, and reactive updates across the application. Integrates with
 * TokenManager for token lifecycle management and AuthAPI for authentication operations.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { authAPI, AuthResponse } from '@/lib/api';
import { tokenManager } from '@/lib/api/core/TokenManager';

/**
 * Authentication context type definition
 *
 * Defines the shape of authentication state and methods available to consuming components.
 * Provides user data, authentication status, loading state, and authentication operations.
 */
interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: 'guest' | 'owner';
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

/**
 * Authentication context instance
 *
 * React context for sharing authentication state across component tree.
 * Use useAuth hook to access context values.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Authentication context provider component
 *
 * Wraps application or feature tree to provide authentication state and methods.
 * Handles token synchronization with TokenManager, user data persistence in localStorage,
 * automatic cookie syncing for SSR compatibility, and reactive updates on token changes.
 * Implements race condition prevention, error recovery, and debounced state updates.
 *
 * @param children - React components to wrap with authentication context
 *
 * @example
 * ```tsx
 * // App-level usage
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // Feature-level usage
 * <AuthProvider>
 *   <ProtectedFeature />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  /**
   * Sync user data to localStorage with error handling
   *
   * Persists user data to localStorage for browser refresh scenarios.
   * TokenManager handles token storage separately. Catches and handles
   * localStorage errors gracefully (quota exceeded, private browsing, etc.).
   *
   * Side effects: Updates or removes localStorage 'user' item
   *
   * @param userData - User data to persist or null to clear
   */
  const syncUserData = useCallback((userData: AuthResponse['user'] | null) => {
    if (typeof window === 'undefined') return;
    
    try {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      // Handle localStorage errors gracefully (quota exceeded, private browsing, etc.)
      console.warn('Failed to sync user data to localStorage:', error);
    }
  }, []);

  /**
   * Initialize authentication state from storage on mount
   *
   * Loads tokens from TokenManager and user data from localStorage on application
   * startup. Syncs tokens to cookies to fix localStorage/cookie mismatches that
   * cause infinite redirect loops. Implements race condition prevention with
   * atomic state updates and comprehensive error recovery.
   *
   * Side effects: Sets user/token state, syncs cookies, handles errors with cleanup
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        // Get token from TokenManager (enterprise-grade token management)
        const currentToken = tokenManager.getAccessToken();
        const storedUser = localStorage.getItem('user');

        if (currentToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // CRITICAL FIX: Ensure cookies are synced during initialization
            // This fixes cases where user has tokens but cookies weren't set
            // Use the private sync method to avoid triggering listeners
            if (typeof window !== 'undefined') {
              const refreshToken = tokenManager.getRefreshToken();
              
              // Manually sync to cookies without triggering setTokens
              const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              const secureFlag = isLocalhost ? '' : 'secure; ';
              const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
              const cookieOptions = `path=/; expires=${tokenExpires}; ${secureFlag}samesite=lax`;
              
              document.cookie = `token=${currentToken}; ${cookieOptions}`;
              if (refreshToken) {
                const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                document.cookie = `refreshToken=${refreshToken}; path=/; expires=${refreshExpires}; ${secureFlag}samesite=lax`;
              }
              
              // DEBUG: Log cookie sync during initialization
              if (process.env.NODE_ENV === 'development') {
                console.log('🔄 AuthContext: Syncing existing tokens to cookies during initialization');
              }
            }
            
            // Set state atomically to prevent inconsistent states
            setToken(currentToken);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Invalid user data in localStorage:', parseError);
            // Clear invalid user data and reset to clean state
            localStorage.removeItem('user');
            tokenManager.clearTokens();
            setToken(null);
            setUser(null);
          }
        } else {
          // Ensure clean state if tokens/user data are missing
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Failsafe: ensure clean state on any initialization error
        setToken(null);
        setUser(null);
      } finally {
        // Always complete loading, regardless of success/failure
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Subscribe to TokenManager changes for reactive authentication updates
   *
   * Registers listener for token changes to keep authentication state synchronized.
   * Implements debouncing (50ms) to prevent rapid state changes and unnecessary
   * re-renders. Cleans up listener and debounce timer on unmount. Syncs token
   * state when tokens updated, clears user state when tokens cleared.
   *
   * Side effects: Sets token/user state, syncs user data to localStorage
   */
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const unsubscribe = tokenManager.onTokenChange((tokenData) => {
      // Clear any existing timer
      if (debounceTimer) clearTimeout(debounceTimer);
      
      // Debounce rapid token changes to prevent unnecessary re-renders
      debounceTimer = setTimeout(() => {
        if (tokenData) {
          // Tokens updated - sync token state
          setToken(tokenData.accessToken);
        } else {
          // Tokens cleared - clear user state
          setToken(null);
          setUser(null);
          syncUserData(null);
        }
      }, 50); // 50ms debounce - fast enough for UX, slow enough to prevent spam
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  }, [syncUserData]);

  /**
   * Authenticate user with email and password
   *
   * Calls authentication API to verify credentials and obtain tokens. Updates
   * user and token state on successful authentication. TokenManager handles
   * token storage automatically via AuthAPI integration.
   *
   * @param email - User email address
   * @param password - User password
   * @throws Error if authentication fails or network error occurs
   */
  const login = async (email: string, password: string) => {
    try {
      // AuthClient already handles TokenManager integration
      const response = await authAPI.login({ email, password });
      const { user: userData } = response.data;

      // Set user data (tokens are already managed by AuthClient/TokenManager)
      setUser(userData);
      syncUserData(userData);
      
      // Sync token state from TokenManager
      const currentToken = tokenManager.getAccessToken();
      setToken(currentToken);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user account and authenticate
   *
   * Creates new user account with provided information and automatically logs
   * in the new user. Updates user and token state on successful registration.
   * TokenManager handles token storage automatically via AuthAPI integration.
   *
   * @param userData - New user registration information
   * @param userData.firstName - User's first name
   * @param userData.lastName - User's last name
   * @param userData.email - User's email address
   * @param userData.password - User's password
   * @param userData.phoneNumber - Optional phone number
   * @param userData.role - User role (guest or owner)
   * @throws Error if registration fails or network error occurs
   */
  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: 'guest' | 'owner';
  }) => {
    try {
      // AuthClient already handles TokenManager integration
      const response = await authAPI.register(userData);
      const { user: newUser } = response.data;

      // Set user data (tokens are already managed by AuthClient/TokenManager)
      setUser(newUser);
      syncUserData(newUser);
      
      // Sync token state from TokenManager
      const currentToken = tokenManager.getAccessToken();
      setToken(currentToken);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Log out current user and clear authentication state
   *
   * Calls logout API to invalidate server session, then clears all local
   * authentication state. TokenManager.clearTokens() is called by AuthAPI,
   * triggering onTokenChange listener to clear user state. Ensures immediate
   * local state cleanup regardless of API success/failure.
   *
   * Side effects: Clears tokens, cookies, localStorage, resets state
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      // TokenManager.clearTokens() is called by AuthClient, 
      // which triggers our onTokenChange listener to clear user state
      // But ensure local state is cleared immediately
      setToken(null);
      setUser(null);
      syncUserData(null);
    }
  };

  /**
   * Refresh current user data from server
   *
   * Fetches latest user profile data from API and updates local state.
   * Used to sync user information after profile updates or role changes.
   * Clears tokens and logs out user if profile fetch fails (invalid session).
   *
   * @throws Error if user not authenticated or profile fetch fails
   */
  const refreshUserData = async () => {
    const currentToken = tokenManager.getAccessToken();
    if (!currentToken) return;

    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      
      setUser(userData);
      syncUserData(userData);
    } catch (error) {
      // If profile fetch fails, user might be logged out
      // TokenManager will handle token clearance
      tokenManager.clearTokens();
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Access authentication context in components
 *
 * Hook to access authentication state and methods from AuthContext.
 * Must be used within AuthProvider component tree.
 *
 * @returns Authentication context value with user, token, status, and methods
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function ProfileComponent() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.firstName}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * useRequireAuth - Check authentication status in components
 *
 * Hook to check if user is authenticated and if authentication state is still loading.
 * Useful for conditional rendering based on auth status. For actual route protection,
 * use ProtectedRoute component instead which handles redirects automatically.
 *
 * @returns Object with isAuthenticated and isLoading flags
 *
 * @example
 * ```tsx
 * function DashboardComponent() {
 *   const { isAuthenticated, isLoading } = useRequireAuth();
 *
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return <Dashboard />;
 * }
 * ```
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  // This hook now just returns auth status
  // Route protection should be handled by ProtectedRoute component
  return { isAuthenticated, isLoading };
}
