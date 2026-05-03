'use client';

/**
 * @fileoverview PropertyBookingButton Component
 *
 * Refactored booking button with type-safe state strategy,
 * unified formatting utilities, and enhanced accessibility.
 */

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/formatting';
import type { PropertyBookingButtonProps } from '../types/BookingCardTypes';

/**
 * Button state union type for type-safe messaging
 */
type ButtonState =
  | { type: 'loading' }
  | { type: 'custom'; text: string }
  | { type: 'missing_dates' }
  | { type: 'invalid' }
  | { type: 'ready' };

/**
 * Button text strategy mapping with type safety
 */
const BUTTON_TEXT_STRATEGY: Record<ButtonState['type'], string> = {
  loading: 'Booking...',
  custom: '',
  missing_dates: 'Select dates',
  invalid: 'Invalid selection',
  ready: 'Reserve',
};

/**
 * Determines button state based on props
 */
function getButtonState(
  isLoading: boolean,
  customText: string | undefined,
  checkIn: Date | null,
  checkOut: Date | null,
  calculationsValid: boolean
): ButtonState {
  if (isLoading) return { type: 'loading' };
  if (customText) return { type: 'custom', text: customText };
  if (!checkIn || !checkOut) return { type: 'missing_dates' };
  if (!calculationsValid) return { type: 'invalid' };
  return { type: 'ready' };
}

/**
 * Resolves button text from state
 */
function resolveButtonText(state: ButtonState): string {
  return state.type === 'custom' ? state.text : BUTTON_TEXT_STRATEGY[state.type];
}

/**
 * Generates semantic aria-label for screen readers
 * Only shows total when calculations are valid
 */
function buildAriaLabel(
  buttonText: string,
  calculationsValid: boolean,
  total: number
): string {
  if (!calculationsValid) {
    return `${buttonText}. Complete booking form`;
  }
  return `${buttonText}. Total cost ${formatCurrency(total)}`;
}

/**
 * PropertyBookingButton - Type-safe booking action button
 *
 * Features:
 * - Strategy pattern for button states with type safety
 * - Unified currency formatting via utility functions
 * - Semantic accessibility labels
 * - Optimized re-rendering with memoization
 */
export const PropertyBookingButton = memo(function PropertyBookingButton({
  onClick,
  disabled,
  isLoading,
  checkIn,
  checkOut,
  calculations,
  customText,
  className = 'w-full mb-4',
}: PropertyBookingButtonProps) {
  const calculationsValid = calculations?.isValid ?? false;
  const calculationsTotal = calculations?.total ?? 0;

  const buttonState = getButtonState(
    isLoading,
    customText,
    checkIn,
    checkOut,
    calculationsValid
  );
  const buttonText = resolveButtonText(buttonState);
  const ariaLabel = buildAriaLabel(buttonText, calculationsValid, calculationsTotal);

  return (
    <Button
      className={className}
      size="lg"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {buttonText}
    </Button>
  );
});

PropertyBookingButton.displayName = 'PropertyBookingButton';
