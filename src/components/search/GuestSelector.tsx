'use client';

import { memo, useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { Users } from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/error-boundaries';
import type { SearchData } from '@/contexts/SearchContext';

import { COMMON_CLASSES, GUEST_LIMITS, SIZES, Z_INDEX } from './constants';
import { GuestCounter } from './GuestCounter';
import { useOnClickOutside, useGuestCounter } from './hooks';
import {
  cn,
  formatGuestText,
  formatGuestTextShort,
  getGuestTypeDescription,
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

const GUEST_TYPES = [
  { key: 'adults' as const, label: 'Adults' },
  { key: 'children' as const, label: 'Children' },
  { key: 'infants' as const, label: 'Infants' },
] as const;

interface MaxGuestWarningProps {
  showMaxGuestWarning: boolean;
  isAtMaxCapacity: boolean;
}

const MaxGuestWarning = memo<MaxGuestWarningProps>(({ showMaxGuestWarning, isAtMaxCapacity }) => {
  if (!showMaxGuestWarning || !isAtMaxCapacity) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-600">
        This place has a maximum of {GUEST_LIMITS.MAX_TOTAL_GUESTS} guests, not including infants.
      </p>
    </div>
  );
});
MaxGuestWarning.displayName = 'MaxGuestWarning';

interface DoneButtonProps {
  showButton: boolean;
  onClick: () => void;
  disabled: boolean;
  testId?: string;
}

const DoneButton = memo<DoneButtonProps>(({ showButton, onClick, disabled, testId }) => {
  if (!showButton) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid={`${testId}-done-button`}
      >
        Done
      </button>
    </div>
  );
});
DoneButton.displayName = 'DoneButton';

interface GuestSelectorContentProps {
  guests: SearchData['guests'];
  increment: (key: 'adults' | 'children' | 'infants') => void;
  decrement: (key: 'adults' | 'children' | 'infants') => void;
  canIncrement: (key: 'adults' | 'children' | 'infants') => boolean;
  canDecrement: (key: 'adults' | 'children' | 'infants') => boolean;
  isAtMaxCapacity: () => boolean;
  closeDropdown: () => void;
  disabled: boolean;
  showMaxGuestWarning: boolean;
  isOpenByDefault: boolean;
  testId?: string;
}

const GuestSelectorContent = memo<GuestSelectorContentProps>(({
  guests,
  increment,
  decrement,
  canIncrement,
  canDecrement,
  isAtMaxCapacity,
  closeDropdown,
  disabled,
  showMaxGuestWarning,
  isOpenByDefault,
  testId,
}) => (
  <div className="guest-selector-dropdown bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
    <div className={cn(SIZES.GUEST_SELECTOR_WIDTH, 'p-6')}>
      {GUEST_TYPES.map((type, index) => (
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
          {index < GUEST_TYPES.length - 1 && <div className="border-t border-gray-200" />}
        </div>
      ))}
    </div>

    <MaxGuestWarning showMaxGuestWarning={showMaxGuestWarning} isAtMaxCapacity={isAtMaxCapacity()} />
    <DoneButton showButton={!isOpenByDefault} onClick={closeDropdown} disabled={disabled} testId={testId} />
  </div>
));
GuestSelectorContent.displayName = 'GuestSelectorContent';

interface TriggerButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  disabled: boolean;
  isOpen: boolean;
  buttonStyle: string;
  guestCountStyle: string;
  guestDisplayText: string;
  testId?: string;
}

const TriggerButton = memo<TriggerButtonProps>(({
  buttonRef,
  onClick,
  disabled,
  isOpen,
  buttonStyle,
  guestCountStyle,
  guestDisplayText,
  testId,
}) => (
  <button
    ref={buttonRef}
    type="button"
    onClick={onClick}
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
));
TriggerButton.displayName = 'TriggerButton';

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
    getTotalGuests,
    isAtMaxCapacity,
  } = useGuestCounter({ guests, onChange });

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const toggleDropdown = useCallback(() => {
    if (!disabled) setIsOpen(prev => !prev);
  }, [disabled]);

  useOnClickOutside(
    [containerRef as RefObject<HTMLElement>, buttonRef as RefObject<HTMLElement>],
    closeDropdown,
    ['.guest-selector-dropdown']
  );

  const guestDisplayText = useMemo(
    () => variant === 'compact' ? formatGuestTextShort(guests) : formatGuestText(guests),
    [variant, guests]
  );

  const guestCountStyle = useMemo(() => cn(
    'flex-1',
    getTotalGuests() === 0 ? 'text-gray-500' : 'text-gray-900',
    disabled && 'opacity-50'
  ), [getTotalGuests, disabled]);

  const buttonStyle = useMemo(() => cn(
    'flex items-center space-x-3 px-4 py-3 text-left transition-colors w-full rounded-lg',
    !disabled && COMMON_CLASSES.BUTTON_HOVER,
    disabled && 'cursor-not-allowed opacity-50',
    className
  ), [disabled, className]);

  const contentProps = {
    guests,
    increment,
    decrement,
    canIncrement,
    canDecrement,
    isAtMaxCapacity,
    closeDropdown,
    disabled,
    showMaxGuestWarning,
    isOpenByDefault,
    testId,
  };

  if (isOpenByDefault) {
    return (
      <FeatureErrorBoundary
        featureName="Guest Selection"
        level="medium"
        enableRetry
        fallback={
          <div className="p-4 text-center text-gray-500">
            Guest selection temporarily unavailable
          </div>
        }
      >
        <GuestSelectorContent {...contentProps} />
      </FeatureErrorBoundary>
    );
  }

  return (
    <FeatureErrorBoundary
      featureName="Guest Selector"
      level="medium"
      enableRetry
      fallback={
        <div className="flex items-center space-x-3 px-4 py-3 text-gray-500">
          <Users className="w-5 h-5 flex-shrink-0" />
          <span>Guest selection unavailable</span>
        </div>
      }
    >
      <div ref={containerRef} className="relative" data-testid={testId}>
        <TriggerButton
          buttonRef={buttonRef}
          onClick={toggleDropdown}
          disabled={disabled}
          isOpen={isOpen}
          buttonStyle={buttonStyle}
          guestCountStyle={guestCountStyle}
          guestDisplayText={guestDisplayText}
          testId={testId}
        />

        {isOpen && (
          <div
            className={cn('absolute top-full right-0 mt-2', `z-[${Z_INDEX.DROPDOWN}]`)}
            data-testid={`${testId}-dropdown`}
          >
            <GuestSelectorContent {...contentProps} />
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  );
};

export const GuestSelector = memo(GuestSelectorComponent);
GuestSelector.displayName = 'GuestSelector';