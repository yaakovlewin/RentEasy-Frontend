'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * GlobalErrorBoundary
 *
 * Root-level error boundary that wraps the entire application.
 * Provides comprehensive error handling and recovery for the main layout.
 */
interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
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

    // Use error monitoring service for comprehensive logging
    import('@/lib/error-monitoring').then(({ captureError, ErrorSeverity, ErrorCategory }) => {
      captureError(error, ErrorSeverity.CRITICAL, ErrorCategory.COMPONENT, {
        componentName: 'GlobalErrorBoundary',
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      });
    });

    // Log global errors with comprehensive context
    console.error('GlobalErrorBoundary: Critical application error', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      stack: error.stack,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default global error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-12 text-center">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-8 bg-red-100 rounded-full">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Global error fallback content
            </h1>

            {/* Error Description */}
            <p className="text-lg text-gray-600 mb-8">
              We encountered a critical error. Please try refreshing the page or return home.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-3">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 text-xs">
                  <p className="font-medium text-red-600 mb-2">
                    {this.state.error.message}
                  </p>
                  <pre className="whitespace-pre-wrap text-gray-700 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={this.handleRefresh}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}