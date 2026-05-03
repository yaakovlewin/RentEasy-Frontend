'use client';

/**
 * @fileoverview ValidationSection Component
 *
 * Consolidated validation and error messaging for booking forms.
 * Combines ValidationMessages and ErrorDisplay into a single,
 * cohesive section with consistent spacing and layout.
 */

import React, { memo } from 'react';
import { ValidationMessages } from '@/components/ui/ValidationMessages';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import type { PropertyError, BookingValidation } from '../types/PropertyDetails';

export interface ValidationSectionProps {
  /** Validation state with errors and warnings */
  readonly validation: BookingValidation;
  /** Optional booking error */
  readonly error?: PropertyError | null;
  /** Error dismissal handler */
  readonly onErrorDismiss?: () => void;
  /** Custom CSS classes */
  readonly className?: string;
  /** Test ID for component testing */
  readonly testId?: string;
}

/**
 * ValidationSection - Unified validation and error display
 *
 * Features:
 * - Consolidated validation errors and warnings
 * - Integrated booking error display
 * - Consistent spacing and layout
 * - Conditional rendering (only shows when needed)
 * - Optimized re-rendering with memoization
 * - Comprehensive accessibility support
 */
export const ValidationSection = memo(function ValidationSection({
  validation,
  error,
  onErrorDismiss,
  className = '',
  testId = 'validation-section',
}: ValidationSectionProps) {
  const hasValidationMessages =
    validation.errors.length > 0 || validation.warnings.length > 0;
  const hasError = error !== null && error !== undefined;

  if (!hasValidationMessages && !hasError) {
    return null;
  }

  return (
    <div
      className={className}
      data-testid={testId}
      role="alert"
      aria-live="polite"
    >
      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <ValidationMessages
          messages={validation.errors}
          variant="error"
          data-testid={`${testId}-errors`}
        />
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <ValidationMessages
          messages={validation.warnings}
          variant="warning"
          data-testid={`${testId}-warnings`}
        />
      )}

      {/* Booking Error */}
      {hasError && (
        <div data-testid={`${testId}-error`}>
          <ErrorDisplay
            error={error}
            variant="inline"
            onDismiss={onErrorDismiss}
          />
        </div>
      )}
    </div>
  );
});

ValidationSection.displayName = 'ValidationSection';

export default ValidationSection;
