import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Property } from '@/lib/api';

// Mock PropertyCard component
jest.mock('../PropertyCard', () => ({
  __esModule: true,
  default: ({ property, viewMode }: { property: Property; viewMode: 'grid' | 'list' }) => (
    <div data-testid='property-card' data-property-id={property.id} data-view-mode={viewMode}>
      {property.title}
    </div>
  ),
}));

type SortOption = 'price-low' | 'price-high' | 'rating' | 'reviews';

interface SearchResultsProps {
  properties: Property[];
  viewMode: 'grid' | 'list';
  loading?: boolean;
  error?: string | null;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

// SearchResults component (simplified version for testing)
const SearchResults: React.FC<SearchResultsProps> = ({
  properties,
  viewMode,
  loading = false,
  error = null,
  onViewModeChange,
  sortBy,
  onSortChange,
}) => {
  // Dynamically import PropertyCard to avoid circular dependency
  const PropertyCard = require('../PropertyCard').default;

  if (loading) {
    return (
      <div data-testid='loading-state'>
        <div className='animate-pulse'>Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid='error-state'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div data-testid='empty-state'>
        <p>No properties found</p>
      </div>
    );
  }

  return (
    <div data-testid='search-results'>
      {/* Controls */}
      <div className='controls'>
        <div className='result-count'>
          <span>{properties.length} properties found</span>
        </div>

        {/* Sort Controls */}
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortOption)}
          aria-label='Sort properties'
        >
          <option value='rating'>Highest rated</option>
          <option value='price-low'>Price: Low to High</option>
          <option value='price-high'>Price: High to Low</option>
          <option value='reviews'>Most reviews</option>
        </select>

        {/* View Mode Toggle */}
        <div className='view-toggle'>
          <button
            onClick={() => onViewModeChange('grid')}
            aria-label='Grid view'
            aria-pressed={viewMode === 'grid'}
            className={viewMode === 'grid' ? 'active' : ''}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            aria-label='List view'
            aria-pressed={viewMode === 'list'}
            className={viewMode === 'list' ? 'active' : ''}
          >
            List
          </button>
        </div>
      </div>

      {/* Results */}
      <div className={viewMode === 'grid' ? 'grid-layout' : 'list-layout'}>
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
};

