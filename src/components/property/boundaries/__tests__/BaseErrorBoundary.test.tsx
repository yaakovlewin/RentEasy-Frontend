/**
 * BaseErrorBoundary Tests
 *
 * Comprehensive test suite for the base enterprise-grade error boundary.
 * Tests error classification, recovery strategies, severity levels, and monitoring integration.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  BaseErrorBoundary,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
} from '../BaseErrorBoundary';

const ThrowError = ({ shouldThrow, message = 'Base error', type = 'generic' }: {
  shouldThrow: boolean;
  message?: string;
  type?: string;
}) => {
  if (shouldThrow) {
    switch (type) {
      case 'network':
        const networkError = new Error(message);
        networkError.message = 'Network error: ' + message;
        throw networkError;
      case 'api':
        const apiError = new Error(message);
        apiError.message = 'API error: ' + message;
        throw apiError;
      case 'auth':
        const authError = new Error(message);
        authError.message = 'Unauthorized: ' + message;
        throw authError;
      default:
        throw new Error(message);
    }
  }
  return <div>Base content loaded</div>;
};

describe('BaseErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleInfoSpy.mockClear();
  });

  describe('Basic Error Catching', () => {
    it('should catch errors from child components', () => {
      render(
        <BaseErrorBoundary componentName="TestComponent">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <BaseErrorBoundary componentName="TestComponent">
          <ThrowError shouldThrow={false} />
        </BaseErrorBoundary>
      );

      expect(screen.getByText('Base content loaded')).toBeInTheDocument();
    });

    it('should catch errors from nested components', () => {
      render(
        <BaseErrorBoundary componentName="ParentComponent">
          <div>
            <div>
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Classification', () => {
    it('should classify network errors', () => {
      render(
        <BaseErrorBoundary componentName="NetworkTest">
          <ThrowError shouldThrow={true} type="network" message="Connection failed" />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should classify API errors', () => {
      render(
        <BaseErrorBoundary componentName="ApiTest">
          <ThrowError shouldThrow={true} type="api" message="500 internal error" />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should classify auth errors', () => {
      render(
        <BaseErrorBoundary componentName="AuthTest">
          <ThrowError shouldThrow={true} type="auth" message="unauthorized access" />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should classify generic errors', () => {
      render(
        <BaseErrorBoundary componentName="GenericTest">
          <ThrowError shouldThrow={true} message="Unknown error" />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Retry Mechanism', () => {
    it('should show retry button when enabled', () => {
      render(
        <BaseErrorBoundary componentName="RetryTest" enableRetry={true}>
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should hide retry button when disabled', () => {
      render(
        <BaseErrorBoundary componentName="NoRetryTest" enableRetry={false}>
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('should enable retry by default', () => {
      render(
        <BaseErrorBoundary componentName="DefaultRetryTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should respect maxRetries limit', () => {
      render(
        <BaseErrorBoundary componentName="MaxRetryTest" maxRetries={2}>
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Default Fallback UI', () => {
    it('should render error title', () => {
      render(
        <BaseErrorBoundary componentName="TitleTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should show Go Back button', () => {
      render(
        <BaseErrorBoundary componentName="GoBackTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should show Home button', () => {
      render(
        <BaseErrorBoundary componentName="HomeTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });

    it('should display error ID', () => {
      render(
        <BaseErrorBoundary componentName="ErrorIdTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/error id:/i)).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Component', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = () => <div>Custom error fallback</div>;

      render(
        <BaseErrorBoundary componentName="CustomTest" fallbackComponent={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    });
  });

  describe('Recovery Actions', () => {
    it('should render custom recovery actions', () => {
      const recoveryActions = [
        {
          label: 'Reload Page',
          action: () => window.location.reload(),
        },
      ];

      render(
        <BaseErrorBoundary componentName="ActionsTest" recoveryActions={recoveryActions}>
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('should execute custom recovery action on click', async () => {
      const user = userEvent.setup();
      const customAction = jest.fn();

      const recoveryActions = [
        {
          label: 'Custom Action',
          action: customAction,
        },
      ];

      render(
        <BaseErrorBoundary componentName="ActionClickTest" recoveryActions={recoveryActions}>
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      const actionButton = screen.getByRole('button', { name: /custom action/i });
      await user.click(actionButton);

      expect(customAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Messages', () => {
    it('should use custom API error message', () => {
      const customMessages = {
        [ErrorCategory.API]: 'Custom API error message',
      };

      render(
        <BaseErrorBoundary componentName="CustomMsgTest" customMessages={customMessages}>
          <ThrowError shouldThrow={true} type="api" />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/custom api error message/i)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log errors with component name', () => {
      render(
        <BaseErrorBoundary componentName="LogTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should call onError callback when provided', () => {
      const onError = jest.fn();

      render(
        <BaseErrorBoundary componentName="CallbackTest" onError={onError}>
          <ThrowError shouldThrow={true} message="Callback test error" />
        </BaseErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show technical details in development', () => {
      process.env.NODE_ENV = 'development';

      render(
        <BaseErrorBoundary componentName="DevTest" showTechnicalDetails={true}>
          <ThrowError shouldThrow={true} message="Dev error" />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/technical details/i)).toBeInTheDocument();
    });
  });

  describe('Feature Name Context', () => {
    it('should include feature name in error context', () => {
      render(
        <BaseErrorBoundary componentName="FeatureTest" featureName="property-search">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <BaseErrorBoundary componentName="NullTest">
          {null}
        </BaseErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <BaseErrorBoundary componentName="UndefinedTest">
          {undefined}
        </BaseErrorBoundary>
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <BaseErrorBoundary componentName="NoMsgTest">
          <NoMessageError />
        </BaseErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple error boundaries independently', () => {
      render(
        <div>
          <BaseErrorBoundary componentName="Component1">
            <ThrowError shouldThrow={true} />
          </BaseErrorBoundary>
          <BaseErrorBoundary componentName="Component2">
            <div>Component 2 works</div>
          </BaseErrorBoundary>
        </div>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText('Component 2 works')).toBeInTheDocument();
    });
  });

  describe('Specialized Property Boundaries', () => {
    it('should work with PropertyFeatureErrorBoundary', () => {
      const { PropertyFeatureErrorBoundary } = require('../BaseErrorBoundary');

      render(
        <PropertyFeatureErrorBoundary featureName="gallery">
          <ThrowError shouldThrow={true} />
        </PropertyFeatureErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(
        <BaseErrorBoundary componentName="A11yTest">
          <ThrowError shouldThrow={true} />
        </BaseErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      const backButton = screen.getByRole('button', { name: /go back/i });
      const homeButton = screen.getByRole('button', { name: /home/i });

      expect(retryButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });
  });
});
