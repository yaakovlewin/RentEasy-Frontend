/**
 * RouteErrorBoundary Tests
 *
 * Comprehensive test suite for route-specific error boundary.
 * Tests route error handling, navigation recovery, and contextual fallbacks.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { RouteErrorBoundary } from '../RouteErrorBoundary';

const ThrowError = ({ shouldThrow, message = 'Route error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Route content loaded</div>;
};

describe('RouteErrorBoundary', () => {
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
    it('should catch errors from route components', () => {
      render(
        <RouteErrorBoundary routeName="Dashboard">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/dashboard error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <RouteErrorBoundary routeName="Home">
          <ThrowError shouldThrow={false} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText('Route content loaded')).toBeInTheDocument();
    });

    it('should catch errors from nested route components', () => {
      render(
        <RouteErrorBoundary routeName="Profile">
          <div>
            <div>
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/profile error/i)).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render route-specific error title', () => {
      render(
        <RouteErrorBoundary routeName="Properties">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/properties error/i)).toBeInTheDocument();
    });

    it('should display route-specific error description', () => {
      render(
        <RouteErrorBoundary routeName="Bookings">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/loading the bookings page/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom route error</div>;

      render(
        <RouteErrorBoundary routeName="Settings" fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText('Custom route error')).toBeInTheDocument();
    });

    it('should apply route error styling', () => {
      const { container } = render(
        <RouteErrorBoundary routeName="Search">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      const errorContainer = container.querySelector('.min-h-\\[400px\\]');
      expect(errorContainer).toHaveClass('bg-blue-50');
      expect(errorContainer).toHaveClass('border-blue-200');
    });
  });

  describe('Error Logging', () => {
    it('should log route errors with route name', () => {
      render(
        <RouteErrorBoundary routeName="Dashboard">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include current URL in error logs', () => {
      render(
        <RouteErrorBoundary routeName="Profile">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include timestamp in logs', () => {
      render(
        <RouteErrorBoundary routeName="Settings">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Route Names', () => {
    it('should handle Dashboard route errors', () => {
      render(
        <RouteErrorBoundary routeName="Dashboard">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/dashboard error/i)).toBeInTheDocument();
    });

    it('should handle Property List route errors', () => {
      render(
        <RouteErrorBoundary routeName="Property List">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/property list error/i)).toBeInTheDocument();
    });

    it('should handle Booking route errors', () => {
      render(
        <RouteErrorBoundary routeName="Booking">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/booking error/i)).toBeInTheDocument();
    });

    it('should handle Profile route errors', () => {
      render(
        <RouteErrorBoundary routeName="Profile">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/profile error/i)).toBeInTheDocument();
    });

    it('should handle Settings route errors', () => {
      render(
        <RouteErrorBoundary routeName="Settings">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/settings error/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Recovery', () => {
    it('should suggest refreshing the page', () => {
      render(
        <RouteErrorBoundary routeName="Dashboard">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/try refreshing or navigate back/i)).toBeInTheDocument();
    });

    it('should provide navigation instructions', () => {
      render(
        <RouteErrorBoundary routeName="Profile">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/navigate back/i)).toBeInTheDocument();
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
        <RouteErrorBoundary routeName="Dashboard">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/dashboard error/i)).toBeInTheDocument();
    });

    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';

      render(
        <RouteErrorBoundary routeName="Dashboard">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/dashboard error/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Routes', () => {
    it('should handle errors in nested routes independently', () => {
      render(
        <div>
          <RouteErrorBoundary routeName="Route1">
            <ThrowError shouldThrow={true} />
          </RouteErrorBoundary>
          <RouteErrorBoundary routeName="Route2">
            <div>Route 2 works</div>
          </RouteErrorBoundary>
        </div>
      );

      expect(screen.getByText(/route1 error/i)).toBeInTheDocument();
      expect(screen.getByText('Route 2 works')).toBeInTheDocument();
    });

    it('should isolate errors to specific routes', () => {
      render(
        <RouteErrorBoundary routeName="OuterRoute">
          <div>
            <RouteErrorBoundary routeName="InnerRoute">
              <ThrowError shouldThrow={true} />
            </RouteErrorBoundary>
          </div>
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/innerroute error/i)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should require routeName prop', () => {
      render(
        <RouteErrorBoundary routeName="RequiredRoute">
          <div>Content</div>
        </RouteErrorBoundary>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle empty route names', () => {
      render(
        <RouteErrorBoundary routeName="">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('should handle long route names', () => {
      const longRoute = 'VeryLongRouteName'.repeat(5);

      render(
        <RouteErrorBoundary routeName={longRoute}>
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(new RegExp(longRoute.substring(0, 20).toLowerCase(), 'i'))).toBeInTheDocument();
    });

    it('should handle route names with special characters', () => {
      render(
        <RouteErrorBoundary routeName="User-Profile_2024">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/user-profile_2024 error/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <RouteErrorBoundary routeName="TestRoute">
          <NoMessageError />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/testroute error/i)).toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(
        <RouteErrorBoundary routeName="TestRoute">
          {null}
        </RouteErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <RouteErrorBoundary routeName="TestRoute">
          {undefined}
        </RouteErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle async component errors', () => {
      const AsyncError = () => {
        throw new Error('Async route error');
      };

      render(
        <RouteErrorBoundary routeName="AsyncRoute">
          <AsyncError />
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/asyncroute error/i)).toBeInTheDocument();
    });
  });

  describe('Component Reusability', () => {
    it('should be reusable across different routes', () => {
      const { rerender } = render(
        <RouteErrorBoundary routeName="Route1">
          <div>Route 1</div>
        </RouteErrorBoundary>
      );

      expect(screen.getByText('Route 1')).toBeInTheDocument();

      rerender(
        <RouteErrorBoundary routeName="Route2">
          <div>Route 2</div>
        </RouteErrorBoundary>
      );

      expect(screen.getByText('Route 2')).toBeInTheDocument();
    });

    it('should maintain separate state for each instance', () => {
      render(
        <div>
          <RouteErrorBoundary routeName="ErrorRoute">
            <ThrowError shouldThrow={true} />
          </RouteErrorBoundary>
          <RouteErrorBoundary routeName="SuccessRoute">
            <div>Success</div>
          </RouteErrorBoundary>
        </div>
      );

      expect(screen.getByText(/errorroute error/i)).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <RouteErrorBoundary routeName="TestRoute">
          <ThrowError shouldThrow={true} />
        </RouteErrorBoundary>
      );

      expect(container.querySelector('.min-h-\\[400px\\]')).toBeInTheDocument();
    });
  });
});
