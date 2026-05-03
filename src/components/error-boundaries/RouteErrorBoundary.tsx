'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * RouteErrorBoundary
 *
 * Route-specific error boundary that provides contextual error handling
 * for different sections of the application.
 */
interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    const { routeName } = this.props;

    console.error(`Route error in ${routeName}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      routeName,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : 'Unknown',
    });

    // In production, report route-specific errors
    if (process.env.NODE_ENV === 'production') {
      import('@/lib/error-monitoring').then(({ captureError, ErrorSeverity, ErrorCategory }) => {
        captureError(error, ErrorSeverity.HIGH, ErrorCategory.ROUTE, {
          routeName,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.pathname : 'Unknown',
        });
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { routeName } = this.props;

      // Truncate long route names for display
      const routeDisplayName = routeName && routeName.length > 30
        ? `${routeName.substring(0, 30)}...`
        : routeName;

      const title = routeName ? `${routeDisplayName} Error` : 'Error';

      // For very long route names, don't repeat in description to avoid duplication
      const description = routeName && routeName.length > 30
        ? 'Something went wrong while loading this page. Please try refreshing or navigate back.'
        : routeName
        ? `Something went wrong while loading the ${routeName} page. Please try refreshing or navigate back.`
        : 'Something went wrong while loading this page. Please try refreshing or navigate back.';

      // Default route error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>

          <p className="text-gray-600 mb-6 max-w-md">{description}</p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 p-4 bg-red-50 rounded-lg text-left w-full max-w-2xl">
              <summary className="cursor-pointer font-medium text-red-700 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-sm text-red-600 whitespace-pre-wrap overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}