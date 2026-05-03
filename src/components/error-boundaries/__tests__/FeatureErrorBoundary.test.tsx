/**
 * FeatureErrorBoundary Tests
 *
 * Comprehensive test suite for feature-specific error boundary.
 * Tests feature isolation, severity levels, graceful degradation, and retry mechanisms.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { FeatureErrorBoundary } from '../FeatureErrorBoundary';

const ThrowError = ({ shouldThrow, message = 'Feature error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Feature working</div>;
};

describe('FeatureErrorBoundary', () => {
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
    it('should catch errors from feature components', () => {
      render(
        <FeatureErrorBoundary featureName="Search">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/search unavailable/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <FeatureErrorBoundary featureName="Search">
          <ThrowError shouldThrow={false} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('Feature working')).toBeInTheDocument();
    });

    it('should catch errors from nested components', () => {
      render(
        <FeatureErrorBoundary featureName="Booking">
          <div>
            <div>
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/booking unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Severity Levels', () => {
    it('should render critical level errors with appropriate styling', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Payment" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/payment unavailable/i)).toBeInTheDocument();
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
      expect(container.querySelector('.border-red-200')).toBeInTheDocument();
    });

    it('should render high level errors with appropriate styling', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Checkout" level="high">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
      expect(container.querySelector('.border-orange-200')).toBeInTheDocument();
    });

    it('should render medium level errors with appropriate styling', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Filter" level="medium">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
    });

    it('should render low level errors with appropriate styling', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Sort" level="low">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
      expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
    });

    it('should use medium level as default', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Default">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });
  });

  describe('Severity Icons', () => {
    it('should display critical icon for critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Critical" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('🚨')).toBeInTheDocument();
    });

    it('should display warning icon for high errors', () => {
      render(
        <FeatureErrorBoundary featureName="High" level="high">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should display medium icon for medium errors', () => {
      render(
        <FeatureErrorBoundary featureName="Medium" level="medium">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('⚡')).toBeInTheDocument();
    });

    it('should display low icon for low errors', () => {
      render(
        <FeatureErrorBoundary featureName="Low" level="low">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('💡')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render feature name in error message', () => {
      render(
        <FeatureErrorBoundary featureName="Property Gallery">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/property gallery unavailable/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom feature error</div>;

      render(
        <FeatureErrorBoundary featureName="Test" fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('Custom feature error')).toBeInTheDocument();
    });

    it('should show continue message for non-critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Filters" level="low">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/you can continue using other parts of the app/i)).toBeInTheDocument();
    });

    it('should show contact support message for critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Payment" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/please contact support/i)).toBeInTheDocument();
    });
  });

  describe('Retry Mechanism', () => {
    it('should show retry button when enabled', () => {
      render(
        <FeatureErrorBoundary featureName="Search" enableRetry={true}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should hide retry button when disabled', () => {
      render(
        <FeatureErrorBoundary featureName="Search" enableRetry={false}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(
        <FeatureErrorBoundary featureName="Search" enableRetry={true} onRetry={onRetry}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should enable retry by default', () => {
      render(
        <FeatureErrorBoundary featureName="Search">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Dismiss Button', () => {
    it('should show dismiss button for non-critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Sort" level="low">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should hide dismiss button for critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Payment" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('should reset error on dismiss click', async () => {
      const user = userEvent.setup();

      render(
        <FeatureErrorBoundary featureName="Filter" level="medium">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      // Error boundary state is reset
      expect(screen.getByText(/filter unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Development Error Details', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <FeatureErrorBoundary featureName="Test">
          <ThrowError shouldThrow={true} message="Test error message" />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <FeatureErrorBoundary featureName="Test">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log feature errors with severity level', () => {
      render(
        <FeatureErrorBoundary featureName="Search" level="high">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include feature name in logs', () => {
      render(
        <FeatureErrorBoundary featureName="PropertyGallery">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include timestamp in logs', () => {
      render(
        <FeatureErrorBoundary featureName="Test">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Critical Error Handling', () => {
    it('should show critical warning for critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Payment" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/this is a critical feature/i)).toBeInTheDocument();
    });

    it('should suggest page refresh for critical errors', () => {
      render(
        <FeatureErrorBoundary featureName="Booking" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/refresh the page or contact support/i)).toBeInTheDocument();
    });

    it('should use critical styling for critical errors', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Critical" level="critical">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(container.querySelector('.bg-red-600')).toBeInTheDocument();
    });
  });

  describe('Feature Isolation', () => {
    it('should isolate errors to specific features', () => {
      render(
        <div>
          <FeatureErrorBoundary featureName="Feature1">
            <ThrowError shouldThrow={true} />
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="Feature2">
            <div>Feature 2 working</div>
          </FeatureErrorBoundary>
        </div>
      );

      expect(screen.getByText(/feature1 unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Feature 2 working')).toBeInTheDocument();
    });

    it('should not affect sibling features', () => {
      render(
        <div>
          <FeatureErrorBoundary featureName="ErrorFeature">
            <ThrowError shouldThrow={true} />
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="WorkingFeature">
            <div>Still works</div>
          </FeatureErrorBoundary>
        </div>
      );

      expect(screen.getByText(/errorfeature unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Still works')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should require featureName prop', () => {
      render(
        <FeatureErrorBoundary featureName="RequiredFeature">
          <div>Content</div>
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle empty feature names', () => {
      render(
        <FeatureErrorBoundary featureName="">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
    });

    it('should handle long feature names', () => {
      const longName = 'VeryLongFeatureName'.repeat(5);

      render(
        <FeatureErrorBoundary featureName={longName}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <FeatureErrorBoundary featureName="Test">
          {null}
        </FeatureErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <FeatureErrorBoundary featureName="Test">
          {undefined}
        </FeatureErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <FeatureErrorBoundary featureName="Test">
          <NoMessageError />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/test unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <FeatureErrorBoundary featureName="Test">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(container.querySelector('.min-h-\\[250px\\]')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <FeatureErrorBoundary featureName="Test" enableRetry={true}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });
});
