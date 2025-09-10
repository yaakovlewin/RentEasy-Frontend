/**
 * @fileoverview Public-Specific Error Boundary
 * 
 * CLIENT COMPONENT providing specialized error handling for public pages.
 * Features marketing-focused error recovery and user-friendly fallbacks.
 */

'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Search } from 'lucide-react';
import Link from 'next/link';

interface PublicErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface PublicErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Public-specific error boundary with marketing-focused recovery options
 */
export class PublicErrorBoundary extends Component<
  PublicErrorBoundaryProps,
  PublicErrorBoundaryState
> {
  constructor(props: PublicErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PublicErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Public Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log public page errors for monitoring
    if (typeof window !== 'undefined') {
      // In a real app, you'd send this to your error monitoring service
      console.error('Public Page Error Details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
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

      // Default public error UI with marketing focus
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error illustration */}
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-8 bg-red-100 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            
            {/* Error title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            {/* User-friendly error description */}
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              We're sorry, but there seems to be a technical issue. Our team has been notified 
              and is working on a fix. In the meantime, here are some things you can try:
            </p>
            
            {/* Error details (in development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 text-left max-w-lg mx-auto">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-4 text-center">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 text-xs">
                  <p className="font-medium text-red-600 mb-2">
                    {this.state.error.message}
                  </p>
                  <pre className="whitespace-pre-wrap text-gray-700 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
            
            {/* Recovery actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>
              
              <Link
                href="/"
                className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
            
            {/* Alternative navigation */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What can we help you find?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/search"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Find Properties</div>
                    <div className="text-sm text-gray-600">Search vacation rentals</div>
                  </div>
                </Link>
                
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">RE</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">My Account</div>
                    <div className="text-sm text-gray-600">Sign in or register</div>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Support information */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                If you continue to experience issues, please{' '}
                <a 
                  href="/contact" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  contact our support team
                </a>
                {' '}or visit our{' '}
                <a 
                  href="/help" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  help center
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}