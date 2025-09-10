'use client';

/**
 * @fileoverview PropertyHeader Component
 * 
 * Enterprise-grade property header component extracted from monolithic PropertyDetailsPage.
 * Features property title, rating, location, and action buttons (share, save).
 */

import React, { memo, useCallback, useState } from 'react';
import { Star, MapPin, Share2, Heart, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PropertyDetails } from '../types';

interface PropertyHeaderProps {
  /** Property details */
  property: PropertyDetails;
  /** Optional CSS classes */
  className?: string;
  /** Share button handler */
  onShare?: () => void;
  /** Save/favorite toggle handler */
  onToggleFavorite?: () => void;
  /** Loading state for favorite action */
  isFavoriteLoading?: boolean;
  /** Custom share URL override */
  shareUrl?: string;
  /** Show action buttons */
  showActions?: boolean;
  /** Compact layout */
  compact?: boolean;
}

/**
 * PropertyHeader - Extracted property header component
 * 
 * Features:
 * - Property title with responsive typography
 * - Star rating with review count
 * - Location display with map pin icon
 * - Share functionality with native Web Share API fallback
 * - Favorite/save functionality with visual feedback
 * - Accessibility support with proper ARIA attributes
 * - Responsive design with mobile optimization
 * - Loading states for async actions
 */
export const PropertyHeader = memo(function PropertyHeader({
  property,
  className,
  onShare,
  onToggleFavorite,
  isFavoriteLoading = false,
  shareUrl,
  showActions = true,
  compact = false,
}: PropertyHeaderProps) {
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  /**
   * Handle share functionality with native Web Share API fallback
   */
  const handleShare = useCallback(async () => {
    setIsShareLoading(true);
    
    try {
      const url = shareUrl || window.location.href;
      const shareData = {
        title: property.title,
        text: `Check out this amazing property: ${property.title}`,
        url: url,
      };

      // Use native Web Share API if available
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }

      onShare?.();
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to clipboard on error
      try {
        const url = shareUrl || window.location.href;
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
      }
    } finally {
      setIsShareLoading(false);
    }
  }, [shareUrl, property.title, onShare]);

  /**
   * Handle favorite toggle
   */
  const handleToggleFavorite = useCallback(() => {
    if (!isFavoriteLoading) {
      onToggleFavorite?.();
    }
  }, [isFavoriteLoading, onToggleFavorite]);

  return (
    <div className={cn(
      'flex items-start justify-between mb-6',
      compact && 'mb-4',
      className
    )}>
      {/* Property Information */}
      <div className="flex-1 min-w-0">
        {/* Property Title */}
        <h1 className={cn(
          'font-bold mb-2 text-gray-900',
          compact ? 'text-2xl' : 'text-3xl'
        )}>
          {property.title}
        </h1>

        {/* Rating and Location */}
        <div className={cn(
          'flex items-center text-gray-600',
          compact ? 'space-x-3 text-sm' : 'space-x-4'
        )}>
          {/* Rating */}
          <div 
            className="flex items-center space-x-1"
            aria-label={`Rating: ${property.rating} out of 5 stars, ${property.reviews} reviews`}
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{property.rating}</span>
            <span>({property.reviews} review{property.reviews !== 1 ? 's' : ''})</span>
          </div>

          {/* Location */}
          <div 
            className="flex items-center min-w-0"
            aria-label={`Location: ${property.location}`}
          >
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center space-x-3 ml-4">
          {/* Share Button */}
          <Button 
            variant="ghost" 
            size={compact ? "sm" : "sm"}
            onClick={handleShare}
            disabled={isShareLoading}
            aria-label="Share property"
          >
            {shareSuccess ? (
              <Check className="w-4 h-4 mr-2" />
            ) : isShareLoading ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            {shareSuccess ? 'Copied!' : 'Share'}
          </Button>

          {/* Save/Favorite Button */}
          <Button 
            variant="ghost" 
            size={compact ? "sm" : "sm"}
            onClick={handleToggleFavorite}
            disabled={isFavoriteLoading}
            aria-label={property.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavoriteLoading ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
            ) : (
              <Heart
                className={cn(
                  'w-4 h-4 mr-2 transition-colors',
                  property.isFavorite 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600 hover:text-red-500'
                )}
              />
            )}
            {property.isFavorite ? 'Saved' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
});

PropertyHeader.displayName = 'PropertyHeader';

export default PropertyHeader;