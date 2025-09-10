'use client';

/**
 * @fileoverview PropertyBookingCard Component
 * 
 * Enterprise-grade booking card component extracted from monolithic PropertyDetailsPage.
 * Features comprehensive booking form, price calculations, validation, and error handling.
 */

import React, { memo, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { UnifiedDatePicker as DatePicker } from '@/components/search/UnifiedDatePicker';
import { GuestSelector } from '@/components/search/GuestSelector';
import { cn } from '@/lib/utils';
import { useBookingCalculations } from '../hooks';
import { PropertyPriceBreakdown } from './PropertyPriceBreakdown';
import { logger } from '../utils/Logger';
import type { 
  PropertyDetails, 
  GuestSelection, 
  BookingFormData,
  PropertyError 
} from '../types';

interface PropertyBookingCardProps {
  /** Property details for booking */
  property: PropertyDetails;
  /** Check-in date */
  checkIn: Date | null;
  /** Check-out date */
  checkOut: Date | null;
  /** Guest selection */
  guests: GuestSelection;
  /** Date selection handler */
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  /** Guest selection handler */
  onGuestsChange: (guests: GuestSelection) => void;
  /** Booking submission handler */
  onBooking: (bookingData: BookingFormData) => Promise<void>;
  /** Optional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Booking error */
  error?: PropertyError | null;
  /** Error dismissal handler */
  onErrorDismiss?: () => void;
  /** Disable booking form */
  disabled?: boolean;
  /** Custom booking button text */
  bookingButtonText?: string;
  /** Show price breakdown */
  showPriceBreakdown?: boolean;
  /** Card position styling */
  sticky?: boolean;
}

/**
 * PropertyBookingCard - Extracted booking widget component
 * 
 * Features:
 * - Comprehensive booking form with date and guest selection
 * - Real-time price calculations with validation
 * - Price breakdown display with detailed cost information
 * - Error handling with structured error display
 * - Loading states with proper UI feedback
 * - Accessibility support with proper form labeling
 * - Performance optimization with memoization
 * - Integration with enterprise hooks (useBookingCalculations)
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
  const {
    calculations,
    validation,
    createBookingData,
  } = useBookingCalculations(property, checkIn, checkOut, guests);

  /**
   * Handle booking submission
   */
  const handleBooking = useCallback(async () => {
    if (!checkIn || !checkOut || !validation.isValid || isLoading || disabled) {
      return;
    }

    try {
      const bookingData = createBookingData(
        property,
        { checkIn, checkOut },
        guests
      );
      await onBooking(bookingData);
    } catch (error) {
      logger.property.booking('submission_failed', property.id, formData, {
        component: 'PropertyBookingCard'
      });
      // Error handling is managed by parent component
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

  /**
   * Get booking button text
   */
  const getBookingButtonText = useCallback(() => {
    if (isLoading) return 'Booking...';
    if (bookingButtonText) return bookingButtonText;
    if (!checkIn || !checkOut) return 'Select dates';
    if (!validation.isValid) return 'Invalid selection';
    return 'Reserve';
  }, [isLoading, bookingButtonText, checkIn, checkOut, validation.isValid]);

  /**
   * Check if booking button should be disabled
   */
  const isBookingDisabled = useCallback(() => {
    return (
      disabled ||
      isLoading ||
      !checkIn ||
      !checkOut ||
      !validation.isValid ||
      validation.errors.length > 0
    );
  }, [disabled, isLoading, checkIn, checkOut, validation]);

  return (
    <div className={className}>
      <Card className={cn(
        'shadow-xl border-0',
        sticky && 'sticky top-24'
      )}>
        <CardContent className="p-6">
          {/* Property Pricing Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-2xl font-bold">
                ${property.pricePerNight}
              </span>
              <span className="text-gray-600"> /night</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{property.rating}</span>
              <span className="text-gray-500">({property.reviews})</span>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-4">
            <DatePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onDateSelect={onDateSelect}
              placeholder="Check in - Check out"
              className="border border-gray-300 rounded-lg"
              disabled={disabled}
              aria-label="Select check-in and check-out dates"
            />
          </div>

          {/* Guest Selection */}
          <div className="mb-6">
            <GuestSelector
              guests={guests}
              onChange={onGuestsChange}
              className="border border-gray-300 rounded-lg"
              disabled={disabled}
              maxGuests={property.maxGuests}
              aria-label="Select number of guests"
            />
          </div>

          {/* Validation Errors */}
          {validation.errors.length > 0 && (
            <div className="mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <ul className="list-disc list-inside space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-700 text-sm">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Booking Error Display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay
                error={error}
                variant="inline"
                onDismiss={onErrorDismiss}
              />
            </div>
          )}

          {/* Booking Button */}
          <Button
            className="w-full mb-4"
            size="lg"
            onClick={handleBooking}
            disabled={isBookingDisabled()}
            aria-label={`${getBookingButtonText()} - ${
              calculations.isValid 
                ? `Total: $${calculations.total.toFixed(0)}`
                : 'Complete form to see total'
            }`}
          >
            {isLoading && (
              <LoadingSpinner size="sm" className="mr-2" />
            )}
            {getBookingButtonText()}
          </Button>

          {/* Booking Disclaimer */}
          <p className="text-center text-sm text-gray-600 mb-6">
            You won't be charged until confirmed by host
          </p>

          {/* Price Breakdown */}
          {showPriceBreakdown && checkIn && checkOut && calculations.isValid && (
            <PropertyPriceBreakdown
              calculations={calculations}
              isVisible={true}
              showDetailed={true}
            />
          )}

          {/* Accessibility Information */}
          <div className="sr-only">
            <p>
              Booking form for {property.title}. 
              Current selection: {calculations.nights} nights, 
              {guests.adults + guests.children} guests.
              {calculations.isValid 
                ? ` Total cost: $${calculations.total.toFixed(0)}`
                : ' Complete the form to see total cost.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PropertyBookingCard.displayName = 'PropertyBookingCard';

export default PropertyBookingCard;