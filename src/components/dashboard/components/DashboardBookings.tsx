/**
 * DashboardBookings Component
 *
 * Comprehensive bookings management component with tab-based filtering,
 * status management, and booking actions. Refactored to use sub-components
 * for better maintainability and adherence to Single Responsibility Principle.
 *
 * Features:
 * - Tab-based filtering (upcoming, past, cancelled)
 * - Rich booking cards with property images and details
 * - Status-specific actions (view, message, cancel, review, book again)
 * - Booking cancellation with confirmation
 * - Loading states and empty state handling
 * - Responsive design with proper image handling
 * - Performance optimized with React.memo
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { ErrorStateDisplay } from '@/components/ui/ErrorStateDisplay';

import type {
  DashboardBookingsProps,
  BookingTabType
} from '../types';

import { BookingsList } from '../bookings';

/**
 * Dashboard Bookings Component
 *
 * Provides comprehensive booking management with filtering, actions,
 * and status-specific behavior.
 */
const DashboardBookings: React.FC<DashboardBookingsProps> = React.memo(({
  bookings,
  onCancelBooking,
  cancellingBookingId,
  isActive,
  isLoading = false,
  error,
  className
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [activeBookingTab, setActiveBookingTab] = useState<BookingTabType>('upcoming');

  // =============================================================================
  // MEMOIZED BOOKING FILTERING
  // =============================================================================

  /**
   * Filter bookings by tab type
   */
  const filteredBookings = useMemo(() => {
    // Handle case where bookings might be undefined or null
    if (!bookings || !Array.isArray(bookings)) {
      return [];
    }

    switch (activeBookingTab) {
      case 'upcoming':
        return bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
      case 'past':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return bookings;
    }
  }, [bookings, activeBookingTab]);

  /**
   * Get booking counts for tab badges
   */
  const bookingCounts = useMemo(() => {
    // Handle case where bookings might be undefined or null
    const safeBookings = bookings || [];

    const upcoming = safeBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const past = safeBookings.filter(b => b.status === 'completed').length;
    const cancelled = safeBookings.filter(b => b.status === 'cancelled').length;

    return { upcoming, past, cancelled };
  }, [bookings]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handle booking cancellation with confirmation
   */
  const handleCancelBooking = useCallback(async (bookingId: string) => {
    // In a real app, you might want to show a confirmation dialog first
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        await onCancelBooking(bookingId);
      } catch (error) {
        // Error handling is done by parent component
        console.error('Booking cancellation error:', error);
      }
    }
  }, [onCancelBooking]);

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header Skeleton */}
        <div className='flex items-center justify-between mb-6'>
          <div className='h-8 bg-gray-200 rounded animate-pulse w-48' />
          <div className='h-10 bg-gray-200 rounded animate-pulse w-32' />
        </div>

        {/* Tabs Skeleton */}
        <div className='mb-6'>
          <div className='flex space-x-4 mb-4'>
            {[...Array(3)].map((_, index) => (
              <div key={index} className='h-10 bg-gray-200 rounded animate-pulse w-24' />
            ))}
          </div>

          {/* Booking Cards Skeleton */}
          <div className='space-y-4'>
            {[...Array(3)].map((_, index) => (
              <Card key={index} className='overflow-hidden'>
                <CardContent className='p-0'>
                  <div className='flex'>
                    <div className='w-48 h-32 bg-gray-200 animate-pulse' />
                    <div className='flex-1 p-4 space-y-3'>
                      <div className='h-6 bg-gray-200 rounded animate-pulse w-3/4' />
                      <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2' />
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='h-4 bg-gray-200 rounded animate-pulse' />
                        <div className='h-4 bg-gray-200 rounded animate-pulse' />
                      </div>
                      <div className='flex justify-between'>
                        <div className='h-4 bg-gray-200 rounded animate-pulse w-1/3' />
                        <div className='flex space-x-2'>
                          <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
                          <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // ERROR STATE
  // =============================================================================

  if (error) {
    return (
      <ErrorStateDisplay
        error={error}
        title="Unable to Load Bookings"
        onRetry={() => window.location.reload()}
        icon={<Calendar className='w-16 h-16' />}
        className={className}
      />
    );
  }

  // =============================================================================
  // RENDER BOOKINGS
  // =============================================================================

  return (
    <FeatureErrorBoundary featureName="Dashboard Bookings" level="high">
      <div className={cn('space-y-6', className)}>
        {/* Header Section */}
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>My Bookings</h2>
          <Link href='/search'>
            <Button>
              <Plus className='w-4 h-4 mr-2' />
              Book New Stay
            </Button>
          </Link>
        </div>

        {/* Bookings Tabs */}
        <Tabs
          value={activeBookingTab}
          onValueChange={(value) => setActiveBookingTab(value as BookingTabType)}
          className='mb-6'
        >
          <TabsList>
            <TabsTrigger value='upcoming' className='relative'>
              Upcoming
              {bookingCounts.upcoming > 0 && (
                <Badge
                  variant="secondary"
                  className='ml-2 px-1.5 py-0.5 text-xs'
                >
                  {bookingCounts.upcoming}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='past' className='relative'>
              Past
              {bookingCounts.past > 0 && (
                <Badge
                  variant="secondary"
                  className='ml-2 px-1.5 py-0.5 text-xs'
                >
                  {bookingCounts.past}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='cancelled' className='relative'>
              Cancelled
              {bookingCounts.cancelled > 0 && (
                <Badge
                  variant="secondary"
                  className='ml-2 px-1.5 py-0.5 text-xs'
                >
                  {bookingCounts.cancelled}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value='upcoming' className='space-y-4'>
            <BookingsList
              bookings={filteredBookings}
              type="upcoming"
              onCancelBooking={handleCancelBooking}
              cancellingBookingId={cancellingBookingId}
            />
          </TabsContent>

          {/* Past Bookings */}
          <TabsContent value='past' className='space-y-4'>
            <BookingsList
              bookings={filteredBookings}
              type="past"
              onCancelBooking={handleCancelBooking}
              cancellingBookingId={cancellingBookingId}
            />
          </TabsContent>

          {/* Cancelled Bookings */}
          <TabsContent value='cancelled' className='space-y-4'>
            <BookingsList
              bookings={filteredBookings}
              type="cancelled"
              onCancelBooking={handleCancelBooking}
              cancellingBookingId={cancellingBookingId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </FeatureErrorBoundary>
  );
});

DashboardBookings.displayName = 'DashboardBookings';

export { DashboardBookings };
