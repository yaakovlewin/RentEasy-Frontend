/**
 * @fileoverview Accessibility Helpers for Property Components
 *
 * Utility functions for generating accessible labels and descriptions
 * for property booking components.
 */

import type { BookingCalculations, PropertyDetails, GuestSelection } from '../types';

const CURRENCY_DECIMAL_PLACES = 0;

/**
 * Generates comprehensive screen reader description for booking form
 */
export function generateBookingFormAriaDescription(
  propertyTitle: string,
  calculations: BookingCalculations,
  totalGuests: number
): string {
  const nightsText = `${calculations.nights} night${calculations.nights !== 1 ? 's' : ''}`;
  const guestsText = `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`;

  const costText = calculations.isValid
    ? `Total cost: $${calculations.total.toFixed(CURRENCY_DECIMAL_PLACES)}`
    : 'Complete the form to see total cost.';

  return `Booking form for ${propertyTitle}. Current selection: ${nightsText}, ${guestsText}. ${costText}`;
}

/**
 * Generates aria-label for booking button based on state
 */
export function generateBookingButtonAriaLabel(
  buttonText: string,
  isCalculationValid: boolean,
  totalAmount: number
): string {
  const totalInfo = isCalculationValid
    ? `Total: $${totalAmount.toFixed(CURRENCY_DECIMAL_PLACES)}`
    : 'Complete form to see total';

  return `${buttonText} - ${totalInfo}`;
}

/**
 * Generates aria-label for date picker
 */
export function generateDatePickerAriaLabel(
  checkIn: Date | null,
  checkOut: Date | null
): string {
  if (!checkIn || !checkOut) {
    return 'Select check-in and check-out dates';
  }

  const checkInStr = checkIn.toLocaleDateString();
  const checkOutStr = checkOut.toLocaleDateString();

  return `Selected dates: Check-in ${checkInStr}, Check-out ${checkOutStr}`;
}

/**
 * Generates aria-label for guest selector
 */
export function generateGuestSelectorAriaLabel(
  guests: GuestSelection,
  maxGuests: number
): string {
  const totalGuests = guests.adults + guests.children;
  const adultsText = `${guests.adults} adult${guests.adults !== 1 ? 's' : ''}`;
  const childrenText = guests.children > 0
    ? `, ${guests.children} child${guests.children !== 1 ? 'ren' : ''}`
    : '';

  return `Select number of guests. Currently: ${adultsText}${childrenText}. Maximum ${maxGuests} guests.`;
}

/**
 * Generates aria-live announcement for price updates
 */
export function generatePriceUpdateAnnouncement(
  calculations: BookingCalculations
): string {
  if (!calculations.isValid) {
    return 'Price calculation unavailable';
  }

  return `Total price updated to $${calculations.total.toFixed(CURRENCY_DECIMAL_PLACES)} for ${calculations.nights} nights`;
}

/**
 * Generates accessible description for property card
 */
export function generatePropertyCardDescription(
  property: PropertyDetails
): string {
  const ratingText = property.rating
    ? `${property.rating} star rating`
    : 'No rating';

  const reviewsText = property.reviews
    ? `${property.reviews} review${property.reviews !== 1 ? 's' : ''}`
    : 'No reviews';

  const priceText = `$${property.pricePerNight} per night`;
  const capacityText = `Accommodates ${property.maxGuests} guest${property.maxGuests !== 1 ? 's' : ''}`;

  return `${property.title}. ${priceText}. ${capacityText}. ${ratingText}, ${reviewsText}.`;
}

/**
 * Calculates total guest count
 * Re-exported from bookingHelpers for convenience
 */
export { calculateTotalGuests } from './bookingHelpers';

/**
 * Formats currency for accessibility
 */
export function formatCurrencyForA11y(amount: number): string {
  return `${amount.toFixed(CURRENCY_DECIMAL_PLACES)} dollars`;
}

/**
 * Generates validation error announcement
 */
export function generateValidationErrorAnnouncement(errors: string[]): string {
  if (errors.length === 0) return '';

  const errorCount = errors.length;
  const errorText = errorCount === 1 ? 'error' : 'errors';

  return `${errorCount} validation ${errorText}: ${errors.join('. ')}`;
}
