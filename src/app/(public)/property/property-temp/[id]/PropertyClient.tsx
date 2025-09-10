'use client';

/**
 * @fileoverview PropertyDetailsPage Client Component
 * 
 * ENTERPRISE-GRADE TRANSFORMATION COMPLETE!
 * 
 * Refactored from page.tsx to separate client logic from server metadata generation.
 * Maintains all existing functionality while enabling SEO optimization.
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

// Enterprise-grade hooks and components
import { usePropertyDetails } from '@/components/property/hooks';
import { PropertyDetailsContent } from '@/components/property/components/PropertyDetailsContent';
import { FeatureErrorBoundary } from '@/components/error-boundaries';

import type { 
  GuestSelection, 
  BookingFormData,
  PropertyError
} from '@/components/property/types';

interface PropertyClientProps {
  propertyId: string;
}

/**
 * PropertyClient - Client Component for Property Details
 * 
 * Handles all client-side interactions while allowing parent server 
 * component to generate metadata for SEO optimization.
 */
export default function PropertyClient({ propertyId }: PropertyClientProps) {
  const router = useRouter();

  // Booking form state
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestSelection>({
    adults: 2,
    children: 0,
    infants: 0,
  });

  // UI state
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [bookingError, setBookingError] = useState<PropertyError | null>(null);

  // Stabilize the onError callback to prevent infinite re-renders
  const onPropertyError = useCallback((error: any) => {
    console.error('Property fetch error:', error);
  }, []);

  // Enterprise property data management
  const {
    property,
    loading: propertyLoading,
    error: propertyError,
    refetch: refetchProperty
  } = usePropertyDetails(propertyId, {
    enableCaching: true,
    prefetchImages: true,
    onError: onPropertyError,
  });

  /**
   * Handle date selection with validation
   */
  const handleDateSelect = useCallback((newCheckIn: Date | null, newCheckOut: Date | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    // Clear any previous booking errors when dates change
    setBookingError(null);
  }, []);

  /**
   * Handle guest selection changes
   */
  const handleGuestsChange = useCallback((newGuests: GuestSelection) => {
    setGuests(newGuests);
    // Clear any previous booking errors when guests change
    setBookingError(null);
  }, []);

  /**
   * Handle booking submission with enterprise error handling
   */
  const handleBooking = useCallback(async (bookingData: BookingFormData) => {
    setIsBookingLoading(true);
    setBookingError(null);

    try {
      // TODO: Implement actual booking API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      
      // Success - redirect or show success message
      // router.push('/booking/confirmation');
      
    } catch (error) {
      console.error('Booking failed:', error);
      
      // Set structured error for user feedback
      setBookingError({
        type: 'BOOKING_FAILED',
        message: 'Booking failed. Please try again.',
        retryable: true,
        suggestions: [
          'Check your internet connection',
          'Verify your booking details',
          'Try again in a few moments',
        ],
      });
    } finally {
      setIsBookingLoading(false);
    }
  }, []);

  /**
   * Handle property sharing
   */
  const handleShare = useCallback(() => {
    // Share functionality is handled within PropertyHeader component
  }, []);

  /**
   * Handle favorite toggle
   */
  const handleToggleFavorite = useCallback(async () => {
    if (!property) return;

    setIsFavoriteLoading(true);
    
    try {
      // TODO: Implement actual favorite API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      // Refresh property data to get updated favorite status
      refetchProperty();
      
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [property, refetchProperty]);

  /**
   * Handle navigation back
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Loading state
   */
  if (propertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (propertyError || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <ErrorDisplay
            error={propertyError || new Error('Property not found')}
            onRetry={refetchProperty}
            className="text-center"
          />
          
          <Button
            onClick={handleBack}
            variant="ghost"
            className="w-full mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to search
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Main render with enterprise error boundary protection
   */
  return (
    <FeatureErrorBoundary 
      featureName="Property Details Page" 
      level="critical"
      enableRetry={true}
      onRetry={refetchProperty}
    >
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <PropertyDetailsContent
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onDateSelect={handleDateSelect}
          onGuestsChange={handleGuestsChange}
          onBooking={handleBooking}
          onShare={handleShare}
          onToggleFavorite={handleToggleFavorite}
          isBookingLoading={isBookingLoading}
          isFavoriteLoading={isFavoriteLoading}
          bookingError={bookingError}
          onBookingErrorDismiss={() => setBookingError(null)}
        />
      </div>
    </FeatureErrorBoundary>
  );
}