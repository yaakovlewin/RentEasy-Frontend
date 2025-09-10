/**
 * TokenService Tests
 * Comprehensive tests for secure token management
 */
import { TokenData, TokenService } from '../services/TokenService';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock document.cookie for testing
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    // Reset mocks
    mockLocalStorage.clear();
    jest.clearAllMocks();

    // Mock window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Reset document.cookie
    document.cookie = '';

    tokenService = new TokenService({ storage: 'localStorage' });
  });

  describe('LocalStorage Operations', () => {
    const mockTokenData: TokenData = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: Date.now() + 3600000, // 1 hour from now
    };

    test('should store tokens in localStorage', () => {
      tokenService.setTokens(mockTokenData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        mockTokenData.accessToken
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        mockTokenData.refreshToken
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tokenExpiresAt',
        mockTokenData.expiresAt?.toString()
      );
    });

    test('should retrieve tokens from localStorage', () => {
      // Setup localStorage
      mockLocalStorage.setItem('accessToken', mockTokenData.accessToken);
      mockLocalStorage.setItem('refreshToken', mockTokenData.refreshToken!);
      mockLocalStorage.setItem('tokenExpiresAt', mockTokenData.expiresAt!.toString());

      const retrievedTokens = tokenService.getTokens();

      expect(retrievedTokens).toEqual(mockTokenData);
    });

    test('should return null when no tokens exist', () => {
      const tokens = tokenService.getTokens();
      expect(tokens).toBeNull();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should not throw error
      expect(() => tokenService.setTokens(mockTokenData)).not.toThrow();
    });
  });

  describe('Token Expiration', () => {
    test('should correctly identify expired tokens', () => {
      const expiredTokenData: TokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() - 1000, // 1 second ago
      };

      tokenService.setTokens(expiredTokenData);

      expect(tokenService.isAccessTokenExpired()).toBe(true);
    });

    test('should correctly identify non-expired tokens', () => {
      const validTokenData: TokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };

      tokenService.setTokens(validTokenData);

      expect(tokenService.isAccessTokenExpired()).toBe(false);
    });

    test('should handle tokens without expiration', () => {
      const tokenWithoutExpiration: TokenData = {
        accessToken: 'test-token',
        // No expiresAt
      };

      tokenService.setTokens(tokenWithoutExpiration);

      expect(tokenService.isAccessTokenExpired()).toBe(false);
    });
  });

  describe('JWT Token Parsing', () => {
    test('should calculate token expiration from JWT payload', () => {
      // Mock JWT token with exp claim
      const mockJwtPayload = {
        exp: Math.floor((Date.now() + 3600000) / 1000), // 1 hour from now in seconds
      };
      const mockJwtToken = `header.${btoa(JSON.stringify(mockJwtPayload))}.signature`;

      const expiration = tokenService.calculateTokenExpiration(mockJwtToken);

      expect(expiration).toBeCloseTo(Date.now() + 3600000, -3); // Allow 1 second tolerance
    });

    test('should handle invalid JWT tokens', () => {
      const invalidToken = 'invalid.token';

      const expiration = tokenService.calculateTokenExpiration(invalidToken);

      expect(expiration).toBeUndefined();
    });

    test('should handle JWT tokens without exp claim', () => {
      const mockJwtPayload = {
        userId: '123',
        // No exp claim
      };
      const mockJwtToken = `header.${btoa(JSON.stringify(mockJwtPayload))}.signature`;

      const expiration = tokenService.calculateTokenExpiration(mockJwtToken);

      expect(expiration).toBeUndefined();
    });
  });

  describe('Token Change Listeners', () => {
    test('should notify listeners when tokens are set', () => {
      const listener = jest.fn();
      const unsubscribe = tokenService.onTokenChange(listener);

      const tokenData: TokenData = {
        accessToken: 'test-token',
      };

      tokenService.setTokens(tokenData);

      expect(listener).toHaveBeenCalledWith(tokenData);

      // Cleanup
      unsubscribe();
    });

    test('should notify listeners when tokens are cleared', () => {
      const listener = jest.fn();
      tokenService.onTokenChange(listener);

      // Set tokens first
      tokenService.setTokens({ accessToken: 'test-token' });
      jest.clearAllMocks();

      // Clear tokens
      tokenService.clearTokens();

      expect(listener).toHaveBeenCalledWith(null);
    });

    test('should handle listener errors gracefully', () => {
      const faultyListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();

      tokenService.onTokenChange(faultyListener);
      tokenService.onTokenChange(goodListener);

      // Should not throw error
      expect(() => {
        tokenService.setTokens({ accessToken: 'test-token' });
      }).not.toThrow();

      // Good listener should still be called
      expect(goodListener).toHaveBeenCalled();
    });

    test('should properly unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = tokenService.onTokenChange(listener);

      unsubscribe();

      tokenService.setTokens({ accessToken: 'test-token' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Cookie Operations', () => {
    beforeEach(() => {
      tokenService = new TokenService({ storage: 'cookies' });
    });

    test('should store tokens in cookies', () => {
      const tokenData: TokenData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      tokenService.setTokens(tokenData);

      expect(document.cookie).toContain('accessToken=test-access-token');
      expect(document.cookie).toContain('refreshToken=test-refresh-token');
    });

    test('should retrieve tokens from cookies', () => {
      // Set cookies manually
      document.cookie = 'accessToken=test-token; path=/';
      document.cookie = 'refreshToken=refresh-token; path=/';

      const tokens = tokenService.getTokens();

      expect(tokens).toEqual({
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: undefined,
      });
    });
  });

  describe('Memory Storage', () => {
    beforeEach(() => {
      tokenService = new TokenService({ storage: 'memory' });
    });

    test('should store and retrieve tokens from memory', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
      };

      tokenService.setTokens(tokenData);
      const retrieved = tokenService.getTokens();

      expect(retrieved).toEqual(tokenData);
    });

    test('should clear tokens from memory', () => {
      tokenService.setTokens({ accessToken: 'test-token' });
      tokenService.clearTokens();

      expect(tokenService.getTokens()).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    test('should check if tokens exist', () => {
      expect(tokenService.hasTokens()).toBe(false);

      tokenService.setTokens({ accessToken: 'test-token' });

      expect(tokenService.hasTokens()).toBe(true);
    });

    test('should get access token directly', () => {
      const tokenData: TokenData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      tokenService.setTokens(tokenData);

      expect(tokenService.getAccessToken()).toBe('test-access-token');
    });

    test('should get refresh token directly', () => {
      const tokenData: TokenData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      tokenService.setTokens(tokenData);

      expect(tokenService.getRefreshToken()).toBe('test-refresh-token');
    });

    test('should return null for missing tokens', () => {
      expect(tokenService.getAccessToken()).toBeNull();
      expect(tokenService.getRefreshToken()).toBeNull();
    });
  });
});
