/**
 * @fileoverview useBookingCalculations Hook
 * 
 * Performance-optimized hook for booking price calculations, validation,
 * and booking form state management with comprehensive error handling.
 */

import { useMemo, useCallback } from 'react';
import type { 
  PropertyDetails, 
  GuestSelection, 
  BookingCalculations, 
  BookingFormData,
  PropertyError,
} from '../types/PropertyDetails';

/**
 * Configuration options for booking calculations
 */
export interface UseBookingCalculationsOptions {
  // Tax calculation
  taxRate?: number;
  includeTaxes?: boolean;
  
  // Validation options
  minNights?: number;
  maxNights?: number;
  maxGuests?: number;
  advanceBookingDays?: number;
  
  // Pricing options
  enableDynamicPricing?: boolean;
  weekendMultiplier?: number;
  
  // Callbacks
  onCalculationError?: (error: PropertyError) => void;
  onValidationError?: (errors: string[]) => void;
}

/**
 * Date range for booking
 */
export interface BookingDateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

/**
 * Booking validation result
 */
export interface BookingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Return type for useBookingCalculations hook
 */
export interface UseBookingCalculationsReturn {
  // Calculations
  calculations: BookingCalculations;
  
  // Validation
  validation: BookingValidation;
  
  // Utilities
  calculateNights: (checkIn: Date | null, checkOut: Date | null) => number;
  validateDates: (checkIn: Date | null, checkOut: Date | null) => string[];
  validateGuests: (guests: GuestSelection, maxGuests?: number) => string[];
  formatPrice: (amount: number) => string;
  
  // Booking form data
  createBookingData: (
    property: PropertyDetails,
    dates: BookingDateRange,
    guests: GuestSelection,
    additionalData?: Partial<BookingFormData>
  ) => BookingFormData;
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<UseBookingCalculationsOptions> = {
  taxRate: 0.12, // 12% default tax rate
  includeTaxes: true,
  minNights: 1,
  maxNights: 30,
  maxGuests: 16,
  advanceBookingDays: 365,
  enableDynamicPricing: false,
  weekendMultiplier: 1.2,
  onCalculationError: () => {},
  onValidationError: () => {},
};

/**
 * Calculate the number of nights between dates
 */
function calculateNightsBetween(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;
  
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, nights);
}

/**
 * Check if date is weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Calculate weekend nights in date range
 */
