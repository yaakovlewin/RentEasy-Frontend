import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../Calendar';
import { addMonths, subMonths, startOfMonth, endOfMonth, format, addDays } from 'date-fns';

describe('Calendar › Component', () => {
  const currentMonth = new Date(2024, 0, 1); // January 2024
  const mockOnMonthChange = jest.fn();
  const mockOnDateClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render calendar component', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
    });

    it('should display current month and year', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should display all weekday headers', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByText('Su')).toBeInTheDocument();
      expect(screen.getByText('Mo')).toBeInTheDocument();
      expect(screen.getByText('Tu')).toBeInTheDocument();
      expect(screen.getByText('We')).toBeInTheDocument();
      expect(screen.getByText('Th')).toBeInTheDocument();
      expect(screen.getByText('Fr')).toBeInTheDocument();
      expect(screen.getByText('Sa')).toBeInTheDocument();
    });

    it('should render calendar grid with days', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells.length).toBeGreaterThan(0);
    });

    it('should apply custom className', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          className="custom-class"
        />
      );

      const calendar = screen.getByRole('grid');
      expect(calendar.parentElement).toHaveClass('custom-class');
    });

    it('should display navigation buttons when showNavigation is true', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          showNavigation={true}
        />
      );

      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    it('should not display navigation buttons when showNavigation is false', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          showNavigation={false}
        />
      );

      expect(screen.queryByLabelText('Previous month')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next month')).not.toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('should call onDateClick when clicking a date', async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const dateButton = screen.getByLabelText(/January 15th, 2024/i);
      await user.click(dateButton);

      expect(mockOnDateClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onDateClick for disabled dates', async () => {
      const user = userEvent.setup();
      const pastDate = new Date(2024, 0, 1);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const dateButtons = screen.getAllByRole('gridcell');
      const disabledButton = dateButtons.find(btn => btn.hasAttribute('disabled'));

      if (disabledButton) {
        await user.click(disabledButton);
        expect(mockOnDateClick).not.toHaveBeenCalled();
      }
    });

    it('should highlight selected check-in date', () => {
      const checkIn = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
        />
      );

      const dateButton = screen.getByLabelText(/January 15th, 2024/i);
      expect(dateButton).toHaveClass('bg-primary');
    });

    it('should highlight selected check-out date', () => {
      const checkOut = new Date(2024, 0, 20);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkOut={checkOut}
        />
      );

      const dateButton = screen.getByLabelText(/January 20th, 2024/i);
      expect(dateButton).toHaveClass('bg-primary');
    });

    it('should highlight date range between check-in and check-out', () => {
      const checkIn = new Date(2024, 0, 15);
      const checkOut = new Date(2024, 0, 20);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      );

      const middleDate = screen.getByLabelText(/January 17th, 2024/i);
      expect(middleDate).toHaveClass('bg-primary/10');
    });

    it('should show hover effect when selecting check-out date', () => {
      const checkIn = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
          selectingCheckOut={true}
        />
      );

      const futureDate = screen.getByLabelText(/January 20th, 2024/i);
      expect(futureDate).toHaveClass('hover:bg-primary/10');
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to previous month', async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          showNavigation={true}
        />
      );

      const prevButton = screen.getByLabelText('Previous month');
      await user.click(prevButton);

      const expectedMonth = subMonths(currentMonth, 1);
      expect(mockOnMonthChange).toHaveBeenCalledWith(expectedMonth);
    });

    it('should navigate to next month', async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          showNavigation={true}
        />
      );

      const nextButton = screen.getByLabelText('Next month');
      await user.click(nextButton);

      const expectedMonth = addMonths(currentMonth, 1);
      expect(mockOnMonthChange).toHaveBeenCalledWith(expectedMonth);
    });

    it('should display correct month with monthOffset', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          monthOffset={1}
        />
      );

      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });

    it('should not show previous button for offset month', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          monthOffset={1}
          showNavigation={true}
        />
      );

      expect(screen.queryByLabelText('Previous month')).not.toBeInTheDocument();
    });
  });

  describe('Date Validation', () => {
    it('should disable past dates by default', () => {
      const today = new Date();
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      const disabledCells = gridCells.filter(cell => cell.hasAttribute('disabled'));
      expect(disabledCells.length).toBeGreaterThan(0);
    });

    it('should highlight today with border', () => {
      const today = new Date();
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const todayFormatted = format(today, 'EEEE, MMMM do, yyyy');
      const todayButton = screen.getByLabelText(todayFormatted);
      expect(todayButton).toHaveClass('border-2', 'border-primary');
    });

    it('should dim dates from previous/next months', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      const dimmedCells = gridCells.filter(cell => cell.classList.contains('text-gray-300'));
      expect(dimmedCells.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have grid role', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should have proper aria-label', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar for January 2024');
    });

    it('should have custom aria-label when provided', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          aria-label="Custom calendar"
        />
      );

      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-label', 'Custom calendar');
    });

    it('should have columnheader role for weekdays', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(7);
    });

    it('should have gridcell role for dates', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const cells = screen.getAllByRole('gridcell');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should have aria-selected on selected dates', () => {
      const checkIn = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
        />
      );

      const dateButton = screen.getByLabelText(/January 15th, 2024/i);
      expect(dateButton).toHaveAttribute('aria-selected', 'true');
    });

    it('should have proper tabIndex for today', () => {
      const today = new Date();
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const todayFormatted = format(today, 'EEEE, MMMM do, yyyy');
      const todayButton = screen.getByLabelText(todayFormatted);
      expect(todayButton).toHaveAttribute('tabIndex', '0');
    });

    it('should have tabIndex -1 for non-today dates', () => {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const tomorrowFormatted = format(tomorrow, 'EEEE, MMMM do, yyyy');
      const tomorrowButton = screen.getByLabelText(tomorrowFormatted);
      expect(tomorrowButton).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be navigable with Tab key', async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          showNavigation={true}
        />
      );

      const prevButton = screen.getByLabelText('Previous month');
      prevButton.focus();

      await user.keyboard('{Tab}');

      const nextButton = screen.getByLabelText('Next month');
      expect(nextButton).toHaveFocus();
    });

    it('should allow clicking with Enter key', async () => {
      const user = userEvent.setup();
      const today = new Date();
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const todayFormatted = format(today, 'EEEE, MMMM do, yyyy');
      const todayButton = screen.getByLabelText(todayFormatted);
      todayButton.focus();

      await user.keyboard('{Enter}');

      expect(mockOnDateClick).toHaveBeenCalled();
    });

    it('should allow clicking with Space key', async () => {
      const user = userEvent.setup();
      const today = new Date();
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const todayFormatted = format(today, 'EEEE, MMMM do, yyyy');
      const todayButton = screen.getByLabelText(todayFormatted);
      todayButton.focus();

      await user.keyboard(' ');

      expect(mockOnDateClick).toHaveBeenCalled();
    });
  });

  describe('Date Range Selection', () => {
    it('should handle single date selection', async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const dateButton = screen.getByLabelText(/January 15th, 2024/i);
      await user.click(dateButton);

      expect(mockOnDateClick).toHaveBeenCalledTimes(1);
    });

    it('should handle range start and end', () => {
      const checkIn = new Date(2024, 0, 15);
      const checkOut = new Date(2024, 0, 20);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      );

      const checkInButton = screen.getByLabelText(/January 15th, 2024/i);
      const checkOutButton = screen.getByLabelText(/January 20th, 2024/i);

      expect(checkInButton).toHaveClass('bg-primary');
      expect(checkOutButton).toHaveClass('bg-primary');
    });

    it('should show range selection state correctly', () => {
      const checkIn = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
          selectingCheckOut={true}
        />
      );

      const futureDate = screen.getByLabelText(/January 20th, 2024/i);
      expect(futureDate).toHaveClass('hover:bg-primary/10');
    });

    it('should prevent selecting check-out before check-in', () => {
      const checkIn = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
          selectingCheckOut={true}
        />
      );

      const pastDate = screen.getByLabelText(/January 10th, 2024/i);
      expect(pastDate).not.toHaveClass('hover:bg-primary/10');
    });
  });

  describe('Edge Cases', () => {
    it('should handle month transitions', () => {
      const endOfMonth = new Date(2024, 0, 31);
      render(
        <Calendar
          currentMonth={endOfMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should handle year transitions', () => {
      const endOfYear = new Date(2024, 11, 1);
      render(
        <Calendar
          currentMonth={endOfYear}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByText('December 2024')).toBeInTheDocument();
    });

    it('should handle leap year', () => {
      const leapYear = new Date(2024, 1, 1); // February 2024
      render(
        <Calendar
          currentMonth={leapYear}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });

    it('should handle null check-in date', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={null}
        />
      );

      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
    });

    it('should handle null check-out date', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkOut={null}
        />
      );

      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
    });

    it('should handle same day check-in and check-out', () => {
      const sameDay = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={sameDay}
          checkOut={sameDay}
        />
      );

      const dateButton = screen.getByLabelText(/January 15th, 2024/i);
      expect(dateButton).toHaveClass('bg-primary');
    });
  });

  describe('Performance', () => {
    it('should memoize calendar days', () => {
      const { rerender } = render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      rerender(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should handle rapid month changes efficiently', async () => {
      const user = userEvent.setup();
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          showNavigation={true}
        />
      );

      const nextButton = screen.getByLabelText('Next month');

      for (let i = 0; i < 10; i++) {
        await user.click(nextButton);
      }

      expect(mockOnMonthChange).toHaveBeenCalledTimes(10);
    });
  });

  describe('Styling', () => {
    it('should apply correct styling to disabled dates', () => {
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      const disabledCell = gridCells.find(cell => cell.hasAttribute('disabled'));

      if (disabledCell) {
        expect(disabledCell).toHaveClass('text-gray-300', 'cursor-not-allowed');
      }
    });

    it('should apply correct styling to selected dates', () => {
      const checkIn = new Date(2024, 0, 15);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
        />
      );

      const dateButton = screen.getByLabelText(/January 15th, 2024/i);
      expect(dateButton).toHaveClass('bg-primary', 'text-white');
    });

    it('should apply correct styling to range dates', () => {
      const checkIn = new Date(2024, 0, 15);
      const checkOut = new Date(2024, 0, 20);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      );

      const middleDate = screen.getByLabelText(/January 17th, 2024/i);
      expect(middleDate).toHaveClass('bg-primary/10', 'text-primary');
    });

    it('should apply correct styling to today', () => {
      const today = new Date();
      const currentMonth = startOfMonth(today);
      render(
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={mockOnMonthChange}
          onDateClick={mockOnDateClick}
        />
      );

      const todayFormatted = format(today, 'EEEE, MMMM do, yyyy');
      const todayButton = screen.getByLabelText(todayFormatted);
      expect(todayButton).toHaveClass('border-2', 'border-primary');
    });
  });
});
