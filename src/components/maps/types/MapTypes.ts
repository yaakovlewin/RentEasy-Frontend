/**
 * @fileoverview Unified Map Types
 * 
 * Enterprise-grade type definitions for the consolidated map architecture.
 * Supports both single and multiple property display modes with full type safety.
 */

import { Property } from '@/lib/api';

/**
 * Map display modes
 */
export type MapMode = 'single' | 'multiple';

/**
 * Marker implementation types
 */
export type MarkerType = 'classic' | 'advanced';

/**
 * Single property data for map display
 */
export interface MapProperty {
  latitude?: number;
  longitude?: number;
  address: string;
  title: string;
  pricePerNight?: number;
  id?: string | number;
  images?: string[];
}

/**
 * Map severity levels for error handling
 */
export type MapErrorSeverity = 'low' | 'medium' | 'high';

/**
 * Map error categories
 */
export type MapErrorCategory = 'API_LOAD' | 'MARKER_CREATION' | 'GEOCODING' | 'GENERAL';

/**
 * Map loading states
 */
export type MapLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Core props for the unified MapCore component
 */
export interface MapCoreProps {
  // Mode configuration
  mode: MapMode;
  
  // Single property mode
  property?: MapProperty;
  
  // Multiple properties mode  
  properties?: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  
  // Common configuration
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  
  // Advanced options
  mapOptions?: Partial<google.maps.MapOptions>;
  markerType?: MarkerType;
  enableGeocoding?: boolean;
  autoFitBounds?: boolean;
  showAddressInfo?: boolean;
  
  // Event handlers
  onMapLoad?: (map: google.maps.Map) => void;
  onError?: (error: MapError) => void;
}

/**
 * Props for internal map component
 */
export interface MapComponentProps {
  mode: MapMode;
  property?: MapProperty;
  properties?: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  center: google.maps.LatLngLiteral;
  zoom: number;
  mapOptions: google.maps.MapOptions;
  markerType: MarkerType;
  enableGeocoding: boolean;
  autoFitBounds: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
  onError?: (error: MapError) => void;
}

/**
 * Structured map error interface
 */
export interface MapError {
  message: string;
  category: MapErrorCategory;
  severity: MapErrorSeverity;
  originalError?: Error;
  context?: Record<string, any>;
}

/**
 * Marker creation options
 */
export interface MarkerOptions {
  position: google.maps.LatLngLiteral;
  map: google.maps.Map;
  title: string;
  property?: MapProperty | Property;
  isSelected?: boolean;
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

/**
 * Info window content data
 */
export interface InfoWindowData {
  property: MapProperty | Property;
  mode: MapMode;
}

/**
 * Geocoding service result
 */
export interface GeocodeResult {
  coordinates: google.maps.LatLngLiteral;
  formattedAddress: string;
  accuracy: 'high' | 'medium' | 'low';
}

/**
 * Map cache entry
 */
export interface MapCacheEntry {
  map: google.maps.Map;
  container: HTMLElement;
  created: number;
  lastUsed: number;
  options: google.maps.MapOptions;
}

/**
 * Hook state for useMapCore
 */
export interface UseMapCoreState {
  loading: boolean;
  error: MapError | null;
  mapInstance: google.maps.Map | null;
  isReady: boolean;
}

/**
 * Map configuration constants
 */
export const MAP_CONSTANTS = {
  DEFAULT_ZOOM: {
    SINGLE: 15,
    MULTIPLE: 12,
  },
  DEFAULT_CENTER: {
    lat: 40.7128,
    lng: -74.006, // NYC
  },
  MARKER_SIZES: {
    DEFAULT: 12,
    SELECTED: 16,
    PRICE_LABEL: { width: 60, height: 30 },
  },
  CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  GEOCODING_CACHE_SIZE: 100,
} as const;

/**
 * Default map options following established patterns
 */
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  gestureHandling: 'cooperative',
  // Note: styles are only applied when mapId is not present
  // When using mapId, styles should be configured in Google Cloud Console
};

/**
 * Default map styles (only used when mapId is not present)
 */
export const DEFAULT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

/**
 * Create map options with proper styles handling
 * Ensures styles are not applied when mapId is present (to avoid API warnings)
 */
export function createMapOptions(
  baseOptions: google.maps.MapOptions = {},
  includeStyles: boolean = true
): google.maps.MapOptions {
  const options = { ...DEFAULT_MAP_OPTIONS, ...baseOptions };
  
  // Only include styles if mapId is not present and styles are requested
  if (includeStyles && !options.mapId) {
    options.styles = [...(DEFAULT_MAP_STYLES || []), ...(baseOptions.styles || [])];
  }
  
  // Remove styles if mapId is present to avoid API warnings
  if (options.mapId && options.styles) {
    delete options.styles;
  }
  
  return options;
}

/**
 * Map theme colors matching design system
 */
export const MAP_THEME = {
  PRIMARY: '#ff385c',
  WHITE: '#ffffff',
  SELECTED: '#ff385c',
  DEFAULT: '#ffffff',
  HOVER: '#ff385c',
  TEXT: {
    PRIMARY: '#222222',
    SECONDARY: '#666666',
    WHITE: '#ffffff',
  },
} as const;

/**
 * Type guards for runtime type checking
 */
export const isMapProperty = (obj: any): obj is MapProperty => {
  return obj && typeof obj.address === 'string' && typeof obj.title === 'string';
};

export const isProperty = (obj: any): obj is Property => {
  return obj && typeof obj.id !== 'undefined' && typeof obj.title === 'string';
};

export const isMapError = (obj: any): obj is MapError => {
  return obj && typeof obj.message === 'string' && typeof obj.category === 'string';
};