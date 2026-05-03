/**
 * AuthErrorBoundary Tests
 *
 * Comprehensive test suite for authentication-specific error boundary.
 * Tests auth error handling, recovery options, and fallback UI.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { AuthErrorBoundary } from '../AuthErrorBoundary';

const ThrowError = ({ shouldThrow, message = 'Auth error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Auth content loaded</div>;
};

describe('AuthErrorBoundary', () => {
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

  describe('Error Catching', () => {
    it('should catch errors from auth components', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={false} />
        </AuthErrorBoundary>
      );

      expect(screen.getByText('Auth content loaded')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render auth error title', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    });

    it('should render auth error description', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByText(/encountered an issue while processing your authentication request/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom auth error</div>;

      render(
        <AuthErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByText('Custom auth error')).toBeInTheDocument();
    });

    it('should apply gradient background', () => {
      const { container } = render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      const errorContainer = container.querySelector('.min-h-screen');
      expect(errorContainer).toHaveClass('bg-gradient-to-br');
    });
  });

  describe('Recovery Actions', () => {
    it('should show Try Again button', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should show Refresh Page button', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    });

    it('should show Return Home link', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      process.env.NODE_ENV = 'development';

      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} message="Dev auth error" />
        </AuthErrorBoundary>
      );

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log auth errors', () => {
      render(
        <AuthErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
