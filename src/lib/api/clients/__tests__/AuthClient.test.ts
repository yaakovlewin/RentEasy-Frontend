import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthClient } from '../AuthClient';
import { HttpClient } from '../../core/HttpClient';
import { tokenManager } from '../../core/TokenManager';
import { DataTransformer } from '../../core/DataTransformer';

jest.mock('../../core/HttpClient');
jest.mock('../../core/DataTransformer');

const mockSetTokens = jest.fn();
const mockClearTokens = jest.fn();
const mockGetRefreshToken = jest.fn();
const mockCalculateTokenExpiration = jest.fn();
const mockHasTokens = jest.fn();
const mockIsAccessTokenExpired = jest.fn();
const mockNeedsRefresh = jest.fn();
const mockGetTokenExpiry = jest.fn();
const mockGetTokenPayload = jest.fn();
const mockOnTokenChange = jest.fn();

jest.mock('../../core/TokenManager', () => ({
  tokenManager: {
    setTokens: mockSetTokens,
    clearTokens: mockClearTokens,
    getRefreshToken: mockGetRefreshToken,
    calculateTokenExpiration: mockCalculateTokenExpiration,
    hasTokens: mockHasTokens,
    isAccessTokenExpired: mockIsAccessTokenExpired,
    needsRefresh: mockNeedsRefresh,
    getTokenExpiry: mockGetTokenExpiry,
    getTokenPayload: mockGetTokenPayload,
    onTokenChange: mockOnTokenChange,
  },
}));

