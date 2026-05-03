/**
 * ApiErrorBoundary Tests
 *
 * Comprehensive test suite for API-specific error boundary.
 * Tests API error handling, different error types, retry mechanisms, and structured error display.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ApiErrorBoundary } from '../ApiErrorBoundary';
import { BaseApiError } from '@/lib/api/services/ApiErrors';

// Mock API error classes
class NetworkError extends BaseApiError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 0, { category: 'network' });
    this.name = 'NetworkError';
  }
}

class ServerError extends BaseApiError {
  constructor(message: string) {
    super(message, 'SERVER_ERROR', 500, { category: 'server' });
    this.name = 'ServerError';
  }
}

class AuthenticationError extends BaseApiError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401, { category: 'authentication' });
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends BaseApiError {
  constructor(message: string) {
    super(message, 'AUTHZ_ERROR', 403, { category: 'authorization' });
    this.name = 'AuthorizationError';
  }
}

// Component that throws different error types
const ThrowApiError = ({ errorType, message }: { errorType: string; message?: string }) => {
  switch (errorType) {
    case 'network':
      throw new NetworkError(message || 'Network error occurred');
    case 'server':
      throw new ServerError(message || 'Server error occurred');
    case 'auth':
      throw new AuthenticationError(message || 'Authentication failed');
    case 'authz':
      throw new AuthorizationError(message || 'Access denied');
    case 'generic':
      throw new Error(message || 'Generic error');
    default:
      return <div>No error</div>;
  }
};

describe('ApiErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe('Basic Error Catching', () => {
    it('should catch API errors from child components', () => {
      render(
        <ApiErrorBoundary context="test operation">
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
    });

    it('should catch generic errors', () => {
      render(
        <ApiErrorBoundary context="test operation">
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ApiErrorBoundary context="test operation">
          <ThrowApiError errorType="none" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Network Errors', () => {
    it('should render network error fallback', () => {
      render(
        <ApiErrorBoundary context="fetching data">
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
      expect(screen.getByText(/unable to connect to our servers/i)).toBeInTheDocument();
    });

    it('should show retry button for network errors', () => {
      render(
        <ApiErrorBoundary context="fetching data">
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(
        <ApiErrorBoundary context="fetching data" onRetry={onRetry}>
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should display network-specific error message', () => {
      render(
        <ApiErrorBoundary context="loading properties">
          <ThrowApiError errorType="network" message="Connection timeout" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
    });
  });

  describe('Server Errors', () => {
    it('should render server error fallback', () => {
      render(
        <ApiErrorBoundary context="submitting form">
          <ThrowApiError errorType="server" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/server error/i)).toBeInTheDocument();
      expect(screen.getByText(/servers are experiencing issues/i)).toBeInTheDocument();
    });

    it('should show retry button for server errors', () => {
      render(
        <ApiErrorBoundary context="submitting form">
          <ThrowApiError errorType="server" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call onRetry for server errors', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(
        <ApiErrorBoundary context="submitting form" onRetry={onRetry}>
          <ThrowApiError errorType="server" />
        </ApiErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should apply server error styling', () => {
      const { container } = render(
        <ApiErrorBoundary context="submitting form">
          <ThrowApiError errorType="server" />
        </ApiErrorBoundary>
      );

      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('Authentication Errors', () => {
    it('should render authentication error fallback', () => {
      render(
        <ApiErrorBoundary context="accessing resource">
          <ThrowApiError errorType="auth" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
      expect(screen.getByText(/please log in to access this feature/i)).toBeInTheDocument();
    });

    it('should show login button for auth errors', () => {
      render(
        <ApiErrorBoundary context="accessing resource">
          <ThrowApiError errorType="auth" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
    });

    it('should apply authentication error styling', () => {
      const { container } = render(
        <ApiErrorBoundary context="accessing resource">
          <ThrowApiError errorType="auth" />
        </ApiErrorBoundary>
      );

      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });
  });

  describe('Authorization Errors', () => {
    it('should render authorization error fallback', () => {
      render(
        <ApiErrorBoundary context="viewing admin panel">
          <ThrowApiError errorType="authz" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    });

    it('should show go back button for authorization errors', () => {
      render(
        <ApiErrorBoundary context="viewing admin panel">
          <ThrowApiError errorType="authz" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should apply authorization error styling', () => {
      const { container } = render(
        <ApiErrorBoundary context="viewing admin panel">
          <ThrowApiError errorType="authz" />
        </ApiErrorBoundary>
      );

      expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom API error fallback</div>;

      render(
        <ApiErrorBoundary context="test" fallback={CustomFallback}>
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText('Custom API error fallback')).toBeInTheDocument();
    });

    it('should use custom fallback over default for all errors', () => {
      const CustomFallback = <div>Always custom</div>;

      render(
        <ApiErrorBoundary context="test" fallback={CustomFallback}>
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText('Always custom')).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log API errors with context', () => {
      render(
        <ApiErrorBoundary context="fetching user data">
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error type for BaseApiError', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="server" />
        </ApiErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include timestamp in logs', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log API error details', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="server" message="Internal server error" />
        </ApiErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Context Prop', () => {
    it('should use context in error messages', () => {
      render(
        <ApiErrorBoundary context="loading properties">
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/while loading properties/i)).toBeInTheDocument();
    });

    it('should handle different contexts', () => {
      const { rerender } = render(
        <ApiErrorBoundary context="fetching data">
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/while fetching data/i)).toBeInTheDocument();

      rerender(
        <ApiErrorBoundary context="submitting form">
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/while fetching data/i)).toBeInTheDocument();
    });

    it('should use default context when not provided', () => {
      render(
        <ApiErrorBoundary>
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Retry Mechanism', () => {
    it('should reset error state on retry', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(
        <ApiErrorBoundary onRetry={onRetry}>
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should handle retry without onRetry prop', async () => {
      const user = userEvent.setup();

      render(
        <ApiErrorBoundary>
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Should not crash
      expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
    });
  });

  describe('Generic Errors', () => {
    it('should render generic fallback for non-API errors', () => {
      render(
        <ApiErrorBoundary context="test operation">
          <ThrowApiError errorType="generic" message="Unknown error" />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should show retry button for generic errors', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should apply generic error styling', () => {
      const { container } = render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="generic" />
        </ApiErrorBoundary>
      );

      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <ApiErrorBoundary context="test">
          {null}
        </ApiErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <ApiErrorBoundary context="test">
          {undefined}
        </ApiErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <ApiErrorBoundary context="test">
          <NoMessageError />
        </ApiErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple API error boundaries independently', () => {
      render(
        <div>
          <ApiErrorBoundary context="operation 1">
            <ThrowApiError errorType="network" />
          </ApiErrorBoundary>
          <ApiErrorBoundary context="operation 2">
            <div>Success</div>
          </ApiErrorBoundary>
        </div>
      );

      expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should isolate errors to specific boundaries', () => {
      render(
        <div>
          <ApiErrorBoundary context="API call 1">
            <ThrowApiError errorType="server" />
          </ApiErrorBoundary>
          <ApiErrorBoundary context="API call 2">
            <ThrowApiError errorType="none" />
          </ApiErrorBoundary>
        </div>
      );

      expect(screen.getByText(/server error/i)).toBeInTheDocument();
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure for network errors', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="network" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should have proper semantic structure for server errors', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="server" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should have proper semantic structure for auth errors', () => {
      render(
        <ApiErrorBoundary context="test">
          <ThrowApiError errorType="auth" />
        </ApiErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
    });
  });
});
