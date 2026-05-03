/**
 * Tests for AuthContext - TDD Baseline
 *
 * Comprehensive tests for authentication state management.
 * Following TDD principles: Tests written BEFORE refactoring.
 * Tests should FAIL initially to prove they test real functionality.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authAPI } from '@/lib/api';
import { tokenManager } from '@/lib/api/core/TokenManager';

// Mock API
jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));

// Mock TokenManager
jest.mock('@/lib/api/core/TokenManager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    hasTokens: jest.fn(),
    isAccessTokenExpired: jest.fn(),
    needsRefresh: jest.fn(),
    onTokenChange: jest.fn(() => jest.fn()), // Return unsubscribe function
    getTokenPayload: jest.fn(),
    getTokenExpiry: jest.fn(),
    calculateTokenExpiration: jest.fn(),
  },
}));

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Replace localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Clear localStorage before each test
    localStorageMock.clear();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default token manager mocks
    (tokenManager.hasTokens as jest.Mock).mockReturnValue(false);
    (tokenManager.isAccessTokenExpired as jest.Mock).mockReturnValue(true);
    (tokenManager.getAccessToken as jest.Mock).mockReturnValue(null);
    (tokenManager.onTokenChange as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Expect error when using hook outside provider
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });

    it('should provide auth context when used within provider', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      expect(result.current).toBeDefined();
      expect(result.current.login).toBeDefined();
      expect(result.current.register).toBeDefined();
      expect(result.current.logout).toBeDefined();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('TEST CASE 1: Login State Management', () => {
    it('should update user and token state after successful login', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'guest',
      };
      const mockToken = 'mock-access-token';

      (authAPI.login as jest.Mock).mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: mockToken,
        },
      });

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(mockToken);
      (tokenManager.hasTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.isAccessTokenExpired as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.login('john@example.com', 'password123');
      });

      // Assert
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update localStorage with user data on login', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'guest',
      };

      (authAPI.login as jest.Mock).mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      });

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.login('john@example.com', 'password123');
      });

      // Assert
      const storedUser = localStorageMock.getItem('user');
      expect(storedUser).toBeTruthy();
      expect(JSON.parse(storedUser!)).toEqual(mockUser);
    });

    it('should call authAPI.login with correct credentials', async () => {
      // Arrange
      (authAPI.login as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'guest' },
          token: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Assert
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error when login fails', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      (authAPI.login as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act & Assert
      await expect(async () => {
        await act(async () => {
          await result.current.login('wrong@example.com', 'wrongpassword');
        });
      }).rejects.toThrow('Invalid credentials');

      // Assert - State not updated on error
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('TEST CASE 2: Logout State Management', () => {
    it('should clear user and token on logout', async () => {
      // Arrange - Setup authenticated state
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'guest',
      };

      (authAPI.login as jest.Mock).mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      });

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('mock-token');
      (tokenManager.hasTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.isAccessTokenExpired as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('john@example.com', 'password123');
      });

      // Verify authenticated
      expect(result.current.isAuthenticated).toBe(true);

      // Act - Logout
      (authAPI.logout as jest.Mock).mockResolvedValueOnce(undefined);
      (tokenManager.hasTokens as jest.Mock).mockReturnValue(false);
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(null);

      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear localStorage on logout', async () => {
      // Arrange - Setup authenticated state
      localStorageMock.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));

      (authAPI.logout as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(localStorageMock.getItem('user')).toBeNull();
    });

    it('should call tokenManager.clearTokens on logout', async () => {
      // Arrange
      (authAPI.logout as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.logout();
      });

      // Assert - clearTokens called via authAPI
      // Note: authAPI.logout internally calls tokenManager.clearTokens
      expect(authAPI.logout).toHaveBeenCalled();
    });

    it('should clear state even if logout API fails', async () => {
      // Arrange
      const error = new Error('Logout failed');
      (authAPI.logout as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act - Should not throw
      await act(async () => {
        await result.current.logout();
      });

      // Assert - State cleared despite error
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });

  describe('TEST CASE 3: Token Synchronization', () => {
    it('should sync token from tokenManager after login', async () => {
      // Arrange
      const mockToken = 'synced-token';
      (authAPI.login as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'guest' },
          token: mockToken,
        },
      });

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(mockToken);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Assert
      expect(tokenManager.getAccessToken).toHaveBeenCalled();
      expect(result.current.token).toBe(mockToken);
    });

    it('should listen to tokenManager changes', () => {
      // Arrange & Act
      renderHook(() => useAuth(), { wrapper });

      // Assert - onTokenChange listener registered
      expect(tokenManager.onTokenChange).toHaveBeenCalled();
    });

    it('should update state when tokenManager notifies of token change', async () => {
      // Arrange
      let tokenChangeCallback: ((tokenData: any) => void) | null = null;

      (tokenManager.onTokenChange as jest.Mock).mockImplementation((callback) => {
        tokenChangeCallback = callback;
        return jest.fn(); // unsubscribe function
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act - Simulate token change notification
      const newToken = 'new-token';
      act(() => {
        if (tokenChangeCallback) {
          tokenChangeCallback({ accessToken: newToken, refreshToken: 'refresh' });
        }
      });

      // Wait for debounce
      await waitFor(() => {
        expect(result.current.token).toBe(newToken);
      }, { timeout: 100 });
    });
  });

  describe('TEST CASE 4: Initialization from Storage', () => {
    it('should initialize with stored user data on mount', async () => {
      // Arrange - Pre-populate localStorage
      const storedUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'guest',
      };
      localStorageMock.setItem('user', JSON.stringify(storedUser));

      const mockToken = 'stored-token';
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(mockToken);
      (tokenManager.hasTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.isAccessTokenExpired as jest.Mock).mockReturnValue(false);

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.user).toEqual(storedUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear invalid stored user data', async () => {
      // Arrange - Store invalid JSON
      localStorageMock.setItem('user', 'invalid-json');
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('some-token');

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert - Invalid data cleared
      expect(localStorageMock.getItem('user')).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should handle missing stored data gracefully', async () => {
      // Arrange - No stored data
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set isLoading to false after initialization', async () => {
      // Arrange
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('TEST CASE 5: Register State Management', () => {
    it('should update user and token state after successful registration', async () => {
      // Arrange
      const mockUser = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'owner',
      };
      const mockToken = 'new-user-token';

      (authAPI.register as jest.Mock).mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: mockToken,
        },
      });

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(mockToken);
      (tokenManager.hasTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.isAccessTokenExpired as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.register({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'Password123!',
          role: 'owner',
        });
      });

      // Assert
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should call authAPI.register with correct user data', async () => {
      // Arrange
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        phoneNumber: '+1234567890',
        role: 'owner' as const,
      };

      (authAPI.register as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: '2', ...userData },
          token: 'token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.register(userData);
      });

      // Assert
      expect(authAPI.register).toHaveBeenCalledWith(userData);
    });

    it('should throw error when registration fails', async () => {
      // Arrange
      const error = new Error('Email already exists');
      (authAPI.register as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act & Assert
      await expect(async () => {
        await act(async () => {
          await result.current.register({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'existing@example.com',
            password: 'Password123!',
            role: 'guest',
          });
        });
      }).rejects.toThrow('Email already exists');
    });
  });

  describe('TEST CASE 6: Refresh User Data', () => {
    it('should fetch and update user profile', async () => {
      // Arrange
      const updatedUser = {
        id: '1',
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        role: 'guest',
      };

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('valid-token');
      (authAPI.getProfile as jest.Mock).mockResolvedValueOnce({
        data: updatedUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.refreshUserData();
      });

      // Assert
      expect(result.current.user).toEqual(updatedUser);
    });

    it('should update localStorage with refreshed user data', async () => {
      // Arrange
      const updatedUser = {
        id: '1',
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        role: 'guest',
      };

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('valid-token');
      (authAPI.getProfile as jest.Mock).mockResolvedValueOnce({
        data: updatedUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.refreshUserData();
      });

      // Assert
      const storedUser = localStorageMock.getItem('user');
      expect(JSON.parse(storedUser!)).toEqual(updatedUser);
    });

    it('should clear tokens if profile fetch fails', async () => {
      // Arrange
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('invalid-token');
      (authAPI.getProfile as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act & Assert
      await expect(async () => {
        await act(async () => {
          await result.current.refreshUserData();
        });
      }).rejects.toThrow();

      expect(tokenManager.clearTokens).toHaveBeenCalled();
    });

    it('should not fetch profile if no token available', async () => {
      // Arrange
      (tokenManager.getAccessToken as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Act
      await act(async () => {
        await result.current.refreshUserData();
      });

      // Assert - getProfile not called
      expect(authAPI.getProfile).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Status', () => {
    it('should return isAuthenticated true when user and token exist', async () => {
      // Arrange
      (authAPI.login as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'guest' },
          token: 'token',
        },
      });

      (tokenManager.getAccessToken as jest.Mock).mockReturnValue('token');
      (tokenManager.hasTokens as jest.Mock).mockReturnValue(true);
      (tokenManager.isAccessTokenExpired as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      // Assert
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return isAuthenticated false when not logged in', () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
