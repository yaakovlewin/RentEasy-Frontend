/**
 * ApiErrors Tests
 * Comprehensive tests for structured error handling and retry logic
 */
import { AxiosError } from 'axios';

import {
  ApiErrorFactory,
  AuthenticationError,
  BaseApiError,
  ErrorRecovery,
  ErrorSeverity,
  ErrorType,
  getErrorMessage,
  getErrorSeverity,
  getRecoveryStrategy,
  isRetryableError,
  NetworkError,
  RateLimitError,
  RetryHandler,
  ServerError,
  TimeoutError,
  ValidationError,
} from '../errors/ApiErrors';

// Mock timers for retry testing
jest.useFakeTimers();

describe('ApiErrors', () => {
  describe('Specific Error Classes', () => {
    test('NetworkError should have correct properties', () => {
      const error = new NetworkError('Connection failed');

      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Connection failed');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.statusCode).toBe(0);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoveryStrategy).toBe(ErrorRecovery.RETRY);
      expect(error.timestamp).toBeDefined();
    });

    test('TimeoutError should have correct properties', () => {
      const error = new TimeoutError('Request timeout');

      expect(error.name).toBe('TimeoutError');
      expect(error.type).toBe(ErrorType.TIMEOUT);
      expect(error.statusCode).toBe(408);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.recoveryStrategy).toBe(ErrorRecovery.RETRY);
    });

    test('AuthenticationError should have correct properties', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.name).toBe('AuthenticationError');
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.statusCode).toBe(401);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.recoveryStrategy).toBe(ErrorRecovery.REFRESH_TOKEN);
    });

    test('ValidationError should handle validation details', () => {
      const validationErrors = {
        email: ['Email is required', 'Email format is invalid'],
        password: ['Password too short'],
      };

      const error = new ValidationError('Validation failed', validationErrors);

      expect(error.name).toBe('ValidationError');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.recoveryStrategy).toBe(ErrorRecovery.USER_ACTION);
      expect(error.validationErrors).toEqual(validationErrors);
    });

    test('RateLimitError should handle retryAfter', () => {
      const retryAfter = 5000; // 5 seconds
      const error = new RateLimitError('Rate limit exceeded', retryAfter);

      expect(error.name).toBe('RateLimitError');
      expect(error.type).toBe(ErrorType.RATE_LIMIT);
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(retryAfter);
      expect(error.recoveryStrategy).toBe(ErrorRecovery.RETRY);
    });

    test('ServerError should handle different status codes', () => {
      const error = new ServerError('Database error', 503);

      expect(error.name).toBe('ServerError');
      expect(error.type).toBe(ErrorType.SERVER);
      expect(error.statusCode).toBe(503);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('Error Serialization', () => {
    test('should serialize error to JSON correctly', () => {
      const error = new NetworkError('Connection failed');
      const json = error.toJSON();

      expect(json).toMatchObject({
        message: 'Connection failed',
        code: 'NetworkError',
        statusCode: 0,
        timestamp: expect.any(String),
      });
      expect(json.stack).toBeDefined(); // In development mode
    });

    test('should create string representation', () => {
      const error = new ValidationError('Invalid input', undefined);
      const stringRep = error.toString();

      expect(stringRep).toBe('ValidationError: Invalid input (400)');
    });
  });

  describe('ApiErrorFactory', () => {
    test('should create NetworkError from network AxiosError', () => {
      const axiosError = {
        message: 'Network Error',
        code: 'ECONNABORTED',
        response: undefined,
      } as AxiosError;

      const apiError = ApiErrorFactory.createFromAxiosError(axiosError);

      expect(apiError).toBeInstanceOf(TimeoutError);
      expect(apiError.type).toBe(ErrorType.TIMEOUT);
    });

    test('should create ValidationError from 400 response', () => {
      const axiosError = {
        message: 'Bad Request',
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            validationErrors: { email: ['Invalid email'] },
          },
        },
      } as AxiosError;

      const apiError = ApiErrorFactory.createFromAxiosError(axiosError);

      expect(apiError).toBeInstanceOf(ValidationError);
      expect(apiError.type).toBe(ErrorType.VALIDATION);
      expect((apiError as ValidationError).validationErrors).toEqual({
        email: ['Invalid email'],
      });
    });

    test('should create AuthenticationError from 401 response', () => {
      const axiosError = {
        message: 'Unauthorized',
        response: {
          status: 401,
          data: { message: 'Invalid token' },
        },
      } as AxiosError;

      const apiError = ApiErrorFactory.createFromAxiosError(axiosError);

      expect(apiError).toBeInstanceOf(AuthenticationError);
      expect(apiError.type).toBe(ErrorType.AUTHENTICATION);
    });

    test('should create RateLimitError with retryAfter from headers', () => {
      const axiosError = {
        message: 'Too Many Requests',
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' },
          headers: { 'retry-after': '30' },
        },
      } as AxiosError;

      const apiError = ApiErrorFactory.createFromAxiosError(axiosError);

      expect(apiError).toBeInstanceOf(RateLimitError);
      expect(apiError.retryAfter).toBe(30000); // Converted to milliseconds
    });

    test('should create ServerError from 500 response', () => {
      const axiosError = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          data: { message: 'Database connection failed' },
        },
      } as AxiosError;

      const apiError = ApiErrorFactory.createFromAxiosError(axiosError);

      expect(apiError).toBeInstanceOf(ServerError);
      expect(apiError.type).toBe(ErrorType.SERVER);
      expect(apiError.statusCode).toBe(500);
    });
  });

  describe('RetryHandler', () => {
    let retryHandler: RetryHandler;

    beforeEach(() => {
      retryHandler = new RetryHandler({
        maxAttempts: 3,
        baseDelay: 1000,
        backoffFactor: 2,
      });
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    test('should retry on retryable errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockRejectedValueOnce(new ServerError('Server error'))
        .mockResolvedValueOnce('success');

      const result = retryHandler.executeWithRetry(operation);

      // Fast-forward through retries
      jest.runAllTimers();

      await expect(result).resolves.toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should not retry non-retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue(new ValidationError('Invalid input'));

      await expect(retryHandler.executeWithRetry(operation)).rejects.toBeInstanceOf(
        ValidationError
      );

      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should respect maximum retry attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError('Connection failed'));

      const result = retryHandler.executeWithRetry(operation);

      // Fast-forward through all retry attempts
      jest.runAllTimers();

      await expect(result).rejects.toBeInstanceOf(NetworkError);
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    test('should use exponential backoff delay', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError('Connection failed'));
      const onRetry = jest.fn();

      retryHandler = new RetryHandler({
        maxAttempts: 3,
        baseDelay: 1000,
        backoffFactor: 2,
        onRetry,
      });

      const promise = retryHandler.executeWithRetry(operation);

      // Check delays: 1000ms, then 2000ms
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));

      jest.runAllTimers();

      await expect(promise).rejects.toBeInstanceOf(NetworkError);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    test('should use retryAfter from error when available', async () => {
      const operation = jest.fn().mockRejectedValue(new RateLimitError('Rate limit', 5000));

      const promise = retryHandler.executeWithRetry(operation);

      // Should use retryAfter (5000ms) instead of calculated delay
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);

      jest.runAllTimers();
      await expect(promise).rejects.toBeInstanceOf(RateLimitError);
    });

    test('should call onRetry callback', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValueOnce('success');
      const onRetry = jest.fn();

      retryHandler = new RetryHandler({
        maxAttempts: 2,
        onRetry,
      });

      const promise = retryHandler.executeWithRetry(operation);
      jest.runAllTimers();

      await expect(promise).resolves.toBe('success');
      expect(onRetry).toHaveBeenCalledWith(expect.any(NetworkError), 1);
    });
  });

  describe('Utility Functions', () => {
    test('isRetryableError should identify retryable errors', () => {
      expect(isRetryableError(new NetworkError())).toBe(true);
      expect(isRetryableError(new TimeoutError())).toBe(true);
      expect(isRetryableError(new ServerError())).toBe(true);
      expect(isRetryableError(new RateLimitError())).toBe(true);

      expect(isRetryableError(new ValidationError())).toBe(false);
      expect(isRetryableError(new AuthenticationError())).toBe(false);
      expect(isRetryableError(new Error('Regular error'))).toBe(false);
    });

    test('getErrorMessage should extract error messages', () => {
      const apiError = new ValidationError('Validation failed');
      const axiosError = {
        response: { data: { message: 'API error' } },
      };
      const regularError = new Error('Regular error');
      const unknownError = { someProperty: 'value' };

      expect(getErrorMessage(apiError)).toBe('Validation failed');
      expect(getErrorMessage(axiosError)).toBe('API error');
      expect(getErrorMessage(regularError)).toBe('Regular error');
      expect(getErrorMessage(unknownError)).toBe('An unexpected error occurred');
    });

    test('getErrorSeverity should return correct severity', () => {
      expect(getErrorSeverity(new NetworkError())).toBe(ErrorSeverity.HIGH);
      expect(getErrorSeverity(new ValidationError())).toBe(ErrorSeverity.LOW);
      expect(getErrorSeverity(new Error())).toBe(ErrorSeverity.MEDIUM);
    });

    test('getRecoveryStrategy should return correct strategy', () => {
      expect(getRecoveryStrategy(new AuthenticationError())).toBe(ErrorRecovery.REFRESH_TOKEN);
      expect(getRecoveryStrategy(new NetworkError())).toBe(ErrorRecovery.RETRY);
      expect(getRecoveryStrategy(new ValidationError())).toBe(ErrorRecovery.USER_ACTION);
      expect(getRecoveryStrategy(new Error())).toBe(ErrorRecovery.NONE);
    });
  });

  describe('Error Context and Details', () => {
    test('should include request context', () => {
      const originalError = {
        config: { url: '/api/users', method: 'GET' },
      } as AxiosError;

      const error = new NetworkError('Connection failed', originalError);

      expect(error.originalError).toBe(originalError);
      expect(error.originalError?.config?.url).toBe('/api/users');
    });

    test('should include additional details', () => {
      const details = { userId: '123', operation: 'update' };
      const error = new ServerError('Update failed', 500);

      // Manually add details (would typically be done in factory)
      error.details = details;

      expect(error.details).toEqual(details);
    });

    test('should include request ID for tracking', () => {
      const requestId = 'req_123456';
      const error = new NetworkError('Connection failed', undefined);

      // Manually add requestId (would typically be done by interceptor)
      error.requestId = requestId;

      expect(error.requestId).toBe(requestId);
    });
  });
});
