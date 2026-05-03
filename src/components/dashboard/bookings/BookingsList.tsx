/**
 * BookingsList Component
 *
 * Displays list of bookings or empty state.
 * Extracted from DashboardBookings for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Render list of booking cards
 * - Show empty state when no bookings
 * - Handle booking cancellation coordination
 */

'use client';

import React from 'react';
import type { BookingDisplay, BookingTabType } from '../types';
import { BookingCard } from './BookingCard';
import { BookingsEmptyState } from './BookingsEmptyState';

export interface BookingsListProps {
  bookings: BookingDisplay[];
  type: BookingTabType;
  onCancelBooking: (bookingId: string) => Promise<void>;
  cancellingBookingId: string | null;
}

/**
 * Bookings List Component
 *
 * Shows booking cards or appropriate empty state.
 */
export const BookingsList: React.FC<BookingsListProps> = React.memo(({
  bookings,
  type,
  onCancelBooking,
  cancellingBookingId
}) => {
  // Empty state handling
  if (!bookings || bookings.length === 0) {
    return <BookingsEmptyState type={type} />;
  }

  return (
    <>
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          type={type}
          onCancelBooking={onCancelBooking}
          isCancelling={cancellingBookingId === booking.id}
        />
      ))}
    </>
  );
});

BookingsList.displayName = 'BookingsList';
