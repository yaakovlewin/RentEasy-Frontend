'use client';

import { useState, useCallback, useEffect } from 'react';

import type { UseHeaderResponsiveReturn } from '../types';

/**
 * Header responsive behavior hook
 * 
 * Manages mobile menu and search overlay states with proper cleanup.
 * Provides unified control over mobile UI elements.
 */
export function useHeaderResponsive(): UseHeaderResponsiveReturn {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(prev => !prev);
  }, []);

  const closeAllMobile = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, []);

  // Close mobile overlays when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        closeAllMobile();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeAllMobile]);

  // Close mobile overlays on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllMobile();
      }
    };

    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }

    // Return cleanup function even if no listeners were added
    return () => {};
  }, [isMobileMenuOpen, isMobileSearchOpen, closeAllMobile]);

  return {
    isMobileMenuOpen,
    isMobileSearchOpen,
    toggleMobileMenu,
    toggleMobileSearch,
    closeAllMobile,
  };
}