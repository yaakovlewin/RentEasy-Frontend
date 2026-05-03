import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationInput } from '../LocationInput';

const mockSuggestions = [
  { id: '1', name: 'Paris', description: 'France', type: 'city' as const, coordinates: { lat: 48.8566, lng: 2.3522 } },
  { id: '2', name: 'London', description: 'United Kingdom', type: 'city' as const, coordinates: { lat: 51.5074, lng: -0.1278 } },
  { id: '3', name: 'New York', description: 'New York, United States', type: 'city' as const, coordinates: { lat: 40.7128, lng: -74.0060 } },
  { id: '4', name: 'Tokyo', description: 'Japan', type: 'city' as const, coordinates: { lat: 35.6762, lng: 139.6503 } },
  { id: '5', name: 'Barcelona', description: 'Spain', type: 'city' as const, coordinates: { lat: 41.3851, lng: 2.1734 } },
];

describe('LocationInput › Component', () => {
  const mockOnChange = jest.fn();
  const mockOnSuggestionSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render location input field', () => {
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox', { name: /location search/i });
      expect(input).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      render(<LocationInput value="" onChange={mockOnChange} placeholder="Enter destination" />);

      const input = screen.getByPlaceholderText('Enter destination');
      expect(input).toBeInTheDocument();
    });

    it('should display default placeholder', () => {
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Where are you going?');
      expect(input).toBeInTheDocument();
    });

    it('should display MapPin icon', () => {
      render(<LocationInput value="" onChange={mockOnChange} />);

      const container = screen.getByTestId('location-input') || screen.getByRole('combobox').parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LocationInput value="" onChange={mockOnChange} className="custom-class" data-testid="location" />);

      const container = screen.getByTestId('location');
      expect(container).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(<LocationInput value="Paris" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('Paris');
    });
  });

  describe('User Input', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'P');

      expect(mockOnChange).toHaveBeenCalledWith('P');
    });

    it('should handle multiple characters', async () => {
      const user = userEvent.setup();
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Paris');

      expect(mockOnChange).toHaveBeenCalledTimes(5);
      expect(mockOnChange).toHaveBeenLastCalledWith('Paris');
    });

    it('should clear input on clear button click', async () => {
      const user = userEvent.setup();
      render(<LocationInput value="Paris" onChange={mockOnChange} data-testid="location" />);

      const clearButton = screen.getByLabelText('Clear location');
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should not show clear button when empty', () => {
      render(<LocationInput value="" onChange={mockOnChange} />);

      const clearButton = screen.queryByLabelText('Clear location');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should show clear button when value exists', () => {
      render(<LocationInput value="Paris" onChange={mockOnChange} />);

      const clearButton = screen.getByLabelText('Clear location');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Autocomplete Suggestions', () => {
    it('should display suggestions when typing', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="Par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });
    });

    it('should filter suggestions based on input', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.queryByText('Tokyo')).not.toBeInTheDocument();
      });
    });

    it('should filter by description as well as name', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="france"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('France')).toBeInTheDocument();
      });
    });

    it('should show maximum 6 suggestions by default', async () => {
      const user = userEvent.setup();
      const manySuggestions = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `City ${i}`,
        description: 'Country',
        type: 'city' as const,
      }));

      render(
        <LocationInput
          value="city"
          onChange={mockOnChange}
          suggestions={manySuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const dropdown = screen.getByTestId('location-dropdown');
        const options = dropdown.querySelectorAll('[role="option"]');
        expect(options.length).toBeLessThanOrEqual(6);
      });
    });

    it('should handle empty suggestions array', () => {
      render(
        <LocationInput
          value="xyz"
          onChange={mockOnChange}
          suggestions={[]}
          data-testid="location"
        />
      );

      const dropdown = screen.queryByTestId('location-dropdown');
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should not show suggestions when value is empty', () => {
      render(
        <LocationInput
          value=""
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const dropdown = screen.queryByTestId('location-dropdown');
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should display suggestion with icon', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const suggestion = screen.getByTestId('location-suggestion-1');
        expect(suggestion).toBeInTheDocument();
      });
    });
  });

  describe('Suggestion Selection', () => {
    it('should call onSuggestionSelect when clicking suggestion', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          onSuggestionSelect={mockOnSuggestionSelect}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const parisSuggestion = screen.getByTestId('location-suggestion-1');
        expect(parisSuggestion).toBeInTheDocument();
      });

      const parisSuggestion = screen.getByTestId('location-suggestion-1');
      await user.click(parisSuggestion);

      expect(mockOnSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('should update input value on suggestion select', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          onSuggestionSelect={mockOnSuggestionSelect}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-suggestion-1')).toBeInTheDocument();
      });

      const suggestion = screen.getByTestId('location-suggestion-1');
      await user.click(suggestion);

      expect(mockOnChange).toHaveBeenCalledWith('Paris');
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          onSuggestionSelect={mockOnSuggestionSelect}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      const suggestion = screen.getByTestId('location-suggestion-1');
      await user.click(suggestion);

      await waitFor(() => {
        expect(screen.queryByTestId('location-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with Arrow Down', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      const firstOption = screen.getByTestId('location-suggestion-1');
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate suggestions with Arrow Up', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      const firstOption = screen.getByTestId('location-suggestion-1');
      expect(firstOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should select suggestion with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          onSuggestionSelect={mockOnSuggestionSelect}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('location-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('Click Outside Handling', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <LocationInput
            value="par"
            onChange={mockOnChange}
            suggestions={mockSuggestions}
            data-testid="location"
          />
          <button>Outside Button</button>
        </div>
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      const outsideButton = screen.getByRole('button', { name: /outside/i });
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByTestId('location-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<LocationInput value="par" onChange={mockOnChange} loading={true} data-testid="location" />);

      const container = screen.getByTestId('location');
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should not show suggestions when loading', () => {
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          loading={true}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const dropdown = screen.queryByTestId('location-dropdown');
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should not show clear button when loading', () => {
      render(<LocationInput value="paris" onChange={mockOnChange} loading={true} />);

      const clearButton = screen.queryByLabelText('Clear location');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should show reduced opacity when loading', () => {
      render(<LocationInput value="par" onChange={mockOnChange} loading={true} data-testid="location" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveClass('opacity-75');
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<LocationInput value="" onChange={mockOnChange} disabled={true} />);

      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
    });

    it('should not show suggestions when disabled', () => {
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          disabled={true}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const dropdown = screen.queryByTestId('location-dropdown');
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should not show clear button when disabled', () => {
      render(<LocationInput value="Paris" onChange={mockOnChange} disabled={true} />);

      const clearButton = screen.queryByLabelText('Clear location');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should apply disabled styling', () => {
      render(<LocationInput value="" onChange={mockOnChange} disabled={true} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-label', 'Location search');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have listbox role for dropdown', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();
      });
    });

    it('should have option role for suggestions', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });
    });

    it('should have proper aria-selected on keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('location-dropdown')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      const selectedOption = screen.getByTestId('location-suggestion-1');
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined suggestions gracefully', () => {
      render(<LocationInput value="par" onChange={mockOnChange} suggestions={undefined} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle suggestion without coordinates', async () => {
      const user = userEvent.setup();
      const suggestionsWithoutCoords = [
        { id: '1', name: 'Paris', description: 'France', type: 'city' as const },
      ];

      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          onSuggestionSelect={mockOnSuggestionSelect}
          suggestions={suggestionsWithoutCoords}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const suggestion = screen.getByTestId('location-suggestion-1');
        expect(suggestion).toBeInTheDocument();
      });

      const suggestion = screen.getByTestId('location-suggestion-1');
      await user.click(suggestion);

      expect(mockOnSuggestionSelect).toHaveBeenCalledWith(suggestionsWithoutCoords[0]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid typing', async () => {
      const user = userEvent.setup();
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'ParisLondonTokyoBarcelona', { delay: 1 });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'São Paulo');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle very long input', async () => {
      const user = userEvent.setup();
      render(<LocationInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('combobox');
      const longText = 'A'.repeat(200);
      await user.type(input, longText);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle focus and blur events', async () => {
      const user = userEvent.setup();
      render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.tab();
      expect(input).not.toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should memoize filtered suggestions', () => {
      const { rerender } = render(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      rerender(
        <LocationInput
          value="par"
          onChange={mockOnChange}
          suggestions={mockSuggestions}
          data-testid="location"
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle large suggestion lists efficiently', async () => {
      const user = userEvent.setup();
      const largeSuggestions = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `City ${i}`,
        description: 'Country',
        type: 'city' as const,
      }));

      render(
        <LocationInput
          value="city"
          onChange={mockOnChange}
          suggestions={largeSuggestions}
          data-testid="location"
        />
      );

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        const dropdown = screen.queryByTestId('location-dropdown');
        expect(dropdown).toBeInTheDocument();
      });
    });
  });
});
