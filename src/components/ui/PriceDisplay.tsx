'use client';

/**
 * @fileoverview PriceDisplay Component
 *
 * Reusable component for displaying property prices with optional discount information.
 * Extracted from multiple components to eliminate code duplication.
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  /** Price per night */
  price: number;
  /** Original price (for showing discounts) */
  originalPrice?: number;
  /** Discount percentage */
  discount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show "/night" suffix */
  showSuffix?: boolean;
  /** Custom currency symbol */
  currencySymbol?: string;
  /** Vertical layout instead of horizontal */
  vertical?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Align text */
  align?: 'left' | 'center' | 'right';
}

/**
 * PriceDisplay - Consistent price display component
 *
 * Features:
 * - Price display with /night suffix
 * - Optional original price and discount badge
 * - Multiple size variants
 * - Horizontal or vertical layouts
 * - Performance optimized with memoization
 */
export const PriceDisplay = memo(function PriceDisplay({
  price,
  originalPrice,
  discount,
  size = 'md',
  showSuffix = true,
  currencySymbol = '$',
  vertical = false,
  className,
  align = 'left',
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: {
      price: 'text-lg font-bold',
      suffix: 'text-xs',
      original: 'text-xs',
      discount: 'text-xs',
    },
    md: {
      price: 'text-2xl font-bold',
      suffix: 'text-sm',
      original: 'text-sm',
      discount: 'text-xs',
    },
    lg: {
      price: 'text-3xl font-bold',
      suffix: 'text-base',
      original: 'text-base',
      discount: 'text-sm',
    },
    xl: {
      price: 'text-4xl font-bold',
      suffix: 'text-lg',
      original: 'text-lg',
      discount: 'text-base',
    },
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const classes = sizeClasses[size];
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={cn(
      vertical ? 'flex flex-col' : 'flex items-baseline space-x-2',
      alignClasses[align],
      className
    )}>
      {/* Current Price */}
      <div className="flex items-baseline">
        <span className={cn(classes.price, 'text-gray-900')}>
          {currencySymbol}{price}
        </span>
        {showSuffix && (
          <span className={cn(classes.suffix, 'text-gray-600 ml-1 font-medium')}>
            /night
          </span>
        )}
      </div>

      {/* Original Price & Discount */}
      {hasDiscount && (
        <div className={cn(
          'flex',
          vertical ? 'flex-col' : 'items-center space-x-2'
        )}>
          <span className={cn(classes.original, 'text-gray-400 line-through')}>
            {currencySymbol}{originalPrice}
          </span>
          {discount && (
            <span className={cn(classes.discount, 'text-green-600 font-semibold')}>
              Save {discount}%
            </span>
          )}
        </div>
      )}
    </div>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

export default PriceDisplay;
