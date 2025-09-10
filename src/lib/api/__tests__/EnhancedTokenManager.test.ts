/**
 * @fileoverview Enhanced TokenManager Tests
 * 
 * Tests for the enterprise-grade TokenManager consolidation.
 * Validates automatic refresh scheduling, session management, and backwards compatibility.
 */

import { tokenManager, TokenData } from '../core/TokenManager';

// Mock setTimeout and clearTimeout
const mockSetTimeout = jest.fn();
const mockClearTimeout = jest.fn();

// Mock dynamic import
jest.mock('../../api', () => ({
  api: {
    auth: {
      refreshToken: jest.fn(),
    },
  },
}));

describe('Enhanced TokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock timers
    global.setTimeout = mockSetTimeout.mockImplementation((fn) => {
      return 'mock-timer' as any;
    });
    global.clearTimeout = mockClearTimeout;
    
    // Clear any existing tokens
    tokenManager.clearTokens();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Enterprise Token Features', () => {
    it('should include sessionId in token data', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      
      expect(tokenManager.getSessionId()).toBe('session-123');
    });

    it('should schedule automatic refresh when tokens are set', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      
      // Should schedule a timer for auto-refresh (2 minutes before expiry)
      expect(mockSetTimeout).toHaveBeenCalled();
      
      const [refreshCallback, timeUntilRefresh] = mockSetTimeout.mock.calls[0];
      
      // Should schedule for approximately 58 minutes (1 hour - 2 minutes)
      const expectedTime = 58 * 60 * 1000; // 58 minutes in ms
      const tolerance = 5000; // 5 second tolerance
      
      expect(timeUntilRefresh).toBeGreaterThan(expectedTime - tolerance);
      expect(timeUntilRefresh).toBeLessThan(expectedTime + tolerance);
    });

    it('should check if token needs proactive refresh', () => {
      // Token expiring in 3 minutes (should need refresh)
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + (3 * 60 * 1000),
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      expect(tokenManager.shouldRefreshProactively()).toBe(true);

      // Token expiring in 10 minutes (should not need refresh)
      const tokenDataFuture: TokenData = {
        accessToken: 'test-token-2',
        refreshToken: 'refresh-token-2',
        expiresAt: Date.now() + (10 * 60 * 1000),
        sessionId: 'session-456'
      };

      tokenManager.setTokens(tokenDataFuture);
      expect(tokenManager.shouldRefreshProactively()).toBe(false);
    });

    it('should clear refresh timer when tokens are cleared', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      
      // Timer should be set
      expect(mockSetTimeout).toHaveBeenCalled();
      
      tokenManager.clearTokens();
      
      // Timer should be cleared
      expect(mockClearTimeout).toHaveBeenCalledWith('mock-timer');
      expect(tokenManager.getSessionId()).toBeNull();
    });

    it('should not schedule refresh for invalid timing', () => {
      // Token expiring in 10 seconds (too soon)
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 10000,
        sessionId: 'session-123'
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      tokenManager.setTokens(tokenData);
      
      // Should log that it's skipping the scheduling
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipping auto-refresh scheduling')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Backwards Compatibility', () => {
    it('should maintain all existing TokenManager functionality', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      };

      // All existing methods should still work
      expect(tokenManager.hasTokens()).toBe(false);
      
      tokenManager.setTokens(tokenData);
      
      expect(tokenManager.hasTokens()).toBe(true);
      expect(tokenManager.getAccessToken()).toBe('test-token');
      expect(tokenManager.getRefreshToken()).toBe('refresh-token');
      
      tokenManager.clearTokens();
      
      expect(tokenManager.hasTokens()).toBe(false);
      expect(tokenManager.getAccessToken()).toBeFalsy();
    });

    it('should handle cookie synchronization', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      };

      tokenManager.setTokens(tokenData);
      
      // Should set localStorage items
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    });

    it('should work with optional sessionId', () => {
      const tokenDataWithoutSession: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      };

      tokenManager.setTokens(tokenDataWithoutSession);
      
      expect(tokenManager.getSessionId()).toBeNull();
      expect(tokenManager.getAccessToken()).toBe('test-token');
    });
  });

  describe('Automatic Refresh Execution', () => {
    it('should handle successful automatic refresh', async () => {
      // Set development environment for logging
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const { api } = await import('../../api');
      (api.auth.refreshToken as jest.Mock).mockResolvedValue({
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      const tokenData: TokenData = {
        accessToken: 'old-token',
        refreshToken: 'old-refresh-token',
        expiresAt: Date.now() + 3600000,
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      
      // Get the callback function from setTimeout
      const [refreshCallback] = mockSetTimeout.mock.calls[0];
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Execute the refresh callback
      await refreshCallback();
      
      expect(api.auth.refreshToken).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Automatic token refresh completed')
      );
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle failed automatic refresh', async () => {
      const { api } = await import('../../api');
      (api.auth.refreshToken as jest.Mock).mockRejectedValue(new Error('Refresh failed'));

      const tokenData: TokenData = {
        accessToken: 'old-token',
        refreshToken: 'old-refresh-token',
        expiresAt: Date.now() + 3600000,
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      
      // Get the callback function from setTimeout
      const [refreshCallback] = mockSetTimeout.mock.calls[0];
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Execute the refresh callback
      await refreshCallback();
      
      expect(api.auth.refreshToken).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Automatic token refresh failed'),
        expect.any(Error)
      );
      
      // Should clear tokens on refresh failure
      expect(tokenManager.getAccessToken()).toBeFalsy();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Token Change Listeners', () => {
    it('should notify listeners when tokens are set or cleared', () => {
      const listener = jest.fn();
      
      const unsubscribe = tokenManager.onTokenChange(listener);
      
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
        sessionId: 'session-123'
      };

      tokenManager.setTokens(tokenData);
      
      expect(listener).toHaveBeenCalledWith(tokenData);
      
      tokenManager.clearTokens();
      
      expect(listener).toHaveBeenCalledWith(null);
      
      // Clean up
      unsubscribe();
    });
  });
});