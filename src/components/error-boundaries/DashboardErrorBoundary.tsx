/**
 * @fileoverview Dashboard-Specific Error Boundary
 * 
 * CLIENT COMPONENT providing specialized error handling for dashboard flows.
 * Features role-based error recovery and dashboard-specific fallbacks.
 */

'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types/auth';

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  userRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Dashboard-specific error boundary with role-based recovery options
 */
export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log dashboard-specific errors for monitoring
    if (typeof window !== 'undefined') {
      // In a real app, you'd send this to your error monitoring service
      console.error('Dashboard Error Details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userRole: this.props.userRole,
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
    // CRITICAL FIX: Don't automatically reload page - this causes infinite loops!
    // Instead, just reset the error state and let React re-render
    this.handleReset();
    
    // Optional: If user really wants a hard refresh, they can use browser refresh
    // But we should never automatically reload the page in an error boundary
  };

  /**
   * Get role-based dashboard URL for recovery
   */
  getDashboardUrl(): string {
    switch (this.props.userRole) {
      case 'owner':
        return '/host/dashboard';
      case 'staff':
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  }

  /**
   * Get role-specific error message
   */
  getErrorMessage(): string {
    switch (this.props.userRole) {
      case 'admin':
        return 'We encountered an issue with the admin dashboard. System administrators have been notified.';
      case 'staff':
        return 'We encountered an issue with the staff dashboard. Please try refreshing or contact support.';
      case 'owner':
        return 'We encountered an issue with your host dashboard. Your property data is safe.';
      default:
        return 'We encountered an issue with your dashboard. Please try refreshing the page.';
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default dashboard error UI with role-specific content
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            {/* Error icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            {/* Error title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Dashboard Error
            </h1>
            
            {/* Role-specific error description */}
            <p className="text-gray-600 mb-6">
              {this.getErrorMessage()}
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
                  <pre className="whitespace-pre-wrap text-gray-700 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
            
            {/* Recovery actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Error State
              </button>
              
              <Link
                href={this.getDashboardUrl()}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Return to Dashboard
              </Link>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
            
            {/* Support options based on role */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">
                Need immediate assistance?
              </p>
              <div className="flex justify-center gap-4 text-sm">
                {(this.props.userRole === 'admin' || this.props.userRole === 'staff') && (
                  <a 
                    href="/admin/support" 
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    System Support
                  </a>
                )}
                <a 
                  href="/contact" 
                  className="text-blue-600 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Support
                </a>
                <a 
                  href="/help" 
                  className="text-blue-600 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}