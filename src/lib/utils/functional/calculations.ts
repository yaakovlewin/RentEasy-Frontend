/**
 * Pure Business Calculation Functions
 *
 * Curried, pure functions for business calculations.
 * All functions are composable and immutable.
 *
 * Extracted from PropertiesClient and BookingsClient, enhanced for FP.
 */

import { curry2, curry3, curry4 } from '../../api/functional/compose';
import { calculateNightsBetween } from './dateUtils';

/**
 * Fee structure for bookings
 */
export interface FeeStructure {
  readonly serviceFeeRate: number; // As decimal (e.g., 0.10 for 10%)
  readonly cleaningFeeRate: number;
  readonly taxRate: number;
  readonly minimumServiceFee?: number;
  readonly maximumServiceFee?: number;
}

/**
 * Price breakdown for a booking
 */
export interface PriceBreakdown {
  readonly basePrice: number;
  readonly numberOfNights: number;
  readonly subtotal: number;
  readonly serviceFee: number;
  readonly cleaningFee: number;
  readonly taxes: number;
  readonly total: number;
  readonly breakdown: readonly {
    readonly name: string;
    readonly amount: number;
    readonly description?: string;
  }[];
}

/**
 * Default fee structure
 */
export const DEFAULT_FEE_STRUCTURE: FeeStructure = Object.freeze({
  serviceFeeRate: 0.10, // 10%
  cleaningFeeRate: 0.05, // 5%
  taxRate: 0.08, // 8%
  minimumServiceFee: 10,
  maximumServiceFee: 500,
});

/**
 * Calculate average rating from reviews
 * Pure curried function (extracted from PropertiesClient)
 *
 * @example
 * const reviews = [{ rating: 4.5 }, { rating: 5.0 }, { rating: 4.0 }];
 * const avg = calculateAverageRating(reviews); // 4.5
 */
export const calculateAverageRating = (
  reviews: readonly { readonly rating: number }[]
): number => {
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = total / reviews.length;

  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate total price for nights
 * Pure curried function
 *
 * @example
 * const calculatePrice = calculateTotalPrice(150);
 * calculatePrice(5); // 750
 */
export const calculateTotalPrice = (pricePerNight: number) =>
  (numberOfNights: number): number =>
    pricePerNight * numberOfNights;

/**
 * Calculate service fee
 * Pure curried function
 *
 * @example
 * const calculateFee = calculateServiceFee(0.10)(10)(500);
 * calculateFee(1000); // 100
 */
export const calculateServiceFee = (rate: number) =>
  (minFee?: number) =>
  (maxFee?: number) =>
  (subtotal: number): number => {
    let fee = subtotal * rate;

    if (minFee !== undefined && fee < minFee) {
      fee = minFee;
    }

    if (maxFee !== undefined && fee > maxFee) {
      fee = maxFee;
    }

    return Math.round(fee * 100) / 100; // Round to 2 decimal places
  };

/**
 * Calculate cleaning fee
 * Pure curried function
 */
export const calculateCleaningFee = (rate: number) =>
  (subtotal: number): number =>
    Math.round(subtotal * rate * 100) / 100;

/**
 * Calculate taxes
 * Pure curried function
 */
export const calculateTaxes = (rate: number) =>
  (subtotal: number): number =>
    Math.round(subtotal * rate * 100) / 100;

/**
 * Calculate refund percentage based on cancellation timing
 * Pure curried function
 *
 * @example
 * const calculateRefund = calculateRefundPercentage(48);
 * calculateRefund(30); // 0.5 (50% refund - less than 48 hours)
 */
export const calculateRefundPercentage = (hoursBeforeCheckIn: number): number => {
  if (hoursBeforeCheckIn >= 168) { // 7 days
    return 1.0; // 100% refund
  }

  if (hoursBeforeCheckIn >= 72) { // 3 days
    return 0.75; // 75% refund
  }

  if (hoursBeforeCheckIn >= 48) { // 2 days
    return 0.50; // 50% refund
  }

  if (hoursBeforeCheckIn >= 24) { // 1 day
    return 0.25; // 25% refund
  }

  return 0; // No refund
};

/**
 * Calculate refund amount
 * Pure curried function
 *
 * @example
 * const calculateRefund = calculateRefundAmount(48);
 * calculateRefund(1000); // 500 (50% refund)
 */
export const calculateRefundAmount = (hoursBeforeCheckIn: number) =>
  (totalPaid: number): number => {
    const refundPercentage = calculateRefundPercentage(hoursBeforeCheckIn);
    return Math.round(totalPaid * refundPercentage * 100) / 100;
  };

/**
 * Calculate comprehensive price breakdown
 * Pure function
 *
 * @example
 * const breakdown = calculatePriceBreakdown(
 *   150,
 *   '2024-01-01',
 *   '2024-01-05',
 *   DEFAULT_FEE_STRUCTURE
 * );
 */
export const calculatePriceBreakdown = (
  pricePerNight: number,
  checkInDate: string,
  checkOutDate: string,
  feeStructure: FeeStructure = DEFAULT_FEE_STRUCTURE
): PriceBreakdown => {
  const numberOfNights = calculateNightsBetween(checkInDate)(checkOutDate);
  const subtotal = calculateTotalPrice(pricePerNight)(numberOfNights);

  const serviceFee = calculateServiceFee(feeStructure.serviceFeeRate)(
    feeStructure.minimumServiceFee
  )(feeStructure.maximumServiceFee)(subtotal);

  const cleaningFee = calculateCleaningFee(feeStructure.cleaningFeeRate)(subtotal);
  const taxes = calculateTaxes(feeStructure.taxRate)(subtotal);

  const total = subtotal + serviceFee + cleaningFee + taxes;

  return Object.freeze({
    basePrice: pricePerNight,
    numberOfNights,
    subtotal,
    serviceFee,
    cleaningFee,
    taxes,
    total: Math.round(total * 100) / 100,
    breakdown: Object.freeze([
      {
        name: 'Accommodation',
        amount: subtotal,
        description: `${pricePerNight} x ${numberOfNights} nights`,
      },
      {
        name: 'Service Fee',
        amount: serviceFee,
        description: `${(feeStructure.serviceFeeRate * 100).toFixed(0)}% of subtotal`,
      },
      {
        name: 'Cleaning Fee',
        amount: cleaningFee,
        description: `${(feeStructure.cleaningFeeRate * 100).toFixed(0)}% of subtotal`,
      },
      {
        name: 'Taxes',
        amount: taxes,
        description: `${(feeStructure.taxRate * 100).toFixed(0)}% of subtotal`,
      },
    ]),
  });
};

/**
 * Calculate occupancy rate
 * Pure curried function
 *
 * @example
 * const occupancyRate = calculateOccupancyRate(25)(30);
 * occupancyRate; // 0.8333 (83.33%)
 */
export const calculateOccupancyRate = (bookedDays: number) =>
  (totalDays: number): number => {
    if (totalDays === 0) return 0;
    return bookedDays / totalDays;
  };

/**
 * Calculate revenue per available night
 * Pure curried function
 */
export const calculateRevPAN = (totalRevenue: number) =>
  (availableNights: number): number => {
    if (availableNights === 0) return 0;
    return Math.round((totalRevenue / availableNights) * 100) / 100;
  };

/**
 * Calculate average booking value
 * Pure curried function
 */
export const calculateAverageBookingValue = (totalRevenue: number) =>
  (numberOfBookings: number): number => {
    if (numberOfBookings === 0) return 0;
    return Math.round((totalRevenue / numberOfBookings) * 100) / 100;
  };

/**
 * Calculate price per guest
 * Pure curried function
 */
export const calculatePricePerGuest = (totalPrice: number) =>
  (numberOfGuests: number): number => {
    if (numberOfGuests === 0) return 0;
    return Math.round((totalPrice / numberOfGuests) * 100) / 100;
  };

/**
 * Calculate discount amount
 * Pure curried function
 *
 * @example
 * const discount20Percent = calculateDiscountAmount(0.20);
 * discount20Percent(100); // 20
 */
export const calculateDiscountAmount = (discountRate: number) =>
  (price: number): number =>
    Math.round(price * discountRate * 100) / 100;

/**
 * Apply discount to price
 * Pure curried function
 */
export const applyDiscount = (discountRate: number) =>
  (price: number): number => {
    const discountAmount = calculateDiscountAmount(discountRate)(price);
    return price - discountAmount;
  };

/**
 * Calculate percentage change
 * Pure curried function
 *
 * @example
 * const change = calculatePercentageChange(100)(150);
 * change; // 0.5 (50% increase)
 */
export const calculatePercentageChange = (oldValue: number) =>
  (newValue: number): number => {
    if (oldValue === 0) return 0;
    return (newValue - oldValue) / oldValue;
  };

/**
 * Calculate total from items with prices
 * Pure function
 */
export const calculateTotal = <T extends { readonly price: number }>(
  items: readonly T[]
): number => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return Math.round(total * 100) / 100;
};

