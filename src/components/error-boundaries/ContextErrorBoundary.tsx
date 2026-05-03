'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ContextErrorBoundary
 *
 * Specialized error boundary for React Context providers.
 * Handles errors that occur within context initialization or updates.
 */
interface ContextErrorBoundaryProps {
  children: ReactNode;
  contextName: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ContextErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ContextErrorBoundary extends Component<
  ContextErrorBoundaryProps,
  ContextErrorBoundaryState
> {
  constructor(props: ContextErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ContextErrorBoundaryState> {
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

    const { contextName } = this.props;

    console.error(`Context error in ${contextName}:`, {
      error: error.message,
      stack: error.stack,
      errorInfo,
      contextName,
      timestamp: new Date().toISOString(),
    });

    // In production, report context-specific errors
    if (process.env.NODE_ENV === 'production') {
      import('@/lib/error-monitoring').then(({ captureError, ErrorSeverity, ErrorCategory }) => {
        captureError(error, ErrorSeverity.HIGH, ErrorCategory.CONTEXT, {
          contextName,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
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

      const { contextName } = this.props;
      const title = contextName ? `${contextName} Error` : 'Error';

      // Truncate long context names in description to avoid duplicate text issues
      const contextDisplayName = contextName && contextName.length > 30
        ? `${contextName.substring(0, 30)}...`
        : contextName;

      const description = contextName
        ? `An error occurred while initializing the ${contextDisplayName}. Please refresh the page to try again.`
        : 'Something went wrong. Please refresh the page to try again.';

      // Default context error UI
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-[200px] bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2" role="heading" aria-level={3}>
            {title}
          </h3>

          <p className="text-gray-600 mb-4">{description}</p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-3 bg-red-50 rounded-lg text-left w-full max-w-md">
              <summary className="cursor-pointer font-medium text-red-700 mb-2">
                Error Details
              </summary>
              <pre className="text-sm text-red-600 whitespace-pre-wrap overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden select-none touch-manipulation bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-large hover:-translate-y-1 active:translate-y-0 active:shadow-medium active:scale-[0.98] transition-all duration-200 h-9 px-4 py-2 rounded-lg text-sm font-medium gap-2"
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