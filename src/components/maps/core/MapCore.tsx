'use client';

/**
 * @fileoverview Unified MapCore Component
 * 
 * Enterprise-grade unified map component that handles both single and multiple
 * property display modes with comprehensive error handling and performance optimization.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { AlertCircle, MapPin } from 'lucide-react';

import type { 
  MapCoreProps, 
  MapComponentProps, 
  MapError, 
  MapLoadingState
} from '../types/MapTypes';
import { 
  MAP_CONSTANTS,
  createMapOptions 
} from '../types/MapTypes';
import { MarkerManager } from '../services/MarkerManager';
import { GeocodeService } from '../services/GeocodeService';

/**
 * Loading component matching established UI patterns
 */
const MapLoadingComponent = () => (
  <div className="w-full h-full rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-gray-600">Loading map...</p>
    </div>
  </div>
);

/**
 * Error component matching established UI patterns
 */
const MapErrorComponent = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="w-full h-full rounded-lg border border-red-200 bg-red-50 flex items-center justify-center">
    <div className="text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
      <p className="text-red-600 font-medium mb-1">Map failed to load</p>
      <p className="text-red-500 text-sm">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

/**
 * API key missing component
 */
const MapApiKeyMissingComponent = () => (
  <div className="w-full h-full rounded-lg border border-yellow-200 bg-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <MapPin className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
      <p className="text-yellow-700 font-medium mb-1">Map unavailable</p>
      <p className="text-yellow-600 text-sm">Google Maps API key required</p>
    </div>
  </div>
);

/**
 * Inner map component that handles the actual Google Maps integration
 */
const MapComponent: React.FC<MapComponentProps> = ({
  mode,
  property,
  properties,
  selectedProperty,
  onPropertySelect,
  center,
  zoom,
  mapOptions,
  markerType,
  enableGeocoding,
  autoFitBounds,
  onMapLoad,
  onError,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerManagerRef = useRef<MarkerManager | null>(null);
  const geocodeServiceRef = useRef<GeocodeService | null>(null);
  const [mapCenter, setMapCenter] = useState(center);

  // Initialize services
  useEffect(() => {
    if (!markerManagerRef.current) {
      markerManagerRef.current = new MarkerManager();
    }
    if (!geocodeServiceRef.current) {
      geocodeServiceRef.current = new GeocodeService();
    }
  }, []);

  // Handle geocoding for single property without coordinates
  useEffect(() => {
    if (
      mode === 'single' && 
      property && 
      enableGeocoding &&
      (!property.latitude || !property.longitude) &&
      property.address &&
      geocodeServiceRef.current
    ) {
      const geocodeProperty = async () => {
        try {
          const result = await geocodeServiceRef.current!.geocodeAddress(property.address);
          setMapCenter(result.coordinates);
        } catch (error) {
          onError?.({
            message: `Failed to geocode address: ${property.address}`,
            category: 'GEOCODING',
            severity: 'medium',
            originalError: error as Error,
          });
        }
      };

      geocodeProperty();
    }
  }, [mode, property, enableGeocoding, onError]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;

    try {
      // Determine if we need mapId for AdvancedMarkerElement
      const finalMapOptions = markerType === 'advanced' 
        ? { ...mapOptions, mapId: 'DEMO_MAP_ID' }
        : mapOptions;

      const map = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom,
        ...finalMapOptions,
      });

      mapInstanceRef.current = map;
      onMapLoad?.(map);

    } catch (error) {
      onError?.({
        message: 'Failed to initialize Google Map',
        category: 'API_LOAD',
        severity: 'high',
        originalError: error as Error,
      });
    }
  }, [mapCenter, zoom, mapOptions, markerType, onMapLoad, onError]);

  // Create markers when map or properties change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerManagerRef.current) return;

    try {
      const actualMarkerType = MarkerManager.getBestMarkerType(markerType);
      
      markerManagerRef.current.createMarkers(mapInstanceRef.current, mode, {
        markerType: actualMarkerType,
        property,
        properties,
        selectedProperty,
        onPropertySelect,
      });

    } catch (error) {
      onError?.({
        message: 'Failed to create map markers',
        category: 'MARKER_CREATION',
        severity: 'medium',
        originalError: error as Error,
      });
    }
  }, [mode, property, properties, selectedProperty, onPropertySelect, markerType, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerManagerRef.current) {
        markerManagerRef.current.destroy();
      }
      if (geocodeServiceRef.current) {
        geocodeServiceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg border border-gray-200 bg-gray-100"
      style={{ minHeight: mode === 'single' ? '300px' : '400px' }}
    />
  );
};

/**
 * MapWrapper component that handles Google Maps API loading states
 */
