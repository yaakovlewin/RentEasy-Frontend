/**
 * BookingActions Component
 *
 * Displays action buttons based on booking status.
 * Extracted from DashboardBookings for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display appropriate action buttons (View, Message, Review, Cancel, Book Again)
 * - Handle button states (loading, disabled)
 * - Navigate to booking details or property page
 *
 * Refactored Features:
 * - Data-driven action configuration
 * - Extracted reusable ActionButton component
 * - Type-safe action definitions
 * - Cleaner, more maintainable code structure
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, MessageSquare, Star, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getBookingActions } from '../utils';
import type { BookingDisplay } from '../types';

export interface BookingActionsProps {
  booking: BookingDisplay;
  isCancelling: boolean;
  onCancelBooking: (bookingId: string) => Promise<void>;
}

/**
 * Action button configuration type
 */
interface ActionConfig {
  key: string;
  icon?: LucideIcon;
  label: string;
  variant?: 'outline' | 'default' | 'destructive';
  className?: string;
  onClick?: () => void;
  href?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
}

/**
 * Individual Action Button Component
 */
const ActionButton: React.FC<ActionConfig> = React.memo(({
  icon: Icon,
  label,
  variant = 'outline',
  className,
  onClick,
  href,
  isLoading = false,
  loadingLabel,
  disabled = false
}) => {
  const buttonContent = (
    <>
      {isLoading ? (
        <LoadingSpinner size='sm' className='mr-1' />
      ) : Icon ? (
        <Icon className='w-3 h-3 mr-1' />
      ) : null}
      {isLoading && loadingLabel ? loadingLabel : label}
    </>
  );

  const buttonProps = {
    variant,
    size: 'sm' as const,
    className,
    disabled: disabled || isLoading,
    onClick
  };

  if (href && !disabled && !isLoading) {
    return (
      <Link href={href}>
        <Button {...buttonProps}>
          {buttonContent}
        </Button>
      </Link>
    );
  }

  return (
    <Button {...buttonProps}>
      {buttonContent}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

/**
 * Booking Actions Component
 *
 * Shows status-appropriate action buttons for bookings.
 */
export const BookingActions: React.FC<BookingActionsProps> = React.memo(({
  booking,
  isCancelling,
  onCancelBooking
}) => {
  const router = useRouter();
  const actions = getBookingActions(booking.status);

  const handleViewBooking = useCallback(() => {
    router.push(`/dashboard/bookings/${booking.id}`);
  }, [router, booking.id]);

  const handleMessageHost = useCallback(() => {
    router.push(`/messages?bookingId=${booking.id}`);
  }, [router, booking.id]);

  const handleReviewProperty = useCallback(() => {
    router.push(`/property/${booking.propertyId}/review?bookingId=${booking.id}`);
  }, [router, booking.propertyId, booking.id]);

  const handleCancelBooking = useCallback(() => {
    onCancelBooking(booking.id);
  }, [onCancelBooking, booking.id]);

  const actionConfigs = useMemo<ActionConfig[]>(() => {
    const configs: ActionConfig[] = [];

    if (actions.canView) {
      configs.push({
        key: 'view',
        icon: Eye,
        label: 'View',
        onClick: handleViewBooking
      });
    }

    if (actions.canMessage) {
      configs.push({
        key: 'message',
        icon: MessageSquare,
        label: 'Message',
        onClick: handleMessageHost
      });
    }

    if (actions.canReview) {
      configs.push({
        key: 'review',
        icon: Star,
        label: 'Review',
        onClick: handleReviewProperty
      });
    }

    if (actions.canBookAgain) {
      configs.push({
        key: 'book-again',
        label: 'Book Again',
        href: `/property/${booking.propertyId}`
      });
    }

    if (actions.canCancel) {
      configs.push({
        key: 'cancel',
        label: 'Cancel',
        loadingLabel: 'Cancelling...',
        className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        onClick: handleCancelBooking,
        isLoading: isCancelling,
        disabled: isCancelling
      });
    }

    return configs;
  }, [
    actions,
    booking.propertyId,
    isCancelling,
    handleViewBooking,
    handleMessageHost,
    handleReviewProperty,
    handleCancelBooking
  ]);

  if (actionConfigs.length === 0) {
    return null;
  }

  return (
    <div className='flex items-center space-x-2'>
      {actionConfigs.map(({ key, ...config }) => (
        <ActionButton key={key} {...config} />
      ))}
    </div>
  );
});

BookingActions.displayName = 'BookingActions';
