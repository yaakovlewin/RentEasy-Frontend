/**
 * DashboardBookings Component
 * 
 * Comprehensive bookings management component with tab-based filtering,
 * status management, and booking actions. Extracted from the original
 * monolithic DashboardContent.tsx for better maintainability.
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
import Image from 'next/image';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  Eye, 
  MessageSquare, 
  Star, 
  Calendar,
  User
} from 'lucide-react';

import { cn, formatDate, DATE_FORMATS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FeatureErrorBoundary } from '@/components/error-boundaries';

import type { 
  DashboardBookingsProps, 
  BookingTabType, 
  BookingDisplay 
} from '../types';
import { 
  getBookingStatusInfo,
  getBookingActions,
  formatRefundAmount,
  ERROR_MESSAGES
} from '../utils';

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
      <div className={cn('text-center py-12', className)}>
        <div className='text-red-500 mb-4'>
          <Calendar className='w-16 h-16 mx-auto' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>Unable to Load Bookings</h3>
        <p className='text-gray-600 mb-6'>
          {error.message || ERROR_MESSAGES.BOOKING_LOAD_FAILED}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
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

// =============================================================================
// BOOKINGS LIST COMPONENT
// =============================================================================

interface BookingsListProps {
  bookings: BookingDisplay[];
  type: BookingTabType;
  onCancelBooking: (bookingId: string) => Promise<void>;
  cancellingBookingId: string | null;
}

const BookingsList: React.FC<BookingsListProps> = React.memo(({
  bookings,
  type,
  onCancelBooking,
  cancellingBookingId
}) => {
  // Empty state handling
  if (!bookings || bookings.length === 0) {
    return <BookingsEmptyState type={type} />;
  }

  return (
    <>
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          type={type}
          onCancelBooking={onCancelBooking}
          isCancelling={cancellingBookingId === booking.id}
        />
      ))}
    </>
  );
});

BookingsList.displayName = 'BookingsList';

// =============================================================================
// BOOKING CARD COMPONENT
// =============================================================================

interface BookingCardProps {
  booking: BookingDisplay;
  type: BookingTabType;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isCancelling: boolean;
}

const BookingCard: React.FC<BookingCardProps> = React.memo(({
  booking,
  type,
  onCancelBooking,
  isCancelling
}) => {
  const statusInfo = getBookingStatusInfo(booking.status);
  const actions = getBookingActions(booking.status);

  // Apply different styling based on type
  const cardClassName = cn(
    'overflow-hidden transition-all duration-200',
    type === 'past' && 'opacity-75',
    type === 'cancelled' && 'opacity-60'
  );

  const imageClassName = cn(
    'object-cover',
    type === 'cancelled' && 'grayscale'
  );

  return (
    <Card className={cardClassName}>
      <CardContent className='p-0'>
        <div className='flex'>
          {/* Property Image */}
          <div className='w-48 h-32 flex-shrink-0 relative'>
            <Image
              src={booking.propertyImage || ''}
              alt={booking.propertyTitle || 'Property'}
              fill
              className={imageClassName}
              sizes='192px'
            />
          </div>

          {/* Booking Details */}
          <div className='flex-1 p-4'>
            <div className='flex items-start justify-between mb-2'>
              <div className='flex-1'>
                <h3 className='font-semibold text-lg mb-1'>
                  {booking.propertyTitle}
                </h3>
                <p className='text-gray-600 flex items-center text-sm'>
                  <MapPin className='w-3 h-3 mr-1' />
                  {booking.location}
                </p>
              </div>
              <Badge className={statusInfo.colorClass}>
                <statusInfo.icon className='w-4 h-4' />
                <span className='ml-1'>{statusInfo.label}</span>
              </Badge>
            </div>

            {/* Booking Information Grid */}
            <BookingInfoGrid booking={booking} type={type} />

            {/* Host Information and Actions */}
            <div className='flex items-center justify-between mt-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-6 h-6 relative'>
                  <Image
                    src={booking.hostImage || ''}
                    alt={booking.hostName || 'Host'}
                    fill
                    className='rounded-full object-cover'
                    sizes='24px'
                  />
                </div>
                <span className='text-sm text-gray-600'>
                  {type === 'cancelled' ? 'Was hosted by' : 'Hosted by'} {booking.hostName || 'Host'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center space-x-2'>
                {actions.canView && (
                  <Button variant='outline' size='sm'>
                    <Eye className='w-3 h-3 mr-1' />
                    View
                  </Button>
                )}

                {actions.canMessage && (
                  <Button variant='outline' size='sm'>
                    <MessageSquare className='w-3 h-3 mr-1' />
                    Message
                  </Button>
                )}

                {actions.canReview && (
                  <Button variant='outline' size='sm'>
                    <Star className='w-3 h-3 mr-1' />
                    Review
                  </Button>
                )}

                {actions.canBookAgain && (
                  <Link href={`/property/${booking.propertyId}`}>
                    <Button variant='outline' size='sm'>
                      Book Again
                    </Button>
                  </Link>
                )}

                {actions.canCancel && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                    disabled={isCancelling}
                    onClick={() => onCancelBooking(booking.id)}
                  >
                    {isCancelling ? (
                      <LoadingSpinner size='sm' className='mr-1' />
                    ) : null}
                    {isCancelling ? 'Cancelling...' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BookingCard.displayName = 'BookingCard';

// =============================================================================
// BOOKING INFO GRID COMPONENT
// =============================================================================

interface BookingInfoGridProps {
  booking: BookingDisplay;
  type: BookingTabType;
}

const BookingInfoGrid: React.FC<BookingInfoGridProps> = React.memo(({
  booking,
  type
}) => {
  if (type === 'past') {
    return (
      <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
        <div>
          <span className='text-gray-600'>Stayed:</span>
          <div className='font-medium'>
            {formatDate(booking.checkIn, DATE_FORMATS.SHORT)} - {formatDate(booking.checkOut, DATE_FORMATS.SHORT)}
          </div>
        </div>
        <div>
          <span className='text-gray-600'>Total paid:</span>
          <div className='font-medium'>${booking.totalPrice}</div>
        </div>
      </div>
    );
  }

  if (type === 'cancelled') {
    return (
      <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
        <div>
          <span className='text-gray-600'>Was scheduled:</span>
          <div className='font-medium'>
            {formatDate(booking.checkIn, DATE_FORMATS.SHORT)} - {formatDate(booking.checkOut, DATE_FORMATS.SHORT)}
          </div>
        </div>
        <div>
          <span className='text-gray-600'>Refunded:</span>
          <div className='font-medium'>
            {formatRefundAmount(booking.totalPrice)}
          </div>
        </div>
      </div>
    );
  }

  // Default for upcoming bookings
  return (
    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
      <div>
        <span className='text-gray-600'>Check-in:</span>
        <div className='font-medium'>
          {formatDate(booking.checkIn, DATE_FORMATS.SHORT)}
        </div>
      </div>
      <div>
        <span className='text-gray-600'>Check-out:</span>
        <div className='font-medium'>
          {formatDate(booking.checkOut, DATE_FORMATS.SHORT)}
        </div>
      </div>
      <div>
        <span className='text-gray-600'>Guests:</span>
        <div className='font-medium'>{booking.guests} guests</div>
      </div>
      <div>
        <span className='text-gray-600'>Total:</span>
        <div className='font-medium'>${booking.totalPrice}</div>
      </div>
    </div>
  );
});

BookingInfoGrid.displayName = 'BookingInfoGrid';

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface BookingsEmptyStateProps {
  type: BookingTabType;
}

const BookingsEmptyState: React.FC<BookingsEmptyStateProps> = React.memo(({
  type
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'upcoming':
        return {
          icon: <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />,
          title: 'No upcoming bookings',
          description: 'When you book a stay, it will appear here.',
          action: (
            <Link href='/search'>
              <Button>Browse Properties</Button>
            </Link>
          )
        };
      case 'past':
        return {
          icon: <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />,
          title: 'No past bookings',
          description: 'Your completed stays will appear here.',
          action: null
        };
      case 'cancelled':
        return {
          icon: <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />,
          title: 'No cancelled bookings',
          description: 'Any cancelled bookings will appear here.',
          action: null
        };
      default:
        return {
          icon: <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />,
          title: 'No bookings found',
          description: 'Start exploring and book your next stay.',
          action: (
            <Link href='/search'>
              <Button>Browse Properties</Button>
            </Link>
          )
        };
    }
  };

  const { icon, title, description, action } = getEmptyStateContent();

  return (
    <div className='text-center py-12'>
      {icon}
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='text-gray-600 mb-6'>{description}</p>
      {action}
    </div>
  );
});

BookingsEmptyState.displayName = 'BookingsEmptyState';

export { DashboardBookings };