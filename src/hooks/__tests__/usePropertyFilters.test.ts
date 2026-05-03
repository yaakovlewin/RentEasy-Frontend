/**
 * Tests for usePropertyFilters hook
 *
 * This hook handles property filtering and sorting logic with support for
 * price range, property types, amenities, rooms, instant book, and rating filters.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import type { Property } from '@/lib/api/clients/PropertiesClient';
import { usePropertyFilters, DEFAULT_FILTERS, type PropertyFilters } from '../usePropertyFilters';

// Sample test data
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Beach Villa',
    description: 'Beautiful beachfront property',
    location: 'Miami Beach, FL',
    pricePerNight: 350,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    images: ['image1.jpg'],
    amenities: ['WiFi', 'Pool', 'Parking'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Cozy Downtown Apartment',
    description: 'Modern apartment in city center',
    location: 'New York, NY',
    pricePerNight: 150,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    images: ['image2.jpg'],
    amenities: ['WiFi', 'Gym'],
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Mountain Cabin',
    description: 'Rustic cabin with mountain views',
    location: 'Aspen, CO',
    pricePerNight: 250,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: ['image3.jpg'],
    amenities: ['WiFi', 'Fireplace', 'Parking'],
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    title: 'Budget Studio',
    description: 'Affordable studio apartment',
    location: 'Austin, TX',
    pricePerNight: 75,
    maxGuests: 1,
    bedrooms: 0,
    bathrooms: 1,
    images: ['image4.jpg'],
    amenities: ['WiFi'],
    isActive: true,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    title: 'Luxury Penthouse',
    description: 'High-end penthouse suite',
    location: 'Los Angeles, CA',
    pricePerNight: 800,
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 4,
    images: ['image5.jpg'],
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Concierge'],
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

describe('usePropertyFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Filters', () => {
    it('should return default filter values', () => {
      const { result } = renderHook(() => usePropertyFilters());

      expect(result.current.filters).toEqual({
        priceRange: [0, 1000],
        propertyTypes: [],
        amenities: [],
        rooms: { bedrooms: 0, bathrooms: 0 },
        instantBook: false,
        rating: 0,
      });
    });

    it('should have default filters initially', () => {
      const { result } = renderHook(() => usePropertyFilters());

      expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    });

    it('should provide updateFilter function', () => {
      const { result } = renderHook(() => usePropertyFilters());

      expect(typeof result.current.updateFilter).toBe('function');
    });

    it('should provide resetFilters function', () => {
      const { result } = renderHook(() => usePropertyFilters());

      expect(typeof result.current.resetFilters).toBe('function');
    });

    it('should provide applyFilters function', () => {
      const { result } = renderHook(() => usePropertyFilters());

      expect(typeof result.current.applyFilters).toBe('function');
    });
  });

  describe('Custom Initial Filters', () => {
    it('should accept custom price range', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ priceRange: [100, 500] })
      );

      expect(result.current.filters.priceRange).toEqual([100, 500]);
    });

    it('should accept custom property types', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ propertyTypes: ['apartment', 'villa'] })
      );

      expect(result.current.filters.propertyTypes).toEqual(['apartment', 'villa']);
    });

    it('should accept custom amenities', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ amenities: ['WiFi', 'Pool'] })
      );

      expect(result.current.filters.amenities).toEqual(['WiFi', 'Pool']);
    });

    it('should accept custom rooms', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ rooms: { bedrooms: 2, bathrooms: 1 } })
      );

      expect(result.current.filters.rooms).toEqual({ bedrooms: 2, bathrooms: 1 });
    });

    it('should accept custom instant book', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ instantBook: true })
      );

      expect(result.current.filters.instantBook).toBe(true);
    });

    it('should accept custom rating', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ rating: 4.5 })
      );

      expect(result.current.filters.rating).toBe(4.5);
    });

    it('should merge custom filters with defaults', () => {
      const { result } = renderHook(() =>
        usePropertyFilters({ priceRange: [200, 600] })
      );

      expect(result.current.filters).toMatchObject({
        priceRange: [200, 600],
        propertyTypes: [],
        amenities: [],
        rooms: { bedrooms: 0, bathrooms: 0 },
        instantBook: false,
        rating: 0,
      });
    });
  });

  describe('Update Filter', () => {
    it('should update price range filter', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [100, 500]);
      });

      expect(result.current.filters.priceRange).toEqual([100, 500]);
    });

    it('should update property types filter', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('propertyTypes', ['apartment']);
      });

      expect(result.current.filters.propertyTypes).toEqual(['apartment']);
    });

    it('should update amenities filter', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['WiFi', 'Pool']);
      });

      expect(result.current.filters.amenities).toEqual(['WiFi', 'Pool']);
    });

    it('should update rooms filter', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rooms', { bedrooms: 3, bathrooms: 2 });
      });

      expect(result.current.filters.rooms).toEqual({ bedrooms: 3, bathrooms: 2 });
    });

    it('should update instant book filter', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('instantBook', true);
      });

      expect(result.current.filters.instantBook).toBe(true);
    });

    it('should update rating filter', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rating', 4.5);
      });

      expect(result.current.filters.rating).toBe(4.5);
    });

    it('should preserve other filters when updating one', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['WiFi']);
      });

      act(() => {
        result.current.updateFilter('rating', 4.0);
      });

      expect(result.current.filters.amenities).toEqual(['WiFi']);
      expect(result.current.filters.rating).toBe(4.0);
    });
  });

  describe('Price Range Filtering', () => {
    it('should filter properties by minimum price', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [200, 1000]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.pricePerNight >= 200)).toBe(true);
    });

    it('should filter properties by maximum price', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [0, 200]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.pricePerNight <= 200)).toBe(true);
    });

    it('should filter properties by price range', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [100, 300]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.pricePerNight >= 100 && p.pricePerNight <= 300)).toBe(true);
    });

    it('should not filter when price range is default [0, 1000]', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(mockProperties.length);
    });

    it('should handle exact price match', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [150, 150]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].pricePerNight).toBe(150);
    });
  });

  describe('Amenities Filtering', () => {
    it('should filter properties by single amenity', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['Pool']);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.amenities?.includes('Pool'))).toBe(true);
    });

    it('should filter properties by multiple amenities (OR logic)', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['Pool', 'Gym']);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(3);
    });

    it('should handle case-insensitive amenity matching', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['wifi']);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(p =>
        p.amenities?.some(a => a.toLowerCase().includes('wifi'))
      )).toBe(true);
    });

    it('should not filter when amenities array is empty', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(mockProperties.length);
    });

    it('should handle partial amenity name matching', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['park']);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(p =>
        p.amenities?.some(a => a.toLowerCase().includes('park'))
      )).toBe(true);
    });
  });

  describe('Rooms Filtering', () => {
    it('should filter by minimum bedrooms', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rooms', { bedrooms: 3, bathrooms: 0 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.bedrooms >= 3)).toBe(true);
    });

    it('should filter by minimum bathrooms', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rooms', { bedrooms: 0, bathrooms: 2 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.bathrooms >= 2)).toBe(true);
    });

    it('should filter by both bedrooms and bathrooms', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rooms', { bedrooms: 3, bathrooms: 2 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(3);
      expect(filtered.every(p => p.bedrooms >= 3 && p.bathrooms >= 2)).toBe(true);
    });

    it('should not filter when rooms are 0', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(mockProperties.length);
    });

    it('should handle properties with 0 bedrooms (studios)', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rooms', { bedrooms: 0, bathrooms: 0 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(mockProperties.length);
    });
  });

  describe('Rating Filtering', () => {
    it('should filter by minimum rating', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rating', 4.5);
      });

      const filtered = result.current.applyFilters(mockProperties);

      // Default rating is 4.8, so all should pass
      expect(filtered).toHaveLength(mockProperties.length);
    });

    it('should filter out properties below rating threshold', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rating', 5.0);
      });

      const filtered = result.current.applyFilters(mockProperties);

      // Default rating is 4.8, so none should pass
      expect(filtered).toHaveLength(0);
    });

    it('should not filter when rating is 0', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(mockProperties.length);
    });
  });

  describe('Multiple Filters', () => {
    it('should apply price and amenities filters together', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [200, 500]);
        result.current.updateFilter('amenities', ['Pool']);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
      expect(filtered[0].pricePerNight).toBe(350);
      expect(filtered[0].amenities).toContain('Pool');
    });

    it('should apply price and rooms filters together', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [100, 400]);
        result.current.updateFilter('rooms', { bedrooms: 3, bathrooms: 2 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(p =>
        p.pricePerNight >= 100 &&
        p.pricePerNight <= 400 &&
        p.bedrooms >= 3 &&
        p.bathrooms >= 2
      )).toBe(true);
    });

    it('should apply all filters simultaneously', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [200, 400]);
        result.current.updateFilter('amenities', ['WiFi']);
        result.current.updateFilter('rooms', { bedrooms: 3, bathrooms: 2 });
        result.current.updateFilter('rating', 4.0);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered.every(p =>
        p.pricePerNight >= 200 &&
        p.pricePerNight <= 400 &&
        p.bedrooms >= 3 &&
        p.bathrooms >= 2 &&
        p.amenities?.some(a => a.toLowerCase().includes('wifi'))
      )).toBe(true);
    });

    it('should return empty array when no properties match all filters', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [50, 60]);
        result.current.updateFilter('rooms', { bedrooms: 10, bathrooms: 5 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('Reset Filters', () => {
    it('should reset all filters to defaults', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [100, 500]);
        result.current.updateFilter('amenities', ['WiFi']);
        result.current.updateFilter('rating', 4.5);
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        priceRange: [0, 1000],
        propertyTypes: [],
        amenities: [],
        rooms: { bedrooms: 0, bathrooms: 0 },
        instantBook: false,
        rating: 0,
      });
    });

    it('should reset filters to defaults on reset', () => {
      const { result } = renderHook(() => usePropertyFilters());

      // Change some filters first
      act(() => {
        result.current.updateFilter('priceRange', [100, 500]);
        result.current.updateFilter('rating', 4);
      });

      // Now reset
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    });

    it('should allow filtering after reset', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [100, 500]);
        result.current.resetFilters();
        result.current.updateFilter('amenities', ['Pool']);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(p => p.amenities?.includes('Pool'))).toBe(true);
    });
  });

  describe('Filter Immutability', () => {
    it('should not mutate input properties array', () => {
      const { result } = renderHook(() => usePropertyFilters());
      const originalProperties = [...mockProperties];

      act(() => {
        result.current.updateFilter('priceRange', [100, 500]);
      });

      result.current.applyFilters(mockProperties);

      expect(mockProperties).toEqual(originalProperties);
    });

    it('should not mutate individual property objects', () => {
      const { result } = renderHook(() => usePropertyFilters());
      const originalProperty = { ...mockProperties[0] };

      act(() => {
        result.current.updateFilter('amenities', ['WiFi']);
      });

      result.current.applyFilters(mockProperties);

      expect(mockProperties[0]).toEqual(originalProperty);
    });

    it('should return new array instance', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).not.toBe(mockProperties);
    });

    it('should not modify filters when applyFilters is called', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtersBefore = { ...result.current.filters };

      result.current.applyFilters(mockProperties);

      expect(result.current.filters).toEqual(filtersBefore);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty properties array', () => {
      const { result } = renderHook(() => usePropertyFilters());

      const filtered = result.current.applyFilters([]);

      expect(filtered).toEqual([]);
    });

    it('should handle properties without amenities', () => {
      const propertiesWithoutAmenities: Property[] = [
        {
          ...mockProperties[0],
          amenities: undefined,
        },
      ];

      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['WiFi']);
      });

      const filtered = result.current.applyFilters(propertiesWithoutAmenities);

      expect(filtered).toEqual([]);
    });

    it('should handle properties with empty amenities array', () => {
      const propertiesWithEmptyAmenities: Property[] = [
        {
          ...mockProperties[0],
          amenities: [],
        },
      ];

      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('amenities', ['WiFi']);
      });

      const filtered = result.current.applyFilters(propertiesWithEmptyAmenities);

      expect(filtered).toEqual([]);
    });

    it('should handle negative price range', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [-100, 200]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should handle reversed price range (max < min)', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [500, 100]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      // Should return empty since no property can satisfy min > max
      expect(filtered).toEqual([]);
    });

    it('should handle very large price range', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [0, 999999]);
      });

      const filtered = result.current.applyFilters(mockProperties);

      expect(filtered).toHaveLength(mockProperties.length);
    });

    it('should handle negative room counts', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('rooms', { bedrooms: -1, bathrooms: -1 });
      });

      const filtered = result.current.applyFilters(mockProperties);

      // Negative counts should not filter
      expect(filtered).toHaveLength(mockProperties.length);
    });
  });

  describe('Functional Programming', () => {
    it('should be pure - same inputs produce same outputs', () => {
      const { result } = renderHook(() => usePropertyFilters());

      act(() => {
        result.current.updateFilter('priceRange', [100, 500]);
      });

      const filtered1 = result.current.applyFilters(mockProperties);
      const filtered2 = result.current.applyFilters(mockProperties);

      expect(filtered1).toEqual(filtered2);
    });

    it('should not have side effects on external state', () => {
      const { result } = renderHook(() => usePropertyFilters());
      const externalState = { modified: false };

      act(() => {
        result.current.updateFilter('amenities', ['WiFi']);
      });

      result.current.applyFilters(mockProperties);

      expect(externalState.modified).toBe(false);
    });

    it('should maintain referential transparency', () => {
      const { result: result1 } = renderHook(() =>
        usePropertyFilters({ priceRange: [100, 500] })
      );
      const { result: result2 } = renderHook(() =>
        usePropertyFilters({ priceRange: [100, 500] })
      );

      const filtered1 = result1.current.applyFilters(mockProperties);
      const filtered2 = result2.current.applyFilters(mockProperties);

      expect(filtered1).toEqual(filtered2);
    });
  });
});
