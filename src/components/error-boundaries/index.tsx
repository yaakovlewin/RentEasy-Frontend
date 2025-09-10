/**
 * Error Boundaries - Enterprise-grade error handling components
 * 
 * Provides comprehensive error boundary components for different layers
 * of the application with specialized handling and recovery strategies.
 */

import * as React from 'react';

export { GlobalErrorBoundary } from './GlobalErrorBoundary';
export { ContextErrorBoundary } from './ContextErrorBoundary';
export { RouteErrorBoundary } from './RouteErrorBoundary';
export { ApiErrorBoundary } from './ApiErrorBoundary';
export { AsyncComponentBoundary } from './AsyncComponentBoundary';
export { FeatureErrorBoundary } from './FeatureErrorBoundary';

// Re-export the base error boundary components
export {
  ErrorBoundary,
  ErrorBoundaryWrapper,
  NetworkError,
  ErrorState,
  useErrorHandler,
  useAsyncError,
} from '@/components/ui/error-boundary';

// Error boundary HOC for easy component wrapping
export const withErrorBoundary = (
  Component: React.ComponentType<any>,
  errorBoundaryProps?: {
    fallback?: React.ComponentType<any>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }
) => {
  const WrappedComponent = (props: any) => (
    <ErrorBoundaryWrapper {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryWrapper>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};