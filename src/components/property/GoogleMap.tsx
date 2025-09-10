'use client';

import React from 'react';
import { MapCore } from '@/components/maps';
import type { MapError, MapProperty } from '@/components/maps';
import { logger } from './utils/Logger';

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  address: string;
  title: string;
  className?: string;
  zoom?: number;
}

/**
 * GoogleMap Component
 * 
 * DEPRECATED: This component now uses the unified MapCore architecture internally.
 * For new implementations, use SinglePropertyMap from @/components/maps directly.
 */

export function GoogleMap({
  latitude,
  longitude,
  address,
  title,
  className,
  zoom = 15,
}: GoogleMapProps) {
  const property: MapProperty = React.useMemo(() => ({
    latitude,
    longitude,
    address,
    title,
  }), [latitude, longitude, address, title]);

  const handleError = React.useCallback((error: MapError) => {
    logger.warn('GoogleMap component error', { 
      component: 'GoogleMap',
      action: 'component_error'
    }, error instanceof Error ? error : new Error(String(error)));
  }, []);

  return (
    <MapCore
      mode="single"
      property={property}
      zoom={zoom}
      className={className}
      markerType="advanced"
      enableGeocoding={true}
      showAddressInfo={true}
      onError={handleError}
    />
  );
}

// Loading skeleton component (legacy - use MapCore loading states instead)
export function GoogleMapSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="w-full h-96 rounded-lg bg-gray-200 animate-pulse" />
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse mt-0.5" />
          <div className="flex-1">
            <div className="h-5 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
