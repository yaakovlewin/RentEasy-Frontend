'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { propertiesAPI, Property } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { PropertyCard } from '@/components/ui/property-card';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface SimilarPropertiesProps {
  currentProperty: Property;
  limit?: number;
  className?: string;
}

interface SimilarPropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: number) => void;
}

function SimilarPropertyCard({ property, onFavoriteToggle }: SimilarPropertyCardProps) {
  // Transform property data to match PropertyCard interface
  const transformedProperty = {
    ...property,
    id: property.id.toString(),
    price: property.pricePerNight,
    priceUnit: 'night' as const,
    guests: property.maxGuests,
    images: property.images || [],
  };

  const handleFavorite = () => {
    onFavoriteToggle?.(property.id);
  };

  const handleClick = () => {
    window.location.href = `/property/${property.id}`;
  };

  return (
    <PropertyCard
      property={transformedProperty}
      variant="compact"
      size="sm"
      features={{
        favorites: true,
        quickActions: false,
        carousel: false,
        badges: false,
        details: false,
        hostInfo: false,
        animations: true,
      }}
      actions={{
        onFavorite: handleFavorite,
        onClick: handleClick,
      }}
      className="hover:shadow-lg transition-all duration-200"
    />
  );
}

function SimilarPropertiesSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <div key={i} className='space-y-3'>
          <div className='w-full h-48 bg-gray-200 rounded-lg animate-pulse' />
          <div className='space-y-2'>
            <div className='h-4 bg-gray-200 rounded animate-pulse' />
            <div className='h-3 bg-gray-200 rounded animate-pulse w-2/3' />
            <div className='flex justify-between'>
              <div className='h-4 bg-gray-200 rounded animate-pulse w-1/3' />
              <div className='h-3 bg-gray-200 rounded animate-pulse w-1/4' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimilarProperties({
  currentProperty,
  limit = 6,
  className,
}: SimilarPropertiesProps) {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  const { loading, error, execute: executeSimilarSearch } = useAsyncOperation<Property[]>();

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        const result = await executeSimilarSearch(async () => {
          // Get the price from either pricePerNight or base_price, with fallback
          const basePrice = 'base_price' in currentProperty && typeof currentProperty.base_price === 'number' 
            ? currentProperty.base_price 
            : undefined;
          const propertyPrice = basePrice || currentProperty.pricePerNight || 0;
          
          // Get the max guests from either max_guests or maxGuests
          const maxGuestsAlt = 'max_guests' in currentProperty && typeof currentProperty.max_guests === 'number'
            ? currentProperty.max_guests
            : undefined;
          const guestCount = maxGuestsAlt || currentProperty.maxGuests;
          
          // Search for properties in the same location with similar criteria
          const searchParams = {
            location: currentProperty.location,
            minPrice: propertyPrice > 50 ? Math.max(0, propertyPrice - 50) : undefined,
            maxPrice: propertyPrice > 0 ? propertyPrice + 100 : undefined,
            bedrooms: currentProperty.bedrooms,
            guests: guestCount,
          };

          const response = await propertiesAPI.search(searchParams);

          // Filter out the current property and limit results
          const filtered = response.data.data
            .filter(property => property.id !== currentProperty.id)
            .slice(0, limit);

          // If we don't have enough similar properties, get more general ones
          if (filtered.length < limit) {
            const generalSearchParams = {
              location: currentProperty.location,
            };

            const generalResponse = await propertiesAPI.search(generalSearchParams);
            const additionalProperties = generalResponse.data.data
              .filter(
                property =>
                  property.id !== currentProperty.id &&
                  !filtered.some(existing => existing.id === property.id)
              )
              .slice(0, limit - filtered.length);

            return [...filtered, ...additionalProperties];
          }

          return filtered;
        });

        if (result) {
          setSimilarProperties(result);
        }
      } catch (error) {
        console.warn('Failed to fetch similar properties:', error);
      }
    };

    if (currentProperty?.id) {
      fetchSimilarProperties();
    }
  }, [
    currentProperty?.id,
    currentProperty?.location,
    currentProperty?.pricePerNight,
    currentProperty?.bedrooms,
    currentProperty?.maxGuests,
    limit,
    executeSimilarSearch,
  ]);

  const handleFavoriteToggle = (propertyId: number) => {
    // This would typically make an API call to toggle favorite status
    console.log('Toggle favorite for property:', propertyId);
    // You could integrate with a favorites API here
  };

  if (error) {
    return (
      <div className={className}>
        <div className='text-center py-8'>
          <p className='text-gray-500'>Unable to load similar properties</p>
          <Button
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Similar properties</h2>
          <div className='h-5 w-24 bg-gray-200 rounded animate-pulse' />
        </div>
        <SimilarPropertiesSkeleton />
      </div>
    );
  }

  if (similarProperties.length === 0) {
    return (
      <div className={className}>
        <h2 className='text-2xl font-bold mb-6'>Similar properties</h2>
        <div className='text-center py-8'>
          <p className='text-gray-500 mb-2'>No similar properties found</p>
          <p className='text-sm text-gray-400'>Try exploring other properties in this area</p>
          <Link href='/search'>
            <Button variant='outline' size='sm' className='mt-4'>
              Browse all properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>Similar properties</h2>
        <Link href={`/search?location=${encodeURIComponent(currentProperty.location)}`}>
          <Button variant='outline' size='sm'>
            View all in {currentProperty.location}
          </Button>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {similarProperties.map(property => (
          <SimilarPropertyCard
            key={property.id}
            property={property}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>

      {similarProperties.length >= limit && (
        <div className='text-center mt-8'>
          <Link href={`/search?location=${encodeURIComponent(currentProperty.location)}`}>
            <Button variant='outline'>See more properties in {currentProperty.location}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
