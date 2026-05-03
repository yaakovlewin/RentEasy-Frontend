import { useCallback, useState, useRef } from 'react';

import { BaseApiError } from '@/lib/api';
import { Result, Option } from '@/lib/api/functional';

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

      const result = await Result.fromPromise(operation());

      return Result.match({
        ok: (data) => {
          setState({ data, loading: false, error: null });
          onSuccessRef.current?.(data);
          return data;
        },
        err: (error: any) => {
          Result.tryCatch(() => {
            if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.error) {
              console.error('Async operation failed:', error);
            }
          })();

          const getErrorMessage = (error: any): string => {
            if (error instanceof BaseApiError) {
              return error.message;
            }
            return Option.getOrElse('An unexpected error occurred')(
              Option.any([
                Option.fromNullable(error?.response?.data?.message),
                Option.fromNullable(error?.message),
              ])
            );
          };

          const shouldRetryError = (error: any, retryCount: number): boolean => {
            if (retryCount >= retryAttempts) return false;

            const statusOption = Option.any([
              Option.fromNullable(error?.response?.status),
              Option.fromNullable(error?.statusCode),
            ]);

            return Option.match({
              some: (status) => status >= 500 || status === 0,
              none: () => true,
            })(statusOption);
          };

          const isRateLimit = error.response?.status === 429;
          const canRetry = shouldRetryError(error, retryCount) && !isRateLimit;

          if (canRetry && retryCount < retryAttempts) {
            Result.tryCatch(() => {
              if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.log) {
                console.log(`Retrying operation... Attempt ${retryCount + 1}/${retryAttempts}`);
              }
            })();

            const baseDelay = retryDelay * Math.pow(2, retryCount);
            const jitter = Math.random() * 1000;
            const delay = Math.min(baseDelay + jitter, 10000);

            return new Promise(resolve => setTimeout(() => {
              resolve(execute(operation, retryCount + 1));
            }, delay));
          }

          if (isRateLimit) {
            Result.tryCatch(() => {
              if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.warn) {
                console.warn('Rate limit reached. Please try again later.');
              }
            })();
          }

          const errorMessage = getErrorMessage(error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));

          onErrorRef.current?.(error);
          return null;
        },
      })(result);
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
