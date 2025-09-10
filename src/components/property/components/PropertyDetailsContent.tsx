'use client';

/**
 * @fileoverview PropertyDetailsContent Component
 * 
 * Enterprise-grade content wrapper that combines all extracted property components
 * with performance optimizations and error boundary integration.
 */

import React, { memo, Suspense } from 'react';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GoogleMap } from '@/components/property/GoogleMap';
import { SimilarProperties } from '@/components/property/SimilarProperties';
import { cn } from '@/lib/utils';

// Lazy imports for better performance
import { PropertyImageGallery } from './PropertyImageGallery';
import { PropertyHeader } from './PropertyHeader';
import { PropertyInfo } from './PropertyInfo';
import { PropertyDescription } from './PropertyDescription';
import { PropertyAmenities } from './PropertyAmenities';
import { PropertyReviews } from './PropertyReviews';
import { PropertyRules } from './PropertyRules';
import { PropertyBookingCard } from './PropertyBookingCard';

import type { 
  PropertyDetails, 
  GuestSelection,
  BookingFormData,
  PropertyError 
} from '../types';

interface PropertyDetailsContentProps {
  /** Property data */
  property: PropertyDetails;
  /** Check-in date */
  checkIn: Date | null;
  /** Check-out date */
  checkOut: Date | null;
  /** Guest selection */
  guests: GuestSelection;
  /** Date selection handler */
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  /** Guest selection handler */
  onGuestsChange: (guests: GuestSelection) => void;
  /** Booking handler */
  onBooking: (bookingData: BookingFormData) => Promise<void>;
  /** Share handler */
  onShare?: () => void;
  /** Favorite toggle handler */
  onToggleFavorite?: () => void;
  /** Loading states */
  isBookingLoading?: boolean;
  isFavoriteLoading?: boolean;
  /** Errors */
  bookingError?: PropertyError | null;
  /** Error handlers */
  onBookingErrorDismiss?: () => void;
  /** Optional CSS classes */
  className?: string;
  /** Show similar properties */
  showSimilarProperties?: boolean;
}

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
      fallback={
        <div className="h-96 lg:h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Images temporarily unavailable</p>
        </div>
      }
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
        fallback={<div className="border-b border-gray-200 pb-8 mb-8 h-32 bg-gray-50 rounded flex items-center justify-center"><p className="text-gray-500">Property info temporarily unavailable</p></div>}
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
        fallback={<div className="border-b border-gray-200 pb-8 mb-8"><h3 className="text-xl font-semibold mb-4">What this place offers</h3><p className="text-gray-500">Amenities list temporarily unavailable</p></div>}
      >
        <PropertyAmenities amenities={property.amenities || []} />
      </FeatureErrorBoundary>

      {/* Reviews Section */}
      <FeatureErrorBoundary 
        featureName="Property Reviews" 
        level="medium"
        fallback={<div className="border-b border-gray-200 pb-8 mb-8"><h3 className="text-xl font-semibold mb-4">Reviews</h3><p className="text-gray-500">Reviews temporarily unavailable</p></div>}
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
        fallback={<div className="border-b border-gray-200 pb-8 mb-8"><h3 className="text-xl font-semibold mb-4">Location</h3><p className="text-gray-500">Map temporarily unavailable</p></div>}
      >
        <div className="border-b border-gray-200 pb-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">Where you'll be</h3>
          <GoogleMap
            latitude={property.latitude}
            longitude={property.longitude}
            address={property.location}
            title={property.title}
            className="h-80"
          />
        </div>
      </FeatureErrorBoundary>
    </div>
  );
});

/**
 * Memoized Booking Section with Error Boundary
 */
const BookingSection = memo(function BookingSection({
  property,
  checkIn,
  checkOut,
  guests,
  onDateSelect,
  onGuestsChange,
  onBooking,
  isBookingLoading,
  bookingError,
  onBookingErrorDismiss,
}: {
  property: PropertyDetails;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: GuestSelection;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  onGuestsChange: (guests: GuestSelection) => void;
  onBooking: (bookingData: BookingFormData) => Promise<void>;
  isBookingLoading?: boolean;
  bookingError?: PropertyError | null;
  onBookingErrorDismiss?: () => void;
}) {
  return (
    <div className="lg:col-span-1">
      <FeatureErrorBoundary 
        featureName="Property Booking" 
        level="high"
        enableRetry={true}
        fallback={
          <div className="sticky top-24 p-6 border rounded-lg bg-gray-50 text-center">
            <p className="text-gray-600 mb-4">Booking form temporarily unavailable</p>
            <p className="text-sm text-gray-500">Please try refreshing the page or contact support</p>
          </div>
        }
      >
        <PropertyBookingCard
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onDateSelect={onDateSelect}
          onGuestsChange={onGuestsChange}
          onBooking={onBooking}
          isLoading={isBookingLoading}
          error={bookingError}
          onErrorDismiss={onBookingErrorDismiss}
        />
      </FeatureErrorBoundary>
    </div>
  );
});

/**
 * PropertyDetailsContent - Main content wrapper with performance optimizations
 * 
 * Features:
 * - Error boundary protection for all major sections
 * - Performance optimization with React.memo and proper component splitting
 * - Fallback UI for each section based on criticality
 * - Loading states and error handling
 * - Responsive grid layout
 * - Accessibility support
 */
export const PropertyDetailsContent = memo(function PropertyDetailsContent({
  property,
  checkIn,
  checkOut,
  guests,
  onDateSelect,
  onGuestsChange,
  onBooking,
  onShare,
  onToggleFavorite,
  isBookingLoading = false,
  isFavoriteLoading = false,
  bookingError,
  onBookingErrorDismiss,
  className,
  showSimilarProperties = true,
}: PropertyDetailsContentProps) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
      {/* Property Header */}
      <FeatureErrorBoundary 
        featureName="Property Header" 
        level="high"
        fallback={
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="text-gray-600">{property.location}</div>
          </div>
        }
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
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onDateSelect={onDateSelect}
          onGuestsChange={onGuestsChange}
          onBooking={onBooking}
          isBookingLoading={isBookingLoading}
          bookingError={bookingError}
          onBookingErrorDismiss={onBookingErrorDismiss}
        />
      </div>

      {/* Similar Properties */}
      {showSimilarProperties && (
        <FeatureErrorBoundary 
          featureName="Similar Properties" 
          level="low"
          fallback={null}
        >
          <Suspense fallback={
            <div className="mt-12 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-gray-600">Loading similar properties...</p>
            </div>
          }>
            <SimilarProperties
              currentPropertyId={property.id}
              location={property.location}
              className="mt-12"
            />
          </Suspense>
        </FeatureErrorBoundary>
      )}
    </div>
  );
});

PropertyDetailsContent.displayName = 'PropertyDetailsContent';

export default PropertyDetailsContent;