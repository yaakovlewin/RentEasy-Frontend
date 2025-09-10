/**
 * @fileoverview Unified Maps Module - Clean Exports
 * 
 * Enterprise-grade map component exports following established patterns.
 * Single entry point for all map functionality with backward compatibility.
 */

// Core components
export { MapCore, SinglePropertyMap, MultiplePropertiesMap } from './core/MapCore';

// Services
export { MarkerManager } from './services/MarkerManager';
export { GeocodeService } from './services/GeocodeService';

// Types
export type {
  MapMode,
  MarkerType,
  MapProperty,
  MapErrorSeverity,
  MapErrorCategory,
  MapLoadingState,
  MapCoreProps,
  MapComponentProps,
  MapError,
  MarkerOptions,
  InfoWindowData,
  GeocodeResult,
  MapCacheEntry,
  UseMapCoreState,
} from './types/MapTypes';

// Constants and utilities
export { 
  MAP_CONSTANTS,
  DEFAULT_MAP_OPTIONS,
  MAP_THEME,
  isMapProperty,
  isProperty,
  isMapError 
} from './types/MapTypes';

// Hooks
export { useMapCore } from './hooks/useMapCore';
export type { UseMapCoreOptions } from './hooks/useMapCore';

// Backward compatibility exports (deprecated - use MapCore instead)
export { default as UnifiedGoogleMap } from './core/MapCore';

/**
 * Default export is the main MapCore component
 */
export { MapCore as default } from './core/MapCore';