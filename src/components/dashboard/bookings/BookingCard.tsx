/**
 * BookingCard Component
 *
 * Displays individual booking information in a card format.
 * Extracted from DashboardBookings for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display property image and details
 * - Show booking status badge
 * - Render booking information grid
 * - Display host information
 * - Show appropriate action buttons
 */

'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getBookingStatusInfo } from '../utils';
import type { BookingDisplay, BookingTabType } from '../types';
import { BookingInfoGrid } from './BookingInfoGrid';
import { BookingActions } from './BookingActions';

export interface BookingCardProps {
  booking: BookingDisplay;
  type: BookingTabType;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isCancelling: boolean;
}

const CARD_IMAGE_WIDTH = 192;
const HOST_AVATAR_SIZE = 24;

const DEFAULT_PROPERTY_ALT = 'Property';
const DEFAULT_HOST_NAME = 'Host';

interface PropertyImageProps {
  src: string;
  alt: string;
  className: string;
}

const PropertyImage: React.FC<PropertyImageProps> = React.memo(({ src, alt, className }) => (
  <div className='w-48 h-32 flex-shrink-0 relative'>
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={`${CARD_IMAGE_WIDTH}px`}
    />
  </div>
));

PropertyImage.displayName = 'PropertyImage';

interface PropertyHeaderProps {
  title: string | undefined;
  location: string | undefined;
  statusInfo: ReturnType<typeof getBookingStatusInfo>;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = React.memo(({ title, location, statusInfo }) => (
  <div className='flex items-start justify-between mb-2'>
    <div className='flex-1'>
      <h3 className='font-semibold text-lg mb-1'>
        {title}
      </h3>
      <p className='text-gray-600 flex items-center text-sm'>
        <MapPin className='w-3 h-3 mr-1' />
        {location}
      </p>
    </div>
    <Badge className={statusInfo.colorClass}>
      <statusInfo.icon className='w-4 h-4' />
      <span className='ml-1'>{statusInfo.label}</span>
    </Badge>
  </div>
));

PropertyHeader.displayName = 'PropertyHeader';

interface HostInfoProps {
  hostImage: string;
  hostName: string;
  type: BookingTabType;
}

const HostInfo: React.FC<HostInfoProps> = React.memo(({ hostImage, hostName, type }) => {
  const hostLabel = type === 'cancelled' ? 'Was hosted by' : 'Hosted by';

  return (
    <div className='flex items-center space-x-2'>
      <div className='w-6 h-6 relative'>
        <Image
          src={hostImage}
          alt={hostName}
          fill
          className='rounded-full object-cover'
          sizes={`${HOST_AVATAR_SIZE}px`}
        />
      </div>
      <span className='text-sm text-gray-600'>
        {hostLabel} {hostName}
      </span>
    </div>
  );
});

HostInfo.displayName = 'HostInfo';

/**
 * Booking Card Component
 *
 * Shows complete booking information with contextual styling and actions.
 */
export const BookingCard: React.FC<BookingCardProps> = React.memo(({
  booking,
  type,
  onCancelBooking,
  isCancelling
}) => {
  const statusInfo = getBookingStatusInfo(booking.status);

  const cardClassName = useMemo(() => cn(
    'overflow-hidden transition-all duration-200',
    type === 'past' && 'opacity-75',
    type === 'cancelled' && 'opacity-60'
  ), [type]);

  const imageClassName = useMemo(() => cn(
    'object-cover',
    type === 'cancelled' && 'grayscale'
  ), [type]);

  const propertyImageSrc = booking.propertyImage || '';
  const propertyImageAlt = booking.propertyTitle || DEFAULT_PROPERTY_ALT;
  const hostImageSrc = booking.hostImage || '';
  const hostName = booking.hostName || DEFAULT_HOST_NAME;

  return (
    <Card className={cardClassName}>
      <CardContent className='p-0'>
        <div className='flex'>
          <PropertyImage
            src={propertyImageSrc}
            alt={propertyImageAlt}
            className={imageClassName}
          />

          <div className='flex-1 p-4'>
            <PropertyHeader
              title={booking.propertyTitle}
              location={booking.location}
              statusInfo={statusInfo}
            />

            <BookingInfoGrid booking={booking} type={type} />

            <div className='flex items-center justify-between mt-4'>
              <HostInfo
                hostImage={hostImageSrc}
                hostName={hostName}
                type={type}
              />

              <BookingActions
                booking={booking}
                isCancelling={isCancelling}
                onCancelBooking={onCancelBooking}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BookingCard.displayName = 'BookingCard';
