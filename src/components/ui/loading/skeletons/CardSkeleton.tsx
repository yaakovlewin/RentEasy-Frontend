import { memo } from 'react';
import { cn } from '@/lib/utils';
import { CoreSkeleton } from './CoreSkeleton';
import { SHIMMER_CLASSES } from '../constants';

export interface CardSkeletonProps {
  className?: string;
  variant?: 'property' | 'booking';
  shimmer?: boolean;
}

const CardSkeletonComponent = ({ className, variant = 'property', shimmer = true }: CardSkeletonProps) => {
  const shimmerClasses = shimmer ? SHIMMER_CLASSES.enabled : SHIMMER_CLASSES.disabled;

  if (variant === 'property') {
    return (
      <div className={cn('bg-white rounded-2xl shadow-lg border-0 overflow-hidden', className)}>
        <div className={cn('h-56 bg-gray-200', shimmerClasses)} />
        <div className='p-6 space-y-4'>
          <div className='flex justify-between items-start'>
            <div className='space-y-2 flex-1'>
              <div className={cn('h-6 bg-gray-200 rounded-lg w-3/4', shimmerClasses)} />
              <div className={cn('h-4 bg-gray-200 rounded w-1/2', shimmerClasses)} />
            </div>
            <div className={cn('h-8 w-16 bg-gray-200 rounded-full', shimmerClasses)} />
          </div>

          <div className='flex items-center space-x-6'>
            <div className={cn('h-4 bg-gray-200 rounded w-16', shimmerClasses)} />
            <div className={cn('h-4 bg-gray-200 rounded w-16', shimmerClasses)} />
            <div className={cn('h-4 bg-gray-200 rounded w-16', shimmerClasses)} />
          </div>

          <div className='flex justify-between items-center pt-2'>
            <div className='space-y-1'>
              <div className={cn('h-6 bg-gray-200 rounded w-20', shimmerClasses)} />
              <div className={cn('h-3 bg-gray-200 rounded w-16', shimmerClasses)} />
            </div>
            <div className={cn('h-4 bg-gray-200 rounded w-24', shimmerClasses)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl border p-6 space-y-4', className)}>
      <div className={cn('h-48 bg-gray-200 rounded-lg', shimmerClasses)} />
      <div className='space-y-3'>
        <div className={cn('h-5 bg-gray-200 rounded w-3/4', shimmerClasses)} />
        <div className={cn('h-4 bg-gray-200 rounded w-1/2', shimmerClasses)} />
        <div className={cn('h-4 bg-gray-200 rounded w-1/3', shimmerClasses)} />
      </div>
    </div>
  );
};

export const CardSkeleton = memo(CardSkeletonComponent);
CardSkeleton.displayName = 'CardSkeleton';
