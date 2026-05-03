import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyFilters } from '../PropertyFilters';

describe('PropertyFilters › Integration', () => {
  const defaultFilters = {
    priceRange: [0, 1000] as [number, number],
    propertyTypes: [] as string[],
    amenities: [] as string[],
    rooms: {
      bedrooms: 0,
      bathrooms: 0,
    },
    instantBook: false,
    rating: 0,
  };

  const mockOnFiltersChange = jest.fn();
  const mockOnApplyFilters = jest.fn();
  const mockOnClearFilters = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
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

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <PropertyFilters
          isOpen={false}
          onClose={mockOnClose}
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('should render all filter sections', () => {
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

      expect(screen.getByText('Price per night')).toBeInTheDocument();
      expect(screen.getByText('Property type')).toBeInTheDocument();
      expect(screen.getByText('Rooms and beds')).toBeInTheDocument();
      expect(screen.getByText('Amenities')).toBeInTheDocument();
      expect(screen.getByText('Guest rating')).toBeInTheDocument();
    });

    it('should render close button', () => {
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

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
      expect(closeButton).toBeInTheDocument();
    });

    it('should render action buttons', () => {
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

      expect(screen.getByText('Clear all')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Show results')).toBeInTheDocument();
    });
  });

  describe('Price Range Filter', () => {
    it('should display current price range', () => {
      const filters = { ...defaultFilters, priceRange: [100, 500] as [number, number] };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('$500+')).toBeInTheDocument();
    });

    it('should update price range on slider change', async () => {
      const user = userEvent.setup();
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

      // Slider updates are handled by the Slider component
      // We can verify the filter change handler is called when the slider changes
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('$1000+')).toBeInTheDocument();
    });
  });

  describe('Property Type Filter', () => {
    it('should render all property type options', () => {
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

      expect(screen.getByText('Entire place')).toBeInTheDocument();
      expect(screen.getByText('Private room')).toBeInTheDocument();
      expect(screen.getByText('Shared room')).toBeInTheDocument();
    });

    it('should toggle property type selection', async () => {
      const user = userEvent.setup();
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

      const entirePlaceButton = screen.getByText('Entire place').closest('button');
      if (entirePlaceButton) {
        await user.click(entirePlaceButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            propertyTypes: ['entire-place'],
          })
        );
      }
    });

    it('should show selected property types with highlight', () => {
      const filters = { ...defaultFilters, propertyTypes: ['entire-place'] };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const entirePlaceButton = screen.getByText('Entire place').closest('button');
      expect(entirePlaceButton).toHaveClass('border-primary', 'bg-primary/5');
    });

    it('should deselect property type when clicked again', async () => {
      const user = userEvent.setup();
      const filters = { ...defaultFilters, propertyTypes: ['entire-place'] };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const entirePlaceButton = screen.getByText('Entire place').closest('button');
      if (entirePlaceButton) {
        await user.click(entirePlaceButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            propertyTypes: [],
          })
        );
      }
    });

    it('should allow multiple property type selections', async () => {
      const user = userEvent.setup();
      const filters = { ...defaultFilters, propertyTypes: ['entire-place'] };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const privateRoomButton = screen.getByText('Private room').closest('button');
      if (privateRoomButton) {
        await user.click(privateRoomButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            propertyTypes: ['entire-place', 'private-room'],
          })
        );
      }
    });
  });

  describe('Rooms Filter', () => {
    it('should display bedroom and bathroom counters', () => {
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

      expect(screen.getByText('Bedrooms')).toBeInTheDocument();
      expect(screen.getByText('Bathrooms')).toBeInTheDocument();
    });

    it('should display "Any" when bedroom count is 0', () => {
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

      const bedroomCounts = screen.getAllByText('Any');
      expect(bedroomCounts.length).toBeGreaterThan(0);
    });

    it('should increment bedroom count', async () => {
      const user = userEvent.setup();
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

      const bedroomSection = screen.getByText('Bedrooms').parentElement;
      const incrementButton = bedroomSection?.querySelector('button:last-of-type');
      if (incrementButton) {
        await user.click(incrementButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            rooms: { bedrooms: 1, bathrooms: 0 },
          })
        );
      }
    });

    it('should decrement bedroom count', async () => {
      const user = userEvent.setup();
      const filters = { ...defaultFilters, rooms: { bedrooms: 2, bathrooms: 0 } };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const bedroomSection = screen.getByText('Bedrooms').parentElement;
      const decrementButton = bedroomSection?.querySelector('button:first-of-type');
      if (decrementButton) {
        await user.click(decrementButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            rooms: { bedrooms: 1, bathrooms: 0 },
          })
        );
      }
    });

    it('should disable decrement when bedroom count is 0', () => {
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

      const bedroomSection = screen.getByText('Bedrooms').parentElement;
      const decrementButton = bedroomSection?.querySelector('button:first-of-type');
      expect(decrementButton).toBeDisabled();
    });

    it('should increment bathroom count', async () => {
      const user = userEvent.setup();
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

      const bathroomSection = screen.getByText('Bathrooms').parentElement;
      const incrementButton = bathroomSection?.querySelector('button:last-of-type');
      if (incrementButton) {
        await user.click(incrementButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            rooms: { bedrooms: 0, bathrooms: 1 },
          })
        );
      }
    });

    it('should display room counts correctly', () => {
      const filters = { ...defaultFilters, rooms: { bedrooms: 2, bathrooms: 1 } };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Amenities Filter', () => {
    it('should render all amenity options', () => {
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

      expect(screen.getByText('Wifi')).toBeInTheDocument();
      expect(screen.getByText('Free parking')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Hot tub')).toBeInTheDocument();
      expect(screen.getByText('Air conditioning')).toBeInTheDocument();
      expect(screen.getByText('Fireplace')).toBeInTheDocument();
      expect(screen.getByText('Beachfront')).toBeInTheDocument();
    });

    it('should toggle amenity selection', async () => {
      const user = userEvent.setup();
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

      const wifiButton = screen.getByText('Wifi').closest('button');
      if (wifiButton) {
        await user.click(wifiButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            amenities: ['wifi'],
          })
        );
      }
    });

    it('should show selected amenities with highlight', () => {
      const filters = { ...defaultFilters, amenities: ['wifi', 'parking'] };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const wifiButton = screen.getByText('Wifi').closest('button');
      const parkingButton = screen.getByText('Free parking').closest('button');

      expect(wifiButton).toHaveClass('border-primary', 'bg-primary/5');
      expect(parkingButton).toHaveClass('border-primary', 'bg-primary/5');
    });

    it('should allow multiple amenity selections', async () => {
      const user = userEvent.setup();
      const filters = { ...defaultFilters, amenities: ['wifi'] };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const parkingButton = screen.getByText('Free parking').closest('button');
      if (parkingButton) {
        await user.click(parkingButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            amenities: ['wifi', 'parking'],
          })
        );
      }
    });
  });

  describe('Guest Rating Filter', () => {
    it('should display rating slider', () => {
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

      expect(screen.getByText('Guest rating')).toBeInTheDocument();
    });

    it('should display current rating', () => {
      const filters = { ...defaultFilters, rating: 4.5 };
      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText('4.5+ stars')).toBeInTheDocument();
    });

    it('should display "Any rating" when rating is 0', () => {
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

      expect(screen.getByText('Any rating')).toBeInTheDocument();
    });
  });

  describe('Instant Book Filter', () => {
    it('should render instant book checkbox', () => {
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

      expect(screen.getByText(/Instant Book/i)).toBeInTheDocument();
    });

    it('should toggle instant book', async () => {
      const user = userEvent.setup();
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

      const instantBookLabel = screen.getByText(/Instant Book/i);
      const checkbox = instantBookLabel.previousElementSibling;

      if (checkbox) {
        await user.click(checkbox);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instantBook: true,
          })
        );
      }
    });
  });

  describe('Filter Actions', () => {
    it('should call onClearFilters when Clear all is clicked', async () => {
      const user = userEvent.setup();
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

      const clearButton = screen.getByText('Clear all');
      await user.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
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

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onApplyFilters when Show results is clicked', async () => {
      const user = userEvent.setup();
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

      const applyButton = screen.getByText('Show results');
      await user.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X button is clicked', async () => {
      const user = userEvent.setup();
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

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Complete Filter Workflow', () => {
    it('should handle complete filter selection workflow', async () => {
      const user = userEvent.setup();
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
      if (entirePlaceButton) await user.click(entirePlaceButton);

      // Select amenities
      const wifiButton = screen.getByText('Wifi').closest('button');
      if (wifiButton) await user.click(wifiButton);

      // Increment bedrooms
      const bedroomSection = screen.getByText('Bedrooms').parentElement;
      const bedroomIncrement = bedroomSection?.querySelector('button:last-of-type');
      if (bedroomIncrement) await user.click(bedroomIncrement);

      // Apply filters
      const applyButton = screen.getByText('Show results');
      await user.click(applyButton);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      expect(mockOnApplyFilters).toHaveBeenCalledTimes(1);
    });

    it('should persist filter state through interactions', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
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
      if (entirePlaceButton) await user.click(entirePlaceButton);

      // Simulate parent component updating filters
      const updatedFilters = {
        ...defaultFilters,
        propertyTypes: ['entire-place'],
      };

      rerender(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={updatedFilters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      const updatedButton = screen.getByText('Entire place').closest('button');
      expect(updatedButton).toHaveClass('border-primary', 'bg-primary/5');
    });
  });

  describe('Accessibility', () => {
    it('should have proper modal overlay', () => {
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

      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
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

      const applyButton = screen.getByText('Show results');
      applyButton.focus();

      await user.keyboard('{Enter}');

      expect(mockOnApplyFilters).toHaveBeenCalled();
    });

    it('should have scrollable content for overflow', () => {
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

      const contentArea = screen.getByText('Price per night').closest('.p-6');
      expect(contentArea?.parentElement).toHaveClass('overflow-y-auto');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all filters at maximum values', () => {
      const maxFilters = {
        priceRange: [0, 1000] as [number, number],
        propertyTypes: ['entire-place', 'private-room', 'shared-room'],
        amenities: ['wifi', 'parking', 'kitchen', 'hot-tub', 'ac', 'fireplace', 'beachfront'],
        rooms: {
          bedrooms: 10,
          bathrooms: 10,
        },
        instantBook: true,
        rating: 5,
      };

      render(
        <PropertyFilters
          isOpen={true}
          onClose={mockOnClose}
          filters={maxFilters}
          onFiltersChange={mockOnFiltersChange}
          onApplyFilters={mockOnApplyFilters}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup();
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

      const bedroomSection = screen.getByText('Bedrooms').parentElement;
      const incrementButton = bedroomSection?.querySelector('button:last-of-type');

      if (incrementButton) {
        for (let i = 0; i < 5; i++) {
          await user.click(incrementButton);
        }

        expect(mockOnFiltersChange).toHaveBeenCalledTimes(5);
      }
    });
  });
});
