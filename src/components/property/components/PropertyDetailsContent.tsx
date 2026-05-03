'use client';

/**
 * @fileoverview PropertyDetailsContent Component
 *
 * Enterprise-grade content wrapper that combines all extracted property components
 * with performance optimizations and error boundary integration.
 */

import React, { memo, Suspense, useMemo } from 'react';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SimilarProperties } from '@/components/property/SimilarProperties';
import { cn } from '@/lib/utils';

// Feature components
import { PropertyImageGallery } from './PropertyImageGallery';
import { PropertyHeader } from './PropertyHeader';
import { PropertyInfo } from './PropertyInfo';
import { PropertyDescription } from './PropertyDescription';
import { PropertyAmenities } from './PropertyAmenities';
import { PropertyReviews } from './PropertyReviews';
import { PropertyRules } from './PropertyRules';
import { PropertyBookingCard } from './PropertyBookingCard';
import { PropertyLocationSection } from './PropertyLocationSection';

// Fallback UI components
import {
  ImageGalleryFallback,
  PropertyInfoFallback,
  AmenitiesFallback,
  ReviewsFallback,
  LocationFallback,
  BookingFallback,
  HeaderFallback,
} from './PropertyDetailsFallbacks';

import type {
  PropertyDetails,
  GuestSelection,
  BookingFormData,
  PropertyError,
} from '../types';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Booking state management interface
 * Tracks all booking-related form state including dates, guests, and errors
 */
interface BookingState {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: GuestSelection;
  isLoading?: boolean;
  error?: PropertyError | null;
}

/**
 * Booking event handlers interface
 * Callbacks for all booking form interactions
 */
interface BookingHandlers {
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  onGuestsChange: (guests: GuestSelection) => void;
  onBooking: (bookingData: BookingFormData) => Promise<void>;
  onErrorDismiss?: () => void;
}

/**
 * Main component props interface
 */
