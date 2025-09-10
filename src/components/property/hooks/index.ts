/**
 * @fileoverview Property Hooks - Clean Exports
 * 
 * Enterprise-grade property hook exports providing comprehensive
 * functionality for property details, booking, gallery, and UI state management.
 */

// Core property hooks
export { 
  usePropertyDetails,
  type UsePropertyDetailsOptions,
  type UsePropertyDetailsReturn 
} from './usePropertyDetails';

export { 
  useBookingCalculations,
  type UseBookingCalculationsOptions,
  type UseBookingCalculationsReturn,
  type BookingDateRange,
  type BookingValidation
} from './useBookingCalculations';

export { 
  useImageGallery,
  type UseImageGalleryOptions,
  type UseImageGalleryReturn
} from './useImageGallery';

export { 
  useContentVisibility,
  useSectionVisibility,
  type UseContentVisibilityOptions,
  type UseContentVisibilityReturn,
  type SectionVisibility
} from './useContentVisibility';

// Convenience re-exports from types
export type {
  PropertyDetails,
  PropertyReview,
  GuestSelection,
  BookingFormData,
  BookingCalculations,
  PropertyCardData,
  PropertyFilters,
  PropertySearchResult,
  ImageGalleryState,
  ContentVisibilityState,
  PropertyError,
  PropertyErrorType,
  PropertyAsyncState,
} from '../types/PropertyDetails';