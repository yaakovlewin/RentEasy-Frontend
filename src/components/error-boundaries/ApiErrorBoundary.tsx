'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogIn, ArrowLeft } from 'lucide-react';

import { BaseApiError } from '@/lib/api/services/ApiErrors';

/**
 * ApiErrorBoundary
 *
 * Specialized error boundary for API-related errors.
 * Integrates with the existing structured error system from ApiErrors.ts
 */
interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  context?: string;
  onReset?: () => void;
}

interface ApiErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorContext?: string;
}

export class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorContext: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ApiErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { context = 'API operation' } = this.props;

    this.setState({
      error,
      errorInfo,
      errorContext: context,
    });

    console.error(`API error in ${context}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      context,
      timestamp: new Date().toISOString(),
      isApiError: error instanceof BaseApiError,
      ...(error instanceof BaseApiError && {
        apiErrorCode: error.code,
        apiErrorType: error.constructor.name,
        statusCode: error.statusCode,
        context: error.context,
        recovery: error.recovery,
      }),
    });

    // Report API-specific errors with enhanced context
    if (process.env.NODE_ENV === 'production') {
      import('@/lib/error-monitoring').then(({ captureError, ErrorSeverity, ErrorCategory }) => {
        captureError(error, ErrorSeverity.HIGH, ErrorCategory.API, {
          context,
          componentStack: errorInfo.componentStack,
          isApiError: error instanceof BaseApiError,
          ...(error instanceof BaseApiError && {
            apiErrorCode: error.code,
            apiErrorType: error.constructor.name,
          }),
        });
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorContext: undefined,
    });

    this.props.onReset?.();
  };

  handleRetry = () => {
    this.props.onRetry?.();
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorContext } = this.state;
      const { fallback } = this.props;
      const context = errorContext || 'API operation';

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Check if it's a structured API error
      if (error instanceof BaseApiError) {
        const errorType = error.constructor.name;

        // Network error handling
        if (errorType === 'NetworkError') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-orange-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Problem</h3>
              <p className="text-gray-600 mb-4">
                Unable to connect to our servers. Please check your internet connection.
              </p>
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          );
        }

        // Server error handling
        if (errorType === 'ServerError') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-red-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Server Error</h3>
              <p className="text-gray-600 mb-4">
                Our servers are experiencing issues. Please try again in a moment.
              </p>
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          );
        }

        // Authentication error handling
        if (errorType === 'AuthenticationError') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">Please log in to access this feature.</p>
              <button
                onClick={() => (window.location.href = '/auth/login')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Go to Login
              </button>
            </div>
          );
        }

        // Authorization error handling
        if (errorType === 'AuthorizationError') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-orange-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this resource.
              </p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          );
        }
      }

      // Default API error fallback
      // Truncate long context for display
      const displayContext = context && context.length > 30
        ? `${context.substring(0, 30)}...`
        : context;

      const title = context ? `${displayContext} Error` : 'API Error';

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-gray-50 border border-gray-200 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-gray-500" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

          <p className="text-gray-600 mb-4">
            {context && context.length <= 30
              ? `Something went wrong while ${context}. Please try again.`
              : 'Something went wrong. Please try again.'}
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-4 p-3 bg-red-50 rounded-lg text-left w-full max-w-md">
              <summary className="cursor-pointer font-medium text-red-700 mb-2">
                Error Details
              </summary>
              <pre className="text-sm text-red-600 whitespace-pre-wrap overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
