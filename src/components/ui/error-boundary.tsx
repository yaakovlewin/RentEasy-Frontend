'use client';

import * as React from 'react';

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  className?: string;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
        className
      )}
    >
      <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6'>
        <AlertTriangle className='w-8 h-8 text-red-500' />
      </div>

      <h2 className='text-2xl font-bold text-gray-900 mb-2'>Something went wrong</h2>

      <p className='text-gray-600 mb-6 max-w-md leading-relaxed'>
        We're sorry for the inconvenience. An unexpected error occurred while loading this page.
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <details className='mb-6 p-4 bg-red-50 rounded-lg max-w-2xl overflow-auto'>
          <summary className='cursor-pointer font-medium text-red-700 mb-2'>
            Error Details (Development)
          </summary>
          <pre className='text-sm text-red-600 text-left whitespace-pre-wrap'>
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}

      <div className='flex flex-col sm:flex-row gap-3'>
        <Button onClick={resetError} className='gap-2'>
          <RefreshCw className='w-4 h-4' />
          Try Again
        </Button>

        <Button variant='outline' onClick={() => (window.location.href = '/')} className='gap-2'>
          <Home className='w-4 h-4' />
          Go Home
        </Button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
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

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to use error boundaries
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    // This will trigger the nearest error boundary
    throw error;
  }, []);
};

// Async error boundary hook
export const useAsyncError = () => {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

// Error boundary wrapper component
interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showDetails?: boolean;
  className?: string;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  showDetails = process.env.NODE_ENV === 'development',
  className,
}) => {
  const CustomFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[300px] p-6 text-center',
        className
      )}
    >
      <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4'>
        <AlertTriangle className='w-6 h-6 text-red-500' />
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600 mb-4'>{description}</p>

      {showDetails && error && (
        <details className='mb-4 p-3 bg-red-50 rounded-lg text-left'>
          <summary className='cursor-pointer font-medium text-red-700 mb-2'>Error Details</summary>
          <pre className='text-sm text-red-600 whitespace-pre-wrap'>{error.message}</pre>
        </details>
      )}

      <Button size='sm' onClick={resetError} className='gap-2'>
        <RefreshCw className='w-4 h-4' />
        Try Again
      </Button>
    </div>
  );

  return <ErrorBoundary fallback={CustomFallback}>{children}</ErrorBoundary>;
};

// Network error component
interface NetworkErrorProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  title = 'Connection Problem',
  description = 'Please check your internet connection and try again.',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4'>
        <AlertTriangle className='w-6 h-6 text-orange-500' />
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600 mb-4'>{description}</p>

      {onRetry && (
        <Button size='sm' onClick={onRetry} className='gap-2'>
          <RefreshCw className='w-4 h-4' />
          Try Again
        </Button>
      )}
    </div>
  );
};

// Generic error state component
interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'network' | 'notFound' | 'unauthorized';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: {
      title: title || 'Something went wrong',
      description: description || 'An unexpected error occurred. Please try again.',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      defaultIcon: <AlertTriangle className='w-6 h-6' />,
    },
    network: {
      title: title || 'Connection Problem',
      description: description || 'Please check your internet connection.',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-500',
      defaultIcon: <AlertTriangle className='w-6 h-6' />,
    },
    notFound: {
      title: title || 'Not Found',
      description: description || "The resource you're looking for doesn't exist.",
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      defaultIcon: <AlertTriangle className='w-6 h-6' />,
    },
    unauthorized: {
      title: title || 'Access Denied',
      description: description || "You don't have permission to access this resource.",
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      defaultIcon: <AlertTriangle className='w-6 h-6' />,
    },
  };

  const config = variants[variant];

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-4',
          config.bgColor
        )}
      >
        <div className={config.iconColor}>{icon || config.defaultIcon}</div>
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{config.title}</h3>

      <p className='text-gray-600 mb-4 max-w-md'>{config.description}</p>

      {action}
    </div>
  );
};
