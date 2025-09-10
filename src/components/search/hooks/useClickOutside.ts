import { RefObject, useEffect, useRef } from 'react';

type Handler = (event: MouseEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  excludeSelectors: string[] = []
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

      handler(event);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handler, excludeSelectors]);

  return ref;
}

// Alternative hook that accepts refs as parameters
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T> | RefObject<T>[],
  handler: Handler,
  excludeSelectors: string[] = []
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const refArray = Array.isArray(refs) ? refs : [refs];

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

      handler(event);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, handler, excludeSelectors]);
}
