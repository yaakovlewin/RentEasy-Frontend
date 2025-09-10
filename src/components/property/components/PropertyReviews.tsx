'use client';

/**
 * @fileoverview PropertyReviews Component
 * 
 * Enterprise-grade reviews display component extracted from monolithic PropertyDetailsPage.
 * Features expandable reviews list with user avatars, ratings, and proper state management.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionVisibility } from '../hooks';
import type { PropertyReview } from '../types';

interface PropertyReviewsProps {
  /** Array of reviews */
  reviews: PropertyReview[];
  /** Overall property rating */
  rating?: number;
  /** Total review count for display */
  totalReviewCount?: number;
  /** Optional CSS classes */
  className?: string;
  /** Number of reviews to show initially */
  initialDisplayCount?: number;
  /** Custom title for the section */
  title?: string;
  /** Enable grid layout */
  useGridLayout?: boolean;
}

/**
 * Individual review item component
 */
const ReviewItem = memo(function ReviewItem({ 
  review 
}: { 
  review: PropertyReview 
}) {
  return (
    <div className="space-y-2">
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          {review.userImage ? (
            <Image
              src={review.userImage}
              alt={`${review.userName}'s profile`}
              fill
              className="object-cover"
              sizes="40px"
              onError={(e) => {
                // Fallback to user icon on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">{review.userName}</div>
          <div className="text-sm text-gray-600">{review.date}</div>
        </div>
      </div>

      {/* Rating Stars */}
      <div className="flex items-center" aria-label={`Rating: ${review.rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-3 h-3',
              i < review.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
        <span className="sr-only">{review.rating} out of 5 stars</span>
      </div>

      {/* Review Comment */}
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
});

/**
 * PropertyReviews - Extracted reviews component
 * 
 * Features:
 * - Expandable reviews list with show/hide toggle
 * - User avatars with fallback handling
 * - Star rating display for each review
 * - Overall rating and count display
 * - Responsive grid layout
 * - Accessibility support with proper ARIA attributes
 * - State persistence with useContentVisibility hook
 */
export const PropertyReviews = memo(function PropertyReviews({
  reviews,
  rating,
  totalReviewCount,
  className,
  initialDisplayCount = 6,
  title,
  useGridLayout = true,
}: PropertyReviewsProps) {
  const { isVisible, toggle } = useSectionVisibility(false);

  // Don't render if no reviews
  if (!reviews || reviews.length === 0) {
    return (
      <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
        {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-gray-400 text-sm">Be the first to review this property</p>
        </div>
      </div>
    );
  }

  const shouldShowToggle = reviews.length > initialDisplayCount;
  const displayedReviews = isVisible || !shouldShowToggle 
    ? reviews 
    : reviews.slice(0, initialDisplayCount);

  // Generate title if not provided
  const sectionTitle = title || (rating && totalReviewCount 
    ? `${rating} · ${totalReviewCount} review${totalReviewCount > 1 ? 's' : ''}`
    : 'Reviews');

  return (
    <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
      {/* Section Header */}
      <div className="flex items-center space-x-4 mb-6">
        {rating && (
          <Star 
            className="w-6 h-6 fill-yellow-400 text-yellow-400" 
            aria-hidden="true"
          />
        )}
        <h3 className="text-xl font-semibold">{sectionTitle}</h3>
      </div>

      {/* Reviews Grid */}
      <div 
        className={cn(
          useGridLayout 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
            : 'space-y-6'
        )}
        role="list"
        aria-label="Customer reviews"
      >
        {displayedReviews.map((review) => (
          <div key={review.id} role="listitem">
            <ReviewItem review={review} />
          </div>
        ))}
      </div>

      {/* Show More/Less Toggle */}
      {shouldShowToggle && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={toggle}
          aria-expanded={isVisible}
          aria-controls="reviews-list"
        >
          {isVisible 
            ? 'Show less reviews' 
            : `Show all ${totalReviewCount || reviews.length} reviews`}
        </Button>
      )}

      {/* Hidden content for screen readers */}
      <div 
        id="reviews-list" 
        className="sr-only"
        aria-live="polite"
      >
        {isVisible 
          ? `Showing all ${reviews.length} reviews`
          : `Showing ${Math.min(initialDisplayCount, reviews.length)} of ${reviews.length} reviews`
        }
      </div>
    </div>
  );
});

PropertyReviews.displayName = 'PropertyReviews';

export default PropertyReviews;