/**
 * @fileoverview Enhanced useBookingCalculations Hook with Strategy Pattern
 * 
 * Refactored version of useBookingCalculations that leverages the BookingCalculationStrategy
 * pattern for flexible, testable, and maintainable pricing calculations.
 */

import { useMemo, useCallback } from 'react';
import type { 
  PropertyDetails, 
  GuestSelection, 
  BookingCalculations, 
  BookingFormData,
  PropertyError,
} from '../types/PropertyDetails';
import { 
  BookingCalculationFactory,
  BookingCalculationUtils,
  DEFAULT_CALCULATION_CONFIGS,
  type CalculationConfig,
  type CalculationResult,
  type CalculationContext
} from '../strategies/BookingCalculationStrategy';

/**
 * Enhanced configuration options with strategy support
 */
export interface UseBookingCalculationsOptions {
  // Strategy selection
  strategy?: 'standard' | 'dynamic' | 'long-term' | 'premium' | string;
  
  // Traditional options (for backward compatibility)
  taxRate?: number;
  includeTaxes?: boolean;
  minNights?: number;
  maxNights?: number;
  maxGuests?: number;
  advanceBookingDays?: number;
  
  // Enhanced strategy-specific options
  enableDynamicPricing?: boolean;
  weekendMultiplier?: number;
  seasonalMultipliers?: Record<string, number>;
  discountRules?: Array<{
    type: 'weekly' | 'monthly' | 'early_bird' | 'last_minute' | 'repeat_guest';
    threshold: number;
    discountPercent: number;
    description: string;
  }>;
  
  // Metadata
  currency?: string;
  locale?: string;
  userType?: 'guest' | 'repeat_guest' | 'premium';
  
  // Callbacks
  onCalculationError?: (error: PropertyError) => void;
  onValidationError?: (errors: string[]) => void;
  onCalculationSuccess?: (result: CalculationResult) => void;
}

/**
 * Date range for booking
 */
export interface BookingDateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

/**
 * Enhanced booking validation result
 */
export interface BookingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedAlternatives?: {
    dates?: { checkIn: Date; checkOut: Date }[];
    guestCounts?: GuestSelection[];
  };
}

/**
 * Enhanced return type with strategy features
 */
export interface UseBookingCalculationsReturn {
  // Enhanced calculations with breakdown
  calculations: BookingCalculations & {
    breakdown: Array<{
      description: string;
      amount: number;
      type: 'base' | 'fee' | 'tax' | 'discount';
      nights?: number;
    }>;
    appliedDiscounts: string[];
    strategy: string;
  };
  
  // Validation
  validation: BookingValidation;
  
  // Utilities
  calculateNights: (checkIn: Date | null, checkOut: Date | null) => number;
  validateDates: (checkIn: Date | null, checkOut: Date | null) => string[];
  validateGuests: (guests: GuestSelection, maxGuests?: number) => string[];
  formatPrice: (amount: number) => string;
  
  // Enhanced utilities
  switchStrategy: (newStrategy: string) => void;
  getAvailableStrategies: () => string[];
  recalculateWithOptions: (options: Partial<UseBookingCalculationsOptions>) => void;
  
  // Booking form data
  createBookingData: (
    property: PropertyDetails,
    dates: BookingDateRange,
    guests: GuestSelection,
    additionalData?: Partial<BookingFormData>
  ) => BookingFormData;
}

/**
 * Default enhanced configuration
 */
const DEFAULT_OPTIONS: Required<Omit<UseBookingCalculationsOptions, 'seasonalMultipliers' | 'discountRules'>> = {
  strategy: 'standard',
  taxRate: 0.12,
  includeTaxes: true,
  minNights: 1,
  maxNights: 30,
  maxGuests: 16,
  advanceBookingDays: 365,
  enableDynamicPricing: false,
  weekendMultiplier: 1.2,
  currency: 'USD',
  locale: 'en-US',
  userType: 'guest',
  onCalculationError: () => {},
  onValidationError: () => {},
  onCalculationSuccess: () => {},
};

/**
 * Calculate the number of nights between dates
 */
