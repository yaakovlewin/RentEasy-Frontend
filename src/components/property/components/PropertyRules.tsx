'use client';

/**
 * @fileoverview PropertyRules Component
 * 
 * Simple, focused component for displaying house rules with proper 
 * formatting and accessibility support.
 */

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { getRuleIcon, getRuleColorClass } from '../factories/IconMappingFactory';

interface PropertyRulesProps {
  /** Array of house rules */
  rules: string[];
  /** Optional CSS classes */
  className?: string;
  /** Custom title for the section */
  title?: string;
  /** Show rule icons */
  showIcons?: boolean;
}
/**
 * PropertyRules - Simple house rules display component
 * 
 * Features:
 * - Clean list display with appropriate icons
 * - Smart icon selection based on rule content
 * - Color coding for different rule types (allowed, prohibited, warning)
 * - Accessibility support with proper semantic markup
 * - Responsive design with mobile optimization
 * - Memoized for performance
 */
export const PropertyRules = memo(function PropertyRules({
  rules,
  className,
  title = "House rules",
  showIcons = true,
}: PropertyRulesProps) {
  // Don't render if no rules
  if (!rules || rules.length === 0) {
    return (
      <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-500">No specific house rules listed.</p>
      </div>
    );
  }

  return (
    <div className={cn('border-b border-gray-200 pb-8 mb-8', className)}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <div className="space-y-3" role="list" aria-label="House rules">
        {rules.map((rule, index) => {
          const IconComponent = showIcons ? getRuleIcon(rule) : null;
          const iconColor = getRuleColorClass(rule);
          
          return (
            <div 
              key={index}
              className="flex items-start space-x-3"
              role="listitem"
            >
              {showIcons && IconComponent && (
                <IconComponent 
                  className={cn('w-4 h-4 flex-shrink-0 mt-0.5', iconColor)}
                  aria-hidden="true"
                />
              )}
              <span className="text-gray-700 leading-relaxed">
                {rule}
              </span>
            </div>
          );
        })}
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          House rules for this property: {rules.length} rule{rules.length !== 1 ? 's' : ''} listed.
        </p>
      </div>
    </div>
  );
});

PropertyRules.displayName = 'PropertyRules';

export default PropertyRules;