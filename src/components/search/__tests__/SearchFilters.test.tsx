import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface PropertyFilters {
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

interface SearchFiltersProps {
  filters: PropertyFilters;
  onFilterChange: (key: keyof PropertyFilters, value: any) => void;
  onReset: () => void;
  onApply: () => void;
}

// SearchFilters component (simplified version for testing)
const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const propertyTypes = [
    { id: 'entire-place', label: 'Entire place' },
    { id: 'private-room', label: 'Private room' },
    { id: 'shared-room', label: 'Shared room' },
  ];

  const amenityOptions = [
    { id: 'wifi', label: 'Wifi' },
    { id: 'parking', label: 'Free parking' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'pool', label: 'Pool' },
  ];

  return (
    <div data-testid='search-filters'>
      {/* Price Range Slider */}
      <div>
        <h3>Price per night</h3>
        <input
          type='range'
          min={0}
          max={1000}
          value={filters.priceRange[0]}
          onChange={e => onFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
          aria-label='Minimum price'
        />
        <input
          type='range'
          min={0}
          max={1000}
          value={filters.priceRange[1]}
          onChange={e => onFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
          aria-label='Maximum price'
        />
        <div>
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}+</span>
        </div>
      </div>

      {/* Property Type Checkboxes */}
      <div>
        <h3>Property type</h3>
        {propertyTypes.map(type => (
          <label key={type.id}>
            <input
              type='checkbox'
              checked={filters.propertyTypes.includes(type.id)}
              onChange={e => {
                const newTypes = e.target.checked
                  ? [...filters.propertyTypes, type.id]
                  : filters.propertyTypes.filter(t => t !== type.id);
                onFilterChange('propertyTypes', newTypes);
              }}
              aria-label={type.label}
            />
            {type.label}
          </label>
        ))}
      </div>

      {/* Amenities Checkboxes */}
      <div>
        <h3>Amenities</h3>
        {amenityOptions.map(amenity => (
          <label key={amenity.id}>
            <input
              type='checkbox'
              checked={filters.amenities.includes(amenity.id)}
              onChange={e => {
                const newAmenities = e.target.checked
                  ? [...filters.amenities, amenity.id]
                  : filters.amenities.filter(a => a !== amenity.id);
                onFilterChange('amenities', newAmenities);
              }}
              aria-label={amenity.label}
            />
            {amenity.label}
          </label>
        ))}
      </div>

      {/* Bedrooms Input */}
      <div>
        <label htmlFor='bedrooms'>Bedrooms</label>
        <button
          onClick={() =>
            onFilterChange('rooms', {
              ...filters.rooms,
              bedrooms: Math.max(0, filters.rooms.bedrooms - 1),
            })
          }
          disabled={filters.rooms.bedrooms === 0}
          aria-label='Decrease bedrooms'
        >
          -
        </button>
        <span data-testid='bedroom-count'>{filters.rooms.bedrooms || 'Any'}</span>
        <button
          onClick={() =>
            onFilterChange('rooms', {
              ...filters.rooms,
              bedrooms: filters.rooms.bedrooms + 1,
            })
          }
          aria-label='Increase bedrooms'
        >
          +
        </button>
      </div>

      {/* Bathrooms Input */}
      <div>
        <label htmlFor='bathrooms'>Bathrooms</label>
        <button
          onClick={() =>
            onFilterChange('rooms', {
              ...filters.rooms,
              bathrooms: Math.max(0, filters.rooms.bathrooms - 1),
            })
          }
          disabled={filters.rooms.bathrooms === 0}
          aria-label='Decrease bathrooms'
        >
          -
        </button>
        <span data-testid='bathroom-count'>{filters.rooms.bathrooms || 'Any'}</span>
        <button
          onClick={() =>
            onFilterChange('rooms', {
              ...filters.rooms,
              bathrooms: filters.rooms.bathrooms + 1,
            })
          }
          aria-label='Increase bathrooms'
        >
          +
        </button>
      </div>

      {/* Instant Book Toggle */}
      <div>
        <label>
          <input
            type='checkbox'
            checked={filters.instantBook}
            onChange={e => onFilterChange('instantBook', e.target.checked)}
            aria-label='Instant Book'
          />
          Instant Book
        </label>
      </div>

      {/* Rating Filter */}
      <div>
        <label htmlFor='rating'>Minimum rating</label>
        <select
          id='rating'
          value={filters.rating}
          onChange={e => onFilterChange('rating', Number(e.target.value))}
          aria-label='Minimum rating'
        >
          <option value={0}>Any rating</option>
          <option value={3}>3+ stars</option>
          <option value={4}>4+ stars</option>
          <option value={4.5}>4.5+ stars</option>
        </select>
      </div>

      {/* Action Buttons */}
      <button onClick={onReset} aria-label='Reset filters'>
        Reset
      </button>
      <button onClick={onApply} aria-label='Apply filters'>
        Apply
      </button>
    </div>
  );
};

describe('SearchFilters Component', () => {
  const defaultFilters: PropertyFilters = {
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

  const mockOnFilterChange = jest.fn();
  const mockOnReset = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Price Range Slider', () => {
    it('should render price range slider with correct values', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const minPriceSlider = screen.getByLabelText('Minimum price');
      const maxPriceSlider = screen.getByLabelText('Maximum price');

      expect(minPriceSlider).toHaveValue('0');
      expect(maxPriceSlider).toHaveValue('1000');
    });

    it('should update price range when slider changes', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const minPriceSlider = screen.getByLabelText('Minimum price');
      await user.clear(minPriceSlider);
      await user.type(minPriceSlider, '100');

      expect(mockOnFilterChange).toHaveBeenCalledWith('priceRange', [100, 1000]);
    });

    it('should display formatted price values', () => {
      const filtersWithPrice = { ...defaultFilters, priceRange: [100, 500] as [number, number] };
      render(
        <SearchFilters
          filters={filtersWithPrice}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('$500+')).toBeInTheDocument();
    });
  });

  describe('Property Type Checkboxes', () => {
    it('should render all property type options', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Entire place')).toBeInTheDocument();
      expect(screen.getByLabelText('Private room')).toBeInTheDocument();
      expect(screen.getByLabelText('Shared room')).toBeInTheDocument();
    });

    it('should check selected property types', () => {
      const filtersWithTypes = { ...defaultFilters, propertyTypes: ['entire-place'] };
      render(
        <SearchFilters
          filters={filtersWithTypes}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const entirePlaceCheckbox = screen.getByLabelText('Entire place');
      expect(entirePlaceCheckbox).toBeChecked();
    });

    it('should call onFilterChange when property type is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const privateRoomCheckbox = screen.getByLabelText('Private room');
      await user.click(privateRoomCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('propertyTypes', ['private-room']);
    });

    it('should remove property type when unchecked', async () => {
      const user = userEvent.setup();
      const filtersWithTypes = { ...defaultFilters, propertyTypes: ['entire-place'] };
      render(
        <SearchFilters
          filters={filtersWithTypes}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const entirePlaceCheckbox = screen.getByLabelText('Entire place');
      await user.click(entirePlaceCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('propertyTypes', []);
    });
  });

  describe('Amenities Checkboxes', () => {
    it('should render all amenity options', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Wifi')).toBeInTheDocument();
      expect(screen.getByLabelText('Free parking')).toBeInTheDocument();
      expect(screen.getByLabelText('Kitchen')).toBeInTheDocument();
      expect(screen.getByLabelText('Pool')).toBeInTheDocument();
    });

    it('should check selected amenities', () => {
      const filtersWithAmenities = { ...defaultFilters, amenities: ['wifi', 'parking'] };
      render(
        <SearchFilters
          filters={filtersWithAmenities}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Wifi')).toBeChecked();
      expect(screen.getByLabelText('Free parking')).toBeChecked();
    });

    it('should call onFilterChange when amenity is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const wifiCheckbox = screen.getByLabelText('Wifi');
      await user.click(wifiCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('amenities', ['wifi']);
    });
  });

  describe('Bedrooms Input', () => {
    it('should render bedroom counter with default value', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByTestId('bedroom-count')).toHaveTextContent('Any');
    });

    it('should increase bedroom count when plus button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const increaseButton = screen.getByLabelText('Increase bedrooms');
      await user.click(increaseButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('rooms', { bedrooms: 1, bathrooms: 0 });
    });

    it('should decrease bedroom count when minus button is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithBedrooms = { ...defaultFilters, rooms: { bedrooms: 2, bathrooms: 0 } };
      render(
        <SearchFilters
          filters={filtersWithBedrooms}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease bedrooms');
      await user.click(decreaseButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('rooms', { bedrooms: 1, bathrooms: 0 });
    });

    it('should disable decrease button when bedroom count is 0', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease bedrooms');
      expect(decreaseButton).toBeDisabled();
    });
  });

  describe('Bathrooms Input', () => {
    it('should render bathroom counter with default value', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByTestId('bathroom-count')).toHaveTextContent('Any');
    });

    it('should increase bathroom count when plus button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const increaseButton = screen.getByLabelText('Increase bathrooms');
      await user.click(increaseButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('rooms', { bedrooms: 0, bathrooms: 1 });
    });

    it('should decrease bathroom count when minus button is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithBathrooms = { ...defaultFilters, rooms: { bedrooms: 0, bathrooms: 2 } };
      render(
        <SearchFilters
          filters={filtersWithBathrooms}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease bathrooms');
      await user.click(decreaseButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('rooms', { bedrooms: 0, bathrooms: 1 });
    });

    it('should disable decrease button when bathroom count is 0', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const decreaseButton = screen.getByLabelText('Decrease bathrooms');
      expect(decreaseButton).toBeDisabled();
    });
  });

  describe('Instant Book Toggle', () => {
    it('should render instant book toggle', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Instant Book')).toBeInTheDocument();
    });

    it('should be unchecked by default', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Instant Book')).not.toBeChecked();
    });

    it('should call onFilterChange when toggled', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const instantBookCheckbox = screen.getByLabelText('Instant Book');
      await user.click(instantBookCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('instantBook', true);
    });
  });

  describe('Rating Filter', () => {
    it('should render rating selector with options', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const ratingSelect = screen.getByLabelText('Minimum rating');
      expect(ratingSelect).toBeInTheDocument();
      expect(screen.getByText('Any rating')).toBeInTheDocument();
      expect(screen.getByText('3+ stars')).toBeInTheDocument();
      expect(screen.getByText('4+ stars')).toBeInTheDocument();
      expect(screen.getByText('4.5+ stars')).toBeInTheDocument();
    });

    it('should call onFilterChange when rating is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const ratingSelect = screen.getByLabelText('Minimum rating');
      await user.selectOptions(ratingSelect, '4');

      expect(mockOnFilterChange).toHaveBeenCalledWith('rating', 4);
    });
  });

  describe('Reset Button', () => {
    it('should render reset button', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Reset filters')).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const resetButton = screen.getByLabelText('Reset filters');
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Apply Button', () => {
    it('should render apply button', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Apply filters')).toBeInTheDocument();
    });

    it('should call onApply when apply button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const applyButton = screen.getByLabelText('Apply filters');
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for all interactive elements', () => {
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Minimum price')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum price')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase bedrooms')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrease bedrooms')).toBeInTheDocument();
      expect(screen.getByLabelText('Instant Book')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const entirePlaceCheckbox = screen.getByLabelText('Entire place');
      entirePlaceCheckbox.focus();

      await user.keyboard('{Space}');

      expect(mockOnFilterChange).toHaveBeenCalledWith('propertyTypes', ['entire-place']);
    });
  });

  describe('Form State Management', () => {
    it('should be a controlled component with external state', () => {
      const customFilters = {
        ...defaultFilters,
        priceRange: [200, 800] as [number, number],
        propertyTypes: ['entire-place'],
        amenities: ['wifi'],
        rooms: { bedrooms: 2, bathrooms: 1 },
        instantBook: true,
        rating: 4,
      };

      render(
        <SearchFilters
          filters={customFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('Minimum price')).toHaveValue('200');
      expect(screen.getByLabelText('Entire place')).toBeChecked();
      expect(screen.getByLabelText('Wifi')).toBeChecked();
      expect(screen.getByTestId('bedroom-count')).toHaveTextContent('2');
      expect(screen.getByLabelText('Instant Book')).toBeChecked();
    });

    it('should handle multiple filter changes sequentially', async () => {
      const user = userEvent.setup();
      render(
        <SearchFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />
      );

      const entirePlaceCheckbox = screen.getByLabelText('Entire place');
      const wifiCheckbox = screen.getByLabelText('Wifi');
      const instantBookCheckbox = screen.getByLabelText('Instant Book');

      await user.click(entirePlaceCheckbox);
      await user.click(wifiCheckbox);
      await user.click(instantBookCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    });
  });
});
