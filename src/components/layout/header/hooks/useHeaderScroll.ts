'use client';

import { useScrollPosition } from '@/hooks/useScrollPosition';

import type { UseHeaderScrollReturn } from '../types';

/**
 * Header-specific scroll hook
 * 
 * Wraps the general useScrollPosition hook to provide header-specific
 * scroll behavior with a standardized threshold.
 */
export function useHeaderScroll(): UseHeaderScrollReturn {
  const { scrollPosition, isScrolledPastThreshold } = useScrollPosition({
    threshold: 10, // Header changes style after 10px scroll
    throttle: 50,  // More responsive for header
  });

  return {
    scrollPosition,
    isScrolled: isScrolledPastThreshold,
  };
}