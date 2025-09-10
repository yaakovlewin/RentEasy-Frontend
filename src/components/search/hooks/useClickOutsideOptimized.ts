import { RefObject, useCallback, useEffect, useRef } from 'react';

type Handler = (event: MouseEvent) => void;

interface UseClickOutsideOptions {
  enabled?: boolean;
  excludeSelectors?: string[];
  eventTypes?: string[];
}

/**
 * Enhanced click outside hook with performance optimizations and flexibility
 * 
 * @param handler - Function to call when clicking outside
 * @param options - Configuration options for the hook
 */
export function useClickOutsideOptimized<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  options: UseClickOutsideOptions = {}
): RefObject<T> {
  const {
    enabled = true,
    excludeSelectors = [],
    eventTypes = ['mousedown'],
  } = options;

  const ref = useRef<T>(null);

  // Memoize the handler to prevent unnecessary effect re-runs
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;

      // Don't trigger if clicking inside the ref element
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      // Don't trigger if clicking inside any excluded selector
      for (const selector of excludeSelectors) {
        if (target.closest(selector)) {
          return;
        }
      }

      memoizedHandler(event as MouseEvent);
    };

    // Add listeners for all specified event types
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, handleClickOutside, { passive: true });
    });

    return () => {
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, handleClickOutside);
      });
    };
  }, [memoizedHandler, enabled, excludeSelectors, eventTypes]);

  return ref;
}

/**
 * Enhanced multi-ref click outside hook with performance optimizations
 * 
 * @param refs - Single ref or array of refs to check
 * @param handler - Function to call when clicking outside
 * @param options - Configuration options for the hook
 */
export function useOnClickOutsideOptimized<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T> | RefObject<T>[],
  handler: Handler,
  options: UseClickOutsideOptions = {}
): void {
  const {
    enabled = true,
    excludeSelectors = [],
    eventTypes = ['mousedown'],
  } = options;

  // Memoize the handler to prevent unnecessary effect re-runs
  const memoizedHandler = useCallback(handler, [handler]);

  // Memoize the refs array for performance
  const refsArray = useCallback(() => {
    return Array.isArray(refs) ? refs : [refs];
  }, [refs]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      const refArray = refsArray();

      // Check if click is inside any of the refs
      for (const ref of refArray) {
        if (ref.current && ref.current.contains(target)) {
          return;
        }
      }

      // Check if click is inside any excluded selector
      for (const selector of excludeSelectors) {
        if (target.closest(selector)) {
          return;
        }
      }

      memoizedHandler(event as MouseEvent);
    };

    // Add listeners for all specified event types
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, handleClickOutside, { passive: true });
    });

    return () => {
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, handleClickOutside);
      });
    };
  }, [memoizedHandler, enabled, excludeSelectors, eventTypes, refsArray]);
}

/**
 * Lightweight click outside hook for simple use cases
 * 
 * @param handler - Function to call when clicking outside
 * @param enabled - Whether the hook is enabled
 */
export function useClickOutsideSimple<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClick, { passive: true });
    return () => document.removeEventListener('mousedown', handleClick);
  }, [handler, enabled]);

  return ref;
}

// Re-export the original hooks for backward compatibility
export { useClickOutside, useOnClickOutside } from './useClickOutside';