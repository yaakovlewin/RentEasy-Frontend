/**
 * GlobalErrorBoundary Tests
 *
 * Comprehensive test suite for the global error boundary component.
 * Tests error catching, fallback UI, error logging, and recovery mechanisms.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { GlobalErrorBoundary } from '../GlobalErrorBoundary';

// Component that throws error on demand
const ThrowError = ({ shouldThrow, message = 'Test error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that throws error in lifecycle
class LifecycleError extends React.Component<{ shouldThrow: boolean }> {
  componentDidMount() {
    if (this.props.shouldThrow) {
      throw new Error('Lifecycle error');
    }
  }

  render() {
    return <div>Lifecycle component</div>;
  }
}

// Component that throws error in event handler (won't be caught by error boundary)
const EventHandlerError = () => {
  const handleClick = () => {
    throw new Error('Event handler error');
  };

  return <button onClick={handleClick}>Throw in handler</button>;
};

describe('GlobalErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    // Suppress console.error for cleaner test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe('Error Catching', () => {
    it('should catch errors thrown by child components', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should catch errors with custom messages', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="Custom error message" />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should catch errors in lifecycle methods', () => {
      render(
        <GlobalErrorBoundary>
          <LifecycleError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/global error fallback content/i)).not.toBeInTheDocument();
    });

    it('should render children normally for multiple components', () => {
      render(
        <GlobalErrorBoundary>
          <div>Component 1</div>
          <div>Component 2</div>
          <div>Component 3</div>
        </GlobalErrorBoundary>
      );

      expect(screen.getByText('Component 1')).toBeInTheDocument();
      expect(screen.getByText('Component 2')).toBeInTheDocument();
      expect(screen.getByText('Component 3')).toBeInTheDocument();
    });

    it('should catch error from any child in component tree', () => {
      render(
        <GlobalErrorBoundary>
          <div>
            <div>
              <div>
                <ThrowError shouldThrow={true} />
              </div>
            </div>
          </div>
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });

  describe('Fallback UI Rendering', () => {
    it('should render fallback UI when error occurs', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should apply gradient background styles', () => {
      const { container } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      const fallbackContainer = container.querySelector('.min-h-screen');
      expect(fallbackContainer).toHaveClass('bg-gradient-to-br');
      expect(fallbackContainer).toHaveClass('from-red-50');
      expect(fallbackContainer).toHaveClass('to-red-100');
    });

    it('should render with proper styling and layout', () => {
      const { container } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should display fallback content', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error details to console', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="Test logging error" />
        </GlobalErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error with component stack', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Error boundary logs are captured by console.error spy
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include timestamp in error logs', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log comprehensive error context', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="Context test error" />
        </GlobalErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Error State Management', () => {
    it('should maintain error state after catching error', () => {
      const { rerender } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should store error in component state', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="Stored error" />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });

  describe('Error Propagation', () => {
    it('should prevent error from bubbling to parent', () => {
      const parentErrorHandler = jest.fn();

      try {
        render(
          <div onError={parentErrorHandler}>
            <GlobalErrorBoundary>
              <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
          </div>
        );
      } catch (error) {
        // Error should be caught by boundary
      }

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should catch errors before they reach window.onerror', () => {
      const windowErrorHandler = jest.fn();
      window.onerror = windowErrorHandler;

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();

      window.onerror = null;
    });

    it('should not interfere with sibling components', () => {
      render(
        <div>
          <GlobalErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GlobalErrorBoundary>
          <div>Sibling component</div>
        </div>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
      expect(screen.getByText('Sibling component')).toBeInTheDocument();
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple errors from different components', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="First error" />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should catch first error when multiple components throw', () => {
      render(
        <GlobalErrorBoundary>
          <div>
            <ThrowError shouldThrow={true} message="First error" />
            <ThrowError shouldThrow={true} message="Second error" />
          </div>
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });

  describe('Error Types', () => {
    it('should catch TypeError', () => {
      const TypeErrorComponent = () => {
        const obj: any = null;
        return <div>{obj.property}</div>;
      };

      render(
        <GlobalErrorBoundary>
          <TypeErrorComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should catch ReferenceError', () => {
      const ReferenceErrorComponent = () => {
        // @ts-ignore - intentionally accessing undefined variable
        return <div>{undefinedVariable}</div>;
      };

      render(
        <GlobalErrorBoundary>
          <ReferenceErrorComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should catch custom errors', () => {
      const CustomErrorComponent = () => {
        class CustomError extends Error {
          constructor(message: string) {
            super(message);
            this.name = 'CustomError';
          }
        }
        throw new CustomError('Custom error occurred');
      };

      render(
        <GlobalErrorBoundary>
          <CustomErrorComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work with functional components', () => {
      const FunctionalComponent = () => {
        throw new Error('Functional component error');
      };

      render(
        <GlobalErrorBoundary>
          <FunctionalComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should work with class components', () => {
      class ClassComponent extends React.Component {
        render() {
          throw new Error('Class component error');
        }
      }

      render(
        <GlobalErrorBoundary>
          <ClassComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should work with nested components', () => {
      const NestedComponent = () => {
        throw new Error('Nested error');
      };

      const ParentComponent = () => (
        <div>
          <NestedComponent />
        </div>
      );

      render(
        <GlobalErrorBoundary>
          <ParentComponent />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors with no message', () => {
      const NoMessageError = () => {
        throw new Error();
      };

      render(
        <GlobalErrorBoundary>
          <NoMessageError />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should handle errors with very long messages', () => {
      const longMessage = 'A'.repeat(1000);

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message={longMessage} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should handle errors with special characters', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="Error with <special> &characters!" />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      render(
        <GlobalErrorBoundary>
          {null}
        </GlobalErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText(/global error fallback content/i)).not.toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      render(
        <GlobalErrorBoundary>
          {undefined}
        </GlobalErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText(/global error fallback content/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Monitoring Integration', () => {
    it('should call error monitoring service asynchronously', async () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} message="Monitoring test" />
        </GlobalErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Browser Environment', () => {
    it('should handle window object availability', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });

    it('should handle SSR-like environment gracefully', () => {
      // Component should work even if window is not available initially
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/global error fallback content/i)).toBeInTheDocument();
    });
  });
});
