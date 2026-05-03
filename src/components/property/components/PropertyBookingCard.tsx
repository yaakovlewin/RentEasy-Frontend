'use client';

/**
 * @fileoverview PropertyBookingCard Component (Refactored)
 *
 * Enterprise-grade booking card component with comprehensive booking form,
 * price calculations, validation, and error handling.
 *
 * Refactoring improvements:
 * - Extracted sub-components for better separation of concerns
 * - Created dedicated hooks for booking logic
 * - Added utility functions for accessibility and validation
 * - Improved type safety with stricter types
 * - Optimized memoization and callback dependencies
 * - Reduced component complexity and improved testability
 */

import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/RatingDisplay';
import { cn } from '@/lib/utils';
import { useBookingCalculations } from '../hooks/useBookingCalculations';
import { useBookingHandler } from '../hooks/useBookingHandler';
import { PropertyPriceBreakdown } from './PropertyPriceBreakdown';
import { PropertyBookingForm } from './PropertyBookingForm';
import { PropertyBookingButton } from './PropertyBookingButton';
import {
  generateBookingFormAriaDescription,
  calculateTotalGuests,
} from '../utils/accessibilityHelpers';
import {
  isBookingDisabled,
  shouldShowPriceBreakdown as shouldShowBreakdown,
} from '../utils/bookingHelpers';
import type { PropertyBookingCardProps, PricingHeaderProps } from '../types/BookingCardTypes';

/**
 * Constants
 */
const DEFAULT_STICKY_TOP = 'top-24';
const CARD_STYLES = 'shadow-xl border-0';
const CONTENT_PADDING = 'p-6';
const PRICING_HEADER_MARGIN = 'mb-6';
const DISCLAIMER_STYLES = 'text-center text-sm text-gray-600 mb-6';

/**
 * PricingHeader - Displays property price and rating
 */
const PricingHeader = memo(function PricingHeader({
  pricePerNight,
  rating,
  reviews,
}: PricingHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${PRICING_HEADER_MARGIN}`}>
      <div>
        <span className="text-2xl font-bold">${pricePerNight}</span>
        <span className="text-gray-600"> /night</span>
      </div>
      <RatingDisplay
        rating={rating}
        reviews={reviews}
        size="md"
        variant="default"
        showReviewCount={true}
      />
    </div>
  );
});

PricingHeader.displayName = 'PricingHeader';

/**
 * PropertyBookingCard - Refactored booking widget component
 *
 * Features:
 * - Modular sub-components for better maintainability
 * - Dedicated hooks for business logic separation
 * - Utility functions for accessibility and validation
 * - Improved type safety with strict typing
 * - Optimized performance with strategic memoization
 * - Enhanced testability through component isolation
 * - Reduced complexity and improved code organization
 *
 * Architecture:
 * - PropertyBookingForm: Date/guest selection with validation
 * - PropertyBookingButton: Booking action with loading states
 * - PropertyPriceBreakdown: Price calculation display
 * - useBookingHandler: Booking submission logic
 * - accessibilityHelpers: A11y utility functions
 * - bookingHelpers: Validation and state utilities
 */
export const PropertyBookingCard = memo(function PropertyBookingCard({
  property,
  checkIn,
  checkOut,
  guests,
  onDateSelect,
  onGuestsChange,
  onBooking,
  className,
  isLoading = false,
  error,
  onErrorDismiss,
  disabled = false,
  bookingButtonText,
  showPriceBreakdown = true,
  sticky = true,
}: PropertyBookingCardProps) {
  const { calculations, validation, createBookingData } = useBookingCalculations(
    property,
    checkIn,
    checkOut,
    guests
  );

  const { handleBooking } = useBookingHandler({
    property,
    checkIn,
    checkOut,
    guests,
    validation,
    isLoading,
    disabled,
    createBookingData,
    onBooking,
  });

  const isDisabled = useMemo(
    () => isBookingDisabled(disabled, isLoading, checkIn, checkOut, validation),
    [disabled, isLoading, checkIn, checkOut, validation]
  );

  const shouldShowPriceBreakdown = useMemo(
    () => shouldShowBreakdown(showPriceBreakdown, checkIn, checkOut, calculations.isValid),
    [showPriceBreakdown, checkIn, checkOut, calculations.isValid]
  );

  const totalGuestCount = useMemo(() => calculateTotalGuests(guests), [guests]);

  const ariaDescription = useMemo(
    () => generateBookingFormAriaDescription(property.title, calculations, totalGuestCount),
    [property.title, calculations, totalGuestCount]
  );

  return (
    <div className={className}>
      <Card className={cn(CARD_STYLES, sticky && `sticky ${DEFAULT_STICKY_TOP}`)}>
        <CardContent className={CONTENT_PADDING}>
          <PricingHeader
            pricePerNight={property.pricePerNight}
            rating={property.rating ?? 0}
            reviews={property.reviews ?? 0}
          />

          <PropertyBookingForm
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            maxGuests={property.maxGuests}
            validation={validation}
            onDateSelect={onDateSelect}
            onGuestsChange={onGuestsChange}
            error={error}
            onErrorDismiss={onErrorDismiss}
            disabled={disabled}
          />

          <PropertyBookingButton
            onClick={handleBooking}
            disabled={isDisabled}
            isLoading={isLoading}
            checkIn={checkIn}
            checkOut={checkOut}
            calculations={calculations}
            customText={bookingButtonText}
          />

          <p className={DISCLAIMER_STYLES}>
            You won&apos;t be charged until confirmed by host
          </p>

          {shouldShowPriceBreakdown && (
            <PropertyPriceBreakdown
              calculations={calculations}
              isVisible={true}
              showDetailed={true}
            />
          )}

          <div className="sr-only" aria-live="polite" aria-atomic="true">
            <p>{ariaDescription}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PropertyBookingCard.displayName = 'PropertyBookingCard';

export default PropertyBookingCard;