// Custom hooks for search components

// Original hooks (maintained for backward compatibility)
export { useClickOutside, useOnClickOutside } from './useClickOutside';
export { useDateSelection } from './useDateSelection';
export { useGuestCounter } from './useGuestCounter';
export { useKeyboardNavigation } from './useKeyboardNavigation';

// Performance-optimized hooks
export {
  useClickOutsideOptimized,
  useOnClickOutsideOptimized,
  useClickOutsideSimple,
} from './useClickOutsideOptimized';

export { useKeyboardNavigationOptimized } from './useKeyboardNavigationOptimized';

export {
  useDebounceOptimized,
  useDebouncedCallback,
  useDebounceSimple,
} from './useDebounceOptimized';
