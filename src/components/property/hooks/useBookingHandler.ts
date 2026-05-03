/**
 * @fileoverview useBookingHandler Hook
 *
 * Optimized hook for managing booking submission with error handling,
 * logging, and state management.
 */

import { useCallback } from 'react';
import { logger } from '../utils/Logger';
import type {
  PropertyDetails,
  GuestSelection,
  BookingFormData,
  BookingValidation,
} from '../types';

interface BookingDateRange {
  checkIn: Date;
  checkOut: Date;
}

interface UseBookingHandlerOptions {
  /** Property details */
  property: PropertyDetails;
  /** Check-in date */
  checkIn: Date | null;
  /** Check-out date */
  checkOut: Date | null;
  /** Guest selection */
  guests: GuestSelection;
  /** Validation state */
  validation: BookingValidation;
  /** Loading state */
  isLoading: boolean;
  /** Disabled state */
  disabled: boolean;
  /** Booking data creator function */
  createBookingData: (
    property: PropertyDetails,
    dates: BookingDateRange,
    guests: GuestSelection
  ) => BookingFormData;
  /** Booking submission handler */
  onBooking: (bookingData: BookingFormData) => Promise<void>;
}

interface UseBookingHandlerReturn {
  /** Optimized booking handler */
  handleBooking: () => Promise<void>;
}

/**
 * useBookingHandler - Optimized booking submission management
 *
 * Features:
 * - Memoized booking handler with dependency tracking
 * - Pre-submission validation
 * - Error handling and logging
 * - State-based submission control
 * - Type-safe date handling
 *
 * @param options - Booking handler configuration
 * @returns Booking handler and submission state
 */
export function useBookingHandler({
  property,
  checkIn,
  checkOut,
  guests,
  validation,
  isLoading,
  disabled,
  createBookingData,
  onBooking,
}: UseBookingHandlerOptions): UseBookingHandlerReturn {
  const handleBooking = useCallback(async () => {
    if (!checkIn || !checkOut || !validation.isValid || isLoading || disabled) {
      return;
    }

    try {
      const bookingData = createBookingData(property, { checkIn, checkOut }, guests);

      logger.property.booking('submission_attempt', property.id, {
        checkIn,
        checkOut,
        guests,
      }, {
        component: 'useBookingHandler',
      });

      await onBooking(bookingData);

      logger.property.booking('submission_success', property.id, {
        checkIn,
        checkOut,
        guests,
      }, {
        component: 'useBookingHandler',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.property.booking('submission_failed', property.id, {
        checkIn,
        checkOut,
        guests,
        error: errorMessage,
      }, {
        component: 'useBookingHandler',
      });

      throw error;
    }
  }, [
    checkIn,
    checkOut,
    validation.isValid,
    isLoading,
    disabled,
    createBookingData,
    property,
    guests,
    onBooking,
  ]);

  return {
    handleBooking,
  };
}

export default useBookingHandler;
