/**
 * @fileoverview Strict Type Definitions for Booking Card Components
 *
 * Enhanced type safety for booking card components with branded types,
 * discriminated unions, and comprehensive validation.
 */

import type {
  PropertyDetails,
  GuestSelection,
  BookingFormData,
  PropertyError,
  BookingCalculations,
  BookingValidation,
} from './PropertyDetails';

/**
 * Branded type for validated booking state
 */
export type ValidatedBookingState = {
  readonly _brand: 'ValidatedBookingState';
  readonly checkIn: Date;
  readonly checkOut: Date;
  readonly guests: GuestSelection;
  readonly isValid: true;
};

/**
 * Branded type for invalid booking state
 */
export type InvalidBookingState = {
  readonly _brand: 'InvalidBookingState';
  readonly checkIn: Date | null;
  readonly checkOut: Date | null;
  readonly guests: GuestSelection;
  readonly isValid: false;
  readonly errors: readonly string[];
};

/**
 * Discriminated union for booking state
 */
export type BookingState = ValidatedBookingState | InvalidBookingState;

/**
 * Strict props for PropertyBookingCard
 */
export interface PropertyBookingCardProps {
  /** Property details for booking */
  readonly property: PropertyDetails;
  /** Check-in date */
  readonly checkIn: Date | null;
  /** Check-out date */
  readonly checkOut: Date | null;
  /** Guest selection */
  readonly guests: GuestSelection;
  /** Date selection handler */
  readonly onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  /** Guest selection handler */
  readonly onGuestsChange: (guests: GuestSelection) => void;
  /** Booking submission handler */
  readonly onBooking: (bookingData: BookingFormData) => Promise<void>;
  /** Optional CSS classes */
  readonly className?: string;
  /** Loading state */
  readonly isLoading?: boolean;
  /** Booking error */
  readonly error?: PropertyError | null;
  /** Error dismissal handler */
  readonly onErrorDismiss?: () => void;
  /** Disable booking form */
  readonly disabled?: boolean;
  /** Custom booking button text */
  readonly bookingButtonText?: string;
  /** Show price breakdown */
  readonly showPriceBreakdown?: boolean;
  /** Card position styling */
  readonly sticky?: boolean;
}

/**
 * Strict props for PropertyBookingButton
 */
export interface PropertyBookingButtonProps {
  /** Click handler */
  readonly onClick: () => void;
  /** Disabled state */
  readonly disabled: boolean;
  /** Loading state */
  readonly isLoading: boolean;
  /** Check-in date */
  readonly checkIn: Date | null;
  /** Check-out date */
  readonly checkOut: Date | null;
  /** Booking calculations (contains validation state and pricing) */
  readonly calculations: BookingCalculations | null;
  /** Custom button text */
  readonly customText?: string;
  /** Additional CSS classes */
  readonly className?: string;
}

/**
 * Strict props for PropertyBookingForm
 */
export interface PropertyBookingFormProps {
  /** Check-in date */
  readonly checkIn: Date | null;
  /** Check-out date */
  readonly checkOut: Date | null;
  /** Guest selection */
  readonly guests: GuestSelection;
  /** Maximum guests allowed */
  readonly maxGuests: number;
  /** Validation state */
  readonly validation: BookingValidation;
  /** Date selection handler */
  readonly onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  /** Guest selection handler */
  readonly onGuestsChange: (guests: GuestSelection) => void;
  /** Booking error */
  readonly error?: PropertyError | null;
  /** Error dismissal handler */
  readonly onErrorDismiss?: () => void;
  /** Disabled state */
  readonly disabled?: boolean;
}

/**
 * Strict props for PricingHeader
 */
export interface PricingHeaderProps {
  /** Price per night */
  readonly pricePerNight: number;
  /** Average rating */
  readonly rating: number;
  /** Number of reviews */
  readonly reviews: number;
}

/**
 * Booking action result discriminated union
 */
export type BookingActionResult =
  | { readonly success: true; readonly bookingId: string }
  | { readonly success: false; readonly error: PropertyError };

/**
 * Type guard for validated booking state
 */
export function isValidatedBookingState(
  state: BookingState
): state is ValidatedBookingState {
  return state.isValid === true;
}

/**
 * Type guard for invalid booking state
 */
export function isInvalidBookingState(
  state: BookingState
): state is InvalidBookingState {
  return state.isValid === false;
}

/**
 * Type guard for successful booking result
 */
export function isSuccessfulBooking(
  result: BookingActionResult
): result is { success: true; bookingId: string } {
  return result.success === true;
}

/**
 * Type guard for failed booking result
 */
export function isFailedBooking(
  result: BookingActionResult
): result is { success: false; error: PropertyError } {
  return result.success === false;
}
