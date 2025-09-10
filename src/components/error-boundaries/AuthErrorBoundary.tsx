/**
 * @fileoverview Auth-Specific Error Boundary
 * 
 * CLIENT COMPONENT providing specialized error handling for authentication flows.
 * Handles auth-specific errors with appropriate fallbacks and recovery options.
 */

'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Auth-specific error boundary with recovery options
 */
export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log auth-specific errors for monitoring
    if (typeof window !== 'undefined') {
      // In a real app, you'd send this to your error monitoring service
      console.error('Auth Error Details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    }
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

      // Default auth error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Error icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            {/* Error title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Authentication Error
            </h1>
            
            {/* Error description */}
            <p className="text-gray-600 mb-6">
              We encountered an issue while processing your authentication request. 
              This might be a temporary problem.
            </p>
            
            {/* Error details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
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
            
            {/* Recovery actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                Return Home
              </Link>
            </div>
            
            {/* Help text */}
            <p className="text-sm text-gray-500 mt-6">
              If this problem persists, please{' '}
              <a 
                href="/contact" 
                className="text-blue-600 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                contact our support team
              </a>
              .
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}