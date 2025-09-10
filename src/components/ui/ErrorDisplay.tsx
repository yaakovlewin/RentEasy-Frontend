import { AlertCircle, RefreshCw, X } from 'lucide-react';

import { BaseApiError } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Comprehensive error type that covers all error scenarios in our app
type AppError = 
  | BaseApiError
  | Error
  | { 
      message?: string; 
      response?: { 
        status?: number; 
        data?: { message?: string }; 
      }; 
      statusCode?: number;
    };

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  title,
  className = '',
  variant = 'card',
}: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorDetails = () => {
    // Handle structured API errors
    if (error instanceof BaseApiError) {
      switch (error.type) {
        case 'not_found':
          return {
            title: title || 'Not Found',
            message: 'The requested resource was not found.',
            color: 'orange',
          };
        case 'validation':
          return {
            title: title || 'Validation Error',
            message: error.message || 'Please check your input and try again.',
            color: 'yellow',
          };
        case 'server':
          return {
            title: title || 'Server Error',
            message: 'Something went wrong on our end. Please try again.',
            color: 'red',
          };
        case 'authentication':
          return {
            title: title || 'Authentication Error',
            message: 'Please log in to continue.',
            color: 'red',
          };
        case 'network':
          return {
            title: title || 'Network Error',
            message: 'Please check your internet connection and try again.',
            color: 'red',
          };
        default:
          return {
            title: title || 'Error',
            message: error.message || 'An unexpected error occurred.',
            color: 'red',
          };
      }
    }

    return {
      title: title || 'Error',
      message: error.message || 'An unexpected error occurred.',
      color: 'red',
    };
  };

  const { title: errorTitle, message, color } = getErrorDetails();

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500',
      title: 'text-orange-800',
      message: 'text-orange-700',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.red;

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 text-sm ${colors.message} ${className}`}>
        <AlertCircle className='w-4 h-4 flex-shrink-0' />
        <span>{message}</span>
        {onRetry && (
          <Button variant='ghost' size='sm' onClick={onRetry} className='h-6 px-2'>
            <RefreshCw className='w-3 h-3 mr-1' />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`rounded-md border p-4 ${colors.bg} ${colors.border} ${className}`}>
        <div className='flex items-start'>
          <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${colors.icon}`} />
          <div className='flex-1'>
            <h3 className={`text-sm font-medium ${colors.title}`}>{errorTitle}</h3>
            <p className={`mt-1 text-sm ${colors.message}`}>{message}</p>
            {onRetry && (
              <div className='mt-3'>
                <Button variant='outline' size='sm' onClick={onRetry}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Try Again
                </Button>
              </div>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`ml-3 flex-shrink-0 ${colors.message} hover:${colors.title}`}
            >
              <X className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={`${colors.border} ${className}`}>
      <CardContent className={`p-6 ${colors.bg}`}>
        <div className='flex items-start space-x-3'>
          <AlertCircle className={`w-6 h-6 flex-shrink-0 ${colors.icon}`} />
          <div className='flex-1 min-w-0'>
            <h3 className={`text-lg font-semibold ${colors.title}`}>{errorTitle}</h3>
            <p className={`mt-1 ${colors.message}`}>{message}</p>
            <div className='mt-4 flex items-center space-x-3'>
              {onRetry && (
                <Button variant='outline' onClick={onRetry}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button variant='ghost' onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
