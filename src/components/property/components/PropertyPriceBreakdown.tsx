'use client';

/**
 * @fileoverview PropertyPriceBreakdown Component
 * 
 * Enterprise-grade price breakdown component extracted from monolithic PropertyDetailsPage.
 * Displays detailed booking cost breakdown with calculations and formatting.
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { BookingCalculations } from '../types';

interface PropertyPriceBreakdownProps {
  /** Booking calculations from useBookingCalculations hook */
  calculations: BookingCalculations;
  /** Whether the breakdown is visible */
  isVisible?: boolean;
  /** Optional CSS classes */
  className?: string;
  /** Show detailed breakdown or summary only */
  showDetailed?: boolean;
  /** Currency symbol */
  currency?: string;
}

/**
 * PropertyPriceBreakdown - Extracted price breakdown component
 * 
 * Features:
 * - Detailed cost breakdown display
 * - Conditional rendering based on availability
 * - Responsive design with proper spacing
 * - Accessibility with semantic markup
 * - Memoized for performance optimization
 */
export const PropertyPriceBreakdown = memo(function PropertyPriceBreakdown({
  calculations,
  isVisible = true,
  className,
  showDetailed = true,
  currency = '$',
}: PropertyPriceBreakdownProps) {
  // Don't render if not visible or calculations are invalid
  if (!isVisible || !calculations.isValid || calculations.nights === 0) {
    return null;
  }

  const {
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total,
    pricePerNight,
  } = calculations;

  // Summary only mode
  if (!showDetailed) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{currency}{total.toFixed(0)}</span>
        </div>
        {nights > 0 && (
          <div className="text-sm text-gray-600">
            {currency}{pricePerNight.toFixed(0)} x {nights} night{nights > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 border-t border-gray-200 pt-4', className)}>
      {/* Subtotal - Nightly Rate */}
      <div className="flex justify-between">
        <span className="text-gray-700">
          {currency}{pricePerNight.toFixed(0)} x {nights} night{nights > 1 ? 's' : ''}
        </span>
        <span className="font-medium">{currency}{subtotal.toFixed(0)}</span>
      </div>

      {/* Cleaning Fee */}
      {cleaningFee > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-700">Cleaning fee</span>
          <span className="font-medium">{currency}{cleaningFee.toFixed(0)}</span>
        </div>
      )}

      {/* Service Fee */}
      {serviceFee > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-700">RentEasy service fee</span>
          <span className="font-medium">{currency}{serviceFee.toFixed(0)}</span>
        </div>
      )}

      {/* Taxes */}
      {taxes > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-700">Taxes and fees</span>
          <span className="font-medium">{currency}{taxes.toFixed(0)}</span>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3">
        <span>Total</span>
        <span>{currency}{total.toFixed(0)}</span>
      </div>

      {/* Additional Information */}
      <div className="text-xs text-gray-500 pt-2">
        <p>Prices are estimates and may vary based on final booking details.</p>
      </div>
    </div>
  );
});

PropertyPriceBreakdown.displayName = 'PropertyPriceBreakdown';

export default PropertyPriceBreakdown;