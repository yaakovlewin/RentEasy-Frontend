/**
 * BookingsEmptyState Component
 *
 * Displays appropriate empty state message for each booking tab type.
 * Extracted from DashboardBookings for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display empty state icon and message
 * - Show tab-specific messaging
 * - Provide call-to-action for upcoming bookings
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookingTabType } from '../types';

export interface BookingsEmptyStateProps {
  type: BookingTabType;
}

interface EmptyStateContent {
  title: string;
  description: string;
  showAction: boolean;
}

const EMPTY_STATE_CONFIG: Record<BookingTabType, EmptyStateContent> = {
  upcoming: {
    title: 'No upcoming bookings',
    description: 'When you book a stay, it will appear here.',
    showAction: true,
  },
  past: {
    title: 'No past bookings',
    description: 'Your completed stays will appear here.',
    showAction: false,
  },
  cancelled: {
    title: 'No cancelled bookings',
    description: 'Any cancelled bookings will appear here.',
    showAction: false,
  },
};

const DEFAULT_EMPTY_STATE: EmptyStateContent = {
  title: 'No bookings found',
  description: 'Start exploring and book your next stay.',
  showAction: true,
};

/**
 * Bookings Empty State Component
 *
 * Shows appropriate empty state based on the active tab.
 */
export const BookingsEmptyState: React.FC<BookingsEmptyStateProps> = React.memo(({
  type
}) => {
  const content = EMPTY_STATE_CONFIG[type] || DEFAULT_EMPTY_STATE;

  return (
    <div className='text-center py-12'>
      <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />
      <h3 className='text-xl font-semibold mb-2'>{content.title}</h3>
      <p className='text-gray-600 mb-6'>{content.description}</p>
      {content.showAction && (
        <Link href='/search'>
          <Button>Browse Properties</Button>
        </Link>
      )}
    </div>
  );
});

BookingsEmptyState.displayName = 'BookingsEmptyState';
