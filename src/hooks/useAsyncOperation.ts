import { useCallback, useState, useRef } from 'react';

import { BaseApiError } from '@/lib/api';

interface UseAsyncOperationOptions {
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncOperation<T>(options: UseAsyncOperationOptions = {}) {
  const { retryAttempts = 3, retryDelay = 1000, onError, onSuccess } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use refs to stabilize callback dependencies
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  // Update refs when callbacks change
  onErrorRef.current = onError;
  onSuccessRef.current = onSuccess;

  const execute = useCallback(
    async (operation: () => Promise<T>, retryCount: number = 0): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await operation();
        setState({ data: result, loading: false, error: null });
        onSuccessRef.current?.(result);
        return result;
      } catch (error: any) {
        try {
          if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.error) {
            console.error('Async operation failed:', error);
          }
        } catch (e) {
          // Silently fail if console is not available
        }
        // Handle structured API errors
        const getErrorMessage = (error: any): string => {
          if (error instanceof BaseApiError) {
            return error.message;
          }
          if (error?.response?.data?.message) {
            return error.response.data.message;
          }
          if (error?.message) {
            return error.message;
          }
          return 'An unexpected error occurred';
        };

        const shouldRetryError = (error: any, retryCount: number): boolean => {
          if (retryCount >= retryAttempts) return false;
          
          const status = error?.response?.status || error?.statusCode;
          return (
            status >= 500 || // Server errors
            status === 0 || // Network errors
            !status // Unknown errors (likely network)
          );
        };

        // Check if we should retry (but not for rate limiting errors)
        const isRateLimit = error.response?.status === 429;
        const canRetry = shouldRetryError(error, retryCount) && !isRateLimit;

        if (canRetry && retryCount < retryAttempts) {
          try {
            if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.log) {
              console.log(`Retrying operation... Attempt ${retryCount + 1}/${retryAttempts}`);
            }
          } catch (e) {
            // Silently fail if console is not available
          }

          // Exponential backoff with jitter
          const baseDelay = retryDelay * Math.pow(2, retryCount);
          const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
          const delay = Math.min(baseDelay + jitter, 10000); // Cap at 10 seconds

          await new Promise(resolve => setTimeout(resolve, delay));
          return execute(operation, retryCount + 1);
        }

        // Special handling for rate limiting
        if (isRateLimit) {
          try {
            if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.warn) {
              console.warn('Rate limit reached. Please try again later.');
            }
          } catch (e) {
            // Silently fail if console is not available
          }
        }

        // Set error state
        const errorMessage = getErrorMessage(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        onErrorRef.current?.(error);
        return null;
      }
    },
    [retryAttempts, retryDelay]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useAsyncCallback<T extends any[], R>(
  callback: (...args: T) => Promise<R>,
  deps: React.DependencyList,
  options: UseAsyncOperationOptions = {}
) {
  const { execute, loading, error } = useAsyncOperation<R>(options);

  const wrappedCallback = useCallback(
    (...args: T) => execute(() => callback(...args)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [execute, ...deps]
  );

  return {
    callback: wrappedCallback,
    loading,
    error,
  };
}
