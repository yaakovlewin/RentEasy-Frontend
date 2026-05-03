'use client';

/**
 * @fileoverview RatingDisplay Component
 *
 * Reusable component for displaying property ratings with star icon and review counts.
 * Extracted from multiple components to eliminate code duplication.
 */

import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingDisplayProps {
  /** Rating value (0-5) */
  rating: number;
  /** Number of reviews (optional) */
  reviews?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Style variant */
  variant?: 'default' | 'badge' | 'compact';
  /** Show review count */
  showReviewCount?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Custom aria-label */
  ariaLabel?: string;
}

/**
 * RatingDisplay - Consistent rating display component
 *
 * Features:
 * - Star icon with rating value
 * - Optional review count
 * - Multiple size and style variants
 * - Accessible with proper ARIA labels
 * - Performance optimized with memoization
 */
export const RatingDisplay = memo(function RatingDisplay({
  rating,
  reviews,
  size = 'md',
  variant = 'default',
  showReviewCount = true,
  className,
  ariaLabel,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: {
      icon: 'w-3 h-3',
      rating: 'text-xs',
      reviews: 'text-xs',
    },
    md: {
      icon: 'w-4 h-4',
      rating: 'text-sm font-medium',
      reviews: 'text-sm text-gray-500',
    },
    lg: {
      icon: 'w-5 h-5',
      rating: 'text-base font-semibold',
      reviews: 'text-base text-gray-600',
    },
  };

  const variantClasses = {
    default: 'flex items-center space-x-1',
    badge: 'flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full',
    compact: 'flex items-center space-x-1 flex-shrink-0',
  };

  const defaultAriaLabel = ariaLabel ||
    `Rating: ${rating} out of 5 stars${reviews ? `, ${reviews} review${reviews !== 1 ? 's' : ''}` : ''}`;

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(variantClasses[variant], className)}
      aria-label={defaultAriaLabel}
    >
      <Star className={cn(classes.icon, 'fill-yellow-400 text-yellow-400')} aria-hidden="true" />
      <span className={classes.rating}>{rating}</span>
      {showReviewCount && reviews !== undefined && (
        <span className={classes.reviews}>({reviews})</span>
      )}
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

export default RatingDisplay;
