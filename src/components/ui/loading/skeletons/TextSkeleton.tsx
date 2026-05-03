import { memo } from 'react';
import { cn } from '@/lib/utils';
import { CoreSkeleton } from './CoreSkeleton';
import { WIDTH_CLASSES, DEFAULT_TEXT_WIDTHS } from '../constants';
import type { WidthClass } from '../constants';

export interface TextSkeletonProps {
  lines: number;
  widths?: Array<WidthClass>;
  className?: string;
  shimmer?: boolean;
  'data-testid'?: string;
}

const TextSkeletonComponent = ({
  lines,
  widths,
  className,
  shimmer = true,
  'data-testid': testId,
}: TextSkeletonProps) => {
  const lineWidths = widths || Array.from({ length: lines }, (_, i) =>
    DEFAULT_TEXT_WIDTHS[i % DEFAULT_TEXT_WIDTHS.length]
  );

  return (
    <div className={cn('space-y-2', className)} data-testid={testId}>
      {Array.from({ length: lines }, (_, index) => (
        <CoreSkeleton
          key={index}
          height="h-4"
          width={WIDTH_CLASSES[lineWidths[index] as WidthClass]}
          shimmer={shimmer}
        />
      ))}
    </div>
  );
};

export const TextSkeleton = memo(TextSkeletonComponent);
TextSkeleton.displayName = 'TextSkeleton';
