'use client';

import React from 'react';
import { MapCore } from '@/components/maps';
import type { MapError } from '@/components/maps';
import { Property } from '@/lib/api';
import { logger } from './utils/Logger';

interface SearchResultsMapProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  className?: string;
  zoom?: number;
  center?: google.maps.LatLngLiteral;
}

/**
 * SearchResultsMap Component
 * 
 * DEPRECATED: This component now uses the unified MapCore architecture internally.
 * For new implementations, use MultiplePropertiesMap from @/components/maps directly.
 */

export function SearchResultsMap({
  properties,
  selectedProperty,
  onPropertySelect,
  className,
  zoom = 12,
  center,
}: SearchResultsMapProps) {
  const handleError = React.useCallback((error: MapError) => {
    logger.warn('SearchResultsMap component error', { 
      component: 'SearchResultsMap',
      action: 'component_error'
    }, error instanceof Error ? error : new Error(String(error)));
  }, []);

  return (
    <MapCore
      mode="multiple"
      properties={properties}
      selectedProperty={selectedProperty}
      onPropertySelect={onPropertySelect}
      center={center}
      zoom={zoom}
      className={className}
      markerType="classic"
      autoFitBounds={true}
      onError={handleError}
    />
  );
}
