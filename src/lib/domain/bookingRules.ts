/**
 * Pure Business Rules for Bookings
 *
 * Pure predicate functions and business logic for booking operations.
 * All rules are extracted from BookingsClient and enhanced with functional patterns.
 *
 * Rules are composable, type-safe, and fully immutable.
 */

import { hoursBetween, isPast, isFuture } from '../utils/functional/dateUtils';
import { calculateRefundPercentage, calculateRefundAmount } from '../utils/functional/calculations';

/**
 * Booking status type
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';

/**
 * Payment status type
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

/**
 * Booking interface
 */
export interface Booking {
  readonly id: string;
  readonly propertyId: string;
  readonly guestId: string;
  readonly checkInDate: string;
  readonly checkOutDate: string;
  readonly numberOfGuests: number;
  readonly totalPrice: number;
  readonly status: BookingStatus;
  readonly paymentStatus: PaymentStatus;
  readonly createdAt: string;
  readonly specialRequests?: string;
  readonly cancellationReason?: string;
}

/**
 * Rule result with reason and metadata
 */
export interface RuleResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly metadata?: Readonly<Record<string, any>>;
}

/**
 * Create rule result
 */
const allow = (metadata?: Readonly<Record<string, any>>): RuleResult =>
  Object.freeze({ allowed: true, metadata });

const deny = (reason: string, metadata?: Readonly<Record<string, any>>): RuleResult =>
  Object.freeze({ allowed: false, reason, metadata });

/**
 * Cancellation policy constants
 */
export const CANCELLATION_POLICY = Object.freeze({
  MINIMUM_HOURS_BEFORE_CHECKIN: 24,
  FULL_REFUND_HOURS: 168, // 7 days
  PARTIAL_REFUND_75_HOURS: 72, // 3 days
  PARTIAL_REFUND_50_HOURS: 48, // 2 days
  PARTIAL_REFUND_25_HOURS: 24, // 1 day
});

/**
 * Modification policy constants
 */
export const MODIFICATION_POLICY = Object.freeze({
  MINIMUM_HOURS_BEFORE_CHECKIN: 48,
  MAXIMUM_MODIFICATIONS_ALLOWED: 3,
});

/**
 * Booking constraints
 */
export const BOOKING_CONSTRAINTS = Object.freeze({
  MINIMUM_NIGHTS: 1,
  MAXIMUM_NIGHTS: 365,
  MINIMUM_GUESTS: 1,
  MAXIMUM_ADVANCE_BOOKING_DAYS: 730, // 2 years
});

// =============================================================================
// CANCELLATION RULES
// =============================================================================

/**
 * Check if booking can be cancelled based on timing
 * Pure function (extracted from BookingsClient.canCancelBooking)
 *
 * @example
 * const booking = { status: 'confirmed', checkInDate: '2024-01-05', ... };
 * const result = canCancelBooking(booking);
 * if (result.allowed) { / * proceed with cancellation * / }
 */
