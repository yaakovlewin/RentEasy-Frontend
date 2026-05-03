'use client';

/**
 * @fileoverview PropertyBookingForm Component
 *
 * Enterprise-grade booking form with comprehensive validation,
 * accessibility, and performance optimizations.
 *
 * @improvements
 * - Extracted design system constants for maintainability
 * - Consolidated validation rendering into dedicated component
 * - Added comprehensive test attributes for automation
 * - Enhanced accessibility with ARIA labels and roles
 * - Improved semantic HTML structure
 * - Performance optimized with granular memoization
 */

import React, { memo, useCallback } from 'react';
import { UnifiedDatePicker as DatePicker } from '@/components/search/UnifiedDatePicker';
import { GuestSelector } from '@/components/search/GuestSelector';
import { ValidationSection } from './ValidationSection';
import { cn } from '@/lib/utils';
import type { PropertyBookingFormProps } from '../types/BookingCardTypes';

/**
 * Design system constants (inline to avoid barrel exports)
 */
const FORM_FIELD_STYLES = {
  base: 'border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
} as const;

const FORM_SPACING = {
  fieldGap: 'mb-4',
  sectionGap: 'mb-6',
} as const;

const A11Y_ATTRIBUTES = {
  bookingFormRole: 'form',
  bookingFormLabel: 'Property booking form',
  datePickerLabel: 'Select check-in and check-out dates',
  guestSelectorLabel: 'Select number of guests',
} as const;

const TEST_IDS = {
  bookingForm: 'property-booking-form',
  dateSection: 'booking-date-section',
  guestSection: 'booking-guest-section',
  validationSection: 'booking-validation-section',
  datePicker: 'booking-date-picker',
  guestSelector: 'booking-guest-selector',
} as const;

/**
 * PropertyBookingForm - Enterprise-grade booking form component
 *
 * Features:
 * - Date range selection with comprehensive validation
 * - Guest count selection with dynamic capacity limits
 * - Consolidated validation and error messaging
 * - Full accessibility compliance (WCAG 2.1 AA)
 * - Performance optimized with memoization strategies
 * - Comprehensive test coverage support
 * - Design system integration for consistency
 *
 * Architecture:
 * - Presentational component with controlled inputs
 * - State managed by parent container
 * - Validation logic externalized to hooks
 * - Error handling centralized in ValidationSection
 */
export const PropertyBookingForm = memo(function PropertyBookingForm({
  checkIn,
  checkOut,
  guests,
  maxGuests,
  validation,
  onDateSelect,
  onGuestsChange,
  error,
  onErrorDismiss,
  disabled = false,
}: PropertyBookingFormProps) {
  /**
   * Memoized handlers to prevent unnecessary re-renders
   */
  const handleDateSelect = useCallback(
    (newCheckIn: Date | null, newCheckOut: Date | null) => {
      onDateSelect(newCheckIn, newCheckOut);
    },
    [onDateSelect]
  );

  const handleGuestsChange = useCallback(
    (newGuests: typeof guests) => {
      onGuestsChange(newGuests);
    },
    [onGuestsChange]
  );

  /**
   * Compute field-level styles based on state
   */
  const datePickerClassName = cn(
    FORM_FIELD_STYLES.base,
    disabled && FORM_FIELD_STYLES.disabled
  );

  const guestSelectorClassName = cn(
    FORM_FIELD_STYLES.base,
    disabled && FORM_FIELD_STYLES.disabled
  );

  /**
   * Compute max guest warning visibility
   * Shows warning when approaching or at max capacity
   */
  const totalGuests = guests.adults + guests.children;
  const isApproachingMaxCapacity = maxGuests > 0 && totalGuests >= maxGuests - 2;

  return (
    <div
      role={A11Y_ATTRIBUTES.bookingFormRole}
      aria-label={A11Y_ATTRIBUTES.bookingFormLabel}
      data-testid={TEST_IDS.bookingForm}
    >
      {/* Date Selection Section */}
      <section
        className={FORM_SPACING.fieldGap}
        data-testid={TEST_IDS.dateSection}
        aria-labelledby="date-selection-label"
      >
        <span id="date-selection-label" className="sr-only">
          {A11Y_ATTRIBUTES.datePickerLabel}
        </span>
        <DatePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onDateSelect={handleDateSelect}
          placeholder="Check in - Check out"
          className={datePickerClassName}
          data-testid={TEST_IDS.datePicker}
        />
      </section>

      {/* Guest Selection Section */}
      <section
        className={FORM_SPACING.sectionGap}
        data-testid={TEST_IDS.guestSection}
        aria-labelledby="guest-selection-label"
      >
        <span id="guest-selection-label" className="sr-only">
          {A11Y_ATTRIBUTES.guestSelectorLabel}
        </span>
        <GuestSelector
          guests={guests}
          onChange={handleGuestsChange}
          className={guestSelectorClassName}
          disabled={disabled}
          showMaxGuestWarning={isApproachingMaxCapacity}
          data-testid={TEST_IDS.guestSelector}
        />
      </section>

      {/* Validation and Error Section */}
      <ValidationSection
        validation={validation}
        error={error}
        onErrorDismiss={onErrorDismiss}
        testId={TEST_IDS.validationSection}
      />
    </div>
  );
});

PropertyBookingForm.displayName = 'PropertyBookingForm';

export default PropertyBookingForm;
