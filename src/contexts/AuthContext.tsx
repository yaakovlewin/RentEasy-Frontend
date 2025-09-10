'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { authAPI, AuthResponse } from '@/lib/api';
import { tokenManager } from '@/lib/api/core/TokenManager';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Sync user data with localStorage (TokenManager handles tokens)
  // Optimized with error handling and stability
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

  // Initialize auth state from TokenManager and localStorage
  // Optimized with race condition prevention and error recovery
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

  // Subscribe to TokenManager changes for reactive updates
  // Optimized with debouncing to prevent rapid state changes
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for checking auth status in components
// NOTE: For actual route protection, use ProtectedRoute component instead
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  // This hook now just returns auth status
  // Route protection should be handled by ProtectedRoute component
  return { isAuthenticated, isLoading };
}
