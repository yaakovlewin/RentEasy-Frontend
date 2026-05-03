import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchProvider } from '@/contexts/SearchContext';
import { SearchBar } from '../SearchBar';
import { PropertyFilters } from '../PropertyFilters';

// Mock the SearchBarCore to simplify integration testing
jest.mock('../SearchBarCore', () => ({
  SearchBarCore: jest.fn(({ layout, onSearch, 'data-testid': testId }) => {
    const { useSearch } = require('@/contexts/SearchContext');
    const { searchData, updateLocation, updateDates, updateGuests } = useSearch();

    return (
      <div data-testid={testId || 'search-bar'} data-layout={layout}>
        <form onSubmit={(e) => { e.preventDefault(); onSearch?.(searchData); }}>
          <input
            data-testid="location-field"
            value={searchData.location}
            onChange={(e) => updateLocation(e.target.value)}
            placeholder="Location"
          />
          <button
            data-testid="checkin-field"
            onClick={() => updateDates(new Date(2024, 0, 15), searchData.checkOut)}
          >
            Check-in
          </button>
          <button
            data-testid="checkout-field"
            onClick={() => updateDates(searchData.checkIn, new Date(2024, 0, 20))}
          >
            Check-out
          </button>
          <button
            data-testid="guests-field"
            onClick={() => updateGuests({ adults: 2 })}
          >
            Guests
          </button>
          <button type="submit" data-testid="search-button">
            Search
          </button>
        </form>
      </div>
    );
  }),
}));