describe('AuthClient', () => {
  let authClient: AuthClient;
  let mockHttp: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttp = new HttpClient('http://localhost:5000/api') as jest.Mocked<HttpClient>;
    authClient = new AuthClient(mockHttp);

    jest.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'guest',
          },
        },
      };

      const mockTransformedData = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: mockResponse.data.user,
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const dataTransformer = new DataTransformer();
      dataTransformer.transformAuthResponse = jest.fn().mockReturnValue(mockTransformedData);
      (authClient as any).dataTransformer = dataTransformer;

      mockCalculateTokenExpiration.mockReturnValue(Date.now() + 3600000);

      const result = await authClient.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSetTokens).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
      expect(result).toEqual(mockTransformedData);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      mockHttp.post = jest.fn().mockRejectedValue(mockError);

      await expect(
        authClient.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register successfully and store tokens', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '1',
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            role: 'guest',
          },
        },
      };

      const mockTransformedData = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: mockResponse.data.user,
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const dataTransformer = new DataTransformer();
      dataTransformer.transformAuthResponse = jest.fn().mockReturnValue(mockTransformedData);
      dataTransformer.transformRegistrationRequest = jest.fn().mockReturnValue({
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      });
      (authClient as any).dataTransformer = dataTransformer;

      mockCalculateTokenExpiration.mockReturnValue(Date.now() + 3600000);

      const result = await authClient.register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '1234567890',
      });

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
      expect(mockSetTokens).toHaveBeenCalled();
      expect(result).toEqual(mockTransformedData);
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      mockHttp.post = jest.fn().mockResolvedValue({});

      await authClient.logout();

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockClearTokens).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should clear tokens even if API call fails', async () => {
      mockHttp.post = jest.fn().mockRejectedValue(new Error('Network error'));

      await authClient.logout();

      expect(mockClearTokens).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getProfile', () => {
    it('should get user profile and cache it', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest',
      };

      mockHttp.get = jest.fn().mockResolvedValue({ data: mockUser });

      const result = await authClient.getProfile();

      expect(mockHttp.get).toHaveBeenCalledWith('/auth/profile', {
        cache: {
          ttl: 10 * 60 * 1000,
          tags: ['user-profile'],
        },
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: 'guest',
      };

      mockHttp.put = jest.fn().mockResolvedValue({ data: updatedUser });

      const result = await authClient.updateProfile({
        firstName: 'Updated',
      });

      expect(mockHttp.put).toHaveBeenCalledWith('/users/me', {
        firstName: 'Updated',
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
      expect(result).toEqual(updatedUser);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const mockResponse = {
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
        },
      };

      mockGetRefreshToken.mockReturnValue('old-refresh-token');
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const dataTransformer = new DataTransformer();
      dataTransformer.transformAuthResponse = jest.fn().mockReturnValue(mockResponse.data);
      (authClient as any).dataTransformer = dataTransformer;

      mockCalculateTokenExpiration.mockReturnValue(Date.now() + 3600000);

      const result = await authClient.refreshToken();

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/auth/refresh-token',
        { refreshToken: 'old-refresh-token' },
        { skipMonitoring: true }
      );

      expect(mockSetTokens).toHaveBeenCalled();
      expect(result.token).toBe('new-token');
    });

    it('should throw error if no refresh token available', async () => {
      mockGetRefreshToken.mockReturnValue(null);

      await expect(authClient.refreshToken()).rejects.toThrow();
    });
  });

  describe('password operations', () => {
    it('should request password reset', async () => {
      const mockResponse = { data: { message: 'Reset email sent' } };
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authClient.requestPasswordReset({ email: 'test@example.com' });

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });

      expect(result.message).toBe('Reset email sent');
    });

    it('should confirm password reset', async () => {
      const mockResponse = { data: { message: 'Password reset successful' } };
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authClient.confirmPasswordReset({
        token: 'reset-token',
        password: 'newpassword123',
      });

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        password: 'newpassword123',
      });

      expect(result.message).toBe('Password reset successful');
    });

    it('should change password for authenticated user', async () => {
      const mockResponse = { data: { message: 'Password changed' } };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await authClient.changePassword({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(mockHttp.put).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(result.message).toBe('Password changed');
    });
  });

  describe('utility methods', () => {
    it('should check if user is authenticated', () => {
      mockHasTokens.mockReturnValue(true);
      mockIsAccessTokenExpired.mockReturnValue(false);

      expect(authClient.isAuthenticated()).toBe(true);

      mockHasTokens.mockReturnValue(false);
      expect(authClient.isAuthenticated()).toBe(false);
    });

    it('should get current user from localStorage', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest',
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

      const result = authClient.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should check user role', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest',
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

      expect(authClient.hasRole('guest')).toBe(true);
      expect(authClient.hasRole('admin')).toBe(false);
    });

    it('should check if user has any of specified roles', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest',
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

      expect(authClient.hasAnyRole(['guest', 'admin'])).toBe(true);
      expect(authClient.hasAnyRole(['admin', 'staff'])).toBe(false);
    });

    it('should check if token needs refresh', () => {
      mockNeedsRefresh.mockReturnValue(true);

      expect(authClient.needsTokenRefresh()).toBe(true);
    });

    it('should clear auth data', () => {
      authClient.clearAuth();

      expect(mockClearTokens).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should get session info', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest',
      };

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'sessionId') return 'session-123';
        return null;
      });

      mockHasTokens.mockReturnValue(true);
      mockIsAccessTokenExpired.mockReturnValue(false);
      mockNeedsRefresh.mockReturnValue(false);
      mockGetTokenExpiry.mockReturnValue(Date.now() + 3600000);

      const sessionInfo = authClient.getSessionInfo();

      expect(sessionInfo).toEqual({
        hasTokens: true,
        isExpired: false,
        needsRefresh: false,
        expiryTime: expect.any(Number),
        sessionId: 'session-123',
        userId: '1',
      });
    });
  });

  describe('email verification', () => {
    it('should verify email', async () => {
      const mockResponse = { data: { message: 'Email verified' } };
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authClient.verifyEmail('verify-token');

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'verify-token',
      });

      expect(result.message).toBe('Email verified');
    });

    it('should resend email verification', async () => {
      const mockResponse = { data: { message: 'Verification email sent' } };
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authClient.resendEmailVerification();

      expect(mockHttp.post).toHaveBeenCalledWith('/auth/resend-verification');
      expect(result.message).toBe('Verification email sent');
    });
  });

  describe('verifyAuth', () => {
    it('should return valid auth status', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'guest',
      };

      mockHttp.get = jest.fn().mockResolvedValue({ data: mockUser });

      const result = await authClient.verifyAuth();

      expect(result).toEqual({ valid: true, user: mockUser });
    });

    it('should return invalid auth status on error', async () => {
      mockHttp.get = jest.fn().mockRejectedValue(new Error('Unauthorized'));

      const result = await authClient.verifyAuth();

      expect(result).toEqual({ valid: false });
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      const mockResponse = { data: { imageUrl: 'https://example.com/avatar.png' } };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authClient.uploadAvatar(mockFile);

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/users/me/avatar',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      expect(result.imageUrl).toBe('https://example.com/avatar.png');
    });
  });
});
