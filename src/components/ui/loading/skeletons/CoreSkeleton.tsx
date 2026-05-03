import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SKELETON_COLORS, SKELETON_VARIANT_CLASSES } from '../constants';
import type { SkeletonVariant } from '../constants';

export interface CoreSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  variant?: SkeletonVariant;
  width?: string;
  shimmer?: boolean;
  'data-testid'?: string;
}

const CoreSkeletonComponent = ({
  className,
  count = 1,
  height = 'h-4',
  variant = 'text',
  width,
  shimmer = true,
  'data-testid': testId,
}: CoreSkeletonProps) => {
  const baseClasses = shimmer ? SKELETON_COLORS.shimmer : SKELETON_COLORS.pulse;

  if (count === 1) {
    return (
      <div
        className={cn(
          baseClasses,
          SKELETON_VARIANT_CLASSES[variant],
          height,
          width,
          className
        )}
        data-testid={testId}
        aria-label="Loading..."
        role="status"
      />
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={cn(
            baseClasses,
            SKELETON_VARIANT_CLASSES[variant],
            height,
            width,
            count > 1 && 'mb-2 last:mb-0'
          )}
          data-testid={testId}
          aria-label="Loading..."
          role="status"
        />
      ))}
    </div>
  );
};

export const CoreSkeleton = memo(CoreSkeletonComponent);
CoreSkeleton.displayName = 'CoreSkeleton';
