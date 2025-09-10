/**
 * @fileoverview Property Types - Clean Exports
 * 
 * Unified property type system exports providing comprehensive
 * type safety for all property-related functionality.
 */

export type {
  // Core property interfaces
  BaseProperty,
  PropertyDetails,
  PropertyReview,
  PropertyAvailability,
  
  // Form and interaction types
  GuestSelection,
  BookingFormData,
  BookingCalculations,
  BookingDateRange,
  BookingValidation,
  
  // Display and UI types
  PropertyCardData,
  PropertyFilters,
  PropertySearchResult,
  ImageGalleryState,
  ContentVisibilityState,
  
  // Error handling
  PropertyError,
  PropertyErrorType,
  PropertyAsyncState,
  
  // Utility types
  PropertyTransformer,
} from './PropertyDetails';

// Constants and utilities
export {
  PROPERTY_CONSTANTS,
  DEFAULT_PROPERTY_VALUES,
  isBaseProperty,
  isPropertyDetails,
  isPropertyError,
} from './PropertyDetails';