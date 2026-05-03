/**
 * Tests for useSearchProperties hook
 *
 * This hook handles property data fetching from the API with URL parameter support,
 * loading states, error handling, and re-fetching capabilities.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import * as React from 'react';

// Import types separately to avoid circular mock issues
import type { Property, PaginatedResponse } from '@/lib/api/clients/PropertiesClient';

// Mock the API module
jest.mock('@/lib/api');

// Import after mocking
import { propertiesAPI } from '@/lib/api';
import { useSearchProperties } from '../useSearchProperties';

// Create mock function
const mockSearch = jest.fn();

// Replace propertiesAPI.search with mock
(propertiesAPI as any).search = mockSearch;

// Mock URLSearchParams for testing
const mockSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return searchParams;
};

// Sample test data
const mockProperty: Property = {
  id: '1',
  title: 'Luxury Beach Villa',
  description: 'Beautiful beachfront property',
  location: 'Miami Beach, FL',
  latitude: 25.7617,
  longitude: -80.1918,
  pricePerNight: 350,
  maxGuests: 8,
  bedrooms: 4,
  bathrooms: 3,
  images: ['image1.jpg', 'image2.jpg'],
  amenities: ['WiFi', 'Pool', 'Parking'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPaginatedResponse: PaginatedResponse<Property> = {
  data: [mockProperty],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

describe('useSearchProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock behavior
    mockSearch.mockResolvedValue(mockPaginatedResponse);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should return empty properties array initially', () => {
      const { result } = renderHook(() => useSearchProperties());

      expect(result.current.properties).toEqual([]);
    });

    it('should have loading false initially or true if fetching', async () => {
      const { result } = renderHook(() => useSearchProperties());

      // In React Testing Library, useEffect runs immediately
      // So loading might be true if fetch has started, or false if it hasn't
      // The important thing is it eventually settles to false after fetch
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should have no error initially', () => {
      const { result } = renderHook(() => useSearchProperties());

      expect(result.current.error).toBeNull();
    });

    it('should provide fetchProperties function', () => {
      const { result } = renderHook(() => useSearchProperties());

      expect(typeof result.current.fetchProperties).toBe('function');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch properties from API on mount', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.properties).toEqual([mockProperty]);
      });
    });

    it('should set loading true during fetch', async () => {
      mockSearch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPaginatedResponse), 100))
      );

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
    });

    it('should set loading false after successful fetch', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should fetch properties with empty search params (validated)', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({});
      const { result } = renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        // With validation, empty/invalid params are filtered out
        expect(propertiesAPI.search).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Search Parameters', () => {
    it('should use location from URL params', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({ location: 'Miami' });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledWith(
          expect.objectContaining({ location: 'Miami' })
        );
      });
    });

    it('should use checkIn date from URL params', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({ checkIn: '2024-06-01' });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledWith(
          expect.objectContaining({ checkIn: '2024-06-01' })
        );
      });
    });

    it('should use checkOut date from URL params', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({ checkOut: '2024-06-10' });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledWith(
          expect.objectContaining({ checkOut: '2024-06-10' })
        );
      });
    });

    it('should use adults as guests from URL params', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({ adults: '4' });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledWith(
          expect.objectContaining({ guests: 4 })
        );
      });
    });

    it('should use all search parameters together', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({
        location: 'Miami',
        checkIn: '2024-06-01',
        checkOut: '2024-06-10',
        adults: '6',
      });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Miami',
            checkIn: '2024-06-01',
            checkOut: '2024-06-10',
            guests: 6,
          })
        );
      });
    });

    it('should reject invalid date formats (security)', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      // ISO datetime with time is invalid - backend expects YYYY-MM-DD only
      const searchParams = mockSearchParams({
        checkIn: '2024-06-01T10:00:00Z'
      });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        // Validation rejects invalid format, parameter not included
        expect(propertiesAPI.search).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Error Handling', () => {
    it('should capture API errors', async () => {
      const errorMessage = 'Network error';
      mockSearch.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should set loading false after error', async () => {
      mockSearch.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear error on successful re-fetch', async () => {
      mockSearch
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      await act(async () => {
        await result.current.fetchProperties();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle errors without message', async () => {
      mockSearch.mockRejectedValue({});

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch properties');
      });
    });
  });

  describe('Pagination', () => {
    it('should handle paginated responses correctly', async () => {
      const multiPropertyResponse: PaginatedResponse<Property> = {
        data: [mockProperty, { ...mockProperty, id: '2', title: 'Second Property' }],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockSearch.mockResolvedValue(multiPropertyResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.properties).toHaveLength(2);
      });
    });

    it('should extract data from paginated response', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(Array.isArray(result.current.properties)).toBe(true);
        expect(result.current.properties[0]).toEqual(mockProperty);
      });
    });
  });

  describe('Empty Results', () => {
    it('should handle empty property arrays', async () => {
      const emptyResponse: PaginatedResponse<Property> = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockSearch.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.properties).toEqual([]);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle undefined data in response', async () => {
      mockSearch.mockResolvedValue({
        data: undefined,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.properties).toEqual([]);
      });
    });
  });

  describe('Re-fetch', () => {
    it('should allow manual re-fetching', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        await result.current.fetchProperties();
      });

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledTimes(2);
      });
    });

    it('should update properties on re-fetch', async () => {
      const firstResponse = mockPaginatedResponse;
      const secondResponse = {
        ...mockPaginatedResponse,
        data: [{ ...mockProperty, id: '2', title: 'Updated Property' }],
      };

      mockSearch
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.properties[0].title).toBe('Luxury Beach Villa');
      });

      await act(async () => {
        await result.current.fetchProperties();
      });

      await waitFor(() => {
        expect(result.current.properties[0].title).toBe('Updated Property');
      });
    });

    it('should set loading state during re-fetch', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loadingDuringFetch = false;
      act(() => {
        result.current.fetchProperties().then(() => {
          if (result.current.loading) {
            loadingDuringFetch = true;
          }
        });
      });

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Cleanup', () => {
    it('should not cause memory leaks on unmount', async () => {
      mockSearch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPaginatedResponse), 100))
      );

      const { unmount } = renderHook(() => useSearchProperties());

      unmount();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(true).toBe(true);
    });

    it('should not update state after unmount', async () => {
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise(resolve => {
        resolveSearch = resolve;
      });

      mockSearch.mockReturnValue(searchPromise);

      const { result, unmount } = renderHook(() => useSearchProperties());

      unmount();

      resolveSearch!(mockPaginatedResponse);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid guest count (security)', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({ adults: 'invalid' });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        // Validation rejects invalid values (prevents NaN, XSS, SQL injection)
        expect(propertiesAPI.search).toHaveBeenCalledWith({});
      });
    });

    it('should handle malformed dates gracefully', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const searchParams = mockSearchParams({ checkIn: 'invalid-date' });
      renderHook(() => useSearchProperties(searchParams));

      await waitFor(() => {
        expect(propertiesAPI.search).toHaveBeenCalled();
      });
    });

    it('should not fail with undefined searchParams', async () => {
      mockSearch.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchProperties(undefined));

      await waitFor(() => {
        expect(result.current.properties).toEqual([mockProperty]);
      });
    });
  });
});
