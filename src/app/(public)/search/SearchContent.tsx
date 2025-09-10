'use client';

import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Bath,
  Bed,
  Car,
  Coffee,
  Filter,
  Grid3X3,
  Heart,
  LayoutList,
  MapPin,
  Waves, // Using Waves instead of Pool as Pool doesn't exist
  Star,
  Users,
  Wifi,
} from 'lucide-react';

import { propertiesAPI, type Property } from '@/lib/api';
// import { getErrorMessage } from '@/lib/errorHandling'; // Commented out - module not found
import { cn } from '@/lib/utils';

import { Header } from '@/components/layout/Header';
import { SearchBar, SearchData } from '@/components/search';
import { PropertyFilters } from '@/components/search/PropertyFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingCard } from '@/components/ui/LoadingSpinner';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

// Enhanced display property interface that includes computed fields
interface DisplayProperty extends Property {
  price: number;
  guests: number;
  beds: number;
  baths: number;
  rating: number;
  reviews: number;
  image: string;
  hostName: string;
  hostImage: string;
  isFavorite: boolean;
  isInstantBook: boolean;
}

type SortOption = 'price-low' | 'price-high' | 'rating' | 'reviews';

export default function SearchContent() {
  const urlParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Use the async operation hook for better error handling
  const {
    data: searchData,
    loading: isLoading,
    error: searchError,
    execute: executeSearch,
  } = useAsyncOperation<Property[]>();
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    propertyTypes: [] as string[],
    amenities: [] as string[],
    rooms: {
      bedrooms: 0,
      bathrooms: 0,
    },
    instantBook: false,
    rating: 0,
  });

  const fetchProperties = useCallback(async () => {
    // Helper function to convert ISO datetime to YYYY-MM-DD format
    const formatDateForBackend = (dateString: string) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
      } catch {
        return dateString; // Return as-is if already in correct format
      }
    };

    // Build search parameters from URL params
    const searchParams = {
      location: urlParams.get('location') || '',
      checkIn: formatDateForBackend(urlParams.get('checkIn') || ''),
      checkOut: formatDateForBackend(urlParams.get('checkOut') || ''),
      guests: urlParams.get('adults') ? parseInt(urlParams.get('adults')!) : undefined,
      minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
      bedrooms: filters.rooms.bedrooms > 0 ? filters.rooms.bedrooms : undefined,
      bathrooms: filters.rooms.bathrooms > 0 ? filters.rooms.bathrooms : undefined,
    };

    const result = await executeSearch(async () => {
      const response = await propertiesAPI.search(searchParams);
      // The API returns PaginatedResponse<Property> with data and pagination
      return response;
    });

    if (result) {
      // Extract the properties array from the paginated response
      const propertiesArray = result.data || [];
      setProperties(propertiesArray);
      setFilteredProperties(propertiesArray);
    }
  }, [urlParams, filters.priceRange, filters.rooms, executeSearch]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // PERFORMANCE OPTIMIZATION: Memoized sorting to prevent unnecessary recalculations
  const sortedProperties = useMemo(() => {
    if (!properties.length) return [];
    
    return [...properties].sort((a, b) => {
      const aDisplay = mapPropertyForDisplay(a);
      const bDisplay = mapPropertyForDisplay(b);
      switch (sortBy) {
        case 'price-low':
          return aDisplay.price - bDisplay.price;
        case 'price-high':
          return bDisplay.price - aDisplay.price;
        case 'rating':
          return bDisplay.rating - aDisplay.rating;
        case 'reviews':
          return bDisplay.reviews - aDisplay.reviews;
        default:
          return 0;
      }
    });
  }, [properties, sortBy]);

  // Update filteredProperties when sortedProperties changes
  useEffect(() => {
    setFilteredProperties(sortedProperties);
  }, [sortedProperties]);

  const handleSearch = (searchData: SearchData) => {
    // TODO: Implement search functionality
  };

  // PERFORMANCE OPTIMIZATION: Memoized favorite toggle to prevent unnecessary re-renders
  const toggleFavorite = useCallback((propertyId: string) => {
    setFilteredProperties(prev =>
      prev.map(property =>
        property.id === propertyId ? { ...property, isFavorite: !property.isFavorite } : property
      )
    );
  }, []);

  // PERFORMANCE OPTIMIZATION: Memoized filter application to prevent expensive recalculations
  const applyFiltersOptimized = useMemo(() => {
    if (!properties.length) return [];

    let filtered = [...properties];

    // Price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      filtered = filtered.filter(
        p => p.pricePerNight >= filters.priceRange[0] && p.pricePerNight <= filters.priceRange[1]
      );
    }

    // Amenities filter
    if (filters.amenities.length > 0 && properties[0]?.amenities) {
      filtered = filtered.filter(p =>
        filters.amenities.some(amenity =>
          p.amenities?.some(pAmenity => pAmenity.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // Rooms filter
    if (filters.rooms.bedrooms > 0) {
      filtered = filtered.filter(p => p.bedrooms >= filters.rooms.bedrooms);
    }
    if (filters.rooms.bathrooms > 0) {
      filtered = filtered.filter(p => p.bathrooms >= filters.rooms.bathrooms);
    }

    // Rating filter (using default since backend doesn't have ratings yet)
    if (filters.rating > 0) {
      const displayRating = 4.8; // Default rating
      filtered = filtered.filter(p => displayRating >= filters.rating);
    }

    // Instant book filter (using default since backend doesn't have this field yet)
    if (filters.instantBook) {
      // For now, don't filter since backend doesn't have this field
      // filtered = filtered.filter(p => p.isInstantBook)
    }

    return filtered;
  }, [properties, filters]);

  const applyFilters = useCallback(() => {
    setFilteredProperties(applyFiltersOptimized);
    setShowFilters(false);
  }, [applyFiltersOptimized]);

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      propertyTypes: [],
      amenities: [],
      rooms: { bedrooms: 0, bathrooms: 0 },
      instantBook: false,
      rating: 0,
    });
    setFilteredProperties(properties);
  };

  // PERFORMANCE OPTIMIZATION: Memoized property mapping to prevent expensive recalculations
  const mapPropertyForDisplay = useMemo(() => {
    const displayPropertyMap = new Map<string, DisplayProperty>();
    
    return (property: Property): DisplayProperty => {
      if (displayPropertyMap.has(property.id)) {
        return displayPropertyMap.get(property.id)!;
      }
      
      const displayProperty: DisplayProperty = {
        ...property,
        price: property.pricePerNight,
        guests: property.maxGuests,
        beds: property.bedrooms, // Using bedrooms as beds fallback
        baths: property.bathrooms,
        image:
          property.images?.[0] ||
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=300&fit=crop',
        hostName: property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : 'Host',
        hostImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        rating: 4.8, // Default rating since backend doesn't have this yet
        reviews: 25, // Default reviews count
        isFavorite: false, // Default favorite status
        isInstantBook: true, // Default instant book status
      };
      
      displayPropertyMap.set(property.id, displayProperty);
      return displayProperty;
    };
  }, []);

  const PropertyCard = ({ property }: { property: Property }) => {
    const displayProperty = mapPropertyForDisplay(property);
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
                  onClick={e => {
                    e.preventDefault();
                    toggleFavorite(displayProperty.id);
                  }}
                  className='absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors'
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
                  <div className='flex items-center space-x-1'>
                    <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    <span className='font-medium'>{displayProperty.rating}</span>
                    <span className='text-gray-500'>({displayProperty.reviews})</span>
                  </div>
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
                    <span className='text-sm text-gray-600'>
                      Hosted by {displayProperty.hostName}
                    </span>
                  </div>
                  <div className='text-right'>
                    <span className='text-2xl font-bold'>${displayProperty.price}</span>
                    <span className='text-gray-600'> /night</span>
                  </div>
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

            {/* Enhanced favorite button */}
            <button
              onClick={e => {
                e.preventDefault();
                toggleFavorite(displayProperty.id);
              }}
              className='absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg'
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  displayProperty.isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                )}
              />
            </button>

            {/* Enhanced badges */}
            {displayProperty.isInstantBook && (
              <div className='absolute top-4 left-4 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-lg'>
                Instant Book
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </div>

          <CardContent className='p-6'>
            <div className='flex items-start justify-between mb-3'>
              <h3 className='font-bold text-lg line-clamp-2 flex-1 pr-2 group-hover:text-primary transition-colors'>
                {displayProperty.title}
              </h3>
              <div className='flex items-center space-x-1 flex-shrink-0 bg-yellow-50 px-2 py-1 rounded-full'>
                <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                <span className='text-sm font-semibold'>{displayProperty.rating}</span>
              </div>
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
              <div className='flex items-baseline'>
                <span className='text-2xl font-bold text-gray-900'>${displayProperty.price}</span>
                <span className='text-gray-600 text-sm ml-1'>/night</span>
              </div>
              <div className='flex items-center text-sm text-gray-500'>
                <Star className='w-3 h-3 mr-1' />
                <span>{displayProperty.reviews} reviews</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className='w-full'>
        <Header />
        <div className='pt-24 px-4'>
          <div className='container mx-auto'>
            <div className='animate-pulse space-y-6'>
              <div className='h-16 bg-gray-200 rounded-lg'></div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='space-y-4'>
                    <div className='h-64 bg-gray-200 rounded-lg'></div>
                    <div className='h-4 bg-gray-200 rounded'></div>
                    <div className='h-4 bg-gray-200 rounded w-2/3'></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <Header />

      <div className='pt-24 px-4'>
        <div className='container mx-auto'>
          {/* Search Bar */}
          <div className='mb-8'>
            <SearchBar variant='header' onSearch={handleSearch} className='max-w-4xl' />
          </div>

          {/* Error Display */}
          {searchError && (
            <div className='mb-8'>
              <ErrorDisplay
                error={new Error(searchError)}
                onRetry={fetchProperties}
                title='Failed to load properties'
                variant='banner'
              />
            </div>
          )}

          {/* Enhanced Results Header */}
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {filteredProperties?.length?.toLocaleString() || 0} stays found
              </h1>
              <p className='text-gray-600 text-lg'>
                {urlParams.get('location') && `in ${urlParams.get('location')}`}
                {urlParams.get('checkIn') &&
                  ` • ${new Date(urlParams.get('checkIn')!).toLocaleDateString()}`}
                {urlParams.get('adults') && ` • ${urlParams.get('adults')} adults`}
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
              <div className='relative'>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className='appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm hover:shadow-md transition-shadow font-medium'
                >
                  <option value='rating'>Highest rated</option>
                  <option value='price-low'>Price: Low to High</option>
                  <option value='price-high'>Price: High to Low</option>
                  <option value='reviews'>Most reviews</option>
                </select>
                <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none'>
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>

              <div className='flex items-center bg-gray-100 rounded-xl p-1 shadow-sm'>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='rounded-lg'
                >
                  <Grid3X3 className='w-4 h-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='rounded-lg'
                >
                  <LayoutList className='w-4 h-4' />
                </Button>
              </div>

              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center space-x-2 rounded-xl shadow-sm hover:shadow-md transition-all font-medium'
              >
                <Filter className='w-4 h-4' />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div
              className={cn(
                'gap-6',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-6'
              )}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : !searchError && filteredProperties?.length === 0 ? (
            /* Enhanced Empty State */
            <div className='text-center py-20 animate-fade-in'>
              <div className='relative mb-8'>
                <div className='w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center'>
                  <MapPin className='w-16 h-16 text-gray-400' />
                </div>
                <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center'>
                  <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>No properties found</h3>
              <p className='text-gray-600 text-lg mb-8 max-w-md mx-auto'>
                We couldn't find any properties matching your criteria. Try adjusting your search or
                clearing some filters.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button onClick={clearFilters} variant='outline' size='lg' className='px-8'>
                  Clear all filters
                </Button>
                <Button variant='gradient' size='lg' className='px-8'>
                  Browse all properties
                </Button>
              </div>
            </div>
          ) : (
            /* Results Grid/List */
            <div
              className={cn(
                'gap-6',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-6'
              )}
            >
              {filteredProperties?.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Enhanced Load More */}
          {filteredProperties?.length > 0 && (
            <div className='text-center mt-16'>
              <Button
                size='xl'
                variant='outline'
                className='px-12 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all'
              >
                Show more properties
                <svg className='w-5 h-5 ml-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </Button>
              <p className='text-sm text-gray-500 mt-4'>
                Showing {filteredProperties?.length || 0} of {filteredProperties?.length || 0} properties
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Filters Modal */}
      <PropertyFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
