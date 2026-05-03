/**
 * BookingInfoGrid Component
 *
 * Displays booking information in a grid layout based on booking type.
 * Extracted from DashboardBookings for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display check-in/check-out dates
 * - Show guest count and total price
 * - Adapt content based on booking status (upcoming/past/cancelled)
 */

'use client';

import React from 'react';
import { formatDate, DATE_FORMATS } from '@/lib/utils';
import { formatRefundAmount } from '../utils';
import type { BookingDisplay, BookingTabType } from '../types';

export interface BookingInfoGridProps {
  booking: BookingDisplay;
  type: BookingTabType;
}

interface InfoItem {
  itemKey: string;
  label: string;
  value: string;
}

const STYLES = {
  GRID: 'grid grid-cols-2 gap-4 mb-4 text-sm',
  LABEL: 'text-gray-600',
  VALUE: 'font-medium'
} as const;

const LABELS = {
  CHECK_IN: 'Check-in',
  CHECK_OUT: 'Check-out',
  GUESTS: 'Guests',
  TOTAL: 'Total',
  STAYED: 'Stayed',
  TOTAL_PAID: 'Total paid',
  WAS_SCHEDULED: 'Was scheduled',
  REFUNDED: 'Refunded'
} as const;

/**
 * Single info item component - reusable grid cell
 */
const InfoItem: React.FC<InfoItem> = ({ label, value, itemKey }) => (
  <div data-testid={`booking-info-${itemKey}`}>
    <span className={STYLES.LABEL}>{label}:</span>
    <div className={STYLES.VALUE}>{value}</div>
  </div>
);

/**
 * Formats date range as a single string
 */
const formatDateRange = (checkIn: string, checkOut: string): string => {
  return `${formatDate(checkIn, DATE_FORMATS.SHORT)} - ${formatDate(checkOut, DATE_FORMATS.SHORT)}`;
};

/**
 * Gets info items configuration based on booking type
 */
const getInfoItems = (booking: BookingDisplay, type: BookingTabType): InfoItem[] => {
  switch (type) {
    case 'past':
      return [
        { itemKey: 'stayed', label: LABELS.STAYED, value: formatDateRange(booking.checkIn, booking.checkOut) },
        { itemKey: 'total-paid', label: LABELS.TOTAL_PAID, value: `$${booking.totalPrice}` }
      ];

    case 'cancelled':
      return [
        { itemKey: 'scheduled', label: LABELS.WAS_SCHEDULED, value: formatDateRange(booking.checkIn, booking.checkOut) },
        { itemKey: 'refunded', label: LABELS.REFUNDED, value: formatRefundAmount(booking.totalPrice) }
      ];

    default: // upcoming
      return [
        { itemKey: 'check-in', label: LABELS.CHECK_IN, value: formatDate(booking.checkIn, DATE_FORMATS.SHORT) },
        { itemKey: 'check-out', label: LABELS.CHECK_OUT, value: formatDate(booking.checkOut, DATE_FORMATS.SHORT) },
        { itemKey: 'guests', label: LABELS.GUESTS, value: `${booking.guests} guests` },
        { itemKey: 'total', label: LABELS.TOTAL, value: `$${booking.totalPrice}` }
      ];
  }
};

/**
 * Booking Info Grid Component
 *
 * Shows booking details in a grid format tailored to booking status.
 */
export const BookingInfoGrid: React.FC<BookingInfoGridProps> = React.memo(({
  booking,
  type
}) => {
  const items = getInfoItems(booking, type);

  return (
    <div className={STYLES.GRID} data-testid="booking-info-grid">
      {items.map((item) => (
        <InfoItem
          key={item.itemKey}
          {...item}
        />
      ))}
    </div>
  );
});

BookingInfoGrid.displayName = 'BookingInfoGrid';