export const canCancelBooking = (booking: Booking): RuleResult => {
  // Cannot cancel if already cancelled or completed
  if (booking.status === 'cancelled') {
    return deny('Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    return deny('Booking is already completed');
  }

  // Check cancellation window
  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const hoursUntilCheckIn = hoursBetween(now)(checkInDate);

  if (hoursUntilCheckIn < CANCELLATION_POLICY.MINIMUM_HOURS_BEFORE_CHECKIN) {
    return deny(
      `Cancellations must be made at least ${CANCELLATION_POLICY.MINIMUM_HOURS_BEFORE_CHECKIN} hours before check-in`,
      { hoursUntilCheckIn }
    );
  }

  return allow({ hoursUntilCheckIn });
};

/**
 * Check if booking is eligible for refund
 * Pure function
 */
export const isEligibleForRefund = (booking: Booking): RuleResult => {
  if (booking.paymentStatus !== 'paid') {
    return deny('Booking has not been paid');
  }

  if (booking.status !== 'cancelled') {
    return deny('Booking must be cancelled to receive refund');
  }

  return allow();
};

/**
 * Calculate refund for cancelled booking
 * Pure function
 */
export const calculateBookingRefund = (booking: Booking): {
  readonly refundPercentage: number;
  readonly refundAmount: number;
  readonly reason: string;
} => {
  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const hoursUntilCheckIn = hoursBetween(now)(checkInDate);

  const refundPercentage = calculateRefundPercentage(hoursUntilCheckIn);
  const refundAmount = calculateRefundAmount(hoursUntilCheckIn)(booking.totalPrice);

  let reason = '';

  if (refundPercentage === 1.0) {
    reason = 'Full refund (cancelled 7+ days before check-in)';
  } else if (refundPercentage === 0.75) {
    reason = 'Partial refund: 75% (cancelled 3-7 days before check-in)';
  } else if (refundPercentage === 0.50) {
    reason = 'Partial refund: 50% (cancelled 2-3 days before check-in)';
  } else if (refundPercentage === 0.25) {
    reason = 'Partial refund: 25% (cancelled 1-2 days before check-in)';
  } else {
    reason = 'No refund (cancelled less than 24 hours before check-in)';
  }

  return Object.freeze({
    refundPercentage,
    refundAmount,
    reason,
  });
};

// =============================================================================
// MODIFICATION RULES
// =============================================================================

/**
 * Check if booking can be modified
 * Pure function (extracted from BookingsClient.canModifyBooking)
 *
 * @example
 * const result = canModifyBooking(booking);
 * if (result.allowed) { / * allow modification * / }
 */
export const canModifyBooking = (booking: Booking): RuleResult => {
  // Can only modify confirmed or pending bookings
  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    return deny(`Booking with status "${booking.status}" cannot be modified`);
  }

  // Check modification window
  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const hoursUntilCheckIn = hoursBetween(now)(checkInDate);

  if (hoursUntilCheckIn < MODIFICATION_POLICY.MINIMUM_HOURS_BEFORE_CHECKIN) {
    return deny(
      `Modifications must be made at least ${MODIFICATION_POLICY.MINIMUM_HOURS_BEFORE_CHECKIN} hours before check-in`,
      { hoursUntilCheckIn }
    );
  }

  return allow({ hoursUntilCheckIn });
};

// =============================================================================
// BOOKING STATUS RULES
// =============================================================================

/**
 * Check if booking is active (guest is currently staying)
 * Pure function (extracted from BookingsClient.isActiveBooking)
 */
export const isActiveBooking = (booking: Booking): boolean => {
  if (booking.status !== 'confirmed' && booking.status !== 'in_progress') {
    return false;
  }

  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);

  return now >= checkInDate && now < checkOutDate;
};

/**
 * Check if booking is upcoming
 * Pure function
 */
export const isUpcomingBooking = (booking: Booking): boolean => {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return false;
  }

  return isFuture(booking.checkInDate);
};

/**
 * Check if booking is past
 * Pure function
 */
export const isPastBooking = (booking: Booking): boolean => {
  return isPast(booking.checkOutDate);
};

/**
 * Check if booking can be confirmed
 * Pure function
 */
export const canConfirmBooking = (booking: Booking): RuleResult => {
  if (booking.status !== 'pending') {
    return deny('Only pending bookings can be confirmed');
  }

  if (booking.paymentStatus !== 'paid') {
    return deny('Payment must be completed before confirmation');
  }

  return allow();
};

/**
 * Check if booking can be completed
 * Pure function
 */
export const canCompleteBooking = (booking: Booking): RuleResult => {
  if (booking.status === 'completed') {
    return deny('Booking is already completed');
  }

  if (booking.status === 'cancelled') {
    return deny('Cancelled bookings cannot be completed');
  }

  const now = new Date();
  const checkOutDate = new Date(booking.checkOutDate);

  if (now < checkOutDate) {
    return deny('Booking can only be completed after check-out date');
  }

  return allow();
};

/**
 * Check if guest can check in
 * Pure function
 */
