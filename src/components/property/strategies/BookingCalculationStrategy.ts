/**
 * @fileoverview Booking Calculation Strategy Pattern
 * 
 * Enterprise-grade strategy pattern for booking calculations that eliminates monolithic
 * calculation logic and allows for flexible, testable, and extensible pricing strategies.
 * 
 * Follows the Strategy pattern used by Airbnb and Booking.com for pricing flexibility.
 */

import type { PropertyDetails, GuestSelection, BookingCalculations } from '../types/PropertyDetails';

/**
 * Base calculation configuration
 */
export interface CalculationConfig {
  taxRate: number;
  includeTaxes: boolean;
  enableDynamicPricing: boolean;
  weekendMultiplier?: number;
  seasonalMultipliers?: Record<string, number>;
  discountRules?: DiscountRule[];
}

/**
 * Discount rule interface
 */
export interface DiscountRule {
  type: 'weekly' | 'monthly' | 'early_bird' | 'last_minute' | 'repeat_guest';
  threshold: number;
  discountPercent: number;
  description: string;
}

/**
 * Date range for calculations
 */
export interface BookingDateRange {
  checkIn: Date;
  checkOut: Date;
  nights: number;
}

/**
 * Calculation context
 */
export interface CalculationContext {
  property: PropertyDetails;
  dateRange: BookingDateRange;
  guests: GuestSelection;
  config: CalculationConfig;
  metadata?: Record<string, any>;
}

/**
 * Calculation result
 */
export interface CalculationResult {
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  discounts: number;
  total: number;
  pricePerNight: number;
  appliedDiscounts: DiscountRule[];
  breakdown: PriceBreakdown[];
}

/**
 * Price breakdown item
 */
export interface PriceBreakdown {
  description: string;
  amount: number;
  type: 'base' | 'fee' | 'tax' | 'discount';
  nights?: number;
}

/**
 * Abstract booking calculation strategy
 */
export abstract class BookingCalculationStrategy {
  protected config: CalculationConfig;

  constructor(config: CalculationConfig) {
    this.config = config;
  }

  /**
   * Main calculation method - Template Method pattern
   */
  calculate(context: CalculationContext): CalculationResult {
    const basePrice = this.calculateBasePrice(context);
    const subtotal = this.calculateSubtotal(context, basePrice);
    const fees = this.calculateFees(context);
    const discounts = this.calculateDiscounts(context, subtotal + fees.cleaningFee + fees.serviceFee);
    const taxes = this.calculateTaxes(context, subtotal + fees.cleaningFee + fees.serviceFee - discounts.amount);
    const total = subtotal + fees.cleaningFee + fees.serviceFee + taxes - discounts.amount;

    return {
      subtotal,
      cleaningFee: fees.cleaningFee,
      serviceFee: fees.serviceFee,
      taxes,
      discounts: discounts.amount,
      total,
      pricePerNight: basePrice,
      appliedDiscounts: discounts.appliedRules,
      breakdown: this.createBreakdown(context, {
        subtotal,
        fees,
        taxes,
        discounts: discounts.amount,
        basePrice
      })
    };
  }

  /**
   * Calculate base price per night
   */
  protected abstract calculateBasePrice(context: CalculationContext): number;

  /**
   * Calculate subtotal
   */
  protected calculateSubtotal(context: CalculationContext, basePrice: number): number {
    return context.dateRange.nights * basePrice;
  }

  /**
   * Calculate fees
   */
  protected calculateFees(context: CalculationContext): { cleaningFee: number; serviceFee: number } {
    return {
      cleaningFee: context.property.cleaningFee || 0,
      serviceFee: context.property.serviceFee || 0
    };
  }

  /**
   * Calculate taxes
   */
  protected calculateTaxes(context: CalculationContext, taxableAmount: number): number {
    if (!this.config.includeTaxes) return 0;
    return taxableAmount * this.config.taxRate;
  }

