import { useCallback, useMemo, useState } from 'react';

interface UseKeyboardNavigationProps<T> {
  items: T[];
  onSelect: (item: T, index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
  loop?: boolean;
  enabled?: boolean;
}

interface UseKeyboardNavigationReturn {
  selectedIndex: number;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  setSelectedIndex: (index: number) => void;
  resetSelection: () => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  selectCurrent: () => void;
}

/**
 * Enhanced keyboard navigation hook with full type safety and performance optimizations
 * 
 * @param items - Array of items to navigate through
 * @param onSelect - Callback when an item is selected
 * @param onEscape - Callback when escape is pressed
 * @param initialIndex - Initial selected index
 * @param loop - Whether to loop navigation at boundaries
 * @param enabled - Whether keyboard navigation is enabled
 */
export function useKeyboardNavigationOptimized<T>({
  items,
  onSelect,
  onEscape,
  initialIndex = -1,
  loop = false,
  enabled = true,
}: UseKeyboardNavigationProps<T>): UseKeyboardNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Memoized navigation functions for performance
  const navigateNext = useCallback(() => {
    if (!enabled) return;
    
    setSelectedIndex(prev => {
      if (prev >= items.length - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [items.length, loop, enabled]);

  const navigatePrevious = useCallback(() => {
    if (!enabled) return;
    
    setSelectedIndex(prev => {
      if (prev <= 0) {
        return loop ? items.length - 1 : -1;
      }
      return prev - 1;
    });
  }, [items.length, loop, enabled]);

  const selectCurrent = useCallback(() => {
    if (!enabled || selectedIndex < 0 || selectedIndex >= items.length) return;
    
    onSelect(items[selectedIndex], selectedIndex);
  }, [enabled, selectedIndex, items, onSelect]);

  const resetSelection = useCallback(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

  // Memoized key handlers for performance
  const keyHandlers = useMemo(() => ({
    ArrowDown: (e: React.KeyboardEvent) => {
      e.preventDefault();
      navigateNext();
    },
    ArrowUp: (e: React.KeyboardEvent) => {
      e.preventDefault();
      navigatePrevious();
    },
    Enter: (e: React.KeyboardEvent) => {
      e.preventDefault();
      selectCurrent();
    },
    Escape: (e: React.KeyboardEvent) => {
      e.preventDefault();
      resetSelection();
      onEscape?.();
    },
    Home: (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (enabled && items.length > 0) {
        setSelectedIndex(0);
      }
    },
    End: (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (enabled && items.length > 0) {
        setSelectedIndex(items.length - 1);
      }
    },
  }), [navigateNext, navigatePrevious, selectCurrent, resetSelection, onEscape, enabled, items.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled) return;
      
      const handler = keyHandlers[e.key as keyof typeof keyHandlers];
      handler?.(e);
    },
    [enabled, keyHandlers]
  );

  return {
    selectedIndex,
    handleKeyDown,
    setSelectedIndex,
    resetSelection,
    navigateNext,
    navigatePrevious,
    selectCurrent,
  };
}