function calculateWeekendNights(checkIn: Date, checkOut: Date): number {
  let weekendNights = 0;
  const currentDate = new Date(checkIn);
  
  while (currentDate < checkOut) {
    if (isWeekend(currentDate)) {
      weekendNights++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weekendNights;
}

/**
 * Validate date range
 */
function validateDateRange(
  checkIn: Date | null,
  checkOut: Date | null,
  options: UseBookingCalculationsOptions
): string[] {
  const errors: string[] = [];
  
  if (!checkIn || !checkOut) {
    if (!checkIn) errors.push('Check-in date is required');
    if (!checkOut) errors.push('Check-out date is required');
    return errors;
  }
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Check if dates are in the past
  if (checkIn < todayStart) {
    errors.push('Check-in date cannot be in the past');
  }
  
  if (checkOut <= checkIn) {
    errors.push('Check-out date must be after check-in date');
  }
  
  // Check nights constraints
  const nights = calculateNightsBetween(checkIn, checkOut);
  const minNights = options.minNights || DEFAULT_OPTIONS.minNights;
  const maxNights = options.maxNights || DEFAULT_OPTIONS.maxNights;
  
  if (nights < minNights) {
    errors.push(`Minimum stay is ${minNights} night${minNights > 1 ? 's' : ''}`);
  }
  
  if (nights > maxNights) {
    errors.push(`Maximum stay is ${maxNights} nights`);
  }
  
  // Check advance booking limit
  const advanceBookingDays = options.advanceBookingDays || DEFAULT_OPTIONS.advanceBookingDays;
  const maxBookingDate = new Date();
  maxBookingDate.setDate(maxBookingDate.getDate() + advanceBookingDays);
  
  if (checkIn > maxBookingDate) {
    errors.push(`Bookings can only be made up to ${advanceBookingDays} days in advance`);
  }
  
  return errors;
}

/**
 * Validate guest selection
 */
function validateGuestSelection(
  guests: GuestSelection,
  maxGuests?: number
): string[] {
  const errors: string[] = [];
  
  const totalGuests = guests.adults + guests.children;
  const maxAllowed = maxGuests || DEFAULT_OPTIONS.maxGuests;
  
  if (guests.adults < 1) {
    errors.push('At least one adult is required');
  }
  
  if (totalGuests > maxAllowed) {
    errors.push(`Maximum ${maxAllowed} guests allowed`);
  }
  
  if (guests.children < 0 || guests.infants < 0) {
    errors.push('Guest counts cannot be negative');
  }
  
  // Check for reasonable limits
  if (guests.adults > 12) {
    errors.push('Maximum 12 adults allowed');
  }
  
  if (guests.children > 8) {
    errors.push('Maximum 8 children allowed');
  }
  
  if (guests.infants > 4) {
    errors.push('Maximum 4 infants allowed');
  }
  
  return errors;
}

/**
 * Calculate dynamic pricing based on dates
 */
function calculateDynamicPrice(
  basePrice: number,
  checkIn: Date,
  checkOut: Date,
  options: UseBookingCalculationsOptions
): number {
  if (!options.enableDynamicPricing) {
    return basePrice;
  }
  
  const weekendNights = calculateWeekendNights(checkIn, checkOut);
  const totalNights = calculateNightsBetween(checkIn, checkOut);
  const weekdayNights = totalNights - weekendNights;
  
  const weekendMultiplier = options.weekendMultiplier || DEFAULT_OPTIONS.weekendMultiplier;
  
  const weekdayTotal = weekdayNights * basePrice;
  const weekendTotal = weekendNights * basePrice * weekendMultiplier;
  
  return (weekdayTotal + weekendTotal) / totalNights;
}

/**
 * Main useBookingCalculations hook
 */
export function useBookingCalculations(
  property: PropertyDetails | null,
  checkIn: Date | null,
  checkOut: Date | null,
  guests: GuestSelection,
  options: Partial<UseBookingCalculationsOptions> = {}
): UseBookingCalculationsReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  /**
   * Memoized booking calculations
   */
  const calculations: BookingCalculations = useMemo(() => {
    const defaultCalculations: BookingCalculations = {
      nights: 0,
      subtotal: 0,
      cleaningFee: 0,
      serviceFee: 0,
      taxes: 0,
      total: 0,
      pricePerNight: 0,
      isValid: false,
      errors: [],
    };
    
    if (!property || !checkIn || !checkOut) {
      return defaultCalculations;
    }
    
    try {
      const nights = calculateNightsBetween(checkIn, checkOut);
      
      if (nights <= 0) {
        return { ...defaultCalculations, errors: ['Invalid date range'] };
      }
      
      // Calculate base price (with potential dynamic pricing)
      const basePrice = config.enableDynamicPricing
        ? calculateDynamicPrice(property.pricePerNight, checkIn, checkOut, config)
        : property.pricePerNight;
      
      const subtotal = nights * basePrice;
      const cleaningFee = property.cleaningFee || 0;
      const serviceFee = property.serviceFee || 0;
      
      // Calculate taxes
      const taxableAmount = subtotal + cleaningFee + serviceFee;
      const taxes = config.includeTaxes ? taxableAmount * config.taxRate : 0;
      
      const total = subtotal + cleaningFee + serviceFee + taxes;
      
      return {
        nights,
        subtotal,
        cleaningFee,
        serviceFee,
        taxes,
        total,
        pricePerNight: basePrice,
        isValid: true,
        errors: [],
      };
    } catch (error) {
      const calculationError: PropertyError = {
        type: 'PRICE_CALCULATION_ERROR',
        message: 'Failed to calculate booking price',
        retryable: false,
        suggestions: ['Refresh the page', 'Try selecting different dates'],
      };
      
      config.onCalculationError(calculationError);
      
      return {
        ...defaultCalculations,
        errors: ['Calculation error occurred'],
      };
    }
  }, [property, checkIn, checkOut, guests, config]);
  
  /**
   * Memoized validation results
   */
  const validation: BookingValidation = useMemo(() => {
    const dateErrors = validateDateRange(checkIn, checkOut, config);
    const guestErrors = validateGuestSelection(guests, property?.maxGuests);
    const calculationErrors = calculations.errors || [];
    
    const allErrors = [...dateErrors, ...guestErrors, ...calculationErrors];
    const warnings: string[] = [];
    
    // Add warnings for edge cases
    if (checkIn && checkOut) {
      const nights = calculateNightsBetween(checkIn, checkOut);
      if (nights > 14) {
        warnings.push('Long stay - consider reaching out to the host directly');
      }
      
      if (guests.adults + guests.children === property?.maxGuests) {
        warnings.push('At maximum guest capacity');
      }
    }
    
    const isValid = allErrors.length === 0 && calculations.isValid;
    
    if (!isValid && allErrors.length > 0) {
      config.onValidationError(allErrors);
    }
    
    return {
      isValid,
      errors: allErrors,
      warnings,
    };
  }, [checkIn, checkOut, guests, property?.maxGuests, calculations, config]);
  
  /**
   * Utility function to calculate nights
   */
  const calculateNights = useCallback((checkInDate: Date | null, checkOutDate: Date | null) => {
    return calculateNightsBetween(checkInDate, checkOutDate);
  }, []);
  
  /**
   * Validate dates utility
   */
  const validateDates = useCallback((checkInDate: Date | null, checkOutDate: Date | null) => {
    return validateDateRange(checkInDate, checkOutDate, config);
  }, [config]);
  
  /**
   * Validate guests utility
   */
  const validateGuests = useCallback((guestSelection: GuestSelection, maxGuestsAllowed?: number) => {
    return validateGuestSelection(guestSelection, maxGuestsAllowed);
  }, []);
  
  /**
   * Format price utility
   */
  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);
  
  /**
   * Create booking form data
   */
  const createBookingData = useCallback((
    propertyData: PropertyDetails,
    dates: BookingDateRange,
    guestSelection: GuestSelection,
    additionalData: Partial<BookingFormData> = {}
  ): BookingFormData => {
    if (!dates.checkIn || !dates.checkOut) {
      throw new Error('Check-in and check-out dates are required');
    }
    
    return {
      propertyId: propertyData.id,
      checkInDate: dates.checkIn.toISOString(),
      checkOutDate: dates.checkOut.toISOString(),
      numberOfGuests: guestSelection.adults + guestSelection.children,
      guestDetails: guestSelection,
      ...additionalData,
    };
  }, []);
  
  return {
    // Calculations
    calculations,
    
    // Validation
    validation,
    
    // Utilities
    calculateNights,
    validateDates,
    validateGuests,
    formatPrice,
    
    // Booking form data
    createBookingData,
  };
}