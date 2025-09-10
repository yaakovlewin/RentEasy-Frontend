/**
 * Profile Error Boundary - Comprehensive error handling
 * 
 * Professional error boundary for profile pages with detailed error
 * information, recovery options, and user-friendly messaging.
 * 
 * Features:
 * - Comprehensive error categorization
 * - User-friendly error messages
 * - Recovery action suggestions
 * - Error reporting capabilities
 * - Accessibility compliance
 * - Fallback UI components
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail, ArrowLeft } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';

// Types
interface ProfileErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error categorization helper
 */
function categorizeError(error: Error): {
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  canRetry: boolean;
} {
  const errorMessage = error.message.toLowerCase();
  
  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return {
      type: 'authentication',
      title: 'Authentication Required',
      message: 'Your session has expired or you don\'t have permission to access this profile section.',
      severity: 'high',
      canRetry: false,
    };
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return {
      type: 'network',
      title: 'Connection Problem',
      message: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
      severity: 'medium',
      canRetry: true,
    };
  }
  
  // Profile data errors
  if (errorMessage.includes('profile') || errorMessage.includes('user') || errorMessage.includes('data')) {
    return {
      type: 'data',
      title: 'Profile Data Error',
      message: 'There was a problem loading your profile information. This might be a temporary issue.',
      severity: 'medium',
      canRetry: true,
    };
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('access')) {
    return {
      type: 'permission',
      title: 'Access Restricted',
      message: 'You don\'t have permission to access this profile section.',
      severity: 'medium',
      canRetry: false,
    };
  }
  
  // Server errors
  if (errorMessage.includes('server') || errorMessage.includes('internal') || errorMessage.includes('500')) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few minutes.',
      severity: 'high',
      canRetry: true,
    };
  }
  
  // Default error
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred while loading your profile. Please try again.',
    severity: 'medium',
    canRetry: true,
  };
}

/**
 * Profile Error Component
 * 
 * Comprehensive error boundary for profile pages with contextual
 * error information and recovery suggestions.
 */
export default function ProfileError({ error, reset }: ProfileErrorProps) {
  const errorInfo = categorizeError(error);
  
  // Log error for monitoring
  useEffect(() => {
    console.error('Profile error:', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      type: errorInfo.type,
      severity: errorInfo.severity,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }, [error, errorInfo]);

  // Get severity-based styling
  const getSeverityStyles = () => {
    switch (errorInfo.severity) {
      case 'high':
        return {
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'medium':
        return {
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Error card */}
        <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-8 text-center`}>
          <div className="mb-6">
            <div className={`w-16 h-16 ${styles.iconColor} mx-auto mb-4`}>
              <AlertTriangle className="w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-gray-600">
              {errorInfo.message}
            </p>
          </div>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Technical Details:</h3>
              <p className="text-sm text-gray-700 font-mono">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {errorInfo.canRetry && (
              <Button 
                onClick={reset}
                className={`w-full ${styles.buttonColor} text-white flex items-center justify-center space-x-2`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Help and support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Still having issues? Our support team is here to help.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/support'}
              className="text-blue-600 hover:text-blue-700"
            >
              Contact Support
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/help'}
              className="text-blue-600 hover:text-blue-700"
            >
              Help Center
            </Button>
          </div>
        </div>

        {/* Error reporting */}
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-900 mb-1">Report this error</p>
              <p className="text-gray-600">
                Help us improve by reporting this issue. We'll investigate and fix it as soon as possible.
              </p>
              <button 
                className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                onClick={() => {
                  const mailtoLink = `mailto:support@renteasy.com?subject=Profile Error Report&body=Error: ${error.message}%0D%0APage: ${window.location.href}%0D%0ATime: ${new Date().toISOString()}`;
                  window.location.href = mailtoLink;
                }}
              >
                Send Error Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Profile Error Component
 * 
 * Simplified error UI for inline error states
 */
export function CompactProfileError({ 
  error, 
  reset, 
  title = "Error loading content"
}: ProfileErrorProps & { title?: string }) {
  const errorInfo = categorizeError(error);
  
  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{errorInfo.message}</p>
      
      {errorInfo.canRetry && (
        <Button onClick={reset} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * Profile Section Error Component
 * 
 * Error UI for specific profile sections
 */
export function ProfileSectionError({
  error,
  reset,
  sectionName = "this section"
}: ProfileErrorProps & { sectionName?: string }) {
  const errorInfo = categorizeError(error);
  
  return (
    <div className="p-8 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <h4 className="font-medium text-gray-900 mb-2">
          Unable to load {sectionName}
        </h4>
        <p className="text-sm text-gray-600 mb-4">{errorInfo.message}</p>
        
        {errorInfo.canRetry && (
          <Button onClick={reset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}