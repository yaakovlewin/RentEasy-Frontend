import { memo } from 'react';
import { cn } from '@/lib/utils';
import {
  SPINNER_SIZE_CLASSES,
  SPINNER_COLOR_CLASSES,
  TEXT_SIZE_CLASSES,
  ANIMATION_DELAYS
} from '../constants';
import type { SpinnerSize, SpinnerColor } from '../constants';

export interface DotsSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  text?: string;
}

const DotsSpinnerComponent = ({
  size = 'md',
  color = 'primary',
  className,
  text,
}: DotsSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center space-x-1', className)}>
      {ANIMATION_DELAYS.slice(0, 3).map((delay, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse rounded-full bg-current opacity-75',
            SPINNER_SIZE_CLASSES.xs,
            SPINNER_COLOR_CLASSES[color]
          )}
          style={delay}
          role="status"
          aria-label={index === 0 ? 'Loading' : undefined}
        />
      ))}
      {text && (
        <span className={cn('ml-3 font-medium', TEXT_SIZE_CLASSES[size], SPINNER_COLOR_CLASSES[color])}>
          {text}
        </span>
      )}
    </div>
  );
};

export const DotsSpinner = memo(DotsSpinnerComponent);
DotsSpinner.displayName = 'DotsSpinner';