interface PropertyDetailsContentProps {
  /** Complete property data object */
  property: PropertyDetails;
  /** Current booking form state */
  bookingState: BookingState;
  /** Booking form event handlers */
  bookingHandlers: BookingHandlers;
  /** Share button click handler */
  onShare?: () => void;
  /** Favorite toggle button handler */
  onToggleFavorite?: () => void;
  /** Loading state for favorite toggle */
  isFavoriteLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to display similar properties section */
  showSimilarProperties?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Transform PropertyDetails to Property format for SimilarProperties component
 * Ensures all required fields are present with sensible defaults
 */
const transformToProperty = (property: PropertyDetails): Record<string, unknown> => ({
  ...property,
  id: String(property.id),
  description: property.description || '',
  isActive: true,
  createdAt: property.createdAt || new Date().toISOString(),
  updatedAt: property.updatedAt || new Date().toISOString(),
});

// ============================================================================
// Sub-Components (Memoized Sections)
// ============================================================================

/**
 * Memoized Image Gallery with Error Boundary
 */
const ImageGallerySection = memo(function ImageGallerySection({
  property,
}: {
  property: PropertyDetails;
}) {
  return (
    <FeatureErrorBoundary
      featureName="Property Image Gallery"
      level="medium"
      fallback={<ImageGalleryFallback />}
    >
      <PropertyImageGallery
        images={property.images}
        title={property.title}
        className="mb-8"
        priority={true}
      />
    </FeatureErrorBoundary>
  );
});
ImageGallerySection.displayName = 'ImageGallerySection';

/**
 * Memoized Content Sections with Error Boundaries
 */
const ContentSections = memo(function ContentSections({
  property,
}: {
  property: PropertyDetails;
}) {
  return (
    <div className="lg:col-span-2">
      {/* Property Info Section */}
      <FeatureErrorBoundary
        featureName="Property Info"
        level="medium"
        fallback={<PropertyInfoFallback />}
      >
        <PropertyInfo property={property} />
      </FeatureErrorBoundary>

      {/* Description Section */}
      <FeatureErrorBoundary
        featureName="Property Description"
        level="low"
        fallback={null}
      >
        <PropertyDescription description={property.description || ''} />
      </FeatureErrorBoundary>

      {/* Amenities Section */}
      <FeatureErrorBoundary
        featureName="Property Amenities"
        level="medium"
        fallback={<AmenitiesFallback />}
      >
        <PropertyAmenities amenities={property.amenities || []} />
      </FeatureErrorBoundary>

      {/* Reviews Section */}
      <FeatureErrorBoundary
        featureName="Property Reviews"
        level="medium"
        fallback={<ReviewsFallback />}
      >
        <PropertyReviews
          reviews={property.reviewsList}
          rating={property.rating}
          totalReviewCount={property.reviews}
        />
      </FeatureErrorBoundary>

      {/* Rules Section */}
      <FeatureErrorBoundary
        featureName="Property Rules"
        level="low"
        fallback={null}
      >
        <PropertyRules rules={property.rules} />
      </FeatureErrorBoundary>

      {/* Location Section */}
      <FeatureErrorBoundary
        featureName="Property Location"
        level="medium"
        fallback={<LocationFallback />}
      >
        <PropertyLocationSection
          latitude={property.latitude}
          longitude={property.longitude}
          address={property.location}
          title={property.title}
        />
      </FeatureErrorBoundary>
    </div>
  );
});
ContentSections.displayName = 'ContentSections';

/**
 * Memoized Booking Section with Error Boundary
 */
const BookingSection = memo(function BookingSection({
  property,
  bookingState,
  bookingHandlers,
}: {
  property: PropertyDetails;
  bookingState: BookingState;
  bookingHandlers: BookingHandlers;
}) {
  return (
    <div className="lg:col-span-1">
      <FeatureErrorBoundary
        featureName="Property Booking"
        level="high"
        enableRetry={true}
        fallback={<BookingFallback />}
      >
        <PropertyBookingCard
          property={property}
          checkIn={bookingState.checkIn}
          checkOut={bookingState.checkOut}
          guests={bookingState.guests}
          onDateSelect={bookingHandlers.onDateSelect}
          onGuestsChange={bookingHandlers.onGuestsChange}
          onBooking={bookingHandlers.onBooking}
          isLoading={bookingState.isLoading}
          error={bookingState.error}
          onErrorDismiss={bookingHandlers.onErrorDismiss}
        />
      </FeatureErrorBoundary>
    </div>
  );
});
BookingSection.displayName = 'BookingSection';

// ============================================================================
// Main Component
// ============================================================================

/**
 * PropertyDetailsContent - Main content wrapper with performance optimizations
 *
 * Enterprise-grade property details layout combining all property information
 * sections with comprehensive error handling and performance optimizations.
 *
 * @features
 * - Error boundary protection for all major sections with fallback UI
 * - Memoized sub-components to prevent unnecessary re-renders
 * - Suspense boundaries for lazy-loaded content
 * - Responsive grid layout (mobile-first design)
 * - Optimized prop drilling with grouped handler objects
 * - Accessible markup and keyboard navigation support
 *
 * @performance
 * - Memoized property transformation for SimilarProperties
 * - Strategic component splitting to isolate re-render boundaries
 * - Lazy loading for non-critical sections
 *
 * @example
 * ```tsx
 * <PropertyDetailsContent
 *   property={propertyData}
 *   bookingState={{ checkIn, checkOut, guests, isLoading, error }}
 *   bookingHandlers={{ onDateSelect, onGuestsChange, onBooking }}
 *   onShare={handleShare}
 *   onToggleFavorite={handleFavorite}
 * />
 * ```
 */
export const PropertyDetailsContent = memo(function PropertyDetailsContent({
  property,
  bookingState,
  bookingHandlers,
  onShare,
  onToggleFavorite,
  isFavoriteLoading = false,
  className,
  showSimilarProperties = true,
}: PropertyDetailsContentProps) {
  // Memoize transformed property to prevent unnecessary recalculations
  const transformedProperty = useMemo(
    () => transformToProperty(property),
    [property.id, property.description, property.createdAt, property.updatedAt]
  );

  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
      {/* Property Header */}
      <FeatureErrorBoundary
        featureName="Property Header"
        level="high"
        fallback={<HeaderFallback title={property.title} location={property.location} />}
      >
        <PropertyHeader
          property={property}
          onShare={onShare}
          onToggleFavorite={onToggleFavorite}
          isFavoriteLoading={isFavoriteLoading}
        />
      </FeatureErrorBoundary>

      {/* Image Gallery */}
      <ImageGallerySection property={property} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Sections */}
        <ContentSections property={property} />

        {/* Booking Section */}
        <BookingSection
          property={property}
          bookingState={bookingState}
          bookingHandlers={bookingHandlers}
        />
      </div>

      {/* Similar Properties */}
      {showSimilarProperties && (
        <FeatureErrorBoundary
          featureName="Similar Properties"
          level="low"
          fallback={null}
        >
          <Suspense
            fallback={
              <div className="mt-12 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-gray-600">Loading similar properties...</p>
              </div>
            }
          >
            <SimilarProperties
              currentProperty={transformedProperty as never}
              className="mt-12"
            />
          </Suspense>
        </FeatureErrorBoundary>
      )}
    </div>
  );
});

PropertyDetailsContent.displayName = 'PropertyDetailsContent';

// Export types for consumers
export type { BookingState, BookingHandlers };

export default PropertyDetailsContent;