export const canCheckIn = (booking: Booking): RuleResult => {
  if (booking.status !== 'confirmed') {
    return deny('Booking must be confirmed to check in');
  }

  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);

  // Allow check-in starting 4 hours before official check-in time
  const earlyCheckInAllowed = new Date(checkInDate.getTime() - 4 * 60 * 60 * 1000);

  if (now < earlyCheckInAllowed) {
    return deny('Check-in time has not arrived yet', {
      checkInDate: checkInDate.toISOString(),
    });
  }

  if (now >= checkOutDate) {
    return deny('Check-in window has passed');
  }

  return allow();
};

/**
 * Check if guest can check out
 * Pure function
 */
export const canCheckOut = (booking: Booking): RuleResult => {
  if (booking.status !== 'in_progress' && booking.status !== 'confirmed') {
    return deny('Booking must be in progress to check out');
  }

  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);

  if (now < checkInDate) {
    return deny('Cannot check out before check-in');
  }

  // Allow early checkout
  return allow();
};

// =============================================================================
// PAYMENT RULES
// =============================================================================

/**
 * Check if booking requires payment
 * Pure function
 */
export const requiresPayment = (booking: Booking): boolean => {
  return booking.paymentStatus !== 'paid' && booking.status !== 'cancelled';
};

/**
 * Check if refund can be processed
 * Pure function
 */
export const canProcessRefund = (booking: Booking): RuleResult => {
  if (booking.paymentStatus !== 'paid') {
    return deny('No payment to refund');
  }

  if (booking.paymentStatus === 'refunded') {
    return deny('Refund has already been processed');
  }

  if (booking.status !== 'cancelled') {
    return deny('Booking must be cancelled to process refund');
  }

  return allow();
};

// =============================================================================
// DATE VALIDATION RULES
// =============================================================================

/**
 * Validate booking dates
 * Pure function
 */
export const validateBookingDates = (
  checkInDate: string,
  checkOutDate: string
): RuleResult => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const now = new Date();

  // Check-in must be in the future
  if (checkIn <= now) {
    return deny('Check-in date must be in the future');
  }

  // Check-out must be after check-in
  if (checkOut <= checkIn) {
    return deny('Check-out date must be after check-in date');
  }

  // Calculate nights
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));

  // Minimum nights
  if (nights < BOOKING_CONSTRAINTS.MINIMUM_NIGHTS) {
    return deny(`Minimum booking is ${BOOKING_CONSTRAINTS.MINIMUM_NIGHTS} night(s)`);
  }

  // Maximum nights
  if (nights > BOOKING_CONSTRAINTS.MAXIMUM_NIGHTS) {
    return deny(`Maximum booking is ${BOOKING_CONSTRAINTS.MAXIMUM_NIGHTS} nights`);
  }

  // Maximum advance booking
  const daysInAdvance = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 3600 * 24));

  if (daysInAdvance > BOOKING_CONSTRAINTS.MAXIMUM_ADVANCE_BOOKING_DAYS) {
    return deny(`Bookings can only be made ${BOOKING_CONSTRAINTS.MAXIMUM_ADVANCE_BOOKING_DAYS} days in advance`);
  }

  return allow({ nights, daysInAdvance });
};

/**
 * Validate guest count
 * Pure function
 */
export const validateGuestCount = (
  numberOfGuests: number,
  maxGuests: number
): RuleResult => {
  if (numberOfGuests < BOOKING_CONSTRAINTS.MINIMUM_GUESTS) {
    return deny(`Minimum ${BOOKING_CONSTRAINTS.MINIMUM_GUESTS} guest required`);
  }

  if (numberOfGuests > maxGuests) {
    return deny(`Property can accommodate maximum ${maxGuests} guests`);
  }

  return allow();
};

/**
 * Namespace containing all booking rules
 */
export const BookingRules = Object.freeze({
  canCancelBooking,
  isEligibleForRefund,
  calculateBookingRefund,
  canModifyBooking,
  isActiveBooking,
  isUpcomingBooking,
  isPastBooking,
  canConfirmBooking,
  canCompleteBooking,
  canCheckIn,
  canCheckOut,
  requiresPayment,
  canProcessRefund,
  validateBookingDates,
  validateGuestCount,
  CANCELLATION_POLICY,
  MODIFICATION_POLICY,
  BOOKING_CONSTRAINTS,
});
