/**
 * Header Styling Functions
 * Pure functions for computing className strings following FP principles
 */

import { cn } from '@/lib/utils';

interface HeaderStyleConfig {
  readonly transparent: boolean;
  readonly isScrolled: boolean;
}

interface CategoryButtonStyleConfig extends HeaderStyleConfig {
  readonly isActive: boolean;
}

/**
 * Computes header container className based on transparency and scroll state
 * Pure function - same input always produces same output
 */
export const getHeaderClassName = ({ transparent, isScrolled }: HeaderStyleConfig): string =>
  cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out', {
    'bg-white shadow-md border-b border-gray-100': !transparent || isScrolled,
    'bg-transparent shadow-none border-transparent': transparent && !isScrolled,
  });

/**
 * Computes category navigation className based on transparency and scroll state
 * Pure function - same input always produces same output
 */
export const getCategoryNavClassName = ({ transparent, isScrolled }: HeaderStyleConfig): string =>
  cn('border-t transition-all duration-300', {
    'border-white/20 bg-black/20 backdrop-blur-xl': transparent && !isScrolled,
    'border-gray-100 bg-white/95': !transparent || isScrolled,
  });

/**
 * Computes category button className based on active state and header style
 * Pure function - same input always produces same output
 */
export const getCategoryButtonClassName = ({
  transparent,
  isScrolled,
  isActive,
}: CategoryButtonStyleConfig): string =>
  cn(
    'flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:scale-105',
    isActive
      ? transparent && !isScrolled
        ? 'bg-white/30 text-white backdrop-blur-md border border-white/40'
        : 'bg-primary text-white shadow-lg'
      : transparent && !isScrolled
        ? 'text-white/80 hover:bg-white/20 hover:text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  );

/**
 * Computes spacer className based on scroll state and category tabs visibility
 * Pure function - same input always produces same output
 */
export const getSpacerClassName = (isScrolled: boolean, showCategoryTabs: boolean): string =>
  cn(isScrolled ? 'h-24' : 'h-20', showCategoryTabs && 'h-32');
