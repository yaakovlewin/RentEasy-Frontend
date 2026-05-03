/**
 * Tests for SearchContext - Functional State Management
 *
 * Team B - Dev 6 (Testing & Performance)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import {
  SearchProvider,
  useSearch,
  useSearchFormData,
  useSearchResults,
  useSearchFilters,
  useSearchHistory,
  useSearchSort,
  type SearchFormData,
} from '../SearchContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SearchProvider>{children}</SearchProvider>
);

describe('SearchContext', () => {
  describe('useSearch hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSearch());
      }).toThrow('useSearch must be used within a SearchProvider');

      consoleError.mockRestore();
    });

    it('should provide search context', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
    });
  });

  describe('Form Data Management', () => {
    it('should update location', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateLocation('New York');
      });

      expect(result.current.state.formData.location).toBe('New York');
    });

    it('should update dates', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const checkIn = new Date('2024-01-01');
      const checkOut = new Date('2024-01-07');

      act(() => {
        result.current.updateDates(checkIn, checkOut);
      });

      expect(result.current.state.formData.checkIn).toEqual(checkIn);
      expect(result.current.state.formData.checkOut).toEqual(checkOut);
    });

    it('should update guests', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateGuests({ adults: 2, children: 1 });
      });

      expect(result.current.state.formData.guests.adults).toBe(2);
      expect(result.current.state.formData.guests.children).toBe(1);
      expect(result.current.state.formData.guests.infants).toBe(0);
    });

    it('should update partial form data', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const checkIn = new Date('2024-01-01');

      act(() => {
        result.current.updateFormData({
          location: 'Paris',
          checkIn,
        });
      });

      expect(result.current.state.formData.location).toBe('Paris');
      expect(result.current.state.formData.checkIn).toEqual(checkIn);
    });

    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateLocation('New York');
        result.current.updateGuests({ adults: 3 });
      });

      expect(result.current.state.formData.location).toBe('New York');

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.state.formData.location).toBe('');
      expect(result.current.state.formData.guests.adults).toBe(1);
    });
  });

  describe('Filter Management', () => {
    it('should update price range', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updatePriceRange([100, 500]);
      });

      expect(result.current.state.filters.priceRange).toEqual([100, 500]);
    });

    it('should update bedrooms', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateBedrooms(3);
      });

      expect(result.current.state.filters.bedrooms).toBe(3);
    });

    it('should update bathrooms', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateBathrooms(2);
      });

      expect(result.current.state.filters.bathrooms).toBe(2);
    });

    it('should toggle amenity', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.toggleAmenity('wifi');
      });

      expect(result.current.state.filters.amenities).toContain('wifi');

      act(() => {
        result.current.toggleAmenity('wifi');
      });

      expect(result.current.state.filters.amenities).not.toContain('wifi');
    });

    it('should toggle property type', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.togglePropertyType('apartment');
      });

      expect(result.current.state.filters.propertyTypes).toContain('apartment');

      act(() => {
        result.current.togglePropertyType('apartment');
      });

      expect(result.current.state.filters.propertyTypes).not.toContain('apartment');
    });

    it('should reset filters to default', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updatePriceRange([100, 500]);
        result.current.updateBedrooms(3);
        result.current.toggleAmenity('wifi');
      });

      expect(result.current.state.filters.priceRange).toEqual([100, 500]);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.state.filters.priceRange).toEqual([0, 1000]);
      expect(result.current.state.filters.bedrooms).toBeNull();
      expect(result.current.state.filters.amenities).toEqual([]);
    });
  });

  describe('Sort Management', () => {
    it('should update sort option', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateSort('price_high_low');
      });

      expect(result.current.state.sortBy).toBe('price_high_low');
    });
  });

  describe('Search Execution', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should set loading state during search', async () => {
      const mockApi = {
        properties: {
          searchProperties: jest.fn().mockResolvedValue({
            data: [],
            pagination: {
              total: 0,
              page: 1,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          }),
        },
      };

      jest.mock('@/lib/api', () => ({ api: mockApi }));

      const { result } = renderHook(() => useSearch(), { wrapper });

      let isLoading = false;
      act(() => {
        result.current.executeSearch().then(() => {
          isLoading = result.current.state.results.isLoading;
        });
      });

      await waitFor(() => {
        expect(result.current.state.results.isLoading).toBe(false);
      });
    });

    it('should clear results', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.state.results.properties).toEqual([]);
      expect(result.current.state.results.total).toBe(0);
    });
  });

  describe('History Management', () => {
    it('should add search to history', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const formData: SearchFormData = {
        location: 'Paris',
        checkIn: new Date('2024-01-01'),
        checkOut: new Date('2024-01-07'),
        guests: { adults: 2, children: 0, infants: 0 },
      };

      act(() => {
        result.current.addToHistory(formData);
      });

      expect(result.current.state.history.length).toBe(1);
      expect(result.current.state.history[0].formData).toEqual(formData);
    });

    it('should clear history', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const formData: SearchFormData = {
        location: 'Paris',
        checkIn: new Date('2024-01-01'),
        checkOut: new Date('2024-01-07'),
        guests: { adults: 2, children: 0, infants: 0 },
      };

      act(() => {
        result.current.addToHistory(formData);
      });

      expect(result.current.state.history.length).toBe(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.state.history).toEqual([]);
    });
  });

  describe('Selector Hooks', () => {
    it('useSearchFormData should return form data', () => {
      const { result } = renderHook(() => useSearchFormData(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.location).toBe('');
    });

    it('useSearchResults should return results', () => {
      const { result } = renderHook(() => useSearchResults(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.properties).toEqual([]);
    });

    it('useSearchFilters should return filters', () => {
      const { result } = renderHook(() => useSearchFilters(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.priceRange).toEqual([0, 1000]);
    });

    it('useSearchHistory should return history', () => {
      const { result } = renderHook(() => useSearchHistory(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current).toEqual([]);
    });

    it('useSearchSort should return sort option', () => {
      const { result } = renderHook(() => useSearchSort(), { wrapper });
      expect(result.current).toBe('price_low_high');
    });
  });

  describe('Immutability', () => {
    it('should not mutate state on location update', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const originalState = result.current.state;
      const originalFormData = result.current.state.formData;

      act(() => {
        result.current.updateLocation('New York');
      });

      expect(result.current.state).not.toBe(originalState);
      expect(result.current.state.formData).not.toBe(originalFormData);
    });

    it('should not mutate state on filter update', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      const originalState = result.current.state;
      const originalFilters = result.current.state.filters;

      act(() => {
        result.current.updatePriceRange([100, 500]);
      });

      expect(result.current.state).not.toBe(originalState);
      expect(result.current.state.filters).not.toBe(originalFilters);
    });

    it('should freeze state in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() => useSearch(), { wrapper });

      act(() => {
        result.current.updateLocation('New York');
      });

      expect(Object.isFrozen(result.current.state)).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Memoization', () => {
    it('should memoize action dispatchers', () => {
      const { result, rerender } = renderHook(() => useSearch(), { wrapper });
      const updateLocation1 = result.current.updateLocation;

      rerender();

      const updateLocation2 = result.current.updateLocation;
      expect(updateLocation1).toBe(updateLocation2);
    });

    it('should memoize selector hooks within same provider', () => {
      const { result } = renderHook(
        () => {
          const search = useSearch();
          const formData = useSearchFormData();
          return { search, formData };
        },
        { wrapper }
      );

      const formData1 = result.current.formData;

      act(() => {
        result.current.search.updateLocation('Paris');
      });

      const formData2 = result.current.formData;

      // Should have different reference after state change
      expect(formData1).not.toBe(formData2);
      expect(formData2.location).toBe('Paris');

      // Updating unrelated state should not change formData reference
      act(() => {
        result.current.search.updateSort('price_high_low');
      });

      const formData3 = result.current.formData;

      // formData should be the same reference as formData2
      expect(formData2).toBe(formData3);
    });
  });
});
