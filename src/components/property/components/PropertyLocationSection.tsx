/**
 * @fileoverview PropertyLocationSection Component
 *
 * Displays property location information with Google Maps integration
 */

import React, { memo } from 'react';
import { GoogleMap } from '@/components/property/GoogleMap';

interface PropertyLocationSectionProps {
  latitude?: number;
  longitude?: number;
  address: string;
  title: string;
}

export const PropertyLocationSection = memo(function PropertyLocationSection({
  latitude = 0,
  longitude = 0,
  address,
  title,
}: PropertyLocationSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-8 mb-8">
      <h3 className="text-xl font-semibold mb-4">Where you'll be</h3>
      <GoogleMap
        latitude={latitude}
        longitude={longitude}
        address={address}
        title={title}
        className="h-80"
      />
    </div>
  );
});

PropertyLocationSection.displayName = 'PropertyLocationSection';
