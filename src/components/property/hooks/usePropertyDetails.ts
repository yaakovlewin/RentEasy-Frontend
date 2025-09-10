/**
 * @fileoverview usePropertyDetails Hook
 * 
 * Enterprise-grade custom hook for managing property data fetching, transformation,
 * and state management with comprehensive error handling and performance optimization.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { propertiesAPI, type Property } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import type { 
  PropertyDetails, 
  PropertyError, 
  PropertyAsyncState, 
  PropertyTransformer
} from '../types/PropertyDetails';
import {
  PROPERTY_CONSTANTS,
  DEFAULT_PROPERTY_VALUES 
} from '../types/PropertyDetails';

/**
 * Configuration options for usePropertyDetails hook
 */
export interface UsePropertyDetailsOptions {
  // Caching options
  enableCaching?: boolean;
  cacheTimeout?: number;
  
  // Data transformation options
  transformData?: PropertyTransformer<PropertyDetails>;
  includeReviews?: boolean;
  includeHost?: boolean;
  
  // Error handling options
  enableRetry?: boolean;
  maxRetries?: number;
  onError?: (error: PropertyError) => void;
  
  // Performance options
  prefetchImages?: boolean;
  enableBackgroundRefresh?: boolean;
}

/**
 * Return type for usePropertyDetails hook
 */
export interface UsePropertyDetailsReturn {
  // Data state
  property: PropertyDetails | null;
  loading: boolean;
  error: PropertyError | null;
  
  // Metadata
  lastUpdated: number | null;
  retryCount: number;
  isStale: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // Utility functions
  getPropertyUrl: (propertyId?: string) => string;
  isBookingAvailable: (date: Date) => boolean;
}

/**
 * Default hook options
 */
const DEFAULT_OPTIONS: Required<UsePropertyDetailsOptions> = {
  enableCaching: true,
  cacheTimeout: 15 * 60 * 1000, // 15 minutes
  transformData: transformBackendProperty,
  includeReviews: true,
  includeHost: true,
  enableRetry: true,
  maxRetries: 3,
  onError: () => {},
  prefetchImages: true,
  enableBackgroundRefresh: false,
};

/**
 * Backend property data interface - represents data from API
 */
interface BackendPropertyData {
  id: string | number;
  title?: string;
  address?: {
    city?: string;
    stateProvince?: string;
    country?: string;
    full?: string;
  };
  location?: string;
  base_price?: number;
  pricePerNight?: number;
  cleaning_fee?: number;
  service_fee?: number;
  max_guests?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  latitude?: string | number;
  longitude?: string | number;
  images?: string[];
  rating?: number;
  reviews?: number;
  amenities?: string[];
  rules?: string[];
  cancellation_policy?: string;
  host?: {
    name?: string;
    image?: string;
    description?: string;
    rating?: number;
    is_superhost?: boolean;
  };
  reviews_list?: unknown[];
  property_type?: string;
  check_in_time?: string;
  check_out_time?: string;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
}

/**
 * Default property data transformer
 */
function transformBackendProperty(backendProperty: BackendPropertyData): PropertyDetails {
  // Handle potential null/undefined data
  if (!backendProperty) {
    throw new Error('Invalid property data received');
  }

  const property: PropertyDetails = {
    // Core property fields
    id: backendProperty.id,
    title: backendProperty.title || 'Untitled Property',
    location: backendProperty.address ? 
      `${backendProperty.address.city}, ${backendProperty.address.stateProvince || backendProperty.address.country}` :
      backendProperty.location || 'Location not specified',
    address: backendProperty.address?.full || backendProperty.location,
    
    // Pricing (handle multiple possible field names)
    pricePerNight: backendProperty.base_price || backendProperty.pricePerNight || 0,
    cleaningFee: backendProperty.cleaning_fee || DEFAULT_PROPERTY_VALUES.cleaningFee,
    serviceFee: backendProperty.service_fee || DEFAULT_PROPERTY_VALUES.serviceFee,
    
    // Property details
    maxGuests: backendProperty.max_guests || backendProperty.maxGuests || 1,
    bedrooms: backendProperty.bedrooms || 0,
    bathrooms: backendProperty.bathrooms || 0,
    
    // Location data (with validation)
    latitude: parseFloat(String(backendProperty.latitude || 0)) || undefined,
    longitude: parseFloat(String(backendProperty.longitude || 0)) || undefined,
    
    // Media
    images: Array.isArray(backendProperty.images) && backendProperty.images.length > 0 
      ? backendProperty.images 
      : getDefaultImages(),
    
    // Ratings and reviews
    rating: parseFloat(String(backendProperty.rating || 0)) || DEFAULT_PROPERTY_VALUES.rating,
    reviews: parseInt(String(backendProperty.reviews || 0)) || DEFAULT_PROPERTY_VALUES.reviews,
    
    // Host information
    hostName: backendProperty.owner?.name || backendProperty.hostName || 'Host',
    hostImage: backendProperty.owner?.avatar || backendProperty.hostImage || getDefaultHostImage(),
    hostDescription: backendProperty.owner?.bio || backendProperty.hostDescription,
    isSuperhost: backendProperty.owner?.is_superhost || false,
    
    // Property features
    amenities: Array.isArray(backendProperty.amenities) ? backendProperty.amenities : [],
    description: backendProperty.description || 'No description available.',
    isInstantBook: backendProperty.instant_book || backendProperty.isInstantBook || false,
    propertyType: backendProperty.property_type || backendProperty.propertyType || 'Entire place',
    
    // Policies and rules
    rules: backendProperty.rules || getDefaultRules(),
    cancellationPolicy: backendProperty.cancellation_policy || getDefaultCancellationPolicy(),
    checkInTime: backendProperty.check_in_time || '4:00 PM',
    checkOutTime: backendProperty.check_out_time || '11:00 AM',
    
    // Extended data (with defaults for display purposes)
    reviewsList: transformReviewsData(backendProperty.reviews_data),
    availability: backendProperty.availability || [],
    
    // Metadata
    createdAt: backendProperty.created_at,
    updatedAt: backendProperty.updated_at,
    verifiedAt: backendProperty.verified_at,
    isFavorite: false, // This would come from user preferences
  };

  return property;
}