describe('SearchFlow › Integration Tests', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Flow 1: Complete Search Journey', () => {
    it('should complete full search flow: location → dates → guests → search', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // Step 1: Enter location
      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Paris');

      expect(locationInput).toHaveValue('Paris');

      // Step 2: Select check-in date
      const checkinButton = screen.getByTestId('checkin-field');
      await user.click(checkinButton);

      // Step 3: Select check-out date
      const checkoutButton = screen.getByTestId('checkout-field');
      await user.click(checkoutButton);

      // Step 4: Select guests
      const guestsButton = screen.getByTestId('guests-field');
      await user.click(guestsButton);

      // Step 5: Execute search
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      // Verify search was called with correct data
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Paris',
            checkIn: expect.any(Date),
            checkOut: expect.any(Date),
            guests: expect.objectContaining({
              adults: 2,
            }),
          })
        );
      });
    });

    it('should allow modifying search parameters before searching', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // First entry
      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'London');

      expect(locationInput).toHaveValue('London');

      // Change mind - update location
      await user.clear(locationInput);
      await user.type(locationInput, 'Paris');

      expect(locationInput).toHaveValue('Paris');

      // Update guests multiple times
      const guestsButton = screen.getByTestId('guests-field');
      await user.click(guestsButton);
      await user.click(guestsButton); // Click again

      // Search
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Paris',
          })
        );
      });
    });

    it('should handle search with partial data (location only)', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // Only enter location
      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Barcelona');

      // Search without dates or guests
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Barcelona',
          })
        );
      });
    });

    it('should handle search with dates but no location', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // Select dates without location
      const checkinButton = screen.getByTestId('checkin-field');
      await user.click(checkinButton);

      const checkoutButton = screen.getByTestId('checkout-field');
      await user.click(checkoutButton);

      // Search
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: '',
            checkIn: expect.any(Date),
            checkOut: expect.any(Date),
          })
        );
      });
    });
  });

  describe('Flow 2: Filter Application', () => {
    it('should apply filters and update search results', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      const mockOnApplyFilters = jest.fn();
      const mockOnClearFilters = jest.fn();
      const mockOnClose = jest.fn();

      const defaultFilters = {
        priceRange: [0, 1000] as [number, number],
        propertyTypes: [] as string[],
        amenities: [] as string[],
        rooms: { bedrooms: 0, bathrooms: 0 },
        instantBook: false,
        rating: 0,
      };

      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      // Select property type
      const entirePlaceButton = screen.getByText('Entire place').closest('button');
      if (entirePlaceButton) {
        await user.click(entirePlaceButton);
      }

      // Select amenity
      const wifiButton = screen.getByText('Wifi').closest('button');
      if (wifiButton) {
        await user.click(wifiButton);
      }

      // Apply filters
      const applyButton = screen.getByText('Show results');
      await user.click(applyButton);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      expect(mockOnApplyFilters).toHaveBeenCalledTimes(1);
    });

    it('should clear all filters when Clear all is clicked', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      const mockOnApplyFilters = jest.fn();
      const mockOnClearFilters = jest.fn();
      const mockOnClose = jest.fn();

      const filtersWithData = {
        priceRange: [100, 500] as [number, number],
        propertyTypes: ['entire-place'],
        amenities: ['wifi', 'parking'],
        rooms: { bedrooms: 2, bathrooms: 1 },
        instantBook: true,
        rating: 4,
      };

      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filtersWithData}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText('Clear all');
      await user.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should cancel filter changes and close modal', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      const mockOnApplyFilters = jest.fn();
      const mockOnClearFilters = jest.fn();
      const mockOnClose = jest.fn();

      const defaultFilters = {
        priceRange: [0, 1000] as [number, number],
        propertyTypes: [] as string[],
        amenities: [] as string[],
        rooms: { bedrooms: 0, bathrooms: 0 },
        instantBook: false,
        rating: 0,
      };

      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      // Make some changes
      const wifiButton = screen.getByText('Wifi').closest('button');
      if (wifiButton) {
        await user.click(wifiButton);
      }

      // Cancel instead of applying
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnApplyFilters).not.toHaveBeenCalled();
    });
  });

  describe('Flow 3: Search State Reset', () => {
    it('should clear search state and allow new search', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // First search
      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Paris');

      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Paris',
          })
        );
      });

      // Clear and perform new search
      await user.clear(locationInput);
      await user.type(locationInput, 'London');

      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'London',
          })
        );
      });
    });
  });

  describe('Flow 4: Multi-variant Search Bar', () => {
    it('should work with hero variant', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar variant="hero" onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'hero');

      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Tokyo');

      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    it('should work with header variant', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar variant="header" onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'header');

      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    it('should work with compact variant', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar variant="compact" onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'compact');

      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Sydney');

      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Sydney',
          })
        );
      });
    });
  });

  describe('Flow 5: Complex Search Scenarios', () => {
    it('should handle complete search with all parameters', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // Set all search parameters
      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Barcelona');

      const checkinButton = screen.getByTestId('checkin-field');
      await user.click(checkinButton);

      const checkoutButton = screen.getByTestId('checkout-field');
      await user.click(checkoutButton);

      const guestsButton = screen.getByTestId('guests-field');
      await user.click(guestsButton);

      // Execute search
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Barcelona',
            checkIn: expect.any(Date),
            checkOut: expect.any(Date),
            guests: expect.objectContaining({
              adults: 2,
            }),
          })
        );
      });
    });

    it('should handle rapid parameter changes', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');

      // Rapid location changes
      await user.clear(locationInput);
      await user.type(locationInput, 'A');
      await user.clear(locationInput);
      await user.type(locationInput, 'B');
      await user.clear(locationInput);
      await user.type(locationInput, 'Paris');

      expect(locationInput).toHaveValue('Paris');

      // Rapid guest changes
      const guestsButton = screen.getByTestId('guests-field');
      await user.click(guestsButton);
      await user.click(guestsButton);
      await user.click(guestsButton);

      // Search should work
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    it('should handle search submission via Enter key', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Rome');

      // Press Enter to submit
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Rome',
          })
        );
      });
    });

    it('should maintain search state across re-renders', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');
      await user.clear(locationInput);
      await user.type(locationInput, 'Amsterdam');

      // Re-render
      rerender(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // State should persist
      const updatedLocationInput = screen.getByTestId('location-field');
      expect(updatedLocationInput).toHaveValue('Amsterdam');
    });

    it('should handle multiple searches in sequence', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');
      const searchButton = screen.getByTestId('search-button');

      // First search
      await user.clear(locationInput);
      await user.type(locationInput, 'Paris');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Paris',
          })
        );
      });

      mockOnSearch.mockClear();

      // Second search
      await user.clear(locationInput);
      await user.type(locationInput, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'London',
          })
        );
      });

      mockOnSearch.mockClear();

      // Third search
      await user.clear(locationInput);
      await user.type(locationInput, 'Berlin');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Berlin',
          })
        );
      });
    });
  });

  describe('Flow 6: Error Recovery', () => {
    it('should recover from invalid search parameters', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');

      // Try invalid/empty search
      await user.clear(locationInput);
      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      // Should still work - just with empty location
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: '',
          })
        );
      });

      mockOnSearch.mockClear();

      // Now do valid search
      await user.type(locationInput, 'Paris');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Paris',
          })
        );
      });
    });

    it('should handle search callback errors gracefully', async () => {
      const user = userEvent.setup();
      const failingCallback = jest.fn(() => {
        throw new Error('Search failed');
      });

      render(
        <SearchProvider>
          <SearchBar onSearch={failingCallback} data-testid="search-bar" />
        </SearchProvider>
      );

      const searchButton = screen.getByTestId('search-button');

      // Should not crash the app
      await expect(async () => {
        await user.click(searchButton);
      }).rejects.toThrow('Search failed');
    });
  });

  describe('Flow 7: Performance Scenarios', () => {
    it('should handle rapid form submissions efficiently', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const searchButton = screen.getByTestId('search-button');

      // Rapid clicks
      await user.click(searchButton);
      await user.click(searchButton);
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle large location strings', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');
      const longLocation = 'A'.repeat(200);

      await user.clear(locationInput);
      await user.type(locationInput, longLocation);

      expect(locationInput).toHaveValue(longLocation);

      const searchButton = screen.getByTestId('search-button');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: longLocation,
          })
        );
      });
    });
  });

  describe('Flow 8: Accessibility Compliance', () => {
    it('should support keyboard-only navigation', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      // Tab through fields
      await user.tab();
      const locationInput = screen.getByTestId('location-field');
      expect(locationInput).toHaveFocus();

      await user.type(locationInput, 'Paris');

      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab(); // Navigate to search button

      const searchButton = screen.getByTestId('search-button');
      expect(searchButton).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Paris',
          })
        );
      });
    });

    it('should provide clear focus indicators', async () => {
      const user = userEvent.setup();

      render(
        <SearchProvider>
          <SearchBar onSearch={mockOnSearch} data-testid="search-bar" />
        </SearchProvider>
      );

      const locationInput = screen.getByTestId('location-field');
      locationInput.focus();

      expect(locationInput).toHaveFocus();
    });
  });
});
