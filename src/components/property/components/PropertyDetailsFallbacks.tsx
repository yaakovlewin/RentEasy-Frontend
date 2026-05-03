/**
 * @fileoverview Fallback Components for Property Details Sections
 *
 * Reusable fallback UI components for error boundaries with consistent styling
 */

import React from 'react';

interface FallbackMessageProps {
  message: string;
}

interface SectionFallbackProps extends FallbackMessageProps {
  title?: string;
  className?: string;
}

interface HeaderFallbackProps {
  title: string;
  location: string;
}

const FallbackMessage: React.FC<FallbackMessageProps> = ({ message }) => (
  <p className="text-gray-500">{message}</p>
);

const SectionFallback: React.FC<SectionFallbackProps> = ({
  title,
  message,
  className = '',
}) => (
  <div className={`border-b border-gray-200 pb-8 mb-8 ${className}`.trim()}>
    {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
    <FallbackMessage message={message} />
  </div>
);

export const ImageGalleryFallback: React.FC = () => (
  <div className="h-96 lg:h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
    <FallbackMessage message="Images temporarily unavailable" />
  </div>
);

export const PropertyInfoFallback: React.FC = () => (
  <div className="border-b border-gray-200 pb-8 mb-8 h-32 bg-gray-50 rounded flex items-center justify-center">
    <FallbackMessage message="Property info temporarily unavailable" />
  </div>
);

export const AmenitiesFallback: React.FC = () => (
  <SectionFallback
    title="What this place offers"
    message="Amenities list temporarily unavailable"
  />
);

export const ReviewsFallback: React.FC = () => (
  <SectionFallback title="Reviews" message="Reviews temporarily unavailable" />
);

export const LocationFallback: React.FC = () => (
  <SectionFallback title="Location" message="Map temporarily unavailable" />
);

export const BookingFallback: React.FC = () => (
  <div className="sticky top-24 p-6 border rounded-lg bg-gray-50 text-center">
    <p className="text-gray-600 mb-4">Booking form temporarily unavailable</p>
    <p className="text-sm text-gray-500">
      Please try refreshing the page or contact support
    </p>
  </div>
);

export const HeaderFallback: React.FC<HeaderFallbackProps> = ({
  title,
  location,
}) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold mb-2">{title}</h1>
    <div className="text-gray-600">{location}</div>
  </div>
);