  /**
   * Calculate discounts
   */
  protected calculateDiscounts(
    context: CalculationContext, 
    totalAmount: number
  ): { amount: number; appliedRules: DiscountRule[] } {
    const appliedRules: DiscountRule[] = [];
    let totalDiscount = 0;

    if (this.config.discountRules) {
      for (const rule of this.config.discountRules) {
        if (this.isDiscountApplicable(rule, context)) {
          const discountAmount = totalAmount * (rule.discountPercent / 100);
          totalDiscount += discountAmount;
          appliedRules.push(rule);
        }
      }
    }

    return { amount: totalDiscount, appliedRules };
  }

  /**
   * Check if discount rule is applicable
   */
  protected isDiscountApplicable(rule: DiscountRule, context: CalculationContext): boolean {
    switch (rule.type) {
      case 'weekly':
        return context.dateRange.nights >= 7;
      case 'monthly':
        return context.dateRange.nights >= 28;
      case 'early_bird':
        const bookingAdvance = Math.ceil(
          (context.dateRange.checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return bookingAdvance >= rule.threshold;
      case 'last_minute':
        const bookingTime = Math.ceil(
          (context.dateRange.checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return bookingTime <= rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Create price breakdown
   */
  protected createBreakdown(
    context: CalculationContext, 
    amounts: {
      subtotal: number;
      fees: { cleaningFee: number; serviceFee: number };
      taxes: number;
      discounts: number;
      basePrice: number;
    }
  ): PriceBreakdown[] {
    const breakdown: PriceBreakdown[] = [];

    // Base price breakdown
    breakdown.push({
      description: `$${amounts.basePrice.toFixed(2)} × ${context.dateRange.nights} nights`,
      amount: amounts.subtotal,
      type: 'base',
      nights: context.dateRange.nights
    });

    // Fees
    if (amounts.fees.cleaningFee > 0) {
      breakdown.push({
        description: 'Cleaning fee',
        amount: amounts.fees.cleaningFee,
        type: 'fee'
      });
    }

    if (amounts.fees.serviceFee > 0) {
      breakdown.push({
        description: 'Service fee',
        amount: amounts.fees.serviceFee,
        type: 'fee'
      });
    }

    // Taxes
    if (amounts.taxes > 0) {
      breakdown.push({
        description: `Taxes (${(this.config.taxRate * 100).toFixed(1)}%)`,
        amount: amounts.taxes,
        type: 'tax'
      });
    }

    // Discounts
    if (amounts.discounts > 0) {
      breakdown.push({
        description: 'Discounts applied',
        amount: -amounts.discounts,
        type: 'discount'
      });
    }

    return breakdown;
  }
}

/**
 * Standard pricing strategy
 */
export class StandardPricingStrategy extends BookingCalculationStrategy {
  protected calculateBasePrice(context: CalculationContext): number {
    return context.property.pricePerNight;
  }
}

/**
 * Dynamic pricing strategy with weekend/seasonal multipliers
 */
export class DynamicPricingStrategy extends BookingCalculationStrategy {
  protected calculateBasePrice(context: CalculationContext): number {
    const basePrice = context.property.pricePerNight;
    
    if (!this.config.enableDynamicPricing) {
      return basePrice;
    }

    const weekendMultiplier = this.config.weekendMultiplier || 1.2;
    const { checkIn, checkOut, nights } = context.dateRange;
    
    let totalAdjustedPrice = 0;
    const currentDate = new Date(checkIn);

    // Calculate price for each night
    for (let i = 0; i < nights; i++) {
      let nightPrice = basePrice;

      // Apply weekend multiplier
      if (this.isWeekend(currentDate)) {
        nightPrice *= weekendMultiplier;
      }

      // Apply seasonal multiplier
      const seasonMultiplier = this.getSeasonalMultiplier(currentDate);
      nightPrice *= seasonMultiplier;

      totalAdjustedPrice += nightPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalAdjustedPrice / nights;
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  private getSeasonalMultiplier(date: Date): number {
    if (!this.config.seasonalMultipliers) return 1;

    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const season = this.getSeason(month);
    
    return this.config.seasonalMultipliers[season] || 1;
  }

  private getSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }
}

/**
 * Long-term stay pricing strategy with progressive discounts
 */
export class LongTermPricingStrategy extends BookingCalculationStrategy {
  protected calculateBasePrice(context: CalculationContext): number {
    const basePrice = context.property.pricePerNight;
    const nights = context.dateRange.nights;

    // Progressive discount for long stays
    let discountMultiplier = 1;
    
    if (nights >= 28) { // Monthly stay
      discountMultiplier = 0.7; // 30% discount
    } else if (nights >= 14) { // Bi-weekly stay
      discountMultiplier = 0.8; // 20% discount
    } else if (nights >= 7) { // Weekly stay
      discountMultiplier = 0.9; // 10% discount
    }

    return basePrice * discountMultiplier;
  }
}

/**
 * Premium pricing strategy for luxury properties
 */
export class PremiumPricingStrategy extends BookingCalculationStrategy {
  protected calculateBasePrice(context: CalculationContext): number {
    const basePrice = context.property.pricePerNight;
    
    // Premium multiplier based on property features
    let premiumMultiplier = 1;
    
    // Check for luxury amenities
    const luxuryAmenities = context.property.amenities?.filter(amenity =>
      amenity.toLowerCase().includes('spa') ||
      amenity.toLowerCase().includes('pool') ||
      amenity.toLowerCase().includes('concierge') ||
      amenity.toLowerCase().includes('ocean view')
    ) || [];

    premiumMultiplier += luxuryAmenities.length * 0.1; // 10% per luxury amenity

    return basePrice * premiumMultiplier;
  }
}

/**
 * Booking calculation factory
 */
export class BookingCalculationFactory {
  private static strategies = new Map<string, typeof BookingCalculationStrategy>([
    ['standard', StandardPricingStrategy],
    ['dynamic', DynamicPricingStrategy],
    ['long-term', LongTermPricingStrategy],
    ['premium', PremiumPricingStrategy]
  ]);

  /**
   * Create calculation strategy
   */
  static createStrategy(type: string, config: CalculationConfig): BookingCalculationStrategy {
    const StrategyClass = this.strategies.get(type.toLowerCase());
    
    if (!StrategyClass) {
      throw new Error(`Unknown pricing strategy: ${type}`);
    }

    return new StrategyClass(config);
  }

  /**
   * Register custom strategy
   */
  static registerStrategy(name: string, strategyClass: typeof BookingCalculationStrategy): void {
    this.strategies.set(name.toLowerCase(), strategyClass);
  }

  /**
   * Get available strategies
   */
  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

/**
 * Utility functions
 */
export const BookingCalculationUtils = {
  /**
   * Calculate nights between dates
   */
  calculateNights(checkIn: Date, checkOut: Date): number {
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  },

  /**
   * Create date range
   */
  createDateRange(checkIn: Date, checkOut: Date): BookingDateRange {
    return {
      checkIn,
      checkOut,
      nights: this.calculateNights(checkIn, checkOut)
    };
  },

  /**
   * Format price
   */
  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Create calculation context
   */
  createContext(
    property: PropertyDetails,
    checkIn: Date,
    checkOut: Date,
    guests: GuestSelection,
    config: CalculationConfig,
    metadata?: Record<string, any>
  ): CalculationContext {
    return {
      property,
      dateRange: this.createDateRange(checkIn, checkOut),
      guests,
      config,
      metadata
    };
  }
};

// Export default configurations
export const DEFAULT_CALCULATION_CONFIGS = {
  standard: {
    taxRate: 0.12,
    includeTaxes: true,
    enableDynamicPricing: false
  },
  dynamic: {
    taxRate: 0.12,
    includeTaxes: true,
    enableDynamicPricing: true,
    weekendMultiplier: 1.2,
    seasonalMultipliers: {
      spring: 1.1,
      summer: 1.3,
      fall: 1.0,
      winter: 0.9
    }
  },
  longTerm: {
    taxRate: 0.10,
    includeTaxes: true,
    enableDynamicPricing: false,
    discountRules: [
      {
        type: 'weekly' as const,
        threshold: 7,
        discountPercent: 10,
        description: 'Weekly stay discount'
      },
      {
        type: 'monthly' as const,
        threshold: 28,
        discountPercent: 30,
        description: 'Monthly stay discount'
      }
    ]
  },
  premium: {
    taxRate: 0.15,
    includeTaxes: true,
    enableDynamicPricing: true,
    weekendMultiplier: 1.5
  }
};