import { describe, it, expect } from '@jest/globals';
import { DataTransformer } from '../DataTransformer';

describe('DataTransformer', () => {
  let transformer: DataTransformer;

  beforeEach(() => {
    transformer = new DataTransformer();
  });

  describe('toBackendFormat', () => {
    it('should transform camelCase to snake_case', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      };

      const result = transformer.toBackendFormat(input);

      expect(result).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      });
    });

    it('should handle nested objects', () => {
      const input = {
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        contactDetails: {
          phoneNumber: '1234567890',
        },
      };

      const result = transformer.toBackendFormat(input);

      expect(result).toEqual({
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
        contact_details: {
          phone_number: '1234567890',
        },
      });
    });

    it('should handle arrays', () => {
      const input = {
        userList: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' },
        ],
      };

      const result = transformer.toBackendFormat(input);

      expect(result.user_list[0]).toEqual({
        first_name: 'John',
        last_name: 'Doe',
      });
    });

    it('should handle null and undefined', () => {
      expect(transformer.toBackendFormat(null)).toBeNull();
      expect(transformer.toBackendFormat(undefined)).toBeUndefined();
    });

    it('should handle special user fields', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        email: 'john@example.com',
      };

      const result = transformer.toBackendFormat(input);

      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.phone_number).toBe('1234567890');
    });
  });

  describe('toFrontendFormat', () => {
    it('should transform snake_case to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      };

      const result = transformer.toFrontendFormat(input);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      });
    });

    it('should handle nested objects', () => {
      const input = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
        contact_details: {
          phone_number: '1234567890',
        },
      };

      const result = transformer.toFrontendFormat(input);

      expect(result).toEqual({
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
        contactDetails: {
          phoneNumber: '1234567890',
        },
      });
    });

    it('should handle arrays', () => {
      const input = {
        user_list: [
          { first_name: 'John', last_name: 'Doe' },
          { first_name: 'Jane', last_name: 'Smith' },
        ],
      };

      const result = transformer.toFrontendFormat(input);

      expect(result.userList[0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should handle user object transformation', () => {
      const input = {
        user: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '1234567890',
        },
      };

      const result = transformer.toFrontendFormat(input);

      expect(result.user).toEqual({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      });

      expect(result.user.first_name).toBeUndefined();
      expect(result.user.last_name).toBeUndefined();
      expect(result.user.phone_number).toBeUndefined();
    });

    it('should handle null and undefined', () => {
      expect(transformer.toFrontendFormat(null)).toBeNull();
      expect(transformer.toFrontendFormat(undefined)).toBeUndefined();
    });
  });

  describe('transformRegistrationRequest', () => {
    it('should transform registration data correctly', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        role: 'guest' as const,
      };

      const result = transformer.transformRegistrationRequest(input);

      expect(result).toEqual({
        email: 'john@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '1234567890',
        role: 'guest',
      });
    });

    it('should handle optional phoneNumber', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'owner' as const,
      };

      const result = transformer.transformRegistrationRequest(input);

      expect(result.phone_number).toBeUndefined();
    });
  });

  describe('transformAuthResponse', () => {
    it('should transform nested tokens structure to flat format', () => {
      const input = {
        tokens: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          accessTokenExpiry: 1234567890,
          refreshTokenExpiry: 1234567890,
        },
        user: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          role: 'guest',
        },
        sessionId: 'session-123',
      };

      const result = transformer.transformAuthResponse(input);

      expect(result.token).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-456');
      expect(result.tokenExpiry).toBe(1234567890);
      expect(result.refreshTokenExpiry).toBe(1234567890);
      expect(result.sessionId).toBe('session-123');
    });

    it('should handle flat token format', () => {
      const input = {
        token: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'guest',
        },
      };

      const result = transformer.transformAuthResponse(input);

      expect(result.token).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-456');
    });

    it('should transform user data comprehensively', () => {
      const input = {
        token: 'token-123',
        user: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          role: 'guest',
          phone_number: '1234567890',
          is_verified: true,
          is_active: true,
          last_login_at: '2024-01-01',
          created_at: '2023-01-01',
          updated_at: '2024-01-01',
        },
      };

      const result = transformer.transformAuthResponse(input);

      expect(result.user).toEqual({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'guest',
        phoneNumber: '1234567890',
        isVerified: true,
        isActive: true,
        lastLoginAt: '2024-01-01',
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
      });
    });

    it('should preserve metadata fields', () => {
      const input = {
        token: 'token-123',
        user: { id: '1', email: 'test@example.com', role: 'guest' },
        message: 'Login successful',
        success: true,
        sessionId: 'session-123',
      };

      const result = transformer.transformAuthResponse(input);

      expect(result.message).toBe('Login successful');
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('session-123');
    });

    it('should handle error field', () => {
      const input = {
        error: 'Invalid credentials',
        success: false,
      };

      const result = transformer.transformAuthResponse(input);

      expect(result.error).toBe('Invalid credentials');
      expect(result.success).toBe(false);
    });

    it('should return null for null input', () => {
      expect(transformer.transformAuthResponse(null)).toBeNull();
    });
  });

  describe('transformBookingRequest', () => {
    it('should transform booking data correctly', () => {
      const input = {
        propertyId: 'p123',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-05',
        numberOfGuests: 4,
      };

      const result = transformer.transformBookingRequest(input);

      expect(result).toEqual({
        propertyId: 'p123',
        checkIn: '2024-06-01',
        checkOut: '2024-06-05',
        guests: 4,
      });
    });
  });

  describe('transformFileUpload', () => {
    it('should transform file to FormData', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = transformer.transformFileUpload(file);

      expect(result).toBeInstanceOf(FormData);
      expect(result.get('file')).toBe(file);
    });

    it('should use custom field name', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = transformer.transformFileUpload(file, 'avatar');

      expect(result.get('avatar')).toBe(file);
    });
  });

  describe('cleanSearchParams', () => {
    it('should remove empty values', () => {
      const input = {
        location: 'Miami',
        minPrice: null,
        maxPrice: undefined,
        guests: '',
        bedrooms: 3,
      };

      const result = transformer.cleanSearchParams(input);

      expect(result).toEqual({
        location: 'Miami',
        bedrooms: 3,
      });
    });

    it('should remove zero values', () => {
      const input = {
        minPrice: 0,
        location: 'Miami',
      };

      const result = transformer.cleanSearchParams(input);

      expect(result).toEqual({
        location: 'Miami',
      });
    });

    it('should handle empty object', () => {
      const result = transformer.cleanSearchParams({});
      expect(result).toEqual({});
    });
  });

  describe('transformPropertyData', () => {
    it('should transform property data to backend format', () => {
      const input = {
        propertyName: 'Beach House',
        pricePerNight: 200,
        maxGuests: 6,
      };

      const result = transformer.transformPropertyData(input);

      expect(result).toEqual({
        property_name: 'Beach House',
        price_per_night: 200,
        max_guests: 6,
      });
    });
  });

  describe('transformUserProfileData', () => {
    it('should transform user profile data to backend format', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      const result = transformer.transformUserProfileData(input);

      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.phone_number).toBe('1234567890');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const jsonString = '{"name":"John","age":30}';
      const result = transformer.safeJsonParse(jsonString);

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should return fallback for invalid JSON', () => {
      const invalidJson = '{invalid json}';
      const result = transformer.safeJsonParse(invalidJson, { error: true });

      expect(result).toEqual({ error: true });
    });

    it('should return null as default fallback', () => {
      const invalidJson = '{invalid}';
      const result = transformer.safeJsonParse(invalidJson);

      expect(result).toBeNull();
    });
  });

  describe('safeJsonStringify', () => {
    it('should stringify valid object', () => {
      const obj = { name: 'John', age: 30 };
      const result = transformer.safeJsonStringify(obj);

      expect(result).toBe('{"name":"John","age":30}');
    });

    it('should handle circular references', () => {
      const obj: any = { name: 'John' };
      obj.self = obj;

      const result = transformer.safeJsonStringify(obj);

      expect(result).toBe('{}');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim email', () => {
      expect(transformer.sanitizeEmail('  JOHN@EXAMPLE.COM  ')).toBe('john@example.com');
      expect(transformer.sanitizeEmail('Test@Example.Com')).toBe('test@example.com');
    });
  });

  describe('transformErrorResponse', () => {
    it('should transform error with response data', () => {
      const error = {
        response: {
          data: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: { field: 'email' },
          },
        },
      };

      const result = transformer.transformErrorResponse(error);

      expect(result).toEqual({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: { field: 'email' },
      });
    });

    it('should handle error with validationErrors field', () => {
      const error = {
        response: {
          data: {
            message: 'Invalid input',
            error: 'BAD_REQUEST',
            validationErrors: ['Email is required'],
          },
        },
      };

      const result = transformer.transformErrorResponse(error);

      expect(result).toEqual({
        message: 'Invalid input',
        code: 'BAD_REQUEST',
        details: ['Email is required'],
      });
    });

    it('should handle error without response', () => {
      const error = new Error('Network error');

      const result = transformer.transformErrorResponse(error);

      expect(result).toEqual({
        message: 'Network error',
      });
    });

    it('should handle unknown error', () => {
      const result = transformer.transformErrorResponse({});

      expect(result).toEqual({
        message: 'An unexpected error occurred',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      expect(transformer.toBackendFormat({})).toEqual({});
      expect(transformer.toFrontendFormat({})).toEqual({});
    });

    it('should handle empty arrays', () => {
      const input = { items: [] };
      expect(transformer.toBackendFormat(input)).toEqual({ items: [] });
      expect(transformer.toFrontendFormat(input)).toEqual({ items: [] });
    });

    it('should handle primitive values', () => {
      expect(transformer.toBackendFormat('string')).toBe('string');
      expect(transformer.toBackendFormat(123)).toBe(123);
      expect(transformer.toBackendFormat(true)).toBe(true);
    });

    it('should handle dates in objects', () => {
      const date = new Date('2024-01-01');
      const input = { createdAt: date };

      const result = transformer.toBackendFormat(input);

      expect(result.created_at).toBe(date);
    });
  });
});
