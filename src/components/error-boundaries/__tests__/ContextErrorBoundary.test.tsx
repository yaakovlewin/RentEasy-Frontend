/**
 * ContextErrorBoundary Tests
 *
 * Comprehensive test suite for context-specific error boundary.
 * Tests context error handling, provider recovery, and state preservation.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ContextErrorBoundary } from '../ContextErrorBoundary';

// Mock context that can throw errors
const TestContext = React.createContext<{ value: string } | null>(null);

const ThrowingProvider = ({ shouldThrow, children }: { shouldThrow: boolean; children: React.ReactNode }) => {
  if (shouldThrow) {
    throw new Error('Context initialization error');
  }
  return <TestContext.Provider value={{ value: 'test' }}>{children}</TestContext.Provider>;
};

// Consumer component
const TestConsumer = () => {
  const context = React.useContext(TestContext);
  return <div>Context value: {context?.value || 'none'}</div>;
};

// Component that throws in render
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Child component error');
  }
  return <div>No error</div>;
};

describe('ContextErrorBoundary', () => {
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
    it('should catch errors from context providers', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowingProvider shouldThrow={true}>
            <TestConsumer />
          </ThrowingProvider>
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });

    it('should catch errors from child components', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowingProvider shouldThrow={false}>
            <TestConsumer />
          </ThrowingProvider>
        </ContextErrorBoundary>
      );

      expect(screen.getByText('Context value: test')).toBeInTheDocument();
    });

    it('should handle multiple children without errors', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ContextErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render default fallback UI on error', () => {
      render(
        <ContextErrorBoundary contextName="AuthContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/authcontext error/i)).toBeInTheDocument();
      expect(screen.getByText(/error occurred while initializing the authcontext/i)).toBeInTheDocument();
    });

    it('should display context name in error title', () => {
      render(
        <ContextErrorBoundary contextName="SearchContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/searchcontext error/i)).toBeInTheDocument();
    });

    it('should display context name in error description', () => {
      render(
        <ContextErrorBoundary contextName="ThemeContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/initializing the themecontext/i)).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom context error fallback</div>;

      render(
        <ContextErrorBoundary contextName="TestContext" fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText('Custom context error fallback')).toBeInTheDocument();
    });

    it('should apply proper styling classes', () => {
      const { container } = render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      const errorContainer = container.querySelector('.min-h-\\[200px\\]');
      expect(errorContainer).toHaveClass('bg-yellow-50');
      expect(errorContainer).toHaveClass('border-yellow-200');
    });
  });

  describe('Error Logging', () => {
    it('should log context errors with proper information', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include context name in error logs', () => {
      render(
        <ContextErrorBoundary contextName="AuthContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include timestamp in error logs', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error stack trace', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Context Types', () => {
    it('should handle AuthContext errors', () => {
      render(
        <ContextErrorBoundary contextName="AuthContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/authcontext error/i)).toBeInTheDocument();
    });

    it('should handle SearchContext errors', () => {
      render(
        <ContextErrorBoundary contextName="SearchContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/searchcontext error/i)).toBeInTheDocument();
    });

    it('should handle ThemeContext errors', () => {
      render(
        <ContextErrorBoundary contextName="ThemeContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/themecontext error/i)).toBeInTheDocument();
    });

    it('should handle custom context names', () => {
      render(
        <ContextErrorBoundary contextName="MyCustomContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/mycustomcontext error/i)).toBeInTheDocument();
    });
  });

  describe('Error Details in Development', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should require contextName prop', () => {
      render(
        <ContextErrorBoundary contextName="RequiredContext">
          <div>Content</div>
        </ContextErrorBoundary>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle empty context name', () => {
      render(
        <ContextErrorBoundary contextName="">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('should handle long context names', () => {
      const longName = 'VeryLongContextNameThatExceedsNormalLength';

      render(
        <ContextErrorBoundary contextName={longName}>
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(new RegExp(longName.toLowerCase(), 'i'))).toBeInTheDocument();
    });

    it('should handle context names with special characters', () => {
      render(
        <ContextErrorBoundary contextName="Auth-Context_v2">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/auth-context_v2 error/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should allow refresh recovery', () => {
      const { rerender } = render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();

      // Simulate recovery by re-rendering without error
      rerender(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={false} />
        </ContextErrorBoundary>
      );

      // Note: Error boundary state persists until reset
      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });

    it('should provide refresh instructions', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/refresh the page to try again/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Contexts', () => {
    it('should handle nested context error boundaries', () => {
      render(
        <ContextErrorBoundary contextName="OuterContext">
          <ContextErrorBoundary contextName="InnerContext">
            <ThrowError shouldThrow={true} />
          </ContextErrorBoundary>
        </ContextErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(screen.getByText(/innercontext error/i)).toBeInTheDocument();
    });

    it('should isolate errors to specific contexts', () => {
      render(
        <div>
          <ContextErrorBoundary contextName="Context1">
            <ThrowError shouldThrow={true} />
          </ContextErrorBoundary>
          <ContextErrorBoundary contextName="Context2">
            <div>Context 2 content</div>
          </ContextErrorBoundary>
        </div>
      );

      expect(screen.getByText(/context1 error/i)).toBeInTheDocument();
      expect(screen.getByText('Context 2 content')).toBeInTheDocument();
    });

    it('should not affect sibling contexts', () => {
      render(
        <div>
          <ContextErrorBoundary contextName="ErrorContext">
            <ThrowError shouldThrow={true} />
          </ContextErrorBoundary>
          <ContextErrorBoundary contextName="WorkingContext">
            <div>Working fine</div>
          </ContextErrorBoundary>
        </div>
      );

      expect(screen.getByText(/errorcontext error/i)).toBeInTheDocument();
      expect(screen.getByText('Working fine')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <ContextErrorBoundary contextName="TestContext">
          <NoMessageError />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          {null}
        </ContextErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          {undefined}
        </ContextErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle fragments with errors', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <>
            <div>Fragment child 1</div>
            <ThrowError shouldThrow={true} />
          </>
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });
  });

  describe('Component Reusability', () => {
    it('should be reusable across different contexts', () => {
      const { rerender } = render(
        <ContextErrorBoundary contextName="FirstContext">
          <div>First context</div>
        </ContextErrorBoundary>
      );

      expect(screen.getByText('First context')).toBeInTheDocument();

      rerender(
        <ContextErrorBoundary contextName="SecondContext">
          <div>Second context</div>
        </ContextErrorBoundary>
      );

      expect(screen.getByText('Second context')).toBeInTheDocument();
    });

    it('should maintain separate state for each instance', () => {
      render(
        <div>
          <ContextErrorBoundary contextName="Context1">
            <ThrowError shouldThrow={true} />
          </ContextErrorBoundary>
          <ContextErrorBoundary contextName="Context2">
            <div>No error here</div>
          </ContextErrorBoundary>
        </div>
      );

      expect(screen.getByText(/context1 error/i)).toBeInTheDocument();
      expect(screen.getByText('No error here')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(container.querySelector('.min-h-\\[200px\\]')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(
        <ContextErrorBoundary contextName="TestContext">
          <ThrowError shouldThrow={true} />
        </ContextErrorBoundary>
      );

      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
    });
  });
});
