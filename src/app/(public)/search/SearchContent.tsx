'use client';

import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Bath,
  Bed,
  Car,
  Coffee,
  Filter,
  Grid3X3,
  Heart,
  LayoutList,
  MapPin,
  Waves, // Using Waves instead of Pool as Pool doesn't exist
  Star,
  Users,
  Wifi,
} from 'lucide-react';

import { type Property } from '@/lib/api';
import { cn } from '@/lib/utils';
import { mapPropertyToDisplay, type DisplayProperty } from '@/lib/utils/propertyTransformers';

import { Header } from '@/components/layout/Header';
import { SearchBar, type SearchData } from '@/components/search/SearchBar';
import { PropertyFilters } from '@/components/search/PropertyFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingCard } from '@/components/ui/LoadingSpinner';

import { useSearchProperties } from '@/hooks/useSearchProperties';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { PropertyCard } from '@/components/search/PropertyCard';

// DisplayProperty interface now imported from propertyTransformers utility

type SortOption = 'price-low' | 'price-high' | 'rating' | 'reviews';

export default function SearchContent() {
  const urlParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Use extracted hooks
  const {
    properties,
    loading: isLoading,
    error: searchError,
    fetchProperties,
  } = useSearchProperties(urlParams);

  const { filters, setAllFilters, resetFilters, applyFilters: applyFiltersHook } = usePropertyFilters();

  // Track favorited property IDs for UI-only favorites
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // PERFORMANCE OPTIMIZATION: Memoize sort comparator to prevent recreation on every render
  const getSortComparator = useCallback((sortBy: SortOption) => {
    switch (sortBy) {
      case 'price-low':
        return (a: Property, b: Property) => a.pricePerNight - b.pricePerNight;
      case 'price-high':
        return (a: Property, b: Property) => b.pricePerNight - a.pricePerNight;
      case 'rating':
        // Using default rating since backend doesn't have ratings yet
        return () => 0;
      case 'reviews':
        // Using default reviews since backend doesn't have reviews yet
        return () => 0;
      default:
        return () => 0;
    }
  }, []);

  // DERIVED STATE: Apply filters and sorting in single memoized computation
  const displayedProperties = useMemo(() => {
    // Step 1: Apply filters
    const filtered = applyFiltersHook(properties);

    // Step 2: Sort filtered results with memoized comparator
    const comparator = getSortComparator(sortBy);
    const sorted = [...filtered].sort(comparator);

    // Step 3: Apply UI-only favorites
    return sorted.map(property => ({
      ...property,
      isFavorite: favoritedIds.has(property.id),
    }));
  }, [properties, applyFiltersHook, sortBy, favoritedIds, getSortComparator]);

  // PERFORMANCE OPTIMIZATION: Memoized favorite toggle to prevent unnecessary re-renders
  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoritedIds(prev => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  }, []);

  // Close filters panel (filters are auto-applied via derived state)
  const handleApplyFilters = useCallback(() => {
    setShowFilters(false);
  }, []);

  // Reset filters to defaults
  const clearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  if (isLoading) {
    return (
      <div className='w-full'>
        <Header />
        <div className='pt-24 px-4'>
          <div className='container mx-auto'>
            <div className='animate-pulse space-y-6'>
              <div className='h-16 bg-gray-200 rounded-lg'></div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='space-y-4'>
                    <div className='h-64 bg-gray-200 rounded-lg'></div>
                    <div className='h-4 bg-gray-200 rounded'></div>
                    <div className='h-4 bg-gray-200 rounded w-2/3'></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <Header />

      <div className='pt-24 px-4'>
        <div className='container mx-auto'>
          {/* Search Bar */}
          <div className='mb-8'>
            <SearchBar variant='header' className='max-w-4xl' />
          </div>

          {/* Error Display */}
          {searchError && (
            <div className='mb-8'>
              <ErrorDisplay
                error={new Error(searchError)}
                onRetry={fetchProperties}
                title='Failed to load properties'
                variant='banner'
              />
            </div>
          )}

          {/* Enhanced Results Header */}
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {displayedProperties?.length?.toLocaleString() || 0} stays found
              </h1>
              <p className='text-gray-600 text-lg'>
                {urlParams.get('location') && `in ${urlParams.get('location')}`}
                {urlParams.get('checkIn') &&
                  ` • ${new Date(urlParams.get('checkIn')!).toLocaleDateString()}`}
                {urlParams.get('adults') && ` • ${urlParams.get('adults')} adults`}
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
              <div className='relative'>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className='appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm hover:shadow-md transition-shadow font-medium'
                >
                  <option value='rating'>Highest rated</option>
                  <option value='price-low'>Price: Low to High</option>
                  <option value='price-high'>Price: High to Low</option>
                  <option value='reviews'>Most reviews</option>
                </select>
                <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none'>
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>

              <div className='flex items-center bg-gray-100 rounded-xl p-1 shadow-sm'>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='rounded-lg'
                >
                  <Grid3X3 className='w-4 h-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='rounded-lg'
                >
                  <LayoutList className='w-4 h-4' />
                </Button>
              </div>

              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center space-x-2 rounded-xl shadow-sm hover:shadow-md transition-all font-medium'
              >
                <Filter className='w-4 h-4' />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div
              className={cn(
                'gap-6',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-6'
              )}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : !searchError && displayedProperties?.length === 0 ? (
            /* Enhanced Empty State */
            <div className='text-center py-20 animate-fade-in'>
              <div className='relative mb-8'>
                <div className='w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center'>
                  <MapPin className='w-16 h-16 text-gray-400' />
                </div>
                <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center'>
                  <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>No properties found</h3>
              <p className='text-gray-600 text-lg mb-8 max-w-md mx-auto'>
                We couldn't find any properties matching your criteria. Try adjusting your search or
                clearing some filters.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button onClick={clearFilters} variant='outline' size='lg' className='px-8'>
                  Clear all filters
                </Button>
                <Button variant='gradient' size='lg' className='px-8'>
                  Browse all properties
                </Button>
              </div>
            </div>
          ) : (
            /* Results Grid/List */
            <div
              className={cn(
                'gap-6',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-6'
              )}
            >
              {displayedProperties?.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode={viewMode}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* Enhanced Load More */}
          {displayedProperties?.length > 0 && (
            <div className='text-center mt-16'>
              <Button
                size='xl'
                variant='outline'
                className='px-12 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all'
              >
                Show more properties
                <svg className='w-5 h-5 ml-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </Button>
              <p className='text-sm text-gray-500 mt-4'>
                Showing {displayedProperties?.length || 0} of {displayedProperties?.length || 0} properties
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Filters Modal */}
      <PropertyFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setAllFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
