/**
 * @fileoverview Unified Property Type Definitions
 * 
 * Enterprise-grade property type system that consolidates the fragmented
 * property interfaces across the application into a coherent, type-safe system.
 */

import { Property } from '@/lib/api';

/**
 * Base property interface - core fields used across all property contexts
 */
export interface BaseProperty {
  id: string | number;
  title: string;
  location: string;
  address?: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  rating?: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  hostName?: string;
  hostImage?: string;
  description?: string;
  isInstantBook?: boolean;
  isFavorite?: boolean;
}

/**
 * Extended property details for detail pages with additional fields
 */
export interface PropertyDetails extends BaseProperty {
  // Additional pricing information
  cleaningFee: number;
  serviceFee: number;
  originalPrice?: number;
  discount?: number;

  // Property rules and policies
  rules: string[];
  cancellationPolicy: string;
  
  // Extended host information
  hostName: string;
  hostImage: string;
  hostDescription?: string;
  hostRating?: number;
  isSuperhost?: boolean;
  
  // Reviews and ratings
  reviewsList: PropertyReview[];
  
  // Property features
  propertyType?: string;
  checkInTime?: string;
  checkOutTime?: string;
  
  // Availability and status
  availability?: PropertyAvailability[];
  isNewListing?: boolean;
  
  // Additional metadata
  createdAt?: string;
  updatedAt?: string;
  verifiedAt?: string;
}

/**
 * Individual review data structure
 */
export interface PropertyReview {
  id: number;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
  helpful?: number;
  response?: {
    text: string;
    date: string;
    author: string;
  };
}

/**
 * Property availability data
 */
export interface PropertyAvailability {
  date: string;
  available: boolean;
  price?: number;
  minNights?: number;
}

/**
 * Guest selection data structure
 */
export interface GuestSelection {
  adults: number;
  children: number;
  infants: number;
}

/**
 * Booking form data structure
 */
export interface BookingFormData {
  propertyId: string | number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  guestDetails: GuestSelection;
  specialRequests?: string;
  contactInfo?: {
    email: string;
    phone?: string;
  };
}

/**
 * Booking calculations result
 */
export interface BookingCalculations {
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  pricePerNight: number;
  isValid: boolean;
  errors?: string[];
}

/**
 * Property card display data (for grid/list views)
 */
export interface PropertyCardData extends BaseProperty {
  badge?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  quickBookAvailable?: boolean;
  lastBookedDate?: string;
  responseRate?: number;
}

/**
 * Property filter criteria
 */
export interface PropertyFilters {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  instantBook: boolean;
  rating: number;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/**
 * Property search result with metadata
 */
export interface PropertySearchResult {
  properties: PropertyCardData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: PropertyFilters;
  sortBy: string;
  searchLocation?: string;
}

/**
 * Image gallery state and controls
 */
export interface ImageGalleryState {
  currentIndex: number;
  images: string[];
  isFullscreen: boolean;
  isLoading: boolean;
}

/**
 * Content visibility state (for amenities, reviews, etc.)
 */
export interface ContentVisibilityState {
  showAllAmenities: boolean;
  showAllReviews: boolean;
  showAllRules: boolean;
  showFullDescription: boolean;
}

/**
 * Property error types for structured error handling
 */
export type PropertyErrorType = 
  | 'PROPERTY_NOT_FOUND'
  | 'PROPERTY_UNAVAILABLE' 
  | 'BOOKING_FAILED'
  | 'PRICE_CALCULATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR';

/**
 * Property-specific error interface
 */
export interface PropertyError {
  type: PropertyErrorType;
  message: string;
  code?: string;
  field?: string;
  retryable: boolean;
  suggestions?: string[];
}

/**
 * Async operation state for property-related operations
 */
export interface PropertyAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: PropertyError | null;
  lastUpdated: number | null;
}

/**
 * Type guards for runtime type checking
 */
export const isBaseProperty = (obj: unknown): obj is BaseProperty => {
  return obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as BaseProperty).id !== 'undefined' &&
    typeof (obj as BaseProperty).title === 'string' &&
    typeof (obj as BaseProperty).pricePerNight === 'number';
};

export const isPropertyDetails = (obj: unknown): obj is PropertyDetails => {
  return isBaseProperty(obj) &&
    Array.isArray((obj as PropertyDetails).rules) &&
    Array.isArray((obj as PropertyDetails).reviewsList) &&
    typeof (obj as PropertyDetails).cleaningFee === 'number' &&
    typeof (obj as PropertyDetails).serviceFee === 'number';
};

export const isPropertyError = (obj: unknown): obj is PropertyError => {
  return obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as PropertyError).type === 'string' &&
    typeof (obj as PropertyError).message === 'string' &&
    typeof (obj as PropertyError).retryable === 'boolean';
};

/**
 * Utility type for property transformations
 */
export type PropertyTransformer<T extends BaseProperty> = (property: unknown) => T;

/**
 * Constants for property-related operations
 */
export const PROPERTY_CONSTANTS = {
  MAX_IMAGES: 20,
  MAX_REVIEWS_PREVIEW: 6,
  MAX_AMENITIES_PREVIEW: 10,
  MAX_RULES_PREVIEW: 5,
  DEFAULT_PAGE_SIZE: 20,
  IMAGE_SIZES: {
    THUMBNAIL: 150,
    CARD: 300,
    HERO: 800,
    FULLSCREEN: 1200,
  },
  BOOKING: {
    MIN_NIGHTS: 1,
    MAX_NIGHTS: 30,
    MAX_GUESTS: 16,
    ADVANCE_BOOKING_DAYS: 365,
  },
} as const;

/**
 * Default values for property data
 */
export const DEFAULT_PROPERTY_VALUES = {
  rating: 0,
  reviews: 0,
  cleaningFee: 0,
  serviceFee: 0,
  images: [],
  amenities: [],
  rules: [],
  reviewsList: [],
  guests: { adults: 1, children: 0, infants: 0 } as GuestSelection,
} as const;