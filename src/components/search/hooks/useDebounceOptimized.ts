import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Enhanced debounce hook with performance optimizations and advanced features
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param options - Additional options
 */
export function useDebounceOptimized<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;
    maxWait?: number;
    equalityCheck?: (a: T, b: T) => boolean;
  } = {}
) {
  const { leading = false, maxWait, equalityCheck } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastExecutionRef = useRef<number>(0);
  const lastValueRef = useRef<T>(value);

  // Custom equality check or default shallow comparison
  const isEqual = useCallback((a: T, b: T): boolean => {
    if (equalityCheck) return equalityCheck(a, b);
    return a === b;
  }, [equalityCheck]);

  const executeUpdate = useCallback((newValue: T) => {
    setDebouncedValue(newValue);
    lastValueRef.current = newValue;
    lastExecutionRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Skip if value hasn't changed
    if (isEqual(value, lastValueRef.current)) {
      return;
    }

    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionRef.current;

    // Leading edge execution
    if (leading && timeSinceLastExecution >= delay) {
      executeUpdate(value);
      return;
    }

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up the debounced execution
    timeoutRef.current = setTimeout(() => {
      executeUpdate(value);
      
      // Clear max wait timeout if it exists
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = undefined;
      }
    }, delay);

    // Set up max wait timeout if specified
    if (maxWait && !maxTimeoutRef.current && timeSinceLastExecution >= maxWait) {
      maxTimeoutRef.current = setTimeout(() => {
        executeUpdate(value);
        
        // Clear regular timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
      }, maxWait - timeSinceLastExecution);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [value, delay, leading, maxWait, isEqual, executeUpdate]);

  return debouncedValue;
}

/**
 * Debounced callback hook with performance optimizations
 * 
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @param options - Additional options
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): {
  debouncedCallback: T;
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
} {
  const { leading = false, trailing = true, maxWait } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T>>();
  const resultRef = useRef<ReturnType<T>>();

  // Memoize the callback
  const memoizedCallback = useCallback(callback, deps);

  const invokeFunc = useCallback((...args: Parameters<T>): ReturnType<T> => {
    lastCallTimeRef.current = Date.now();
    resultRef.current = memoizedCallback(...args);
    return resultRef.current;
  }, [memoizedCallback]);

  const leadingEdge = useCallback((...args: Parameters<T>) => {
    lastCallTimeRef.current = Date.now();
    return invokeFunc(...args);
  }, [invokeFunc]);

  const trailingEdge = useCallback(() => {
    if (lastArgsRef.current) {
      return invokeFunc(...lastArgsRef.current);
    }
    return resultRef.current;
  }, [invokeFunc]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    const timeSinceLastCall = time - lastCallTimeRef.current;
    
    if (timeSinceLastCall < delay && timeSinceLastCall >= 0) {
      // Restart the timer
      timeoutRef.current = setTimeout(timerExpired, delay - timeSinceLastCall);
    } else {
      if (trailing) {
        trailingEdge();
      }
      cancel();
    }
  }, [delay, trailing, trailingEdge]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    lastCallTimeRef.current = 0;
    lastArgsRef.current = undefined;
    resultRef.current = undefined;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      const result = trailingEdge();
      cancel();
      return result;
    }
    return resultRef.current;
  }, [trailingEdge, cancel]);

  const isPending = useCallback(() => {
    return timeoutRef.current !== undefined || maxTimeoutRef.current !== undefined;
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>): ReturnType<T> | undefined => {
      const time = Date.now();
      const timeSinceLastCall = time - lastCallTimeRef.current;
      
      lastArgsRef.current = args;

      // Leading edge
      if (leading && (!timeoutRef.current || timeSinceLastCall >= delay)) {
        return leadingEdge(...args);
      }

      // Clear existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set up regular timeout
      timeoutRef.current = setTimeout(timerExpired, delay);

      // Handle max wait
      if (maxWait && !maxTimeoutRef.current && timeSinceLastCall >= maxWait) {
        maxTimeoutRef.current = setTimeout(() => {
          if (trailing) {
            trailingEdge();
          }
          cancel();
        }, maxWait - timeSinceLastCall);
      }

      return resultRef.current;
    },
    [delay, leading, maxWait, leadingEdge, timerExpired, trailing, trailingEdge, cancel]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return useMemo(() => ({
    debouncedCallback,
    cancel,
    flush,
    isPending,
  }), [debouncedCallback, cancel, flush, isPending]);
}

/**
 * Simple debounce hook for basic use cases
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 */
export function useDebounceSimple<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}