/**
 * Calculate weighted average
 * Pure function
 *
 * @example
 * const items = [
 *   { value: 4.5, weight: 10 },
 *   { value: 5.0, weight: 5 },
 *   { value: 3.5, weight: 2 }
 * ];
 * const avg = calculateWeightedAverage(items); // 4.5
 */
export const calculateWeightedAverage = (
  items: readonly { readonly value: number; readonly weight: number }[]
): number => {
  if (items.length === 0) return 0;

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) return 0;

  const weightedSum = items.reduce((sum, item) => sum + item.value * item.weight, 0);

  return Math.round((weightedSum / totalWeight) * 100) / 100;
};

/**
 * Calculate compound interest
 * Pure curried function
 *
 * @example
 * const interest = calculateCompoundInterest(1000)(0.05)(12)(5);
 * interest; // Future value after compound interest
 */
export const calculateCompoundInterest = (principal: number) =>
  (rate: number) =>
  (periods: number) =>
  (years: number): number => {
    const amount = principal * Math.pow(1 + rate / periods, periods * years);
    return Math.round(amount * 100) / 100;
  };

/**
 * Calculate property value appreciation
 * Pure curried function
 */
export const calculateAppreciation = (initialValue: number) =>
  (appreciationRate: number) =>
  (years: number): number => {
    const finalValue = initialValue * Math.pow(1 + appreciationRate, years);
    return Math.round(finalValue * 100) / 100;
  };

/**
 * Clamp value between min and max
 * Pure curried function
 */
export const clamp = (min: number) =>
  (max: number) =>
  (value: number): number => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  };

/**
 * Round to specified decimal places
 * Pure curried function
 */
export const roundTo = (decimals: number) =>
  (value: number): number => {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  };

/**
 * Namespace containing all calculation utilities
 */
export const Calculations = Object.freeze({
  calculateAverageRating,
  calculateTotalPrice,
  calculateServiceFee,
  calculateCleaningFee,
  calculateTaxes,
  calculateRefundPercentage,
  calculateRefundAmount,
  calculatePriceBreakdown,
  calculateOccupancyRate,
  calculateRevPAN,
  calculateAverageBookingValue,
  calculatePricePerGuest,
  calculateDiscountAmount,
  applyDiscount,
  calculatePercentageChange,
  calculateTotal,
  calculateWeightedAverage,
  calculateCompoundInterest,
  calculateAppreciation,
  clamp,
  roundTo,
  DEFAULT_FEE_STRUCTURE,
});
