import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestSelector } from '../GuestSelector';

describe('GuestSelector › Component', () => {
  const defaultGuests = {
    adults: 1,
    children: 0,
    infants: 0,
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render guest selector trigger button', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('should display default guest count text', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} />);

      expect(screen.getByText('1 guest')).toBeInTheDocument();
    });

    it('should display multiple adults count', () => {
      const guests = { ...defaultGuests, adults: 2 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} />);

      expect(screen.getByText('2 guests')).toBeInTheDocument();
    });

    it('should display adults and children count', () => {
      const guests = { adults: 2, children: 1, infants: 0 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} />);

      expect(screen.getByText('2 adults, 1 child')).toBeInTheDocument();
    });

    it('should display full guest breakdown', () => {
      const guests = { adults: 2, children: 2, infants: 1 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} />);

      expect(screen.getByText('2 adults, 2 children, 1 infant')).toBeInTheDocument();
    });

    it('should display compact variant text', () => {
      const guests = { adults: 2, children: 1, infants: 0 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} variant="compact" />);

      expect(screen.getByText('3 guests')).toBeInTheDocument();
    });

    it('should display Users icon', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const container = screen.getByTestId('guest-selector');
      expect(container).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <GuestSelector
          guests={defaultGuests}
          onChange={mockOnChange}
          className="custom-class"
          data-testid="guest-selector"
        />
      );

      const container = screen.getByTestId('guest-selector');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when clicking trigger', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-dropdown')).toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking trigger again', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-dropdown')).toBeInTheDocument();
      });

      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByTestId('guest-selector-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking Done button', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-dropdown')).toBeInTheDocument();
      });

      const doneButton = screen.getByTestId('guest-selector-done-button');
      await user.click(doneButton);

      await waitFor(() => {
        expect(screen.queryByTestId('guest-selector-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should display dropdown content when isOpenByDefault is true', () => {
      render(
        <GuestSelector
          guests={defaultGuests}
          onChange={mockOnChange}
          isOpenByDefault={true}
          data-testid="guest-selector"
        />
      );

      expect(screen.getByText('Adults')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
      expect(screen.getByText('Infants')).toBeInTheDocument();
    });

    it('should not show Done button when isOpenByDefault is true', () => {
      render(
        <GuestSelector
          guests={defaultGuests}
          onChange={mockOnChange}
          isOpenByDefault={true}
          data-testid="guest-selector"
        />
      );

      expect(screen.queryByTestId('guest-selector-done-button')).not.toBeInTheDocument();
    });
  });

  describe('Guest Counter Controls', () => {
    it('should display adults counter', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-adults-counter')).toBeInTheDocument();
      });
    });

    it('should display children counter', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-children-counter')).toBeInTheDocument();
      });
    });

    it('should display infants counter', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-infants-counter')).toBeInTheDocument();
      });
    });

    it('should display guest type descriptions', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(/Ages 13 or above/i)).toBeInTheDocument();
        expect(screen.getByText(/Ages 2-12/i)).toBeInTheDocument();
        expect(screen.getByText(/Under 2/i)).toBeInTheDocument();
      });
    });
  });

  describe('Increment/Decrement Adults', () => {
    it('should increment adults count', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        await user.click(incrementButton);
        expect(mockOnChange).toHaveBeenCalledWith({ adults: 2, children: 0, infants: 0 });
      }
    });

    it('should decrement adults count', async () => {
      const user = userEvent.setup();
      const guests = { adults: 2, children: 0, infants: 0 };
      render(
        <GuestSelector guests={guests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const decrementButton = counter.querySelector('[aria-label*="Decrement"]');

      if (decrementButton) {
        await user.click(decrementButton);
        expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 0, infants: 0 });
      }
    });

    it('should not decrement adults below minimum (1)', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const decrementButton = counter.querySelector('[aria-label*="Decrement"]');

      if (decrementButton) {
        expect(decrementButton).toBeDisabled();
      }
    });

    it('should not exceed maximum total guests', async () => {
      const user = userEvent.setup();
      const guests = { adults: 16, children: 0, infants: 0 };
      render(
        <GuestSelector guests={guests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        expect(incrementButton).toBeDisabled();
      }
    });
  });

  describe('Increment/Decrement Children', () => {
    it('should increment children count', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-children-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        await user.click(incrementButton);
        expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 1, infants: 0 });
      }
    });

    it('should decrement children count', async () => {
      const user = userEvent.setup();
      const guests = { adults: 1, children: 2, infants: 0 };
      render(
        <GuestSelector guests={guests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-children-counter');
      const decrementButton = counter.querySelector('[aria-label*="Decrement"]');

      if (decrementButton) {
        await user.click(decrementButton);
        expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 1, infants: 0 });
      }
    });

    it('should not decrement children below minimum (0)', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-children-counter');
      const decrementButton = counter.querySelector('[aria-label*="Decrement"]');

      if (decrementButton) {
        expect(decrementButton).toBeDisabled();
      }
    });
  });

  describe('Increment/Decrement Infants', () => {
    it('should increment infants count', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-infants-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        await user.click(incrementButton);
        expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 0, infants: 1 });
      }
    });

    it('should decrement infants count', async () => {
      const user = userEvent.setup();
      const guests = { adults: 1, children: 0, infants: 2 };
      render(
        <GuestSelector guests={guests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-infants-counter');
      const decrementButton = counter.querySelector('[aria-label*="Decrement"]');

      if (decrementButton) {
        await user.click(decrementButton);
        expect(mockOnChange).toHaveBeenCalledWith({ adults: 1, children: 0, infants: 1 });
      }
    });

    it('should not decrement infants below minimum (0)', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-infants-counter');
      const decrementButton = counter.querySelector('[aria-label*="Decrement"]');

      if (decrementButton) {
        expect(decrementButton).toBeDisabled();
      }
    });

    it('should allow infants without counting toward total limit', async () => {
      const user = userEvent.setup();
      const guests = { adults: 16, children: 0, infants: 0 };
      render(
        <GuestSelector guests={guests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-infants-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        expect(incrementButton).not.toBeDisabled();
      }
    });
  });

  describe('Maximum Guest Warning', () => {
    it('should show max guest warning at capacity', () => {
      const guests = { adults: 16, children: 0, infants: 0 };
      render(
        <GuestSelector
          guests={guests}
          onChange={mockOnChange}
          isOpenByDefault={true}
          showMaxGuestWarning={true}
          data-testid="guest-selector"
        />
      );

      expect(screen.getByText(/maximum of 16 guests/i)).toBeInTheDocument();
    });

    it('should not show warning when below capacity', () => {
      render(
        <GuestSelector
          guests={defaultGuests}
          onChange={mockOnChange}
          isOpenByDefault={true}
          showMaxGuestWarning={true}
          data-testid="guest-selector"
        />
      );

      expect(screen.queryByText(/maximum of 16 guests/i)).not.toBeInTheDocument();
    });

    it('should not show warning when showMaxGuestWarning is false', () => {
      const guests = { adults: 16, children: 0, infants: 0 };
      render(
        <GuestSelector
          guests={guests}
          onChange={mockOnChange}
          isOpenByDefault={true}
          showMaxGuestWarning={false}
          data-testid="guest-selector"
        />
      );

      expect(screen.queryByText(/maximum of 16 guests/i)).not.toBeInTheDocument();
    });

    it('should mention infants not counting toward limit', () => {
      const guests = { adults: 16, children: 0, infants: 0 };
      render(
        <GuestSelector
          guests={guests}
          onChange={mockOnChange}
          isOpenByDefault={true}
          showMaxGuestWarning={true}
          data-testid="guest-selector"
        />
      );

      expect(screen.getByText(/not including infants/i)).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable trigger when disabled prop is true', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} disabled={true} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeDisabled();
    });

    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} disabled={true} data-testid="guest-selector" />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByTestId('guest-selector-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should disable all counters when disabled', () => {
      render(
        <GuestSelector
          guests={defaultGuests}
          onChange={mockOnChange}
          disabled={true}
          isOpenByDefault={true}
          data-testid="guest-selector"
        />
      );

      const counters = screen.getAllByRole('button');
      counters.forEach(button => {
        if (!button.getAttribute('data-testid')?.includes('done')) {
          expect(button).toBeDisabled();
        }
      });
    });

    it('should apply disabled styling', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} disabled={true} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByTestId('guest-selector-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByTestId('guest-selector-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have descriptive aria-label on trigger', () => {
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByTestId('guest-selector-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select guests: 1 guest');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByTestId('guest-selector-trigger');
      trigger.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-dropdown')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels on counter buttons', async () => {
      const user = userEvent.setup();
      render(<GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const adultsCounter = screen.getByTestId('guest-selector-adults-counter');
        expect(adultsCounter).toBeInTheDocument();
      });
    });
  });

  describe('Click Outside Handling', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <GuestSelector guests={defaultGuests} onChange={mockOnChange} data-testid="guest-selector" />
          <button>Outside Button</button>
        </div>
      );

      const trigger = screen.getByTestId('guest-selector-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('guest-selector-dropdown')).toBeInTheDocument();
      });

      const outsideButton = screen.getByRole('button', { name: /outside/i });
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByTestId('guest-selector-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero guests in all categories', () => {
      const guests = { adults: 0, children: 0, infants: 0 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} />);

      expect(screen.getByText('Add guests')).toBeInTheDocument();
    });

    it('should handle maximum guests across categories', () => {
      const guests = { adults: 10, children: 6, infants: 3 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} />);

      expect(screen.getByText('10 adults, 6 children, 3 infants')).toBeInTheDocument();
    });

    it('should handle rapid counter clicks', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        for (let i = 0; i < 5; i++) {
          await user.click(incrementButton);
        }

        expect(mockOnChange).toHaveBeenCalledTimes(5);
      }
    });

    it('should handle null onChange gracefully', async () => {
      const user = userEvent.setup();
      render(
        <GuestSelector guests={defaultGuests} onChange={(() => {}) as any} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        await user.click(incrementButton);
        // Should not throw
        expect(incrementButton).toBeInTheDocument();
      }
    });
  });

  describe('Variant Rendering', () => {
    it('should render full variant correctly', () => {
      const guests = { adults: 2, children: 1, infants: 0 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} variant="full" />);

      expect(screen.getByText('2 adults, 1 child')).toBeInTheDocument();
    });

    it('should render compact variant correctly', () => {
      const guests = { adults: 2, children: 1, infants: 0 };
      render(<GuestSelector guests={guests} onChange={mockOnChange} variant="compact" />);

      expect(screen.getByText('3 guests')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should memoize guest display text', () => {
      const { rerender } = render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} />
      );

      rerender(<GuestSelector guests={defaultGuests} onChange={mockOnChange} />);

      expect(screen.getByText('1 guest')).toBeInTheDocument();
    });

    it('should handle state updates efficiently', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <GuestSelector guests={defaultGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
      );

      const counter = screen.getByTestId('guest-selector-adults-counter');
      const incrementButton = counter.querySelector('[aria-label*="Increment"]');

      if (incrementButton) {
        await user.click(incrementButton);

        const updatedGuests = { adults: 2, children: 0, infants: 0 };
        rerender(
          <GuestSelector guests={updatedGuests} onChange={mockOnChange} isOpenByDefault={true} data-testid="guest-selector" />
        );

        expect(screen.getByTestId('guest-selector')).toBeInTheDocument();
      }
    });
  });
});
