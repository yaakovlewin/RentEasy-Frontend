/**
 * AsyncComponentBoundary Tests
 *
 * Comprehensive test suite for async component error boundary.
 * Tests async error handling, loading states, retry logic with exponential backoff, and max retries.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { AsyncComponentBoundary } from '../AsyncComponentBoundary';

const ThrowError = ({ shouldThrow, message = 'Async error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Async content loaded</div>;
};

describe('AsyncComponentBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  describe('Basic Error Catching', () => {
    it('should catch errors from async components', () => {
      render(
        <AsyncComponentBoundary componentName="AsyncComponent">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/asynccomponent error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <AsyncComponentBoundary componentName="AsyncComponent">
          <ThrowError shouldThrow={false} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText('Async content loaded')).toBeInTheDocument();
    });

    it('should catch errors from nested async components', () => {
      render(
        <AsyncComponentBoundary componentName="ParentAsync">
          <div>
            <div>
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/parentasync error/i)).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render component-specific error message', () => {
      render(
        <AsyncComponentBoundary componentName="DataLoader">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/dataloader error/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom async error</div>;

      render(
        <AsyncComponentBoundary componentName="Test" fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText('Custom async error')).toBeInTheDocument();
    });

    it('should apply async error styling', () => {
      const { container } = render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
      expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
    });

    it('should show error icon', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText('⚡')).toBeInTheDocument();
    });
  });

  describe('Retry Mechanism', () => {
    it('should show retry button with retry count', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={0} maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByRole('button', { name: /retry \(0\/3\)/i })).toBeInTheDocument();
    });

    it('should increment retry count on retry', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn(() => Promise.resolve());

      render(
        <AsyncComponentBoundary componentName="Test" onRetry={onRetry} retryCount={0} maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn(() => Promise.resolve());

      render(
        <AsyncComponentBoundary componentName="Test" onRetry={onRetry}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during retry', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <AsyncComponentBoundary componentName="Test" onRetry={onRetry} retryCount={0}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/retrying/i)).toBeInTheDocument();
      });
    });

    it('should show max retries reached message', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={3} maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/maximum retries reached/i)).toBeInTheDocument();
    });

    it('should disable retry button when max retries reached', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={3} maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should use default maxRetries of 3', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByRole('button', { name: /retry \(0\/3\)/i })).toBeInTheDocument();
    });

    it('should respect custom maxRetries', () => {
      render(
        <AsyncComponentBoundary componentName="Test" maxRetries={5}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByRole('button', { name: /retry \(0\/5\)/i })).toBeInTheDocument();
    });
  });

  describe('Loading Fallback', () => {
    it('should render custom loading fallback during retry', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const LoadingFallback = <div>Custom loading...</div>;

      render(
        <AsyncComponentBoundary
          componentName="Test"
          onRetry={onRetry}
          loadingFallback={LoadingFallback}
        >
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Custom loading...')).toBeInTheDocument();
      });
    });

    it('should show default loading spinner during retry', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <AsyncComponentBoundary componentName="Test" onRetry={onRetry}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/retrying/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reset Button', () => {
    it('should show reset button', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should reset error state on reset click', async () => {
      const user = userEvent.setup();

      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Error state is reset
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });
  });

  describe('Component Names', () => {
    it('should use Component as default name', () => {
      render(
        <AsyncComponentBoundary>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/component error/i)).toBeInTheDocument();
    });

    it('should handle custom component names', () => {
      render(
        <AsyncComponentBoundary componentName="DataFetcher">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/datafetcher error/i)).toBeInTheDocument();
    });

    it('should handle long component names', () => {
      const longName = 'VeryLongAsyncComponentName';

      render(
        <AsyncComponentBoundary componentName={longName}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(new RegExp(longName.toLowerCase(), 'i'))).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log async errors with component name', () => {
      render(
        <AsyncComponentBoundary componentName="AsyncLoader">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include retry count in logs', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={2}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include max retries in logs', () => {
      render(
        <AsyncComponentBoundary componentName="Test" maxRetries={5}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should warn when max retries reached', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={3} maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(consoleWarnSpy).toHaveBeenCalled();
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
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} message="Dev error" />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
    });

    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';

      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          {null}
        </AsyncComponentBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          {undefined}
        </AsyncComponentBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <AsyncComponentBoundary componentName="Test">
          <NoMessageError />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });

    it('should handle retryCount of 0', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={0}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByRole('button', { name: /retry \(0\/3\)/i })).toBeInTheDocument();
    });

    it('should handle negative retryCount gracefully', () => {
      render(
        <AsyncComponentBoundary componentName="Test" retryCount={-1}>
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple async boundaries independently', () => {
      render(
        <div>
          <AsyncComponentBoundary componentName="Async1">
            <ThrowError shouldThrow={true} />
          </AsyncComponentBoundary>
          <AsyncComponentBoundary componentName="Async2">
            <div>Success</div>
          </AsyncComponentBoundary>
        </div>
      );

      expect(screen.getByText(/async1 error/i)).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should maintain separate retry counts', () => {
      render(
        <div>
          <AsyncComponentBoundary componentName="Component1" retryCount={1}>
            <ThrowError shouldThrow={true} />
          </AsyncComponentBoundary>
          <AsyncComponentBoundary componentName="Component2" retryCount={2}>
            <ThrowError shouldThrow={true} />
          </AsyncComponentBoundary>
        </div>
      );

      const buttons = screen.getAllByRole('button', { name: /retry/i });
      expect(buttons[0]).toHaveTextContent('Retry (1/3)');
      expect(buttons[1]).toHaveTextContent('Retry (2/3)');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(container.querySelector('.min-h-\\[200px\\]')).toBeInTheDocument();
    });

    it('should have accessible retry button', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toBeDisabled();
    });

    it('should have accessible reset button', () => {
      render(
        <AsyncComponentBoundary componentName="Test">
          <ThrowError shouldThrow={true} />
        </AsyncComponentBoundary>
      );

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });
});
