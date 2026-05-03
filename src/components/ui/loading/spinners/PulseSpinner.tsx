import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SPINNER_SIZE_CLASSES, SPINNER_COLOR_CLASSES, TEXT_SIZE_CLASSES } from '../constants';
import type { SpinnerSize, SpinnerColor } from '../constants';

export interface PulseSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  text?: string;
}

const PulseSpinnerComponent = ({
  size = 'md',
  color = 'primary',
  className,
  text,
}: PulseSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center space-x-3', className)}>
      <div
        className={cn(
          'animate-pulse rounded-full bg-current',
          SPINNER_SIZE_CLASSES[size],
          SPINNER_COLOR_CLASSES[color]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className={cn('font-medium', TEXT_SIZE_CLASSES[size], SPINNER_COLOR_CLASSES[color])}>
          {text}
        </span>
      )}
    </div>
  );
};

export const PulseSpinner = memo(PulseSpinnerComponent);
PulseSpinner.displayName = 'PulseSpinner';
