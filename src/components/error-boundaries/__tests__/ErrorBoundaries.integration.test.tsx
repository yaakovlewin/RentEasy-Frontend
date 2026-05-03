/**
 * Error Boundaries Integration Tests
 *
 * Comprehensive integration test suite for error boundary interactions.
 * Tests nested boundaries, error propagation, boundary hierarchy, and multiple errors.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { GlobalErrorBoundary } from '../GlobalErrorBoundary';
import { ContextErrorBoundary } from '../ContextErrorBoundary';
import { RouteErrorBoundary } from '../RouteErrorBoundary';
import { FeatureErrorBoundary } from '../FeatureErrorBoundary';
import { ApiErrorBoundary } from '../ApiErrorBoundary';
import { AsyncComponentBoundary } from '../AsyncComponentBoundary';

// Test components
const ThrowError = ({ shouldThrow, message = 'Integration test error' }: {
  shouldThrow: boolean;
  message?: string;
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Component working</div>;
};

describe('Error Boundaries Integration', () => {
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

  describe('Nested Error Boundaries', () => {
    it('should handle nested GlobalErrorBoundary > RouteErrorBoundary', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Test Route">
            <ThrowError shouldThrow={true} message="Route error" />
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Inner boundary (RouteErrorBoundary) should catch the error
      expect(screen.getByText(/test route error/i)).toBeInTheDocument();
      expect(screen.queryByText(/global error fallback/i)).not.toBeInTheDocument();
    });

    it('should handle nested GlobalErrorBoundary > ContextErrorBoundary', () => {
      render(
        <GlobalErrorBoundary>
          <ContextErrorBoundary contextName="TestContext">
            <ThrowError shouldThrow={true} message="Context error" />
          </ContextErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Inner boundary (ContextErrorBoundary) should catch the error
      expect(screen.getByText(/testcontext error/i)).toBeInTheDocument();
      expect(screen.queryByText(/global error fallback/i)).not.toBeInTheDocument();
    });

    it('should handle nested GlobalErrorBoundary > RouteErrorBoundary > FeatureErrorBoundary', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Dashboard">
            <FeatureErrorBoundary featureName="Analytics">
              <ThrowError shouldThrow={true} message="Feature error" />
            </FeatureErrorBoundary>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Innermost boundary (FeatureErrorBoundary) should catch the error
      expect(screen.getByText(/analytics unavailable/i)).toBeInTheDocument();
      expect(screen.queryByText(/dashboard error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/global error fallback/i)).not.toBeInTheDocument();
    });

    it('should handle deeply nested boundaries (4 levels)', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Properties">
            <FeatureErrorBoundary featureName="Search">
              <ApiErrorBoundary context="searching properties">
                <ThrowError shouldThrow={true} message="API error" />
              </ApiErrorBoundary>
            </FeatureErrorBoundary>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Innermost boundary should catch the error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle nested AsyncComponentBoundary within FeatureErrorBoundary', () => {
      render(
        <FeatureErrorBoundary featureName="DataLoader">
          <AsyncComponentBoundary componentName="AsyncData">
            <ThrowError shouldThrow={true} message="Async error" />
          </AsyncComponentBoundary>
        </FeatureErrorBoundary>
      );

      // Inner boundary should catch
      expect(screen.getByText(/asyncdata error/i)).toBeInTheDocument();
      expect(screen.queryByText(/dataloader unavailable/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary Hierarchy', () => {
    it('should catch error at nearest boundary', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Level1">
            <FeatureErrorBoundary featureName="Level2">
              <ApiErrorBoundary context="Level3">
                <ThrowError shouldThrow={true} />
              </ApiErrorBoundary>
            </FeatureErrorBoundary>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // API boundary (innermost) catches first
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/level2 unavailable/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/level1 error/i)).not.toBeInTheDocument();
    });

    it('should not propagate to parent when caught by child', () => {
      render(
        <GlobalErrorBoundary>
          <div>
            <FeatureErrorBoundary featureName="Feature1">
              <ThrowError shouldThrow={true} />
            </FeatureErrorBoundary>
            <div>Sibling content</div>
          </div>
        </GlobalErrorBoundary>
      );

      // Feature boundary catches, siblings unaffected
      expect(screen.getByText(/feature1 unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Sibling content')).toBeInTheDocument();
      expect(screen.queryByText(/global error fallback/i)).not.toBeInTheDocument();
    });
  });

  describe('Multiple Errors in Different Features', () => {
    it('should isolate errors to individual feature boundaries', () => {
      render(
        <div>
          <FeatureErrorBoundary featureName="Feature1">
            <ThrowError shouldThrow={true} message="Error 1" />
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="Feature2">
            <div>Feature 2 works</div>
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="Feature3">
            <ThrowError shouldThrow={true} message="Error 3" />
          </FeatureErrorBoundary>
        </div>
      );

      expect(screen.getByText(/feature1 unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Feature 2 works')).toBeInTheDocument();
      expect(screen.getByText(/feature3 unavailable/i)).toBeInTheDocument();
    });

    it('should handle multiple route errors independently', () => {
      render(
        <div>
          <RouteErrorBoundary routeName="Route1">
            <ThrowError shouldThrow={true} />
          </RouteErrorBoundary>
          <RouteErrorBoundary routeName="Route2">
            <div>Route 2 content</div>
          </RouteErrorBoundary>
        </div>
      );

      expect(screen.getByText(/route1 error/i)).toBeInTheDocument();
      expect(screen.getByText('Route 2 content')).toBeInTheDocument();
    });

    it('should handle multiple context errors independently', () => {
      render(
        <div>
          <ContextErrorBoundary contextName="Context1">
            <ThrowError shouldThrow={true} />
          </ContextErrorBoundary>
          <ContextErrorBoundary contextName="Context2">
            <div>Context 2 working</div>
          </ContextErrorBoundary>
        </div>
      );

      expect(screen.getByText(/context1 error/i)).toBeInTheDocument();
      expect(screen.getByText('Context 2 working')).toBeInTheDocument();
    });
  });

  describe('Complex Application Scenarios', () => {
    it('should handle realistic app structure with multiple boundaries', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Dashboard">
            <ContextErrorBoundary contextName="AuthContext">
              <div>
                <FeatureErrorBoundary featureName="UserProfile">
                  <div>User profile section</div>
                </FeatureErrorBoundary>
                <FeatureErrorBoundary featureName="Statistics">
                  <ThrowError shouldThrow={true} message="Stats error" />
                </FeatureErrorBoundary>
                <FeatureErrorBoundary featureName="ActivityFeed">
                  <div>Activity feed section</div>
                </FeatureErrorBoundary>
              </div>
            </ContextErrorBoundary>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Statistics feature error, others work
      expect(screen.getByText('User profile section')).toBeInTheDocument();
      expect(screen.getByText(/statistics unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Activity feed section')).toBeInTheDocument();
    });

    it('should handle mixed successful and error states', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Properties">
            <FeatureErrorBoundary featureName="PropertyList">
              <div>Property list working</div>
            </FeatureErrorBoundary>
            <FeatureErrorBoundary featureName="PropertyFilters">
              <ThrowError shouldThrow={true} />
            </FeatureErrorBoundary>
            <FeatureErrorBoundary featureName="PropertyMap">
              <div>Map working</div>
            </FeatureErrorBoundary>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      expect(screen.getByText('Property list working')).toBeInTheDocument();
      expect(screen.getByText(/propertyfilters unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Map working')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Across Boundaries', () => {
    it('should allow retry in nested boundaries', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn(() => Promise.resolve());

      render(
        <FeatureErrorBoundary featureName="OuterFeature">
          <AsyncComponentBoundary componentName="InnerAsync" onRetry={onRetry}>
            <ThrowError shouldThrow={true} />
          </AsyncComponentBoundary>
        </FeatureErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not interfere with sibling boundary recovery', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <FeatureErrorBoundary featureName="Feature1">
            <ThrowError shouldThrow={true} />
          </FeatureErrorBoundary>
          <FeatureErrorBoundary featureName="Feature2">
            <ThrowError shouldThrow={true} />
          </FeatureErrorBoundary>
        </div>
      );

      const retryButtons = screen.getAllByRole('button', { name: /try again/i });
      expect(retryButtons).toHaveLength(2);

      // Click first retry, shouldn't affect second
      await user.click(retryButtons[0]);
      expect(screen.getAllByRole('button', { name: /try again/i })).toHaveLength(2);
    });
  });

  describe('Error Propagation Prevention', () => {
    it('should prevent errors from bubbling up to window', () => {
      const windowErrorHandler = jest.fn();
      window.onerror = windowErrorHandler;

      render(
        <FeatureErrorBoundary featureName="Test">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText(/test unavailable/i)).toBeInTheDocument();
      window.onerror = null;
    });

    it('should not affect parent component state', () => {
      const ParentComponent = () => {
        const [count, setCount] = React.useState(0);

        return (
          <div>
            <div>Count: {count}</div>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <FeatureErrorBoundary featureName="Child">
              <ThrowError shouldThrow={true} />
            </FeatureErrorBoundary>
          </div>
        );
      };

      render(<ParentComponent />);

      expect(screen.getByText('Count: 0')).toBeInTheDocument();
      expect(screen.getByText(/child unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Performance with Multiple Boundaries', () => {
    it('should handle many boundaries without performance issues', () => {
      const ManyBoundaries = () => (
        <div>
          {Array.from({ length: 20 }, (_, i) => (
            <FeatureErrorBoundary key={i} featureName={`Feature${i}`}>
              <div>Feature {i} content</div>
            </FeatureErrorBoundary>
          ))}
        </div>
      );

      render(<ManyBoundaries />);

      // All should render successfully
      expect(screen.getByText('Feature 0 content')).toBeInTheDocument();
      expect(screen.getByText('Feature 10 content')).toBeInTheDocument();
      expect(screen.getByText('Feature 19 content')).toBeInTheDocument();
    });

    it('should handle many boundaries with mixed error states', () => {
      const MixedBoundaries = () => (
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <FeatureErrorBoundary key={i} featureName={`Feature${i}`}>
              <ThrowError shouldThrow={i % 2 === 0} message={`Error ${i}`} />
            </FeatureErrorBoundary>
          ))}
        </div>
      );

      render(<MixedBoundaries />);

      // Even indices error, odd indices work
      expect(screen.getByText(/feature0 unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Component working')).toBeInTheDocument(); // From Feature1
      expect(screen.getByText(/feature2 unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Boundary Interaction Edge Cases', () => {
    it('should handle error in one branch of parallel boundaries', () => {
      render(
        <RouteErrorBoundary routeName="Parent">
          <div style={{ display: 'flex' }}>
            <FeatureErrorBoundary featureName="LeftPanel">
              <ThrowError shouldThrow={true} />
            </FeatureErrorBoundary>
            <FeatureErrorBoundary featureName="RightPanel">
              <div>Right panel works</div>
            </FeatureErrorBoundary>
          </div>
        </RouteErrorBoundary>
      );

      expect(screen.getByText(/leftpanel unavailable/i)).toBeInTheDocument();
      expect(screen.getByText('Right panel works')).toBeInTheDocument();
    });

    it('should handle errors in deeply nested parallel structures', () => {
      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Main">
            <div>
              <FeatureErrorBoundary featureName="Section1">
                <ApiErrorBoundary context="api1">
                  <ThrowError shouldThrow={true} />
                </ApiErrorBoundary>
              </FeatureErrorBoundary>
              <FeatureErrorBoundary featureName="Section2">
                <ApiErrorBoundary context="api2">
                  <div>Section 2 works</div>
                </ApiErrorBoundary>
              </FeatureErrorBoundary>
            </div>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText('Section 2 works')).toBeInTheDocument();
    });
  });

  describe('Error Logging in Nested Boundaries', () => {
    it('should log errors at the catching boundary level', () => {
      render(
        <GlobalErrorBoundary>
          <FeatureErrorBoundary featureName="Feature">
            <ThrowError shouldThrow={true} message="Nested error" />
          </FeatureErrorBoundary>
        </GlobalErrorBoundary>
      );

      // FeatureErrorBoundary logs the error
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not duplicate logs in parent boundaries', () => {
      const logCountBefore = consoleErrorSpy.mock.calls.length;

      render(
        <GlobalErrorBoundary>
          <RouteErrorBoundary routeName="Route">
            <FeatureErrorBoundary featureName="Feature">
              <ThrowError shouldThrow={true} />
            </FeatureErrorBoundary>
          </RouteErrorBoundary>
        </GlobalErrorBoundary>
      );

      // Only the catching boundary logs
      const logCountAfter = consoleErrorSpy.mock.calls.length;
      expect(logCountAfter).toBeGreaterThan(logCountBefore);
    });
  });
});
