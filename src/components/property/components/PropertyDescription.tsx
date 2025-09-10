'use client';

/**
 * @fileoverview PropertyDescription Component
 * 
 * Simple, focused component for displaying property descriptions with 
 * expandable content and proper typography.
 */

import React, { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyDescriptionProps {
  /** Property description text */
  description: string;
  /** Optional CSS classes */
  className?: string;
  /** Custom title for the section */
  title?: string;
  /** Character limit before showing "Read more" */
  charLimit?: number;
  /** Show expand/collapse functionality */
  expandable?: boolean;
}

/**
 * PropertyDescription - Simple description display component
 * 
 * Features:
 * - Clean typography with proper text styling
 * - Expandable content for long descriptions
 * - Accessibility support with proper semantic markup
 * - Responsive design with mobile optimization
 * - Memoized for performance
 */
export const PropertyDescription = memo(function PropertyDescription({
  description,
  className,
  title = "About this place",
  charLimit = 300,
  expandable = true,
}: PropertyDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Don't render if no description
  if (!description || description.trim().length === 0) {
    return null;
  }

  const shouldTruncate = expandable && description.length > charLimit;
  const displayText = shouldTruncate && !isExpanded 
    ? `${description.slice(0, charLimit).trim()}...`
    : description;

  return (
    <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <div className="prose prose-gray max-w-none">
        <p 
          className="text-gray-700 leading-relaxed whitespace-pre-line"
          aria-label={shouldTruncate && !isExpanded ? "Property description (truncated)" : "Property description"}
        >
          {displayText}
        </p>
      </div>

      {/* Read More/Less Toggle */}
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="mt-3 p-0 h-auto font-medium text-primary hover:text-primary/80"
          aria-expanded={isExpanded}
          aria-controls="property-description"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </Button>
      )}

      {/* Hidden content for screen readers */}
      <div 
        id="property-description" 
        className="sr-only"
        aria-live="polite"
      >
        {shouldTruncate && (
          isExpanded 
            ? 'Full description is now shown'
            : 'Description is truncated. Click "Read more" to see the full description'
        )}
      </div>
    </div>
  );
});

PropertyDescription.displayName = 'PropertyDescription';

export default PropertyDescription;