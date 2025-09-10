'use client';

/**
 * @fileoverview PropertyInfo Component
 * 
 * Enterprise-grade property information component extracted from monolithic PropertyDetailsPage.
 * Features host information, property specifications, and special badges.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { Users, Bed, Bath, Shield, User, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyDetails } from '../types';

interface PropertyInfoProps {
  /** Property details */
  property: PropertyDetails;
  /** Optional CSS classes */
  className?: string;
  /** Show host information */
  showHost?: boolean;
  /** Show property specifications */
  showSpecs?: boolean;
  /** Show special badges */
  showBadges?: boolean;
  /** Compact layout */
  compact?: boolean;
}

/**
 * Host avatar component with fallback
 */
const HostAvatar = memo(function HostAvatar({
  hostImage,
  hostName,
  size = 'w-16 h-16',
}: {
  hostImage?: string;
  hostName: string;
  size?: string;
}) {
  return (
    <div className={cn('relative rounded-full overflow-hidden bg-gray-100', size)}>
      {hostImage ? (
        <Image
          src={hostImage}
          alt={`${hostName}'s profile`}
          fill
          className="object-cover"
          sizes="64px"
          onError={(e) => {
            // Fallback to user icon on error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  );
});

/**
 * Property specifications component
 */
const PropertySpecs = memo(function PropertySpecs({
  property,
  compact = false,
}: {
  property: PropertyDetails;
  compact?: boolean;
}) {
  const specs = [
    {
      icon: Users,
      label: `${property.maxGuests} guest${property.maxGuests !== 1 ? 's' : ''}`,
      key: 'guests',
    },
    {
      icon: Bed,
      label: `${property.bedrooms} bedroom${property.bedrooms !== 1 ? 's' : ''}`,
      key: 'bedrooms',
    },
    {
      icon: Bath,
      label: `${property.bathrooms} bathroom${property.bathrooms !== 1 ? 's' : ''}`,
      key: 'bathrooms',
    },
  ];

  return (
    <div className={cn(
      'flex items-center text-gray-600',
      compact ? 'space-x-4 text-sm' : 'space-x-6'
    )}>
      {specs.map(({ icon: Icon, label, key }) => (
        <span key={key} className="flex items-center">
          <Icon className="w-4 h-4 mr-1" />
          {label}
        </span>
      ))}
    </div>
  );
});

/**
 * Special badges component
 */
const PropertyBadges = memo(function PropertyBadges({
  property,
  compact = false,
}: {
  property: PropertyDetails;
  compact?: boolean;
}) {
  const badges = [];

  // Instant Book badge
  if (property.isInstantBook) {
    badges.push({
      icon: Shield,
      title: 'Instant Book',
      description: 'Book without waiting for host approval',
      color: 'text-primary',
      key: 'instant-book',
    });
  }

  // Superhost badge (if host rating is very high)
  const hostRating = property.hostRating || 0;
  if (hostRating >= 4.8) {
    badges.push({
      icon: Star,
      title: 'Superhost',
      description: `${property.hostName} is a highly rated host`,
      color: 'text-yellow-500',
      key: 'superhost',
    });
  }

  // Recently joined badge (if property is new)
  if (property.isNewListing) {
    badges.push({
      icon: Calendar,
      title: 'New listing',
      description: 'This is a new property on RentEasy',
      color: 'text-green-500',
      key: 'new-listing',
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="space-y-3">
      {badges.map(({ icon: Icon, title, description, color, key }) => (
        <div key={key} className={cn('flex items-center space-x-2', color)}>
          <Icon className="w-5 h-5" />
          <div>
            <span className="font-medium">{title}</span>
            {!compact && (
              <span className="text-gray-600 ml-2">{description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * PropertyInfo - Extracted property information component
 * 
 * Features:
 * - Host information with avatar and name
 * - Property specifications (guests, bedrooms, bathrooms)
 * - Special badges (Instant Book, Superhost, New listing)
 * - Responsive design with compact mode
 * - Accessibility support with proper ARIA attributes
 * - Graceful image fallbacks for host avatars
 * - Flexible layout options
 */
export const PropertyInfo = memo(function PropertyInfo({
  property,
  className,
  showHost = true,
  showSpecs = true,
  showBadges = true,
  compact = false,
}: PropertyInfoProps) {
  return (
    <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
      <div className={cn(
        'flex items-center justify-between mb-4',
        compact && 'mb-3'
      )}>
        {/* Property and Host Information */}
        <div className="flex-1 min-w-0">
          <h2 className={cn(
            'font-semibold mb-2 text-gray-900',
            compact ? 'text-lg' : 'text-xl'
          )}>
            {property.propertyType || 'Entire villa'} hosted by {property.hostName}
          </h2>
          
          {showSpecs && (
            <PropertySpecs property={property} compact={compact} />
          )}
        </div>

        {/* Host Avatar */}
        {showHost && (
          <HostAvatar
            hostImage={property.hostImage}
            hostName={property.hostName}
            size={compact ? 'w-12 h-12' : 'w-16 h-16'}
          />
        )}
      </div>

      {/* Special Badges */}
      {showBadges && (
        <PropertyBadges property={property} compact={compact} />
      )}

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          Property information: {property.propertyType || 'Entire villa'} hosted by {property.hostName}.
          Accommodates {property.maxGuests} guests in {property.bedrooms} bedrooms with {property.bathrooms} bathrooms.
          {property.isInstantBook && ' This property offers instant booking.'}
          {property.hostRating >= 4.8 && ` ${property.hostName} is a Superhost.`}
          {property.isNewListing && ' This is a new listing.'}
        </p>
      </div>
    </div>
  );
});

PropertyInfo.displayName = 'PropertyInfo';

export default PropertyInfo;