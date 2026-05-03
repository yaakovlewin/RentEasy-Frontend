import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SPINNER_SIZE_CLASSES, SPINNER_COLOR_CLASSES, TEXT_SIZE_CLASSES } from '../constants';
import type { SpinnerSize, SpinnerColor } from '../constants';

export interface DefaultSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  text?: string;
}

const DefaultSpinnerComponent = ({
  size = 'md',
  color = 'primary',
  className,
  text,
}: DefaultSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center space-x-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-transparent',
          SPINNER_SIZE_CLASSES[size],
          color === 'primary' && 'border-gray-200 border-t-primary',
          color === 'white' && 'border-white/20 border-t-white',
          color === 'gray' && 'border-gray-300 border-t-gray-600'
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

export const DefaultSpinner = memo(DefaultSpinnerComponent);
DefaultSpinner.displayName = 'DefaultSpinner';
