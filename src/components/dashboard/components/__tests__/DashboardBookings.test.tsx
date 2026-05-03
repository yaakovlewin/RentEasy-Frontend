/**
 * DashboardBookings Component Tests
 *
 * Comprehensive test suite for the DashboardBookings component following
 * TDD methodology and best practices from React Testing Library.
 *
 * Test Coverage:
 * - Bookings list display
 * - Tab-based filtering (upcoming, past, cancelled)
 * - Booking cancellation with confirmation
 * - Empty states for each tab
 * - Error states and error handling
 * - Loading states and skeletons
 * - Booking actions (view, message, cancel, review)
 * - Property information display
 * - Status badges and indicators
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardBookings } from '../DashboardBookings';
import type { BookingDisplay } from '../../types';

// =============================================================================
// TEST DATA & MOCKS
// =============================================================================

const mockUpcomingBooking: BookingDisplay = {
  id: 'booking-1',
  propertyId: 'property-1',
  guestId: 'guest-1',
  propertyTitle: 'Luxury Beach Villa',
  propertyImage: '/images/villa.jpg',
  propertyLocation: 'Malibu, CA',
  hostName: 'John Doe',
  checkIn: '2025-11-01',
  checkOut: '2025-11-05',
  checkInDate: new Date('2025-11-01'),
  checkOutDate: new Date('2025-11-05'),
  guests: 4,
  numberOfGuests: 4,
  status: 'confirmed',
  totalPrice: 1200,
  bookingDate: '2025-10-01',
};

const mockPastBooking: BookingDisplay = {
  id: 'booking-2',
  propertyId: 'property-2',
  guestId: 'guest-1',
  propertyTitle: 'Mountain Cabin',
  propertyImage: '/images/cabin.jpg',
  propertyLocation: 'Aspen, CO',
  hostName: 'Jane Smith',
  checkIn: '2025-09-01',
  checkOut: '2025-09-05',
  checkInDate: new Date('2025-09-01'),
  checkOutDate: new Date('2025-09-05'),
  guests: 2,
  numberOfGuests: 2,
  status: 'completed',
  totalPrice: 800,
  bookingDate: '2025-08-01',
};

const mockCancelledBooking: BookingDisplay = {
  id: 'booking-3',
  propertyId: 'property-3',
  guestId: 'guest-1',
  propertyTitle: 'City Apartment',
  propertyImage: '/images/apartment.jpg',
  propertyLocation: 'New York, NY',
  hostName: 'Bob Johnson',
  checkIn: '2025-12-01',
  checkOut: '2025-12-05',
  checkInDate: new Date('2025-12-01'),
  checkOutDate: new Date('2025-12-05'),
  guests: 2,
  numberOfGuests: 2,
  status: 'cancelled',
  totalPrice: 1000,
  bookingDate: '2025-10-15',
};

const mockBookings: BookingDisplay[] = [
  mockUpcomingBooking,
  mockPastBooking,
  mockCancelledBooking,
];

const mockCancelBooking = jest.fn();

// =============================================================================
// TEST SUITE: DashboardBookings
// =============================================================================

describe('DashboardBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // TEST CASE 1: Component Rendering
  // ===========================================================================

  describe('Rendering', () => {
    it('should render bookings list with all tabs', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByRole('tab', { name: /upcoming/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /past/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /cancelled/i })).toBeInTheDocument();
    });

    it('should display booking count badges on tabs', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      const upcomingTab = screen.getByRole('tab', { name: /upcoming/i });
      expect(within(upcomingTab).getByText('1')).toBeInTheDocument();

      const pastTab = screen.getByRole('tab', { name: /past/i });
      expect(within(pastTab).getByText('1')).toBeInTheDocument();

      const cancelledTab = screen.getByRole('tab', { name: /cancelled/i });
      expect(within(cancelledTab).getByText('1')).toBeInTheDocument();
    });

    it('should render booking card with property information', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByText('Luxury Beach Villa')).toBeInTheDocument();
      expect(screen.getByText(/Malibu, CA/i)).toBeInTheDocument();
      expect(screen.getByText(/4 guests/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 2: Tab Filtering
  // ===========================================================================

  describe('Tab Filtering', () => {
    it('should show upcoming bookings by default', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByText('Luxury Beach Villa')).toBeInTheDocument();
      expect(screen.queryByText('Mountain Cabin')).not.toBeInTheDocument();
      expect(screen.queryByText('City Apartment')).not.toBeInTheDocument();
    });

    it('should filter to past bookings when past tab clicked', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /past/i }));

      expect(screen.getByText('Mountain Cabin')).toBeInTheDocument();
      expect(screen.queryByText('Luxury Beach Villa')).not.toBeInTheDocument();
      expect(screen.queryByText('City Apartment')).not.toBeInTheDocument();
    });

    it('should filter to cancelled bookings when cancelled tab clicked', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /cancelled/i }));

      expect(screen.getByText('City Apartment')).toBeInTheDocument();
      expect(screen.queryByText('Luxury Beach Villa')).not.toBeInTheDocument();
      expect(screen.queryByText('Mountain Cabin')).not.toBeInTheDocument();
    });

    it('should preserve tab selection when switching between tabs', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /past/i }));
      expect(screen.getByText('Mountain Cabin')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: /upcoming/i }));
      expect(screen.getByText('Luxury Beach Villa')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: /cancelled/i }));
      expect(screen.getByText('City Apartment')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 3: Booking Cancellation
  // ===========================================================================

  describe('Booking Cancellation', () => {
    it('should show cancel button for upcoming bookings', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel booking/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should not show cancel button for past bookings', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /past/i }));

      expect(screen.queryByRole('button', { name: /cancel booking/i })).not.toBeInTheDocument();
    });

    it('should call onCancelBooking when cancel confirmed', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel booking/i }));

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockCancelBooking).toHaveBeenCalledWith('booking-1');
      });
    });

    it('should show loading state while cancelling', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId="booking-1"
          isActive={true}
        />
      );

      expect(screen.getByText(/cancelling/i)).toBeInTheDocument();
    });

    it('should disable cancel button while cancellation in progress', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId="booking-1"
          isActive={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancelling/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  // ===========================================================================
  // TEST CASE 4: Empty States
  // ===========================================================================

  describe('Empty States', () => {
    it('should show empty state when no upcoming bookings', () => {
      render(
        <DashboardBookings
          bookings={[mockPastBooking, mockCancelledBooking]}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByText(/no upcoming bookings/i)).toBeInTheDocument();
    });

    it('should show empty state when no past bookings', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={[mockUpcomingBooking, mockCancelledBooking]}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /past/i }));

      expect(screen.getByText(/no past bookings/i)).toBeInTheDocument();
    });

    it('should show empty state when no cancelled bookings', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={[mockUpcomingBooking, mockPastBooking]}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /cancelled/i }));

      expect(screen.getByText(/no cancelled bookings/i)).toBeInTheDocument();
    });

    it('should show empty state with call-to-action when no bookings at all', () => {
      render(
        <DashboardBookings
          bookings={[]}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByText(/explore properties/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 5: Loading States
  // ===========================================================================

  describe('Loading States', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
          isLoading={true}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show bookings content while loading', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
          isLoading={true}
        />
      );

      expect(screen.queryByText('Luxury Beach Villa')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 6: Error States
  // ===========================================================================

  describe('Error Handling', () => {
    it('should display error message when error prop provided', () => {
      const error = new Error('Failed to load bookings');

      render(
        <DashboardBookings
          bookings={[]}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
          error={error}
        />
      );

      expect(screen.getByText(/failed to load bookings/i)).toBeInTheDocument();
    });

    it('should show retry button when error occurs', () => {
      const error = new Error('Failed to load bookings');

      render(
        <DashboardBookings
          bookings={[]}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
          error={error}
        />
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 7: Booking Actions
  // ===========================================================================

  describe('Booking Actions', () => {
    it('should show view details button for all bookings', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    });

    it('should show message host button for upcoming bookings', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      expect(screen.getByRole('button', { name: /message/i })).toBeInTheDocument();
    });

    it('should show review button for past bookings', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /past/i }));

      expect(screen.getByRole('button', { name: /leave review/i })).toBeInTheDocument();
    });

    it('should show book again button for past bookings', async () => {
      const user = userEvent.setup();

      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      await user.click(screen.getByRole('tab', { name: /past/i }));

      expect(screen.getByRole('button', { name: /book again/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 8: Accessibility
  // ===========================================================================

  describe('Accessibility', () => {
    it('should have accessible tab navigation', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should have proper ARIA labels for actions', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel booking/i });
      expect(cancelButton).toHaveAccessibleName();
    });

    it('should have proper image alt text', () => {
      render(
        <DashboardBookings
          bookings={mockBookings}
          onCancelBooking={mockCancelBooking}
          cancellingBookingId={null}
          isActive={true}
        />
      );

      const propertyImage = screen.getByAltText(/Luxury Beach Villa/i);
      expect(propertyImage).toBeInTheDocument();
    });
  });
});
