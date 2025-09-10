'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePersistedState } from './usePersistedState';
import type { Property } from '@/lib/api';

// Filter configuration types
export interface SearchFilters {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  rooms: {
    bedrooms: number;
    bathrooms: number;
  };
  instantBook: boolean;
  rating: number;
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'reviews' | 'distance' | 'newest';

export interface FilterOptions {
  // Price range bounds
  minPrice?: number;
  maxPrice?: number;
  
  // Available property types
  availablePropertyTypes?: string[];
  
  // Available amenities
  availableAmenities?: string[];
  
  // Persist filters across sessions
  persistFilters?: boolean;
  
  // Default sort option
  defaultSort?: SortOption;
  
  // Filter validation function
  validateFilters?: (filters: SearchFilters) => SearchFilters;
}

// Default filter values
const DEFAULT_FILTERS: SearchFilters = {
  priceRange: [0, 1000],
  propertyTypes: [],
  amenities: [],
  rooms: {
    bedrooms: 0,
    bathrooms: 0,
  },
  instantBook: false,
  rating: 0,
};

// Available amenities with proper typing
export const AVAILABLE_AMENITIES = [
  'wifi',
  'parking',
  'pool',
  'gym',
  'kitchen',
  'washer',
  'dryer',
  'balcony',
  'garden',
  'barbecue',
  'fireplace',
  'netflix',
  'coffee',
  'breakfast',
] as const;

export type AmenityType = typeof AVAILABLE_AMENITIES[number];

// Available property types
export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'cottage',
  'studio',
  'loft',
  'penthouse',
  'townhouse',
] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];

// Enhanced display property interface for consistent filtering
export interface FilterableProperty extends Property {
  displayPrice: number;
  displayGuests: number;
  displayBeds: number;
  displayBaths: number;
  displayRating: number;
  displayReviews: number;
  displayAmenities: string[];
  isInstantBook?: boolean;
  isFavorite?: boolean;
}

/**
 * Enterprise-grade hook for search filter management
 * 
 * Features:
 * - Comprehensive filter state management
 * - Sorting functionality with multiple options
 * - Property filtering with intelligent matching
 * - Persistent filter state (optional)
 * - Filter validation and sanitization
 * - Performance optimized with memoization
 * - TypeScript support throughout
 */
