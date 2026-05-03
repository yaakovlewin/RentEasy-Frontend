import { memo } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '../spinners';
import type { SpinnerVariant } from '../spinners';

export interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'glass' | 'fullscreen';
  spinnerVariant?: SpinnerVariant;
}

const LoadingOverlayComponent = ({
  show,
  text = 'Loading...',
  className,
  variant = 'default',
  spinnerVariant = 'spinner',
}: LoadingOverlayProps) => {
  if (!show) return null;

  if (variant === 'minimal') {
    return (
      <div className={cn('absolute inset-0 flex items-center justify-center z-50', className)}>
        <LoadingSpinner size='lg' variant={spinnerVariant} text={text} />
      </div>
    );
  }

  if (variant === 'glass') {
    return (
      <div
        className={cn(
          'absolute inset-0 glass backdrop-blur-lg flex items-center justify-center z-50',
          className
        )}
      >
        <div className='glass rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-white/20'>
          <LoadingSpinner size='xl' variant={spinnerVariant} />
          <span className='text-gray-700 font-semibold text-lg'>{text}</span>
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center z-50',
          className
        )}
      >
        <div className='text-center'>
          <div className='mb-8'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-pink-500 rounded-3xl shadow-2xl flex items-center justify-center'>
              <LoadingSpinner size='xl' variant={spinnerVariant} color='white' />
            </div>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>{text}</h2>
          <p className='text-gray-600'>Please wait a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50',
        className
      )}
    >
      <div className='bg-white rounded-2xl shadow-2xl p-8 flex items-center space-x-4 border'>
        <LoadingSpinner size='lg' variant={spinnerVariant} />
        <span className='text-gray-700 font-semibold text-lg'>{text}</span>
      </div>
    </div>
  );
};

export const LoadingOverlay = memo(LoadingOverlayComponent);
LoadingOverlay.displayName = 'LoadingOverlay';
