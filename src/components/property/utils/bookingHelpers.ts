/**
 * @fileoverview Booking Helper Utilities
 *
 * Pure utility functions for booking validation, state derivation,
 * and business logic calculations.
 */

import type { BookingValidation, GuestSelection } from '../types';

/**
 * Determines if booking button should be disabled
 */
export function isBookingDisabled(
  disabled: boolean,
  isLoading: boolean,
  checkIn: Date | null,
  checkOut: Date | null,
  validation: BookingValidation
): boolean {
  return (
    disabled ||
    isLoading ||
    !checkIn ||
    !checkOut ||
    !validation.isValid ||
    validation.errors.length > 0
  );
}

/**
 * Determines if price breakdown should be shown
 */
export function shouldShowPriceBreakdown(
  enabled: boolean,
  checkIn: Date | null,
  checkOut: Date | null,
  isCalculationValid: boolean
): boolean {
  return enabled && checkIn !== null && checkOut !== null && isCalculationValid;
}

/**
 * Calculates total guest count from selection
 */
export function calculateTotalGuests(guests: GuestSelection): number {
  return guests.adults + guests.children;
}

/**
 * Validates guest selection against property capacity
 */
export function validateGuestCapacity(
  guests: GuestSelection,
  maxGuests: number
): { isValid: boolean; error?: string } {
  const totalGuests = calculateTotalGuests(guests);

  if (totalGuests === 0) {
    return { isValid: false, error: 'At least one guest is required' };
  }

  if (totalGuests > maxGuests) {
    return {
      isValid: false,
      error: `This property can accommodate a maximum of ${maxGuests} guests`,
    };
  }

  return { isValid: true };
}

/**
 * Validates date selection
 */
export function validateDateSelection(
  checkIn: Date | null,
  checkOut: Date | null
): { isValid: boolean; error?: string } {
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'Check-in and check-out dates are required' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (checkIn < now) {
    return { isValid: false, error: 'Check-in date cannot be in the past' };
  }

  if (checkOut <= checkIn) {
    return { isValid: false, error: 'Check-out date must be after check-in date' };
  }

  return { isValid: true };
}

/**
 * Combines validation results
 */
export function combineValidationResults(
  ...results: Array<{ isValid: boolean; error?: string }>
): { isValid: boolean; errors: string[] } {
  const errors = results
    .filter((result) => !result.isValid && result.error)
    .map((result) => result.error!);

  return {
    isValid: results.every((result) => result.isValid),
    errors,
  };
}

/**
 * Formats date for display
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculates number of nights between dates
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const checkInTime = checkIn.getTime();
  const checkOutTime = checkOut.getTime();
  return Math.round((checkOutTime - checkInTime) / msPerDay);
}

/**
 * Determines if dates are valid for booking
 */
export function areDatesValid(
  checkIn: Date | null,
  checkOut: Date | null
): boolean {
  return checkIn !== null && checkOut !== null && checkOut > checkIn;
}