/**
 * Backend review data interface
 */
interface BackendReviewData {
  id: number;
  user_name?: string;
  userName?: string;
  user_image?: string;
  userImage?: string;
  rating?: number;
  comment?: string;
  text?: string;
  date?: string;
  created_at?: string;
  helpful_count?: number;
  host_response?: {
    text: string;
    date: string;
    author?: string;
  };
}

/**
 * Transform reviews data from backend format
 */
function transformReviewsData(reviewsData: unknown): PropertyDetails['reviewsList'] {
  if (!Array.isArray(reviewsData)) {
    return getDefaultReviews();
  }

  return (reviewsData as BackendReviewData[]).map(review => ({
    id: review.id,
    userName: review.user_name || review.userName || 'Anonymous',
    userImage: review.user_image || review.userImage || getDefaultUserImage(),
    rating: review.rating || 5,
    comment: review.comment || review.text || '',
    date: review.date || review.created_at || new Date().toISOString(),
    helpful: review.helpful_count || 0,
    response: review.host_response ? {
      text: review.host_response.text,
      date: review.host_response.date,
      author: review.host_response.author || 'Host',
    } : undefined,
  }));
}

/**
 * Get default property images
 */
function getDefaultImages(): string[] {
  return [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
  ];
}

/**
 * Get default house rules
 */
function getDefaultRules(): string[] {
  return [
    'Check-in: 4:00 PM - 9:00 PM',
    'Checkout: 11:00 AM',
    'No smoking',
    'No pets allowed',
    'No parties or events',
    'Quiet hours: 10:00 PM - 8:00 AM',
  ];
}

/**
 * Get default cancellation policy
 */
function getDefaultCancellationPolicy(): string {
  return 'Free cancellation for 48 hours. Cancel before check-in for a partial refund.';
}

/**
 * Get default reviews for display
 */
function getDefaultReviews(): PropertyDetails['reviewsList'] {
  return [
    {
      id: 1,
      userName: 'Mike Chen',
      userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
      rating: 5,
      comment: 'Absolutely stunning property! The ocean views are incredible and the villa exceeded all expectations.',
      date: 'October 2023',
    },
    {
      id: 2,
      userName: 'Emily Rodriguez',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
      rating: 5,
      comment: 'Perfect getaway spot. The private pool and beach access made our vacation unforgettable.',
      date: 'September 2023',
    },
  ];
}

/**
 * Get default host image
 */
function getDefaultHostImage(): string {
  return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop';
}

/**
 * Get default user image for reviews
 */
function getDefaultUserImage(): string {
  return 'https://images.unsplash.com/photo-1494790108755-2616b332c3e5?w=50&h=50&fit=crop';
}

/**
 * Create structured property error
 */
function createPropertyError(message: string, type: PropertyError['type'], originalError?: Error): PropertyError {
  return {
    type,
    message,
    code: originalError?.message,
    retryable: type === 'NETWORK_ERROR' || type === 'PROPERTY_UNAVAILABLE',
    suggestions: getErrorSuggestions(type),
  };
}

/**
 * Get error suggestions based on error type
 */
function getErrorSuggestions(type: PropertyError['type']): string[] {
  const suggestions = {
    PROPERTY_NOT_FOUND: ['Check the property URL', 'Browse available properties', 'Contact support if this persists'],
    PROPERTY_UNAVAILABLE: ['Try refreshing the page', 'Check availability dates', 'View similar properties'],
    BOOKING_FAILED: ['Check your payment information', 'Verify booking dates', 'Contact the host directly'],
    PRICE_CALCULATION_ERROR: ['Refresh the page', 'Clear and re-select dates', 'Contact support'],
    VALIDATION_ERROR: ['Check required fields', 'Verify date selections', 'Ensure guest count is valid'],
    NETWORK_ERROR: ['Check your internet connection', 'Try again in a moment', 'Refresh the page'],
  };
  
  return suggestions[type] || ['Try refreshing the page', 'Contact support if the issue persists'];
}

