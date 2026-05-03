/**
 * @fileoverview Property Utilities - Clean Exports
 *
 * Utility functions for property components including accessibility helpers,
 * booking validation, and business logic.
 */

// Accessibility utilities
export {
  generateBookingFormAriaDescription,
  generateBookingButtonAriaLabel,
  generateDatePickerAriaLabel,
  generateGuestSelectorAriaLabel,
  generatePriceUpdateAnnouncement,
  generatePropertyCardDescription,
  calculateTotalGuests,
  formatCurrencyForA11y,
  generateValidationErrorAnnouncement,
} from './accessibilityHelpers';

// Booking validation and state utilities
export {
  isBookingDisabled,
  shouldShowPriceBreakdown,
  calculateTotalGuests,
  validateGuestCapacity,
  validateDateSelection,
  combineValidationResults,
  formatDateForDisplay,
  calculateNights,
  areDatesValid,
} from './bookingHelpers';

// Logger utility (re-export)
export { logger } from './Logger';
