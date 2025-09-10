'use client';

/**
 * @fileoverview PropertyAmenities Component
 * 
 * Enterprise-grade amenities display component extracted from monolithic PropertyDetailsPage.
 * Features expandable amenities list with proper state management and accessibility.
 */

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionVisibility } from '../hooks';
import { getAmenityIcon, getAmenityColorClass } from '../factories/IconMappingFactory';

interface PropertyAmenitiesProps {
  /** Array of amenity names */
  amenities: string[];
  /** Optional CSS classes */
  className?: string;
  /** Number of amenities to show initially */
  initialDisplayCount?: number;
  /** Custom title for the section */
  title?: string;
  /** Enable grid layout */
  useGridLayout?: boolean;
  /** Show amenity icons */
  showIcons?: boolean;
}

/**
 * PropertyAmenities - Extracted amenities component
 * 
 * Features:
 * - Expandable amenities list with show/hide toggle
 * - Appropriate icons for different amenity types
 * - Grid layout for optimal space usage
 * - Accessibility support with proper ARIA attributes
 * - Responsive design with mobile optimization
 * - State persistence with useContentVisibility hook
 */
export const PropertyAmenities = memo(function PropertyAmenities({
  amenities,
  className,
  initialDisplayCount = 10,
  title = "What this place offers",
  useGridLayout = true,
  showIcons = true,
}: PropertyAmenitiesProps) {
  const { isVisible, toggle, show, hide } = useSectionVisibility(false);
  
  // Don't render if no amenities
  if (!amenities || amenities.length === 0) {
    return (
      <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-500">No amenities listed for this property.</p>
      </div>
    );
  }

  const shouldShowToggle = amenities.length > initialDisplayCount;
  const displayedAmenities = isVisible || !shouldShowToggle 
    ? amenities 
    : amenities.slice(0, initialDisplayCount);

  return (
    <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      {/* Amenities Grid */}
      <div className={cn(
        useGridLayout 
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' 
          : 'space-y-3'
      )}>
        {displayedAmenities.map((amenity, index) => {
          const IconComponent = showIcons ? getAmenityIcon(amenity) : null;
          
          return (
            <div 
              key={`${amenity}-${index}`}
              className="flex items-center space-x-3"
            >
              {IconComponent && (
                <IconComponent 
                  className={cn("w-5 h-5 flex-shrink-0", getAmenityColorClass(amenity))} 
                  aria-hidden="true"
                />
              )}
              <span className="text-gray-700">{amenity}</span>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Toggle */}
      {shouldShowToggle && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={toggle}
          aria-expanded={isVisible}
          aria-controls="amenities-list"
        >
          {isVisible
            ? 'Show less amenities'
            : `Show all ${amenities.length} amenities`}
        </Button>
      )}

      {/* Hidden content for screen readers */}
      <div 
        id="amenities-list" 
        className="sr-only"
        aria-live="polite"
      >
        {isVisible 
          ? `Showing all ${amenities.length} amenities`
          : `Showing ${Math.min(initialDisplayCount, amenities.length)} of ${amenities.length} amenities`
        }
      </div>
    </div>
  );
});

PropertyAmenities.displayName = 'PropertyAmenities';

export default PropertyAmenities;