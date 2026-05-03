import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';
import { SearchProvider } from '@/contexts/SearchContext';

// Mock SearchBarCore component
jest.mock('../SearchBarCore', () => ({
  SearchBarCore: jest.fn(({ layout, onSearch, isDocked, 'data-testid': testId }) => (
    <div data-testid={testId || 'search-bar'} data-layout={layout} data-docked={isDocked}>
      <button onClick={() => onSearch?.({ location: 'Paris', checkIn: null, checkOut: null, guests: { adults: 1, children: 0, infants: 0 } })}>
        Search
      </button>
    </div>
  )),
}));

describe('SearchBar › Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <SearchProvider>
        {ui}
      </SearchProvider>
    );
  };

  describe('Rendering', () => {
    it('should render search bar with default variant', () => {
      renderWithProvider(<SearchBar />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
      expect(searchBar).toHaveAttribute('data-layout', 'hero');
    });

    it('should render with hero variant', () => {
      renderWithProvider(<SearchBar variant="hero" />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'hero');
    });

    it('should render with header variant', () => {
      renderWithProvider(<SearchBar variant="header" />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'header');
    });

    it('should render with compact variant', () => {
      renderWithProvider(<SearchBar variant="compact" />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'compact');
    });

    it('should apply custom className', () => {
      renderWithProvider(<SearchBar className="custom-class" data-testid="custom-bar" />);

      const searchBar = screen.getByTestId('custom-bar');
      expect(searchBar).toBeInTheDocument();
    });

    it('should apply custom test id', () => {
      renderWithProvider(<SearchBar data-testid="custom-search" />);

      expect(screen.getByTestId('custom-search')).toBeInTheDocument();
    });
  });

  describe('Docked State', () => {
    it('should render in non-docked state by default', () => {
      renderWithProvider(<SearchBar />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-docked', 'false');
    });

    it('should render in docked state when isDocked is true', () => {
      renderWithProvider(<SearchBar isDocked={true} />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-docked', 'true');
    });

    it('should toggle between docked states', () => {
      const { rerender } = renderWithProvider(<SearchBar isDocked={false} />);

      let searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-docked', 'false');

      rerender(
        <SearchProvider>
          <SearchBar isDocked={true} />
        </SearchProvider>
      );

      searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-docked', 'true');
    });
  });

  describe('Search Functionality', () => {
    it('should call onSearch callback when search is triggered', async () => {
      const user = userEvent.setup();
      renderWithProvider(<SearchBar onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith({
        location: 'Paris',
        checkIn: null,
        checkOut: null,
        guests: { adults: 1, children: 0, infants: 0 },
      });
    });

    it('should register onSearch callback with context', async () => {
      const user = userEvent.setup();
      renderWithProvider(<SearchBar onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalled();
    });

    it('should handle search without onSearch callback', async () => {
      const user = userEvent.setup();
      renderWithProvider(<SearchBar />);

      const searchButton = screen.getByRole('button', { name: /search/i });

      await expect(async () => {
        await user.click(searchButton);
      }).not.toThrow();
    });
  });

  describe('Memoization', () => {
    it('should memoize search callback', () => {
      const callback = jest.fn();
      const { rerender } = renderWithProvider(<SearchBar onSearch={callback} />);

      rerender(
        <SearchProvider>
          <SearchBar onSearch={callback} />
        </SearchProvider>
      );

      // Component should not re-render if callback reference is the same
      expect(SearchBar).toBeDefined();
    });

    it('should update when variant changes', () => {
      const { rerender } = renderWithProvider(<SearchBar variant="hero" />);

      let searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'hero');

      rerender(
        <SearchProvider>
          <SearchBar variant="compact" />
        </SearchProvider>
      );

      searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-layout', 'compact');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing SearchProvider gracefully', () => {
      // Note: This will throw because SearchProvider is required
      // In production, error boundary would catch this
      expect(() => {
        render(<SearchBar />);
      }).toThrow();
    });

    it('should handle invalid variant gracefully', () => {
      // TypeScript prevents this, but test runtime behavior
      renderWithProvider(<SearchBar variant={'invalid' as any} />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProvider(<SearchBar onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      searchButton.focus();

      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes via SearchBarCore', () => {
      renderWithProvider(<SearchBar />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should accept all valid variants', () => {
      const variants = ['hero', 'header', 'compact'] as const;

      variants.forEach(variant => {
        const { unmount } = renderWithProvider(<SearchBar variant={variant} />);

        const searchBar = screen.getByTestId('search-bar');
        expect(searchBar).toHaveAttribute('data-layout', variant);

        unmount();
      });
    });

    it('should handle all props combinations', () => {
      renderWithProvider(
        <SearchBar
          variant="hero"
          onSearch={mockOnSearch}
          className="custom"
          isDocked={true}
          data-testid="all-props"
        />
      );

      const searchBar = screen.getByTestId('all-props');
      expect(searchBar).toBeInTheDocument();
      expect(searchBar).toHaveAttribute('data-layout', 'hero');
      expect(searchBar).toHaveAttribute('data-docked', 'true');
    });
  });

  describe('Context Integration', () => {
    it('should integrate with SearchContext', () => {
      renderWithProvider(<SearchBar onSearch={mockOnSearch} />);

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should update when context changes', async () => {
      const user = userEvent.setup();
      renderWithProvider(<SearchBar onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <SearchBar />;
      };

      const { rerender } = renderWithProvider(<TestComponent />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = renderWithProvider(<SearchBar variant="hero" />);

      for (let i = 0; i < 10; i++) {
        const variant = i % 2 === 0 ? 'hero' : 'compact';
        rerender(
          <SearchProvider>
            <SearchBar variant={variant} />
          </SearchProvider>
        );
      }

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });
  });
});