function calculateNightsBetween(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;
  return BookingCalculationUtils.calculateNights(checkIn, checkOut);
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
 * Create calculation configuration from options
 */
function createCalculationConfig(options: UseBookingCalculationsOptions): CalculationConfig {
  const strategyConfig = options.strategy && DEFAULT_CALCULATION_CONFIGS[options.strategy as keyof typeof DEFAULT_CALCULATION_CONFIGS];
  
  return {
    taxRate: options.taxRate ?? strategyConfig?.taxRate ?? DEFAULT_OPTIONS.taxRate,
    includeTaxes: options.includeTaxes ?? strategyConfig?.includeTaxes ?? DEFAULT_OPTIONS.includeTaxes,
    enableDynamicPricing: options.enableDynamicPricing ?? strategyConfig?.enableDynamicPricing ?? DEFAULT_OPTIONS.enableDynamicPricing,
    weekendMultiplier: options.weekendMultiplier ?? strategyConfig?.weekendMultiplier,
    seasonalMultipliers: options.seasonalMultipliers ?? strategyConfig?.seasonalMultipliers,
    discountRules: options.discountRules ?? strategyConfig?.discountRules,
  };
}

/**
 * Enhanced useBookingCalculations hook with strategy pattern
 */
export function useBookingCalculationsStrategy(
  property: PropertyDetails | null,
  checkIn: Date | null,
  checkOut: Date | null,
  guests: GuestSelection,
  options: Partial<UseBookingCalculationsOptions> = {}
): UseBookingCalculationsReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  /**
   * Memoized calculation strategy
   */
  const calculationStrategy = useMemo(() => {
    const calculationConfig = createCalculationConfig(config);
    return BookingCalculationFactory.createStrategy(config.strategy, calculationConfig);
  }, [config.strategy, config.taxRate, config.includeTaxes, config.enableDynamicPricing, config.weekendMultiplier]);

  /**
   * Memoized booking calculations using strategy
   */
  const calculations = useMemo(() => {
    const defaultCalculations = {
      nights: 0,
      subtotal: 0,
      cleaningFee: 0,
      serviceFee: 0,
      taxes: 0,
      total: 0,
      pricePerNight: 0,
      isValid: false,
      errors: [],
      breakdown: [],
      appliedDiscounts: [],
      strategy: config.strategy,
    };
    
    if (!property || !checkIn || !checkOut) {
      return defaultCalculations;
    }
    
    try {
      const nights = calculateNightsBetween(checkIn, checkOut);
      
      if (nights <= 0) {
        return { ...defaultCalculations, errors: ['Invalid date range'] };
      }

      // Create calculation context
      const context = BookingCalculationUtils.createContext(
        property,
        checkIn,
        checkOut,
        guests,
        createCalculationConfig(config),
        { userType: config.userType }
      );

      // Perform calculation using strategy
      const result = calculationStrategy.calculate(context);
      
      // Notify success
      config.onCalculationSuccess?.(result);

      return {
        nights,
        subtotal: result.subtotal,
        cleaningFee: result.cleaningFee,
        serviceFee: result.serviceFee,
        taxes: result.taxes,
        total: result.total,
        pricePerNight: result.pricePerNight,
        isValid: true,
        errors: [],
        breakdown: result.breakdown,
        appliedDiscounts: result.appliedDiscounts.map(rule => rule.description),
        strategy: config.strategy,
      };
    } catch (error) {
      const calculationError: PropertyError = {
        type: 'PRICE_CALCULATION_ERROR',
        message: 'Failed to calculate booking price',
        retryable: false,
        suggestions: ['Refresh the page', 'Try selecting different dates'],
      };
      
      config.onCalculationError?.(calculationError);
      
      return {
        ...defaultCalculations,
        errors: ['Calculation error occurred'],
      };
    }
  }, [property, checkIn, checkOut, guests, calculationStrategy, config]);

  /**
   * Enhanced validation with suggestions
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
        warnings.push('Long stays may qualify for additional discounts');
      }
      
      if (calculations.strategy === 'standard' && nights >= 7) {
        warnings.push('Consider switching to long-term strategy for better rates');
      }
    }
    
    const totalGuests = guests.adults + guests.children;
    if (property && totalGuests === property.maxGuests) {
      warnings.push('You\'re booking for maximum capacity');
    }
    
    if (allErrors.length > 0) {
      config.onValidationError?.(allErrors);
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings,
    };
  }, [checkIn, checkOut, guests, property, calculations, config]);

  /**
   * Utility functions
   */
  const calculateNights = useCallback((checkIn: Date | null, checkOut: Date | null): number => {
    return calculateNightsBetween(checkIn, checkOut);
  }, []);

  const validateDates = useCallback((checkIn: Date | null, checkOut: Date | null): string[] => {
    return validateDateRange(checkIn, checkOut, config);
  }, [config]);

  const validateGuests = useCallback((guests: GuestSelection, maxGuests?: number): string[] => {
    return validateGuestSelection(guests, maxGuests);
  }, []);

  const formatPrice = useCallback((amount: number): string => {
    return BookingCalculationUtils.formatPrice(amount, config.currency);
  }, [config.currency]);

  const switchStrategy = useCallback((newStrategy: string) => {
    // This would trigger a re-render with new strategy
    // Implementation depends on how the parent component manages state
    console.warn('switchStrategy called - implement state update in parent component');
  }, []);

  const getAvailableStrategies = useCallback((): string[] => {
    return BookingCalculationFactory.getAvailableStrategies();
  }, []);

  const recalculateWithOptions = useCallback((newOptions: Partial<UseBookingCalculationsOptions>) => {
    // This would trigger a re-calculation with new options
    // Implementation depends on how the parent component manages state
    console.warn('recalculateWithOptions called - implement state update in parent component');
  }, []);

  const createBookingData = useCallback((
    property: PropertyDetails,
    dates: BookingDateRange,
    guests: GuestSelection,
    additionalData?: Partial<BookingFormData>
  ): BookingFormData => {
    return {
      propertyId: property.id,
      checkIn: dates.checkIn?.toISOString() || '',
      checkOut: dates.checkOut?.toISOString() || '',
      guests,
      totalAmount: calculations.total,
      breakdown: calculations.breakdown,
      strategy: calculations.strategy,
      ...additionalData,
    } as BookingFormData;
  }, [calculations]);

  return {
    calculations,
    validation,
    calculateNights,
    validateDates,
    validateGuests,
    formatPrice,
    switchStrategy,
    getAvailableStrategies,
    recalculateWithOptions,
    createBookingData,
  };
}

export default useBookingCalculationsStrategy;