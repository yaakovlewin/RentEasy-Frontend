import React from 'react';

import { MapPin, Users, BedDouble, Bath, Wifi, Car, Utensils } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';

import type { PropertyCardContentProps, PropertyCardField } from '../types';

export function PropertyCardContent({
  property,
  variant,
  fields,
  showDetails = true,
  showHost = true,
  renderPrice,
  renderTitle,
  className,
}: PropertyCardContentProps) {
  // Determine which fields to show based on variant and configuration
  const getVisibleFields = (): PropertyCardField[] => {
    if (fields?.showFields) {
      return fields.showFields;
    }

    // Default fields for each variant
    const variantDefaults: Record<string, PropertyCardField[]> = {
      compact: ['title', 'location', 'price', 'rating'],
      list: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests'],
      management: ['title', 'location', 'price', 'status', 'bedrooms', 'bathrooms', 'guests'],
      default: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests'],
    };

    let defaultFields = variantDefaults[variant] || variantDefaults.default;

    // Remove hidden fields
    if (fields?.hideFields) {
      defaultFields = defaultFields.filter(field => !fields.hideFields!.includes(field));
    }

    return defaultFields;
  };

  const visibleFields = getVisibleFields();
  const shouldShow = (field: PropertyCardField) => visibleFields.includes(field);

  // Get amenity icons
  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      wifi: Wifi,
      parking: Car,
      kitchen: Utensils,
      // Add more as needed
    };
    
    const normalizedAmenity = amenity.toLowerCase();
    return iconMap[normalizedAmenity] || null;
  };

  // Format guest capacity
  const formatGuests = (guests?: number) => {
    if (!guests) return null;
    return `${guests} guest${guests !== 1 ? 's' : ''}`;
  };

  // Format bedrooms/bathrooms
  const formatRooms = (bedrooms?: number, bathrooms?: number) => {
    const parts: string[] = [];
    
    if (bedrooms) {
      parts.push(`${bedrooms} bed${bedrooms !== 1 ? 's' : ''}`);
    }
    
    if (bathrooms) {
      parts.push(`${bathrooms} bath${bathrooms !== 1 ? 's' : ''}`);
    }
    
    return parts.join(' • ');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Title */}
      {shouldShow('title') && (
        <div>
          {renderTitle ? (
            renderTitle(property)
          ) : (
            <h3
              className={cn(
                'font-semibold line-clamp-2 text-gray-900 group-hover:text-primary transition-colors',
                {
                  'text-lg': variant === 'default' || variant === 'featured',
                  'text-base': variant === 'list' || variant === 'management',
                  'text-sm': variant === 'compact',
                }
              )}
            >
              {property.title}
            </h3>
          )}
        </div>
      )}

      {/* Location */}
      {shouldShow('location') && property.location && (
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className={cn(
            'line-clamp-1',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}>
            {property.location}
          </span>
        </div>
      )}

      {/* Property details */}
      {showDetails && (variant !== 'compact') && (
        <div className="space-y-2">
          {/* Bedrooms, bathrooms, guests */}
          {(shouldShow('bedrooms') || shouldShow('bathrooms') || shouldShow('guests')) && (
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {(shouldShow('bedrooms') || shouldShow('bathrooms')) && (
                <div className="flex items-center">
                  <BedDouble className="w-4 h-4 mr-1" />
                  <span>{formatRooms(property.bedrooms, property.bathrooms)}</span>
                </div>
              )}
              
              {shouldShow('guests') && property.guests && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{formatGuests(property.guests)}</span>
                </div>
              )}
            </div>
          )}

          {/* Property type */}
          {shouldShow('propertyType') && property.propertyType && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Type:</span> {property.propertyType}
            </div>
          )}

          {/* Amenities (limited to 3-4 for space) */}
          {shouldShow('amenities') && property.amenities && property.amenities.length > 0 && (
            <div className="flex items-center space-x-2">
              {property.amenities.slice(0, 4).map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity);
                return (
                  <div
                    key={index}
                    className="flex items-center text-xs text-gray-600"
                    title={amenity}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-3 h-3 mr-1" />
                    ) : (
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1" />
                    )}
                    <span className="line-clamp-1">{amenity}</span>
                  </div>
                );
              })}
              {property.amenities.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{property.amenities.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Description (for management variant) */}
          {shouldShow('description') && property.description && variant === 'management' && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {property.description}
            </p>
          )}
        </div>
      )}

      {/* Host information */}
      {showHost && shouldShow('host') && property.host && (
        <div className="flex items-center space-x-2">
          {property.host.avatar && (
            <div className="w-6 h-6 relative rounded-full overflow-hidden bg-gray-100">
              <img
                src={property.host.avatar}
                alt={property.host.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Hosted by</span>
            <span className="text-sm font-medium text-gray-900">
              {property.host.name}
            </span>
            {property.host.verified && (
              <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                ✓
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status (for management variant) */}
      {shouldShow('status') && property.status && variant === 'management' && (
        <div className="text-sm">
          <span className="font-medium text-gray-700">Status:</span>{' '}
          <span
            className={cn({
              'text-green-600': property.status === 'available',
              'text-red-600': property.status === 'unavailable',
              'text-yellow-600': property.status === 'pending',
              'text-blue-600': property.status === 'booked',
            })}
          >
            {property.status}
          </span>
        </div>
      )}

      {/* Availability */}
      {shouldShow('availability') && property.availability && (
        <div className="text-sm text-gray-600">
          {property.availability.available ? (
            <span className="text-green-600">Available now</span>
          ) : (
            <span>
              Next available: {property.availability.nextAvailable ? 
                new Date(property.availability.nextAvailable).toLocaleDateString() : 
                'Not available'
              }
            </span>
          )}
        </div>
      )}

      {/* Price */}
      {shouldShow('price') && (
        <div className="flex items-baseline justify-between">
          {renderPrice ? (
            renderPrice(property)
          ) : (
            <div className="flex items-baseline space-x-1">
              {property.originalPrice && property.price < property.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(property.originalPrice)}
                </span>
              )}
              <span className={cn(
                'font-semibold text-gray-900',
                {
                  'text-xl': variant === 'default' || variant === 'featured',
                  'text-lg': variant === 'list' || variant === 'management',
                  'text-base': variant === 'compact',
                }
              )}>
                {formatCurrency(property.price)}
              </span>
              <span className="text-sm text-gray-600">
                /{property.priceUnit || 'night'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}