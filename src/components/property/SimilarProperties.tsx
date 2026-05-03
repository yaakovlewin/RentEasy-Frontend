'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { propertiesAPI, Property } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CardSkeleton, CoreSkeleton } from '@/components/ui/loading/skeletons';
import { PropertyCard } from '@/components/ui/property-card/PropertyCard';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface SimilarPropertiesProps {
  currentProperty: Property;
  limit?: number;
  className?: string;
}

interface SimilarPropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string) => void;
}

interface SearchParams {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  guests?: number;
}

const DEFAULT_LIMIT = 6;
const PRICE_VARIANCE_LOW = 50;
const PRICE_VARIANCE_HIGH = 100;

const extractPropertyPrice = (property: Property): number => {
  const basePrice =
    'base_price' in property && typeof property.base_price === 'number'
      ? property.base_price
      : undefined;
  return basePrice ?? property.pricePerNight ?? 0;
};

const extractMaxGuests = (property: Property): number | undefined => {
  const maxGuestsAlt =
    'max_guests' in property && typeof property.max_guests === 'number'
      ? property.max_guests
      : undefined;
  return maxGuestsAlt ?? property.maxGuests;
};

const createPriceRange = (price: number): { minPrice?: number; maxPrice?: number } => ({
  minPrice: price > PRICE_VARIANCE_LOW ? Math.max(0, price - PRICE_VARIANCE_LOW) : undefined,
  maxPrice: price > 0 ? price + PRICE_VARIANCE_HIGH : undefined,
});

const buildSearchParams = (property: Property): SearchParams => {
  const price = extractPropertyPrice(property);
  const guests = extractMaxGuests(property);

  return {
    location: property.location,
    ...createPriceRange(price),
    bedrooms: property.bedrooms,
    guests,
  };
};

const buildLocationOnlySearchParams = (property: Property): SearchParams => ({
  location: property.location,
});

const excludeCurrentProperty = (properties: Property[], currentId: string): Property[] =>
  properties.filter((property) => property.id !== currentId);

const excludeExistingProperties = (
  properties: Property[],
  existingProperties: Property[]
): Property[] =>
  properties.filter(
    (property) => !existingProperties.some((existing) => existing.id === property.id)
  );

const transformPropertyForCard = (property: Property) => ({
  ...property,
  price: property.pricePerNight,
  priceUnit: 'night' as const,
  guests: property.maxGuests,
  images: property.images || [],
});

const createPropertyCardFeatures = () => ({
  favorites: true,
  quickActions: false,
  carousel: false,
  badges: false,
  details: false,
  hostInfo: false,
  animations: true,
});

function SimilarPropertyCard({ property, onFavoriteToggle }: SimilarPropertyCardProps) {
  const handleFavorite = () => onFavoriteToggle?.(property.id);
  const handleClick = () => {
    window.location.href = `/property/${property.id}`;
  };

  return (
    <PropertyCard
      property={transformPropertyForCard(property)}
      variant="compact"
      size="sm"
      features={createPropertyCardFeatures()}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: DEFAULT_LIMIT }, (_, i) => (
        <CardSkeleton key={i} variant="property" shimmer={true} />
      ))}
    </div>
  );
}

function ErrorState({ onRetry, className }: { onRetry: () => void; className?: string }) {
  return (
    <div className={className}>
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load similar properties</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function LoadingState({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Similar properties</h2>
        <CoreSkeleton height="h-5" width="w-24" variant="rounded" shimmer={true} />
      </div>
      <SimilarPropertiesSkeleton />
    </div>
  );
}

function EmptyState({ className }: { className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Similar properties</h2>
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">No similar properties found</p>
        <p className="text-sm text-gray-400">Try exploring other properties in this area</p>
        <Link href="/search">
          <Button variant="outline" size="sm" className="mt-4">
            Browse all properties
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface PropertiesHeaderProps {
  location: string;
}

function PropertiesHeader({ location }: PropertiesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Similar properties</h2>
      <Link href={`/search?location=${encodeURIComponent(location)}`}>
        <Button variant="outline" size="sm">
          View all in {location}
        </Button>
      </Link>
    </div>
  );
}

interface PropertiesFooterProps {
  location: string;
}

function PropertiesFooter({ location }: PropertiesFooterProps) {
  return (
    <div className="text-center mt-8">
      <Link href={`/search?location=${encodeURIComponent(location)}`}>
        <Button variant="outline">See more properties in {location}</Button>
      </Link>
    </div>
  );
}

const useSimilarProperties = (currentProperty: Property, limit: number) => {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const { loading, error, execute } = useAsyncOperation<Property[]>();

  useEffect(() => {
    if (!currentProperty?.id) return;

    const fetchSimilarProperties = async () => {
      try {
        const result = await execute(async () => {
          const searchParams = buildSearchParams(currentProperty);
          const response = await propertiesAPI.search(searchParams);

          const filtered = excludeCurrentProperty(response.data, currentProperty.id).slice(
            0,
            limit
          );

          if (filtered.length >= limit) {
            return filtered;
          }

          const generalSearchParams = buildLocationOnlySearchParams(currentProperty);
          const generalResponse = await propertiesAPI.search(generalSearchParams);

          const additional = excludeCurrentProperty(
            generalResponse.data,
            currentProperty.id
          );
          const uniqueAdditional = excludeExistingProperties(additional, filtered).slice(
            0,
            limit - filtered.length
          );

          return [...filtered, ...uniqueAdditional];
        });

        if (result) {
          setSimilarProperties(result);
        }
      } catch (err) {
        console.warn('Failed to fetch similar properties:', err);
      }
    };

    fetchSimilarProperties();
  }, [currentProperty, limit, execute]);

  return { similarProperties, loading, error };
};

export function SimilarProperties({
  currentProperty,
  limit = DEFAULT_LIMIT,
  className,
}: SimilarPropertiesProps) {
  const { similarProperties, loading, error } = useSimilarProperties(currentProperty, limit);

  const handleFavoriteToggle = (propertyId: string) => {
    console.log('Toggle favorite for property:', propertyId);
  };

  const handleRetry = () => window.location.reload();

  if (error) {
    return <ErrorState className={className} onRetry={handleRetry} />;
  }

  if (loading) {
    return <LoadingState className={className} />;
  }

  if (similarProperties.length === 0) {
    return <EmptyState className={className} />;
  }

  return (
    <div className={className}>
      <PropertiesHeader location={currentProperty.location} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <SimilarPropertyCard
            key={property.id}
            property={property}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>

      {similarProperties.length >= limit && (
        <PropertiesFooter location={currentProperty.location} />
      )}
    </div>
  );
}
