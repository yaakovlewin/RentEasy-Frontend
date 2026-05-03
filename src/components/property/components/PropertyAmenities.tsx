'use client';

/**
 * @fileoverview PropertyAmenities Component
 *
 * Enterprise-grade amenities display component extracted from monolithic PropertyDetailsPage.
 * Features expandable amenities list with proper state management and accessibility.
 */

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAmenityIcon, getAmenityColorClass } from '../factories/IconMappingFactory';

const DEFAULT_DISPLAY_COUNT = 10;
const DEFAULT_TITLE = "What this place offers";

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

interface AmenityItemProps {
  amenity: string;
  showIcon: boolean;
}

const AmenityItem = memo(function AmenityItem({
  amenity,
  showIcon,
}: AmenityItemProps) {
  const IconComponent = useMemo(
    () => showIcon ? getAmenityIcon(amenity) : null,
    [amenity, showIcon]
  );

  const iconColorClass = useMemo(
    () => IconComponent ? getAmenityColorClass(amenity) : '',
    [amenity, IconComponent]
  );

  return (
    <div className="flex items-center space-x-3">
      {IconComponent && (
        <IconComponent
          className={cn("w-5 h-5 flex-shrink-0", iconColorClass)}
          aria-hidden="true"
        />
      )}
      <span className="text-gray-700">{amenity}</span>
    </div>
  );
});

AmenityItem.displayName = 'AmenityItem';

const EmptyAmenities = memo(function EmptyAmenities({
  title,
  className
}: {
  title: string;
  className?: string;
}) {
  return (
    <section className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-500">No amenities listed for this property.</p>
    </section>
  );
});

EmptyAmenities.displayName = 'EmptyAmenities';

/**
 * PropertyAmenities - Extracted amenities component
 *
 * Features:
 * - Expandable amenities list with show/hide toggle
 * - Appropriate icons for different amenity types
 * - Grid layout for optimal space usage
 * - Accessibility support with proper ARIA attributes
 * - Responsive design with mobile optimization
 * - Optimized re-renders with memoization
 */
export const PropertyAmenities = memo(function PropertyAmenities({
  amenities,
  className,
  initialDisplayCount = DEFAULT_DISPLAY_COUNT,
  title = DEFAULT_TITLE,
  useGridLayout = true,
  showIcons = true,
}: PropertyAmenitiesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const { shouldShowToggle, displayedAmenities, visibleCount } = useMemo(() => {
    const total = amenities?.length || 0;
    const shouldToggle = total > initialDisplayCount;
    const displayed = isExpanded || !shouldToggle
      ? amenities
      : amenities.slice(0, initialDisplayCount);
    const visible = Math.min(initialDisplayCount, total);

    return {
      shouldShowToggle: shouldToggle,
      displayedAmenities: displayed,
      visibleCount: visible,
    };
  }, [amenities, initialDisplayCount, isExpanded]);

  const gridClassName = useMemo(
    () => cn(
      useGridLayout
        ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
        : 'space-y-3'
    ),
    [useGridLayout]
  );

  const screenReaderText = useMemo(
    () => isExpanded
      ? `Showing all ${amenities.length} amenities`
      : `Showing ${visibleCount} of ${amenities.length} amenities`,
    [isExpanded, amenities.length, visibleCount]
  );

  if (!amenities || amenities.length === 0) {
    return <EmptyAmenities title={title} className={className} />;
  }

  return (
    <section
      className={cn('border-b border-gray-200 pb-8 mb-8', className)}
      aria-labelledby="amenities-heading"
    >
      <h2 id="amenities-heading" className="text-xl font-semibold mb-4">
        {title}
      </h2>

      <ul className={gridClassName} role="list">
        {displayedAmenities.map((amenity, index) => (
          <li key={`${amenity}-${index}`}>
            <AmenityItem
              amenity={amenity}
              showIcon={showIcons}
            />
          </li>
        ))}
      </ul>

      {shouldShowToggle && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls="amenities-list-region"
        >
          {isExpanded
            ? 'Show less amenities'
            : `Show all ${amenities.length} amenities`}
        </Button>
      )}

      <div
        id="amenities-list-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {screenReaderText}
      </div>
    </section>
  );
});

PropertyAmenities.displayName = 'PropertyAmenities';

export default PropertyAmenities;