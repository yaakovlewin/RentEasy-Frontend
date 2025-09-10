'use client';

import { Component, ReactNode } from 'react';

import { ErrorBoundary } from '@/components/ui/error-boundary';

/**
 * GlobalErrorBoundary
 * 
 * Root-level error boundary that wraps the entire application.
 * Provides comprehensive error handling and recovery for the main layout.
 */
interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use error monitoring service for comprehensive logging
    import('@/lib/error-monitoring').then(({ withErrorMonitoring }) => {
      withErrorMonitoring(error, errorInfo, 'GlobalErrorBoundary');
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

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Global error boundary fallback triggered:', error, errorInfo);
          }}
          className='min-h-screen bg-gradient-to-br from-red-50 to-red-100'
        >
          <div>Global error fallback content</div>
        </ErrorBoundary>
      );
    }

    return this.props.children;
  }
}