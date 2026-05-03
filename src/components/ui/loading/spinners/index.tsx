import { memo } from 'react';
import { DefaultSpinner, type DefaultSpinnerProps } from './DefaultSpinner';
import { DotsSpinner, type DotsSpinnerProps } from './DotsSpinner';
import { PulseSpinner, type PulseSpinnerProps } from './PulseSpinner';

export type SpinnerVariant = 'spinner' | 'dots' | 'pulse';

export interface LoadingSpinnerProps extends Omit<DefaultSpinnerProps, 'variant'> {
  variant?: SpinnerVariant;
}

/**
 * Strategy pattern for spinner variants
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
const SPINNER_STRATEGIES = {
  spinner: DefaultSpinner,
  dots: DotsSpinner,
  pulse: PulseSpinner,
} as const;

/**
 * Main LoadingSpinner component using strategy pattern
 * Eliminates conditional logic and enables easy extension
 */
const LoadingSpinnerComponent = ({ variant = 'spinner', ...props }: LoadingSpinnerProps) => {
  const SpinnerComponent = SPINNER_STRATEGIES[variant];
  return <SpinnerComponent {...props} />;
};

export const LoadingSpinner = memo(LoadingSpinnerComponent);
LoadingSpinner.displayName = 'LoadingSpinner';

// Export individual spinners for direct use
export { DefaultSpinner } from './DefaultSpinner';
export { DotsSpinner } from './DotsSpinner';
export { PulseSpinner } from './PulseSpinner';