/**
 * Main usePropertyDetails hook
 */
export function usePropertyDetails(
  propertyId: string | undefined,
  options: Partial<UsePropertyDetailsOptions> = {}
): UsePropertyDetailsReturn {
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [
    options?.enableCaching,
    options?.cacheTimeout,
    options?.transformData,
    options?.includeReviews,
    options?.includeHost,
    options?.enableRetry,
    options?.maxRetries,
    options?.onError,
    options?.prefetchImages,
    options?.enableBackgroundRefresh
  ]);
  
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const cacheRef = useRef<Map<string, { data: PropertyDetails; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Use the established async operation pattern
  const {
    loading,
    error: rawError,
    execute: executePropertyFetch,
  } = useAsyncOperation<PropertyDetails>();

  // Transform raw error to PropertyError
  const error: PropertyError | null = useMemo(() => {
    if (!rawError) return null;
    
    if (rawError.message.includes('404') || rawError.message.includes('not found')) {
      return createPropertyError('Property not found', 'PROPERTY_NOT_FOUND', rawError);
    }
    
    if (rawError.message.includes('network') || rawError.message.includes('fetch')) {
      return createPropertyError('Network error occurred', 'NETWORK_ERROR', rawError);
    }
    
    return createPropertyError('Failed to load property', 'PROPERTY_UNAVAILABLE', rawError);
  }, [rawError]);

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!lastUpdated) return false;
    return Date.now() - lastUpdated > config.cacheTimeout;
  }, [lastUpdated, config.cacheTimeout]);

  /**
   * Fetch property data with caching and error handling
   */
  const fetchPropertyData = useCallback(async () => {
    if (!propertyId) return;

    // Check cache first
    if (config.enableCaching) {
      const cached = cacheRef.current.get(propertyId);
      if (cached && Date.now() - cached.timestamp < config.cacheTimeout) {
        setProperty(cached.data);
        setLastUpdated(cached.timestamp);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await executePropertyFetch(async () => {
        const response = await propertiesAPI.getById(propertyId);
        const transformedProperty = config.transformData(response.data);
        
        // Cache the result
        if (config.enableCaching) {
          cacheRef.current.set(propertyId, {
            data: transformedProperty,
            timestamp: Date.now(),
          });
        }
        
        return transformedProperty;
      });

      if (result && !abortControllerRef.current.signal.aborted) {
        setProperty(result);
        setLastUpdated(Date.now());
        setRetryCount(0); // Reset retry count on success
        
        // Prefetch images if enabled
        if (config.prefetchImages && result.images.length > 0) {
          result.images.forEach(imageUrl => {
            const img = new Image();
            img.src = imageUrl;
          });
        }
      }
    } catch (fetchError) {
      if (!abortControllerRef.current.signal.aborted) {
        setRetryCount(prev => prev + 1);
        config.onError(error!);
      }
    }
  }, [propertyId, config, executePropertyFetch]);

  // Initial fetch and propertyId change handling
  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
    } else {
      setProperty(null);
      setLastUpdated(null);
      setRetryCount(0);
    }

    // Cleanup on unmount or propertyId change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [propertyId, fetchPropertyData]);

  // Auto-retry logic with exponential backoff
  useEffect(() => {
    if (error && config.enableRetry && retryCount < config.maxRetries && retryCount > 0) {
      const delay = Math.pow(2, retryCount - 1) * 1000; // Exponential backoff
      
      const timer = setTimeout(() => {
        fetchPropertyData();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [error, config.enableRetry, config.maxRetries, retryCount, fetchPropertyData]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    setRetryCount(0);
    await fetchPropertyData();
  }, [fetchPropertyData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    // This would be handled by useAsyncOperation, but we can add custom logic here
    setRetryCount(0);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setProperty(null);
    setLastUpdated(null);
    setRetryCount(0);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear cache for this property
    if (propertyId) {
      cacheRef.current.delete(propertyId);
    }
  }, [propertyId]);

  /**
   * Get property URL
   */
  const getPropertyUrl = useCallback((id?: string) => {
    const targetId = id || propertyId;
    return targetId ? `/property/${targetId}` : '';
  }, [propertyId]);

  /**
   * Check if booking is available for a specific date
   */
  const isBookingAvailable = useCallback((date: Date) => {
    if (!property?.availability) return true;
    
    const dateString = date.toISOString().split('T')[0];
    const availability = property.availability.find(avail => avail.date === dateString);
    
    return availability?.available !== false;
  }, [property?.availability]);

  return {
    // Data state
    property,
    loading,
    error,
    
    // Metadata
    lastUpdated,
    retryCount,
    isStale,
    
    // Actions
    refetch,
    clearError,
    reset,
    
    // Utility functions
    getPropertyUrl,
    isBookingAvailable,
  };
}