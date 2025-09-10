import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  className?: string;
  text?: string;
  color?: 'primary' | 'white' | 'gray';
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  className,
  text,
  color = 'primary',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary text-primary',
    white: 'border-white text-white',
    gray: 'border-gray-400 text-gray-400',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        <div
          className={cn(
            'animate-pulse rounded-full bg-current opacity-75',
            sizeClasses.xs,
            colorClasses[color]
          )}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={cn(
            'animate-pulse rounded-full bg-current opacity-75',
            sizeClasses.xs,
            colorClasses[color]
          )}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={cn(
            'animate-pulse rounded-full bg-current opacity-75',
            sizeClasses.xs,
            colorClasses[color]
          )}
          style={{ animationDelay: '300ms' }}
        />
        {text && (
          <span className={cn('ml-3 font-medium', textSizeClasses[size], colorClasses[color])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center space-x-3', className)}>
        <div
          className={cn(
            'animate-pulse rounded-full bg-current',
            sizeClasses[size],
            colorClasses[color]
          )}
        />
        {text && (
          <span className={cn('font-medium', textSizeClasses[size], colorClasses[color])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        <div
          className={cn('animate-pulse bg-current', sizeClasses.xs, 'h-6')}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={cn('animate-pulse bg-current', sizeClasses.xs, 'h-4')}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={cn('animate-pulse bg-current', sizeClasses.xs, 'h-8')}
          style={{ animationDelay: '300ms' }}
        />
        <div
          className={cn('animate-pulse bg-current', sizeClasses.xs, 'h-6')}
          style={{ animationDelay: '450ms' }}
        />
        {text && (
          <span className={cn('ml-3 font-medium', textSizeClasses[size], colorClasses[color])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center space-x-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-transparent',
          sizeClasses[size],
          color === 'primary' && 'border-gray-200 border-t-primary',
          color === 'white' && 'border-white/20 border-t-white',
          color === 'gray' && 'border-gray-300 border-t-gray-600'
        )}
      />
      {text && (
        <span className={cn('font-medium', textSizeClasses[size], colorClasses[color])}>
          {text}
        </span>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string;
  shimmer?: boolean;
}

export function LoadingSkeleton({
  className,
  count = 1,
  height = 'h-4',
  variant = 'text',
  width,
  shimmer = true,
}: LoadingSkeletonProps) {
  const baseClasses = shimmer
    ? 'relative bg-gray-200 overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
    : 'bg-gray-200 animate-pulse';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            baseClasses,
            variantClasses[variant],
            height,
            width,
            count > 1 && 'mb-2 last:mb-0'
          )}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  variant?: 'property' | 'review' | 'profile' | 'booking';
  shimmer?: boolean;
}

export function LoadingCard({ className, variant = 'property', shimmer = true }: LoadingCardProps) {
  const shimmerClasses = shimmer
    ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
    : 'animate-pulse';

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

  if (variant === 'review') {
    return (
      <div className={cn('bg-white rounded-xl border p-6 space-y-4', className)}>
        <div className='flex items-center space-x-4'>
          <div className={cn('w-12 h-12 bg-gray-200 rounded-full', shimmerClasses)} />
          <div className='space-y-2 flex-1'>
            <div className={cn('h-5 bg-gray-200 rounded w-32', shimmerClasses)} />
            <div className={cn('h-4 bg-gray-200 rounded w-24', shimmerClasses)} />
          </div>
          <div className={cn('h-6 w-16 bg-gray-200 rounded', shimmerClasses)} />
        </div>
        <div className='space-y-2'>
          <div className={cn('h-4 bg-gray-200 rounded w-full', shimmerClasses)} />
          <div className={cn('h-4 bg-gray-200 rounded w-5/6', shimmerClasses)} />
          <div className={cn('h-4 bg-gray-200 rounded w-3/4', shimmerClasses)} />
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={cn('bg-white rounded-xl border p-6', className)}>
        <div className='flex items-center space-x-4 mb-6'>
          <div className={cn('w-16 h-16 bg-gray-200 rounded-full', shimmerClasses)} />
          <div className='space-y-2 flex-1'>
            <div className={cn('h-6 bg-gray-200 rounded w-40', shimmerClasses)} />
            <div className={cn('h-4 bg-gray-200 rounded w-32', shimmerClasses)} />
          </div>
        </div>
        <div className='space-y-3'>
          <div className={cn('h-4 bg-gray-200 rounded w-full', shimmerClasses)} />
          <div className={cn('h-4 bg-gray-200 rounded w-4/5', shimmerClasses)} />
          <div className={cn('h-4 bg-gray-200 rounded w-3/5', shimmerClasses)} />
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
}

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'glass' | 'fullscreen';
  spinnerVariant?: 'spinner' | 'dots' | 'pulse' | 'bars';
}

export function LoadingOverlay({
  show,
  text = 'Loading...',
  className,
  variant = 'default',
  spinnerVariant = 'spinner',
}: LoadingOverlayProps) {
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
}
