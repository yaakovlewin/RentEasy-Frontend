'use client';

import { memo, useCallback, useEffect, useMemo } from 'react';

import { FeatureErrorBoundary } from '@/components/error-boundaries';

import { type SearchData, useSearch } from '@/contexts/SearchContext';

import type { SearchBarVariant } from './constants';
import { SearchBarCore } from './SearchBarCore';

interface SearchBarProps {
  variant?: SearchBarVariant;
  onSearch?: (searchData: SearchData) => void;
  className?: string;
  isDocked?: boolean;
  'data-testid'?: string;
}

export type { SearchData };

/**
 * SearchBar - Enterprise-grade search component factory
 * 
 * Renders different search bar variants based on the specified variant prop.
 * Supports hero, header, and compact layouts with proper error boundaries
 * and performance optimizations.
 * 
 * @param variant - The search bar variant to render ('hero' | 'header' | 'compact')
 * @param onSearch - Callback function when search is performed
 * @param className - Additional CSS classes
 * @param isDocked - Whether the search bar is in docked mode
 * @param data-testid - Test identifier for testing
 */
const SearchBarComponent = ({
  variant = 'hero',
  onSearch,
  className,
  isDocked = false,
  'data-testid': testId,
}: SearchBarProps) => {
  const { setOnSearch } = useSearch();

  // Memoize the search callback to prevent unnecessary re-renders
  const memoizedOnSearch = useCallback(
    (searchData: SearchData) => {
      onSearch?.(searchData);
    },
    [onSearch]
  );

  // Set the onSearch callback in the context when component mounts
  useEffect(() => {
    if (onSearch) {
      setOnSearch(memoizedOnSearch);
    }
  }, [memoizedOnSearch, setOnSearch]);

  // Memoize component props to prevent unnecessary re-renders
  const componentProps = useMemo(
    () => ({
      onSearch: memoizedOnSearch,
      className,
      isDocked,
      'data-testid': testId,
    }),
    [memoizedOnSearch, className, isDocked, testId]
  );

  return (
    <SearchBarCore
      layout={variant}
      onSearch={memoizedOnSearch}
      className={className}
      isDocked={isDocked}
      data-testid={testId}
    />
  );
};

// Export the memoized version for performance optimization
export const SearchBar = memo(SearchBarComponent);
SearchBar.displayName = 'SearchBar';