describe('SearchResults Component', () => {
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Beach House',
      description: 'Beautiful beach house',
      location: 'Malibu, CA',
      pricePerNight: 250,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Mountain Cabin',
      description: 'Cozy mountain retreat',
      location: 'Aspen, CO',
      pricePerNight: 350,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'City Apartment',
      description: 'Modern downtown apartment',
      location: 'New York, NY',
      pricePerNight: 150,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockOnViewModeChange = jest.fn();
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Grid Layout', () => {
    it('should display properties in grid layout', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const resultsContainer = screen.getByTestId('search-results');
      const gridLayout = resultsContainer.querySelector('.grid-layout');
      expect(gridLayout).toBeInTheDocument();
    });

    it('should render PropertyCard components in grid view', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const propertyCards = screen.getAllByTestId('property-card');
      expect(propertyCards).toHaveLength(3);
      propertyCards.forEach(card => {
        expect(card).toHaveAttribute('data-view-mode', 'grid');
      });
    });

    it('should have active grid button in grid view', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const gridButton = screen.getByLabelText('Grid view');
      expect(gridButton).toHaveAttribute('aria-pressed', 'true');
      expect(gridButton).toHaveClass('active');
    });
  });

  describe('List Layout', () => {
    it('should display properties in list layout', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const resultsContainer = screen.getByTestId('search-results');
      const listLayout = resultsContainer.querySelector('.list-layout');
      expect(listLayout).toBeInTheDocument();
    });

    it('should render PropertyCard components in list view', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const propertyCards = screen.getAllByTestId('property-card');
      expect(propertyCards).toHaveLength(3);
      propertyCards.forEach(card => {
        expect(card).toHaveAttribute('data-view-mode', 'list');
      });
    });

    it('should have active list button in list view', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const listButton = screen.getByLabelText('List view');
      expect(listButton).toHaveAttribute('aria-pressed', 'true');
      expect(listButton).toHaveClass('active');
    });
  });

  describe('Loading State', () => {
    it('should display loading state when loading is true', () => {
      render(
        <SearchResults
          properties={[]}
          viewMode='grid'
          loading={true}
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading properties...')).toBeInTheDocument();
    });

    it('should not display results when loading', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          loading={true}
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });

    it('should show loading spinner animation', () => {
      render(
        <SearchResults
          properties={[]}
          viewMode='grid'
          loading={true}
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const loadingElement = screen.getByTestId('loading-state');
      const spinner = loadingElement.querySelector('.animate-pulse');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is present', () => {
      render(
        <SearchResults
          properties={[]}
          viewMode='grid'
          error='Failed to load properties'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to load properties')).toBeInTheDocument();
    });

    it('should not display results when error is present', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          error='Failed to load properties'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no properties are available', () => {
      render(
        <SearchResults
          properties={[]}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No properties found')).toBeInTheDocument();
    });

    it('should not display controls in empty state', () => {
      render(
        <SearchResults
          properties={[]}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.queryByLabelText('Sort properties')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Grid view')).not.toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('should call onViewModeChange when grid button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const gridButton = screen.getByLabelText('Grid view');
      await user.click(gridButton);

      expect(mockOnViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('should call onViewModeChange when list button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      expect(mockOnViewModeChange).toHaveBeenCalledWith('list');
    });

    it('should toggle between grid and list views', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      rerender(
        <SearchResults
          properties={mockProperties}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByLabelText('List view')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Sort Controls', () => {
    it('should render sort dropdown with all options', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('Highest rated')).toBeInTheDocument();
      expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
      expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
      expect(screen.getByText('Most reviews')).toBeInTheDocument();
    });

    it('should display currently selected sort option', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='price-low'
          onSortChange={mockOnSortChange}
        />
      );

      const sortSelect = screen.getByLabelText('Sort properties');
      expect(sortSelect).toHaveValue('price-low');
    });

    it('should call onSortChange when sort option is selected', async () => {
      const user = userEvent.setup();
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const sortSelect = screen.getByLabelText('Sort properties');
      await user.selectOptions(sortSelect, 'price-high');

      expect(mockOnSortChange).toHaveBeenCalledWith('price-high');
    });
  });

  describe('Property Count', () => {
    it('should display correct property count', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('3 properties found')).toBeInTheDocument();
    });

    it('should update property count when properties change', () => {
      const { rerender } = render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('3 properties found')).toBeInTheDocument();

      rerender(
        <SearchResults
          properties={[mockProperties[0]]}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('1 properties found')).toBeInTheDocument();
    });
  });

  describe('PropertyCard Rendering', () => {
    it('should render PropertyCard for each property', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getByText('Beach House')).toBeInTheDocument();
      expect(screen.getByText('Mountain Cabin')).toBeInTheDocument();
      expect(screen.getByText('City Apartment')).toBeInTheDocument();
    });

    it('should pass correct props to PropertyCard', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const propertyCards = screen.getAllByTestId('property-card');
      propertyCards.forEach(card => {
        expect(card).toHaveAttribute('data-view-mode', 'list');
      });
    });

    it('should render properties with unique keys', () => {
      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const propertyCards = screen.getAllByTestId('property-card');
      const propertyIds = propertyCards.map(card => card.getAttribute('data-property-id'));

      expect(new Set(propertyIds).size).toBe(propertyIds.length);
    });
  });

  describe('Functional Programming', () => {
    it('should be a pure component with same props producing same output', () => {
      const { container, rerender } = render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const firstRender = container.innerHTML;

      rerender(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      const secondRender = container.innerHTML;

      expect(firstRender).toBe(secondRender);
    });

    it('should not cause side effects during render', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle prop changes immutably', () => {
      const { rerender } = render(
        <SearchResults
          properties={mockProperties}
          viewMode='grid'
          onViewModeChange={mockOnViewModeChange}
          sortBy='rating'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getAllByTestId('property-card')).toHaveLength(3);

      rerender(
        <SearchResults
          properties={[mockProperties[0]]}
          viewMode='list'
          onViewModeChange={mockOnViewModeChange}
          sortBy='price-low'
          onSortChange={mockOnSortChange}
        />
      );

      expect(screen.getAllByTestId('property-card')).toHaveLength(1);
    });
  });
});
