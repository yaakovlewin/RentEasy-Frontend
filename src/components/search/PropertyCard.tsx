/**
 * PropertyCard Component
 *
 * Displays a property card in either grid or list view mode.
 * Features property image, details, pricing, and favorite toggle.
 */

import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Users, Bed, Bath } from 'lucide-react';

import { type Property } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/RatingDisplay';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn } from '@/lib/utils';
import { mapPropertyToDisplay } from '@/lib/utils/propertyTransformers';
import { withErrorBoundary } from '@/components/error-boundaries';
import { captureError, ErrorSeverity, ErrorCategory } from '@/lib/error-monitoring';

export interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
  onToggleFavorite?: (propertyId: string) => void;
}

export const PropertyCard = memo(({ property, viewMode = 'grid', onToggleFavorite }: PropertyCardProps) => {
  const displayProperty = useMemo(() => mapPropertyToDisplay(property), [property]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleFavorite?.(displayProperty.id);
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/property/${property.id}`}>
        <Card className='group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden'>
          <div className='flex'>
            <div className='relative w-80 h-60 flex-shrink-0 overflow-hidden'>
              <Image
                src={displayProperty.image}
                alt={displayProperty.title}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                sizes='320px'
              />
              <button
                onClick={handleFavoriteClick}
                className='absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors'
                aria-label={displayProperty.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={cn(
                    'w-4 h-4',
                    displayProperty.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  )}
                />
              </button>
              {displayProperty.isInstantBook && (
                <div className='absolute top-3 left-3 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full'>
                  Instant Book
                </div>
              )}
            </div>

            <CardContent className='flex-1 p-6'>
              <div className='flex justify-between items-start mb-4'>
                <div className='flex-1'>
                  <h3 className='text-xl font-semibold mb-2 group-hover:text-primary transition-colors'>
                    {displayProperty.title}
                  </h3>
                  <p className='text-gray-600 flex items-center mb-3'>
                    <MapPin className='w-4 h-4 mr-1' />
                    {displayProperty.location}
                  </p>
                </div>
                <RatingDisplay
                  rating={displayProperty.rating}
                  reviews={displayProperty.reviews}
                  size="md"
                  showReviewCount={true}
                />
              </div>

              <div className='flex items-center space-x-6 mb-4 text-gray-600'>
                <span className='flex items-center'>
                  <Users className='w-4 h-4 mr-1' />
                  {displayProperty.guests} guests
                </span>
                <span className='flex items-center'>
                  <Bed className='w-4 h-4 mr-1' />
                  {displayProperty.beds} beds
                </span>
                <span className='flex items-center'>
                  <Bath className='w-4 h-4 mr-1' />
                  {displayProperty.baths} baths
                </span>
              </div>

              <p className='text-gray-600 mb-4 line-clamp-2'>{displayProperty.description}</p>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <div className='relative w-8 h-8 rounded-full overflow-hidden'>
                    <Image
                      src={displayProperty.hostImage}
                      alt={displayProperty.hostName}
                      fill
                      className='object-cover'
                      sizes='32px'
                    />
                  </div>
                  <span className='text-sm text-gray-600'>Hosted by {displayProperty.hostName}</span>
                </div>
                <PriceDisplay
                  price={displayProperty.price}
                  size="md"
                  align="right"
                />
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/property/${property.id}`}>
      <Card className='group cursor-pointer hover-lift border-0 overflow-hidden bg-white shadow-lg animate-slide-up'>
        <div className='relative h-64 overflow-hidden'>
          <Image
            src={displayProperty.image}
            alt={displayProperty.title}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110'
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          />

          <button
            onClick={handleFavoriteClick}
            className='absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg'
            aria-label={displayProperty.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                displayProperty.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              )}
            />
          </button>

          {displayProperty.isInstantBook && (
            <div className='absolute top-4 left-4 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-lg'>
              Instant Book
            </div>
          )}

          <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>

        <CardContent className='p-6'>
          <div className='flex items-start justify-between mb-3'>
            <h3 className='font-bold text-lg line-clamp-2 flex-1 pr-2 group-hover:text-primary transition-colors'>
              {displayProperty.title}
            </h3>
            <RatingDisplay
              rating={displayProperty.rating}
              size="sm"
              variant="badge"
              showReviewCount={false}
            />
          </div>

          <p className='text-gray-600 text-sm mb-4 flex items-center'>
            <MapPin className='w-4 h-4 mr-2 text-gray-400' />
            {displayProperty.location}
          </p>

          <div className='flex items-center space-x-6 mb-4 text-sm text-gray-600'>
            <span className='flex items-center font-medium'>
              <Users className='w-4 h-4 mr-1.5 text-gray-400' />
              {displayProperty.guests} guests
            </span>
            <span className='flex items-center font-medium'>
              <Bed className='w-4 h-4 mr-1.5 text-gray-400' />
              {displayProperty.beds} beds
            </span>
            <span className='flex items-center font-medium'>
              <Bath className='w-4 h-4 mr-1.5 text-gray-400' />
              {displayProperty.baths} baths
            </span>
          </div>

          <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
            <PriceDisplay
              price={displayProperty.price}
              size="md"
              align="left"
            />
            <div className='flex items-center text-sm text-gray-500'>
              <span>{displayProperty.reviews} reviews</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

PropertyCard.displayName = 'PropertyCard';

// Wrap with error boundary HOC for enterprise-grade error handling
export default withErrorBoundary(PropertyCard, {
  onError: (error, errorInfo) => {
    captureError(error, ErrorSeverity.MEDIUM, ErrorCategory.COMPONENT, {
      componentName: 'PropertyCard',
      errorInfo: errorInfo.componentStack,
    });
  },
});