export function useSearchFilters(options: FilterOptions = {}) {
  const {
    minPrice = 0,
    maxPrice = 1000,
    availablePropertyTypes = PROPERTY_TYPES as unknown as string[],
    availableAmenities = AVAILABLE_AMENITIES as unknown as string[],
    persistFilters = true,
    defaultSort = 'rating',
    validateFilters,
  } = options;

  // Use persisted state if enabled, otherwise use regular state
  const [filters, setFilters] = persistFilters
    ? usePersistedState('search-filters', DEFAULT_FILTERS, {
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
        validate: (value): value is SearchFilters => {
          return (
            typeof value === 'object' &&
            value !== null &&
            Array.isArray(value.priceRange) &&
            value.priceRange.length === 2 &&
            typeof value.priceRange[0] === 'number' &&
            typeof value.priceRange[1] === 'number' &&
            Array.isArray(value.propertyTypes) &&
            Array.isArray(value.amenities) &&
            typeof value.rooms === 'object' &&
            typeof value.instantBook === 'boolean' &&
            typeof value.rating === 'number'
          );
        },
      })
    : useState<SearchFilters>(DEFAULT_FILTERS);

  const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterDirty, setIsFilterDirty] = useState(false);

  // Normalize property for consistent filtering
  const normalizeProperty = useCallback((property: Property): FilterableProperty => ({
    ...property,
    displayPrice: property.pricePerNight || 0,
    displayGuests: property.maxGuests || 1,
    displayBeds: property.bedrooms || 1,
    displayBaths: property.bathrooms || 1,
    displayRating: 4.8, // Default until backend provides ratings
    displayReviews: 25, // Default until backend provides review counts
    displayAmenities: property.amenities || [],
    isInstantBook: true, // Default until backend provides this field
    isFavorite: false, // Should be managed separately
  }), []);

  // Apply filters to properties
  const applyFilters = useCallback((properties: Property[]): Property[] => {
    if (!properties || properties.length === 0) return [];

    return properties.filter(property => {
      const normalized = normalizeProperty(property);

      // Price range filter
      if (normalized.displayPrice < filters.priceRange[0] || 
          normalized.displayPrice > filters.priceRange[1]) {
        return false;
      }

      // Property types filter
      if (filters.propertyTypes.length > 0) {
        const propertyType = property.propertyType?.toLowerCase() || 'apartment';
        if (!filters.propertyTypes.some(type => type.toLowerCase() === propertyType)) {
          return false;
        }
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasRequiredAmenities = filters.amenities.every(requiredAmenity =>
          normalized.displayAmenities.some(amenity =>
            amenity.toLowerCase().includes(requiredAmenity.toLowerCase())
          )
        );
        if (!hasRequiredAmenities) {
          return false;
        }
      }

      // Rooms filter
      if (filters.rooms.bedrooms > 0 && normalized.displayBeds < filters.rooms.bedrooms) {
        return false;
      }
      if (filters.rooms.bathrooms > 0 && normalized.displayBaths < filters.rooms.bathrooms) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && normalized.displayRating < filters.rating) {
        return false;
      }

      // Instant book filter
      if (filters.instantBook && !normalized.isInstantBook) {
        return false;
      }

      return true;
    });
  }, [filters, normalizeProperty]);

  // Sort properties
  const sortProperties = useCallback((properties: Property[]): Property[] => {
    if (!properties || properties.length === 0) return [];

    return [...properties].sort((a, b) => {
      const normalizedA = normalizeProperty(a);
      const normalizedB = normalizeProperty(b);

      switch (sortBy) {
        case 'price-low':
          return normalizedA.displayPrice - normalizedB.displayPrice;
        case 'price-high':
          return normalizedB.displayPrice - normalizedA.displayPrice;
        case 'rating':
          return normalizedB.displayRating - normalizedA.displayRating;
        case 'reviews':
          return normalizedB.displayReviews - normalizedA.displayReviews;
        case 'distance':
          // Would need location data to implement properly
          return 0;
        case 'newest':
          // Would need creation date to implement properly
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
  }, [sortBy, normalizeProperty]);

  // Apply filters and sorting together
  const processProperties = useCallback((properties: Property[]): Property[] => {
    const filtered = applyFilters(properties);
    return sortProperties(filtered);
  }, [applyFilters, sortProperties]);

  // Update individual filter values
  const updatePriceRange = useCallback((range: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
    setIsFilterDirty(true);
  }, [setFilters]);

  const updatePropertyTypes = useCallback((types: string[]) => {
    setFilters(prev => ({ ...prev, propertyTypes: types }));
    setIsFilterDirty(true);
  }, [setFilters]);

  const updateAmenities = useCallback((amenities: string[]) => {
    setFilters(prev => ({ ...prev, amenities }));
    setIsFilterDirty(true);
  }, [setFilters]);

  const updateRooms = useCallback((rooms: { bedrooms?: number; bathrooms?: number }) => {
    setFilters(prev => ({
      ...prev,
      rooms: { ...prev.rooms, ...rooms }
    }));
    setIsFilterDirty(true);
  }, [setFilters]);

  const updateInstantBook = useCallback((enabled: boolean) => {
    setFilters(prev => ({ ...prev, instantBook: enabled }));
    setIsFilterDirty(true);
  }, [setFilters]);

  const updateRating = useCallback((rating: number) => {
    setFilters(prev => ({ ...prev, rating }));
    setIsFilterDirty(true);
  }, [setFilters]);

  // Toggle amenity
  const toggleAmenity = useCallback((amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
    setIsFilterDirty(true);
  }, [setFilters]);

  // Toggle property type
  const togglePropertyType = useCallback((type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
    setIsFilterDirty(true);
  }, [setFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [minPrice, maxPrice] as [number, number],
    };
    
    const finalFilters = validateFilters ? validateFilters(clearedFilters) : clearedFilters;
    setFilters(finalFilters);
    setIsFilterDirty(false);
  }, [setFilters, minPrice, maxPrice, validateFilters]);

  // Reset to default with bounds
  const resetFilters = useCallback(() => {
    const resetFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [minPrice, maxPrice] as [number, number],
    };
    
    const finalFilters = validateFilters ? validateFilters(resetFilters) : resetFilters;
    setFilters(finalFilters);
    setIsFilterDirty(false);
  }, [setFilters, minPrice, maxPrice, validateFilters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.priceRange[0] !== minPrice ||
      filters.priceRange[1] !== maxPrice ||
      filters.propertyTypes.length > 0 ||
      filters.amenities.length > 0 ||
      filters.rooms.bedrooms > 0 ||
      filters.rooms.bathrooms > 0 ||
      filters.instantBook ||
      filters.rating > 0
    );
  }, [filters, minPrice, maxPrice]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.rooms.bedrooms > 0) count++;
    if (filters.rooms.bathrooms > 0) count++;
    if (filters.instantBook) count++;
    if (filters.rating > 0) count++;
    
    return count;
  }, [filters, minPrice, maxPrice]);

  // Validate filters on change
  useEffect(() => {
    if (validateFilters) {
      const validatedFilters = validateFilters(filters);
      if (JSON.stringify(validatedFilters) !== JSON.stringify(filters)) {
        setFilters(validatedFilters);
      }
    }
  }, [filters, validateFilters, setFilters]);

  return {
    // Filter state
    filters,
    sortBy,
    showFilters,
    isFilterDirty,
    
    // Filter status
    hasActiveFilters,
    activeFilterCount,
    
    // Filter actions
    updatePriceRange,
    updatePropertyTypes,
    updateAmenities,
    updateRooms,
    updateInstantBook,
    updateRating,
    toggleAmenity,
    togglePropertyType,
    clearFilters,
    resetFilters,
    
    // Sorting actions
    setSortBy,
    
    // UI actions
    setShowFilters,
    toggleFilters: () => setShowFilters(prev => !prev),
    hideFilters: () => setShowFilters(false),
    
    // Property processing
    processProperties,
    applyFilters,
    sortProperties,
    normalizeProperty,
    
    // Configuration
    availablePropertyTypes,
    availableAmenities,
    minPrice,
    maxPrice,
    
    // Mark filters as applied
    markFiltersApplied: () => setIsFilterDirty(false),
  };
}

// Convenience hook for simple use cases
export function useSimpleFilters(properties: Property[] = []) {
  const searchFilters = useSearchFilters({
    persistFilters: false, // Don't persist for simple use cases
  });
  
  const filteredAndSortedProperties = useMemo(() => {
    return searchFilters.processProperties(properties);
  }, [properties, searchFilters]);
  
  return {
    ...searchFilters,
    properties: filteredAndSortedProperties,
  };
}

export default useSearchFilters;