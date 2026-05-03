/**
 * ErrorStateDisplay Component
 *
 * Reusable error display component with retry functionality.
 * Provides consistent error UI across dashboard and other components.
 *
 * Features:
 * - Error icon display
 * - Error message formatting
 * - Optional retry button
 * - Customizable styling
 * - Accessibility compliant
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ErrorStateDisplayProps {
  /** Error object or error message */
  error?: Error | string | null;
  /** Optional title (defaults to "Something went wrong") */
  title?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Optional custom icon */
  icon?: React.ReactNode;
  /** Additional className for container */
  className?: string;
  /** Show error details (error.message) */
  showDetails?: boolean;
}

/**
 * Error State Display Component
 *
 * Displays error messages with optional retry functionality
 *
 * @example
 * <ErrorStateDisplay
 *   error={error}
 *   title="Failed to load data"
 *   onRetry={() => refetch()}
 * />
 */
export const ErrorStateDisplay: React.FC<ErrorStateDisplayProps> = ({
  error,
  title = 'Something went wrong',
  onRetry,
  retryText = 'Try again',
  icon,
  className,
  showDetails = true,
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div
      className={cn('text-center py-12 px-4', className)}
      role="alert"
      aria-live="polite"
    >
      {/* Error Icon */}
      <div className="text-red-500 mb-4 flex justify-center">
        {icon || <AlertCircle className="w-16 h-16" aria-hidden="true" />}
      </div>

      {/* Error Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Error Message */}
      {showDetails && errorMessage && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {errorMessage}
        </p>
      )}

      {/* Retry Button */}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="inline-flex items-center gap-2"
          aria-label={retryText}
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {retryText}
        </Button>
      )}
    </div>
  );
};

ErrorStateDisplay.displayName = 'ErrorStateDisplay';