const MapWrapper: React.FC<MapComponentProps> = (props) => {
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return <MapApiKeyMissingComponent />;
  }

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      render={(status: Status) => {
        switch (status) {
          case Status.LOADING:
            return <MapLoadingComponent />;
          case Status.FAILURE:
            return (
              <MapErrorComponent 
                error="Failed to load Google Maps API"
                onRetry={handleRetry}
              />
            );
          case Status.SUCCESS:
            return <MapComponent {...props} key={retryCount} />;
          default:
            return <MapLoadingComponent />;
        }
      }}
      libraries={['places', 'geometry', 'marker']}
    />
  );
};

/**
 * Address info component for single property mode
 */
const MapAddressInfo: React.FC<{ address: string; className?: string }> = ({ 
  address, 
  className 
}) => (
  <div className={`mt-4 p-4 bg-gray-50 rounded-lg ${className || ''}`}>
    <div className="flex items-start space-x-3">
      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-gray-900">{address}</p>
        <p className="text-sm text-gray-500 mt-1">
          This is an approximate location for privacy and security purposes.
        </p>
      </div>
    </div>
  </div>
);

/**
 * Main MapCore component - unified interface for all map functionality
 */
export const MapCore: React.FC<MapCoreProps> = ({
  mode,
  property,
  properties,
  selectedProperty,
  onPropertySelect,
  center,
  zoom,
  className,
  mapOptions,
  markerType = 'classic',
  enableGeocoding = true,
  autoFitBounds = true,
  showAddressInfo = false,
  onMapLoad,
  onError,
}) => {
  // Calculate default center based on mode and data
  const defaultCenter = useMemo(() => {
    if (center) return center;

    if (mode === 'single' && property?.latitude && property?.longitude) {
      return { lat: property.latitude, lng: property.longitude };
    }

    if (mode === 'multiple' && properties && properties.length > 0) {
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      if (validProperties.length === 0) {
        return MAP_CONSTANTS.DEFAULT_CENTER;
      }

      const avgLat = validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0) / validProperties.length;
      const avgLng = validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0) / validProperties.length;
      
      return { lat: avgLat, lng: avgLng };
    }

    return MAP_CONSTANTS.DEFAULT_CENTER;
  }, [center, mode, property, properties]);

  // Calculate default zoom based on mode
  const defaultZoom = useMemo(() => {
    if (zoom !== undefined) return zoom;
    return mode === 'single' 
      ? MAP_CONSTANTS.DEFAULT_ZOOM.SINGLE 
      : MAP_CONSTANTS.DEFAULT_ZOOM.MULTIPLE;
  }, [zoom, mode]);

  // Merge map options with defaults and handle styles properly
  const finalMapOptions = useMemo(() => 
    createMapOptions(mapOptions), 
    [mapOptions]
  );

  const mapComponentProps: MapComponentProps = {
    mode,
    property,
    properties,
    selectedProperty,
    onPropertySelect,
    center: defaultCenter,
    zoom: defaultZoom,
    mapOptions: finalMapOptions,
    markerType,
    enableGeocoding,
    autoFitBounds,
    onMapLoad,
    onError,
  };

  return (
    <div className={className}>
      <MapWrapper {...mapComponentProps} />
      {showAddressInfo && mode === 'single' && property?.address && (
        <MapAddressInfo address={property.address} />
      )}
    </div>
  );
};

/**
 * Convenience components for specific use cases
 */

// Single property map
export const SinglePropertyMap: React.FC<{
  property: MapCoreProps['property'];
  zoom?: number;
  className?: string;
  showAddressInfo?: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
  onError?: (error: MapError) => void;
}> = ({ property, zoom, className, showAddressInfo = true, onMapLoad, onError }) => (
  <MapCore
    mode="single"
    property={property}
    zoom={zoom}
    className={className}
    showAddressInfo={showAddressInfo}
    onMapLoad={onMapLoad}
    onError={onError}
  />
);

// Multiple properties map
export const MultiplePropertiesMap: React.FC<{
  properties: MapCoreProps['properties'];
  selectedProperty?: MapCoreProps['selectedProperty'];
  onPropertySelect?: MapCoreProps['onPropertySelect'];
  zoom?: number;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
  onError?: (error: MapError) => void;
}> = ({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  zoom, 
  className, 
  onMapLoad, 
  onError 
}) => (
  <MapCore
    mode="multiple"
    properties={properties}
    selectedProperty={selectedProperty}
    onPropertySelect={onPropertySelect}
    zoom={zoom}
    className={className}
    onMapLoad={onMapLoad}
    onError={onError}
  />
);

export default MapCore;