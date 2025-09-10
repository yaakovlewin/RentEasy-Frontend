import React from 'react';

import { Heart, Share, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import type { PropertyCardHeaderProps } from '../types';

export function PropertyCardHeader({
  property,
  variant,
  showBadges = true,
  actions,
  interaction,
  loading,
  className,
}: PropertyCardHeaderProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions?.onFavorite?.();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions?.onShare?.();
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    actions?.onSelect?.(e.target.checked);
  };

  const isFavorited = interaction?.isFavorited || false;
  const favoriteDisabled = interaction?.favoriteDisabled || loading?.favoriteLoading;
  const shareDisabled = loading?.shareLoading;

  return (
    <div className={cn('flex items-start justify-between', className)}>
      {/* Left side - Badges */}
      <div className="flex items-start space-x-2">
        {showBadges && (
          <div className="flex flex-col space-y-1">
            {/* Status badge */}
            {property.status && property.status !== 'available' && (
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
                  {
                    'bg-green-100 text-green-800': property.status === 'available',
                    'bg-red-100 text-red-800': property.status === 'unavailable',
                    'bg-yellow-100 text-yellow-800': property.status === 'pending',
                    'bg-blue-100 text-blue-800': property.status === 'booked',
                  }
                )}
              >
                {property.status}
              </span>
            )}

            {/* Featured badge */}
            {property.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Featured
              </span>
            )}

            {/* New listing badge */}
            {property.isNewListing && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                New
              </span>
            )}

            {/* Discount badge */}
            {property.hasDiscount && property.discountPercent && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                -{property.discountPercent}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-start space-x-1">
        {/* Selection checkbox */}
        {actions?.onSelect && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              onChange={handleSelectChange}
              onClick={(e) => e.stopPropagation()}
            />
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200',
                'bg-white border-gray-300 hover:border-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              <Check className="w-3 h-3 text-white opacity-0" />
            </div>
          </label>
        )}

        {/* Share button */}
        {actions?.onShare && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'p-1.5 h-auto rounded-full',
              'bg-white/90 hover:bg-white shadow-sm',
              'text-gray-600 hover:text-gray-900'
            )}
            onClick={handleShareClick}
            disabled={shareDisabled}
            aria-label={`Share ${property.title}`}
          >
            {shareDisabled ? (
              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Share className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Favorite button */}
        {actions?.onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'p-1.5 h-auto rounded-full',
              'bg-white/90 hover:bg-white shadow-sm',
              'transition-colors duration-200'
            )}
            onClick={handleFavoriteClick}
            disabled={favoriteDisabled}
            aria-label={isFavorited ? `Remove ${property.title} from favorites` : `Add ${property.title} to favorites`}
          >
            {loading?.favoriteLoading ? (
              <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors duration-200',
                  isFavorited
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                )}
              />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}