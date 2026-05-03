/**
 * PublicErrorBoundary Tests
 *
 * Comprehensive test suite for public page error boundary.
 * Tests public page error handling, marketing-focused recovery, and user-friendly fallbacks.
 */

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { PublicErrorBoundary } from '../PublicErrorBoundary';

const ThrowError = ({ shouldThrow, message = 'Public error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Public content loaded</div>;
};

describe('PublicErrorBoundary', () => {
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
    it('should catch errors from public page components', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={false} />
        </PublicErrorBoundary>
      );

      expect(screen.getByText('Public content loaded')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render user-friendly error title', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    });

    it('should render marketing-focused description', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByText(/sorry, but there seems to be a technical issue/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom public error</div>;

      render(
        <PublicErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByText('Custom public error')).toBeInTheDocument();
    });
  });

  describe('Recovery Actions', () => {
    it('should show Try Again button', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should show Refresh Page button', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    });

    it('should show Go Home link', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    });
  });

  describe('Alternative Navigation', () => {
    it('should show Find Properties link', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByRole('link', { name: /find properties/i })).toBeInTheDocument();
    });

    it('should show My Account link', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(screen.getByRole('link', { name: /my account/i })).toBeInTheDocument();
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
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} message="Dev public error" />
        </PublicErrorBoundary>
      );

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log public page errors', () => {
      render(
        <PublicErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PublicErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
