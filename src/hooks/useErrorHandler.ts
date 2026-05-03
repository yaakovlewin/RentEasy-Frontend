/**
 * useErrorHandler Hook
 *
 * Simple, focused hook for common error handling patterns across dashboard components.
 * Manages error state, success messages, and provides clean error utilities.
 *
 * Features:
 * - Error state management
 * - Success message handling with auto-dismiss
 * - Error message formatting
 * - Clear utilities for resetting state
 */

import { useState, useCallback, useEffect } from 'react';

interface UseErrorHandlerReturn {
  /** Current error state */
  error: Error | null;
  /** Current success message */
  successMessage: string | null;
  /** Handle an error (accepts Error, string, or unknown) */
  handleError: (err: unknown) => void;
  /** Clear current error */
  clearError: () => void;
  /** Show success message */
  showSuccess: (message: string, autoDismiss?: boolean) => void;
  /** Clear success message */
  clearSuccess: () => void;
  /** Check if there's an active error */
  hasError: boolean;
  /** Check if there's an active success message */
  hasSuccess: boolean;
}

/**
 * Hook for managing error and success states
 *
 * @param autoD ismissDelay - Optional delay in ms before auto-dismissing success messages (default: 5000)
 * @returns Error handling utilities
 *
 * @example
 * const { error, handleError, clearError, showSuccess } = useErrorHandler();
 *
 * try {
 *   await api.updateSettings(data);
 *   showSuccess('Settings saved successfully');
 * } catch (err) {
 *   handleError(err);
 * }
 */
export const useErrorHandler = (autoDismissDelay: number = 5000): UseErrorHandlerReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Handle an error with proper formatting
   */
  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else if (typeof err === 'string') {
      setError(new Error(err));
    } else {
      setError(new Error('An unexpected error occurred'));
    }
    // Clear any existing success message when error occurs
    setSuccessMessage(null);
  }, []);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Show success message with optional auto-dismiss
   */
  const showSuccess = useCallback((message: string, autoDismiss: boolean = true) => {
    setSuccessMessage(message);
    // Clear any existing error when showing success
    setError(null);

    if (autoDismiss && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismissDelay]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return {
    error,
    successMessage,
    handleError,
    clearError,
    showSuccess,
    clearSuccess,
    hasError: error !== null,
    hasSuccess: successMessage !== null,
  };
};
