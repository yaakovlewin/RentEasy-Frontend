import React from 'react';

import { Star, MessageCircle, Calendar, Clock } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { PropertyCardFooterProps } from '../types';

export function PropertyCardFooter({
  property,
  variant,
  showRating = true,
  showHost = false,
  showTimestamp = false,
  className,
}: PropertyCardFooterProps) {
  // Format timestamp helper
  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Format rating display
  const formatRating = (rating?: number) => {
    if (!rating) return 'New';
    return rating.toFixed(1);
  };

  // Get review text
  const getReviewText = (count?: number) => {
    if (!count) return 'No reviews';
    if (count === 1) return '1 review';
    return `${count} reviews`;
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Left side - Rating and reviews */}
      <div className="flex items-center space-x-3">
        {showRating && (
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900">
              {formatRating(property.rating)}
            </span>
            {property.reviewCount && property.reviewCount > 0 && (
              <>
                <span className="text-sm text-gray-500">·</span>
                <span className="text-sm text-gray-600">
                  {getReviewText(property.reviewCount)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Host info (compact format) */}
        {showHost && property.host && !showRating && (
          <div className="flex items-center space-x-1">
            {property.host.avatar && (
              <div className="w-4 h-4 relative rounded-full overflow-hidden bg-gray-100">
                <img
                  src={property.host.avatar}
                  alt={property.host.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="text-sm text-gray-600 truncate max-w-24">
              {property.host.name}
            </span>
            {property.host.verified && (
              <div className="w-3 h-3 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                ✓
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side - Timestamps and metadata */}
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        {/* Last updated (for management) */}
        {showTimestamp && property.updatedAt && variant === 'management' && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Updated {formatTimestamp(property.updatedAt)}</span>
          </div>
        )}

        {/* Created date (for management) */}
        {showTimestamp && property.createdAt && variant === 'management' && !property.updatedAt && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Listed {formatTimestamp(property.createdAt)}</span>
          </div>
        )}

        {/* Saved date (for favorites) */}
        {showTimestamp && property.savedAt && variant === 'favorites' && (
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Saved {formatTimestamp(property.savedAt)}</span>
          </div>
        )}

        {/* Message/inquiry indicator */}
        {variant === 'management' && (
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>0 messages</span>
          </div>
        )}
      </div>
    </div>
  );
}