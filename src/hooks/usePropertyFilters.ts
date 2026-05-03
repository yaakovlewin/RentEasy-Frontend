/**
 * usePropertyFilters Hook
 *
 * Custom hook for managing property filtering logic.
 * Handles price range, amenities, rooms, rating, and other filter criteria.
 *
 * Features:
 * - Multiple filter types (price, amenities, rooms, rating)
 * - Filter composition (multiple filters applied together)
 * - Immutable filter operations
 * - Type-safe filter updates
 */

import { useState, useCallback } from 'react';
import { type Property } from '@/lib/api';
import { captureError, ErrorSeverity, ErrorCategory } from '@/lib/error-monitoring';

/**
 * Property filters interface
 */
export interface PropertyFilters {
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

/**
 * Hook return type
 */
export interface UsePropertyFiltersReturn {
  filters: PropertyFilters;
  updateFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  setAllFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  applyFilters: (properties: Property[]) => Property[];
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: PropertyFilters = {
  priceRange: [0, 1000],
  propertyTypes: [],
  amenities: [],
  rooms: { bedrooms: 0, bathrooms: 0 },
  instantBook: false,
  rating: 0,
};

/**
 * Filter strategy type
 * Each strategy receives a property and filter value, returns boolean for inclusion
 */
type FilterStrategy<T> = (property: Property, filterValue: T) => boolean;

/**
 * Filter strategies interface - defines specific types for each filter
 * This provides full type safety without using 'any'
 */
interface FilterStrategies {
  priceRange: FilterStrategy<[number, number]>;
  propertyTypes: FilterStrategy<string[]>;
  amenities: FilterStrategy<string[]>;
  bedrooms: FilterStrategy<number>;
  bathrooms: FilterStrategy<number>;
  rating: FilterStrategy<number>;
  instantBook: FilterStrategy<boolean>;
}

/**
 * Filter strategy map implementing the Strategy Pattern
 * Complies with Open/Closed Principle - add new filters by adding strategies
 * without modifying the applyFilters function
 *
 * PERFORMANCE OPTIMIZATION: Extracted outside hook to prevent recreation on every render.
 * This object has no dependencies on hook state and can be safely reused.
 */
const FILTER_STRATEGIES: FilterStrategies = {
  /**
   * Price range filter strategy
   * Filters properties within the specified price range [min, max]
   */
  priceRange: (property: Property, [min, max]: [number, number]) => {
    // Skip default range to avoid unnecessary filtering
    if (min === 0 && max === 1000) return true;
    return property.pricePerNight >= min && property.pricePerNight <= max;
  },

  /**
   * Property types filter strategy
   * Not implemented in backend yet, returns true for all properties
   */
  propertyTypes: (property: Property, types: string[]) => {
    // Skip if no types specified
    if (types.length === 0) return true;
    // When backend supports property types, implement filtering here
    return true;
  },

  /**
   * Amenities filter strategy
   * Filters properties that have at least one of the required amenities
   * Uses case-insensitive partial matching
   */
  amenities: (property: Property, requiredAmenities: string[]) => {
    // Skip if no amenities filter specified
    if (requiredAmenities.length === 0) return true;

    // Property must have amenities array
    if (!property.amenities || property.amenities.length === 0) return false;

    // Check if property has at least one required amenity (OR logic)
    return requiredAmenities.some(required =>
      property.amenities?.some(pAmenity =>
        pAmenity.toLowerCase().includes(required.toLowerCase())
      ) ?? false
    );
  },

  /**
   * Bedrooms filter strategy
   * Filters properties with at least the minimum number of bedrooms
   */
  bedrooms: (property: Property, minBedrooms: number) => {
    // Skip if no minimum specified or negative value
    if (minBedrooms <= 0) return true;
    return property.bedrooms >= minBedrooms;
  },

  /**
   * Bathrooms filter strategy
   * Filters properties with at least the minimum number of bathrooms
   */
  bathrooms: (property: Property, minBathrooms: number) => {
    // Skip if no minimum specified or negative value
    if (minBathrooms <= 0) return true;
    return property.bathrooms >= minBathrooms;
  },

  /**
   * Rating filter strategy
   * Uses default rating of 4.8 since backend doesn't have ratings yet
   */
  rating: (property: Property, minRating: number) => {
    // Skip if no minimum rating specified
    if (minRating <= 0) return true;

    const displayRating = 4.8; // Default rating for all properties
    return displayRating >= minRating;
  },

  /**
   * Instant book filter strategy
   * Not implemented in backend yet, returns true for all properties
   */
  instantBook: (property: Property, required: boolean) => {
    // Skip if instant book not required
    if (!required) return true;
    // When backend supports instantBook, implement filtering here
    return true;
  },
};

/**
 * usePropertyFilters Hook
 *
 * @param initialFilters - Optional initial filter values
 * @returns Object containing filters, filtered properties, and filter operations
 */
export function usePropertyFilters(
  initialFilters?: Partial<PropertyFilters>
): UsePropertyFiltersReturn {
  const [filters, setFilters] = useState<PropertyFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  /**
   * Apply all active filters to the properties array
   *
   * Uses the Strategy Pattern to apply filters dynamically without modifying
   * this function when new filter types are added. Each filter type has its
   * own strategy function that determines if a property should be included.
   *
   * @param properties - Array of properties to filter
   * @returns Filtered array of properties matching all active filter criteria
   */
  const applyFilters = useCallback(
    (properties: Property[]): Property[] => {
      // Defensive null/undefined check
      if (!properties || !Array.isArray(properties) || properties.length === 0) {
        return [];
      }

      try {
        return properties.filter(property => {
          // Defensive check for property object
          if (!property || typeof property !== 'object') {
            captureError(
              new Error('Invalid property object in filter'),
              ErrorSeverity.LOW,
              ErrorCategory.VALIDATION,
              { property }
            );
            return false;
          }

          try {
            // Apply price range filter
            if (FILTER_STRATEGIES.priceRange && !FILTER_STRATEGIES.priceRange(property, filters.priceRange)) {
              return false;
            }

            // Apply property types filter
            if (FILTER_STRATEGIES.propertyTypes && !FILTER_STRATEGIES.propertyTypes(property, filters.propertyTypes)) {
              return false;
            }

            // Apply amenities filter
            if (FILTER_STRATEGIES.amenities && !FILTER_STRATEGIES.amenities(property, filters.amenities)) {
              return false;
            }

            // Apply bedrooms filter
            if (FILTER_STRATEGIES.bedrooms && !FILTER_STRATEGIES.bedrooms(property, filters.rooms.bedrooms)) {
              return false;
            }

            // Apply bathrooms filter
            if (FILTER_STRATEGIES.bathrooms && !FILTER_STRATEGIES.bathrooms(property, filters.rooms.bathrooms)) {
              return false;
            }

            // Apply rating filter
            if (FILTER_STRATEGIES.rating && !FILTER_STRATEGIES.rating(property, filters.rating)) {
              return false;
            }

            // Apply instant book filter
            if (FILTER_STRATEGIES.instantBook && !FILTER_STRATEGIES.instantBook(property, filters.instantBook)) {
              return false;
            }

            // Property passed all filters
            return true;
          } catch (strategyError) {
            // Capture individual filter strategy errors
            captureError(
              strategyError instanceof Error ? strategyError : new Error('Filter strategy error'),
              ErrorSeverity.MEDIUM,
              ErrorCategory.COMPONENT,
              {
                operation: 'filter-strategy-execution',
                propertyId: property?.id,
                filters: {
                  priceRange: filters.priceRange,
                  propertyTypes: filters.propertyTypes,
                  amenities: filters.amenities,
                  rooms: filters.rooms,
                  rating: filters.rating,
                  instantBook: filters.instantBook,
                },
              }
            );
            // Exclude property on error to be safe
            return false;
          }
        });
      } catch (error) {
        // Capture overall filtering errors
        captureError(
          error instanceof Error ? error : new Error('Property filtering error'),
          ErrorSeverity.HIGH,
          ErrorCategory.COMPONENT,
          {
            operation: 'apply-filters',
            propertyCount: properties.length,
            filters,
          }
        );
        // Return empty array on catastrophic failure
        return [];
      }
    },
    [filters]
  );

  const updateFilter = useCallback(<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setAllFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    updateFilter,
    setAllFilters,
    resetFilters,
    applyFilters,
  };
}
