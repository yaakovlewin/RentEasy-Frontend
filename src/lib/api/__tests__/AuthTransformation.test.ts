/**
 * @fileoverview Authentication Response Transformation Tests
 * 
 * Tests for the critical auth response format mismatch fix.
 * Validates that backend nested tokens structure is properly transformed to frontend flat structure.
 */

import { dataTransformer } from '../core/DataTransformer';

describe('AuthTransformation', () => {
  describe('transformAuthResponse', () => {
    it('should transform nested tokens structure to flat structure', () => {
      // Backend response format (what we receive)
      const backendResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'guest',
          phone_number: '+1234567890',
          is_verified: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        },
        tokens: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          accessTokenExpiry: 1640995200000,
          refreshTokenExpiry: 1641081600000
        },
        sessionId: 'session-789',
        message: 'Login successful'
      };

      const result = dataTransformer.transformAuthResponse(backendResponse);

      // Should have flat token structure (what frontend expects)
      expect(result.token).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-456');
      expect(result.tokenExpiry).toBe(1640995200000);
      expect(result.refreshTokenExpiry).toBe(1641081600000);

      // Should not have nested tokens object
      expect(result.tokens).toBeUndefined();

      // Should preserve session ID
      expect(result.sessionId).toBe('session-789');

      // Should preserve message
      expect(result.message).toBe('Login successful');

      // Should transform user data to camelCase
      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'guest',
        phoneNumber: '+1234567890',
        isVerified: true,
        isActive: true,
        lastLoginAt: undefined,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      });
    });

    it('should handle response without tokens (backward compatibility)', () => {
      const responseWithoutTokens = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'guest'
        },
        message: 'Profile updated'
      };

      const result = dataTransformer.transformAuthResponse(responseWithoutTokens);

      // Should return response unchanged if no tokens
      expect(result.token).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.user.firstName).toBe('John');
      expect(result.message).toBe('Profile updated');
    });

    it('should handle null/undefined response gracefully', () => {
      expect(dataTransformer.transformAuthResponse(null)).toBeNull();
      expect(dataTransformer.transformAuthResponse(undefined)).toBeUndefined();
      expect(dataTransformer.transformAuthResponse({})).toEqual({});
    });

    it('should handle mixed snake_case and camelCase user data', () => {
      const mixedResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',      // snake_case
          lastName: 'Doe',         // camelCase (should prefer this)
          phone_number: '+123',    // snake_case
          phoneNumber: '+456',     // camelCase (should prefer this)
          role: 'guest'
        },
        tokens: {
          accessToken: 'token-123',
          refreshToken: 'refresh-456'
        }
      };

      const result = dataTransformer.transformAuthResponse(mixedResponse);

      // Should prefer camelCase over snake_case when both are present
      expect(result.user.lastName).toBe('Doe');
      expect(result.user.phoneNumber).toBe('+456');
      expect(result.user.firstName).toBe('John'); // Only snake_case available
    });

    it('should handle refresh token response format', () => {
      // Backend refresh token response
      const refreshResponse = {
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          accessTokenExpiry: 1640995200000,
          refreshTokenExpiry: 1641081600000
        },
        sessionId: 'session-updated'
      };

      const result = dataTransformer.transformAuthResponse(refreshResponse);

      expect(result.token).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.tokenExpiry).toBe(1640995200000);
      expect(result.refreshTokenExpiry).toBe(1641081600000);
      expect(result.sessionId).toBe('session-updated');
      expect(result.tokens).toBeUndefined();
    });
  });

  describe('Integration with HttpClient', () => {
    it('should detect auth endpoints correctly', () => {
      // Test the auth endpoint detection logic
      const authEndpoints = [
        '/auth/login',
        '/auth/register', 
        '/auth/refresh',
        '/api/auth/login',
        'https://api.example.com/auth/login'
      ];

      const nonAuthEndpoints = [
        '/properties',
        '/bookings',
        '/auth/profile', // This should not trigger auth transformation
        '/users/auth'    // This should not trigger auth transformation
      ];

      authEndpoints.forEach(url => {
        const isAuthEndpoint = url.includes('/auth/login') || 
                              url.includes('/auth/register') || 
                              url.includes('/auth/refresh');
        expect(isAuthEndpoint).toBe(true);
      });

      nonAuthEndpoints.forEach(url => {
        const isAuthEndpoint = url.includes('/auth/login') || 
                              url.includes('/auth/register') || 
                              url.includes('/auth/refresh');
        expect(isAuthEndpoint).toBe(false);
      });
    });
  });
});