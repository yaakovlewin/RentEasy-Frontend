'use client';

import { memo, useCallback, useMemo, useRef, useState } from 'react';

import { Users } from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/error-boundaries';

import type { SearchData } from '@/contexts/SearchContext';

import { COMMON_CLASSES, GUEST_LIMITS, SIZES, Z_INDEX } from './constants';
import { GuestCounter } from './GuestCounter';
import { useClickOutside, useGuestCounter } from './hooks';
import {
  cn,
  formatGuestText,
  formatGuestTextShort,
  getGuestTypeDescription,
  getTotalGuests,
} from './utils';

interface GuestSelectorProps {
  guests: SearchData['guests'];
  onChange: (guests: SearchData['guests']) => void;
  className?: string;
  isOpenByDefault?: boolean;
  variant?: 'full' | 'compact';
  showMaxGuestWarning?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

/**
 * GuestSelector - Enterprise-grade guest selection component
 * 
 * Provides an interactive interface for selecting guest counts with support
 * for adults, children, and infants. Features proper accessibility,
 * error handling, and performance optimizations.
 * 
 * @param guests - Current guest counts
 * @param onChange - Callback when guest counts change
 * @param className - Additional CSS classes
 * @param isOpenByDefault - Whether dropdown is open by default
 * @param variant - Display variant ('full' | 'compact')
 * @param showMaxGuestWarning - Whether to show maximum guest warning
 * @param disabled - Whether the selector is disabled
 * @param data-testid - Test identifier for testing
 */
const GuestSelectorComponent = ({
  guests,
  onChange,
  className,
  isOpenByDefault = false,
  variant = 'full',
  showMaxGuestWarning = true,
  disabled = false,
  'data-testid': testId,
}: GuestSelectorProps) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    increment,
    decrement,
    canIncrement,
    canDecrement,
    getTotalGuests: getTotal,
    isAtMaxCapacity,
  } = useGuestCounter({ guests, onChange });

  // Memoized callbacks to prevent unnecessary re-renders
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  useClickOutside(closeDropdown, ['.guest-selector-dropdown']);

  // Memoized guest types configuration
  const guestTypes = useMemo(
    () => [
      { key: 'adults' as const, label: 'Adults' },
      { key: 'children' as const, label: 'Children' },
      { key: 'infants' as const, label: 'Infants' },
    ],
    []
  );

  // Memoized guest display text
  const guestDisplayText = useMemo(() => {
    return variant === 'compact' ? formatGuestTextShort(guests) : formatGuestText(guests);
  }, [variant, guests]);

  // Memoized guest count styling
  const guestCountStyle = useMemo(() => {
    const totalGuests = getTotal();
    return cn(
      'flex-1',
      totalGuests === 0 ? 'text-gray-500' : 'text-gray-900',
      disabled && 'opacity-50'
    );
  }, [getTotal, disabled]);

  // Memoized button styling
  const buttonStyle = useMemo(
    () =>
      cn(
        'flex items-center space-x-3 px-4 py-3 text-left transition-colors w-full rounded-lg',
        !disabled && COMMON_CLASSES.BUTTON_HOVER,
        disabled && 'cursor-not-allowed opacity-50',
        className
      ),
    [disabled, className]
  );

  // Memoized guest selector content
  const GuestSelectorContent = memo(() => (
    <div className="guest-selector-dropdown bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
      <div className={cn(SIZES.GUEST_SELECTOR_WIDTH, 'p-6')}>
        {guestTypes.map((type, index) => (
          <div key={type.key}>
            <GuestCounter
              label={type.label}
              description={getGuestTypeDescription(type.key)}
              value={guests[type.key]}
              onIncrement={() => increment(type.key)}
              onDecrement={() => decrement(type.key)}
              canIncrement={canIncrement(type.key)}
              canDecrement={canDecrement(type.key)}
              disabled={disabled}
              data-testid={`${testId}-${type.key}-counter`}
            />
            {index < guestTypes.length - 1 && <div className="border-t border-gray-200" />}
          </div>
        ))}
      </div>

      {/* Max Guest Warning */}
      {showMaxGuestWarning && isAtMaxCapacity() && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            This place has a maximum of {GUEST_LIMITS.MAX_TOTAL_GUESTS} guests, not including
            infants.
          </p>
        </div>
      )}

      {/* Done Button for dropdown variant */}
      {!isOpenByDefault && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={closeDropdown}
            disabled={disabled}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`${testId}-done-button`}
          >
            Done
          </button>
        </div>
      )}
    </div>
  ));
  
  GuestSelectorContent.displayName = 'GuestSelectorContent';

  // If opened by default (from search bar popover), just show the content
  if (isOpenByDefault) {
    return (
      <FeatureErrorBoundary
        featureName="Guest Selection"
        level="medium"
        enableRetry
        fallbackComponent={
          <div className="p-4 text-center text-gray-500">
            Guest selection temporarily unavailable
          </div>
        }
      >
        <GuestSelectorContent />
      </FeatureErrorBoundary>
    );
  }

  // Regular dropdown variant
  return (
    <FeatureErrorBoundary
      featureName="Guest Selector"
      level="medium"
      enableRetry
      fallbackComponent={
        <div className="flex items-center space-x-3 px-4 py-3 text-gray-500">
          <Users className="w-5 h-5 flex-shrink-0" />
          <span>Guest selection unavailable</span>
        </div>
      }
    >
      <div ref={containerRef} className="relative" data-testid={testId}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={buttonStyle}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`Select guests: ${guestDisplayText}`}
          data-testid={`${testId}-trigger`}
        >
          <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className={guestCountStyle}>{guestDisplayText}</span>
        </button>

        {isOpen && (
          <div 
            className={cn('absolute top-full right-0 mt-2', `z-[${Z_INDEX.DROPDOWN}]`)}
            data-testid={`${testId}-dropdown`}
          >
            <GuestSelectorContent />
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  );
};

// Export the memoized version for performance optimization
export const GuestSelector = memo(GuestSelectorComponent);
GuestSelector.displayName = 'GuestSelector';