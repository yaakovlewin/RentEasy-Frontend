'use client';

import * as React from 'react';

import {
  Calendar,
  Filter,
  Heart,
  MapPin,
  Package,
  Plus,
  Search,
  Star,
  Users,
  Wifi,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'search' | 'filter' | 'create' | 'connect';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
  variant = 'default',
}) => {
  const variants = {
    default: {
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      defaultIcon: <Package className='w-8 h-8' />,
    },
    search: {
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
      defaultIcon: <Search className='w-8 h-8' />,
    },
    filter: {
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-500',
      defaultIcon: <Filter className='w-8 h-8' />,
    },
    create: {
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      defaultIcon: <Plus className='w-8 h-8' />,
    },
    connect: {
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-500',
      defaultIcon: <Wifi className='w-8 h-8' />,
    },
  };

  const config = variants[variant];

  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 hover:scale-105',
          config.bgColor
        )}
      >
        <div className={config.iconColor}>{icon || config.defaultIcon}</div>
      </div>

      <h3 className='text-xl font-semibold text-gray-900 mb-3'>{title}</h3>

      {description && <p className='text-gray-600 mb-6 max-w-md leading-relaxed'>{description}</p>}

      {action}
    </div>
  );
};

// Specific empty state components for common scenarios
interface NoSearchResultsProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  onCreateNew?: () => void;
  suggestions?: string[];
  className?: string;
}

export const NoSearchResults: React.FC<NoSearchResultsProps> = ({
  searchTerm,
  onClearSearch,
  onCreateNew,
  suggestions,
  className,
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6'>
        <Search className='w-8 h-8 text-blue-500' />
      </div>

      <h3 className='text-xl font-semibold text-gray-900 mb-3'>No results found</h3>

      <p className='text-gray-600 mb-6 max-w-md mx-auto'>
        {searchTerm
          ? `We couldn't find any results for "${searchTerm}".`
          : "We couldn't find any results matching your search."}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className='mb-6'>
          <p className='text-sm text-gray-500 mb-3'>Try searching for:</p>
          <div className='flex flex-wrap gap-2 justify-center'>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className='px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
                onClick={() => {
                  /* Handle suggestion click */
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
        {onClearSearch && (
          <Button variant='outline' onClick={onClearSearch}>
            Clear Search
          </Button>
        )}
        {onCreateNew && (
          <Button onClick={onCreateNew} className='gap-2'>
            <Plus className='w-4 h-4' />
            Create New
          </Button>
        )}
      </div>
    </div>
  );
};

// Empty property list
export const NoProperties: React.FC<{
  onAddProperty?: () => void;
  onBrowseAll?: () => void;
  className?: string;
}> = ({ onAddProperty, onBrowseAll, className }) => {
  return (
    <EmptyState
      title='No properties found'
      description="We couldn't find any properties matching your criteria. Try adjusting your filters or explore our full collection."
      icon={<MapPin className='w-8 h-8' />}
      variant='search'
      className={className}
      action={
        <div className='flex flex-col sm:flex-row gap-3'>
          {onBrowseAll && (
            <Button variant='outline' onClick={onBrowseAll}>
              Browse All Properties
            </Button>
          )}
          {onAddProperty && (
            <Button onClick={onAddProperty} className='gap-2'>
              <Plus className='w-4 h-4' />
              Add Property
            </Button>
          )}
        </div>
      }
    />
  );
};

// Empty favorites list
export const NoFavorites: React.FC<{
  onBrowseProperties?: () => void;
  className?: string;
}> = ({ onBrowseProperties, className }) => {
  return (
    <EmptyState
      title='No favorites yet'
      description='Start exploring amazing properties and save your favorites here for easy access later.'
      icon={<Heart className='w-8 h-8' />}
      variant='create'
      className={className}
      action={
        onBrowseProperties && (
          <Button onClick={onBrowseProperties} className='gap-2'>
            <Search className='w-4 h-4' />
            Browse Properties
          </Button>
        )
      }
    />
  );
};

// Empty bookings list
export const NoBookings: React.FC<{
  onBrowseProperties?: () => void;
  className?: string;
}> = ({ onBrowseProperties, className }) => {
  return (
    <EmptyState
      title='No bookings yet'
      description='Book your first amazing stay! Explore our collection of unique properties and create unforgettable memories.'
      icon={<Calendar className='w-8 h-8' />}
      variant='create'
      className={className}
      action={
        onBrowseProperties && (
          <Button onClick={onBrowseProperties} className='gap-2'>
            <Search className='w-4 h-4' />
            Find Properties
          </Button>
        )
      }
    />
  );
};

// Empty reviews list
export const NoReviews: React.FC<{
  onWriteReview?: () => void;
  className?: string;
}> = ({ onWriteReview, className }) => {
  return (
    <EmptyState
      title='No reviews yet'
      description='Be the first to share your experience! Your review helps other travelers make informed decisions.'
      icon={<Star className='w-8 h-8' />}
      variant='create'
      className={className}
      action={
        onWriteReview && (
          <Button onClick={onWriteReview} className='gap-2'>
            <Plus className='w-4 h-4' />
            Write First Review
          </Button>
        )
      }
    />
  );
};

// Generic data list empty state
interface NoDataProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const NoData: React.FC<NoDataProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon}
      className={className}
      action={
        actionLabel &&
        onAction && (
          <Button onClick={onAction} className='gap-2'>
            <Plus className='w-4 h-4' />
            {actionLabel}
          </Button>
        )
      }
    />
  );
};

// Connection/Network error empty state
export const ConnectionError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => {
  return (
    <EmptyState
      title='Connection Problem'
      description="We're having trouble connecting to our servers. Please check your internet connection and try again."
      icon={<Wifi className='w-8 h-8' />}
      variant='connect'
      className={className}
      action={
        onRetry && (
          <Button onClick={onRetry} variant='outline'>
            Try Again
          </Button>
        )
      }
    />
  );
};

// Loading failed state
export const LoadingFailed: React.FC<{
  onRetry?: () => void;
  error?: string;
  className?: string;
}> = ({ onRetry, error, className }) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6'>
        <Package className='w-8 h-8 text-red-500' />
      </div>

      <h3 className='text-xl font-semibold text-gray-900 mb-3'>Failed to Load</h3>

      <p className='text-gray-600 mb-6 max-w-md mx-auto'>
        {error || 'Something went wrong while loading this content. Please try again.'}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant='outline'>
          Try Again
        </Button>
      )}
    </div>
  );
};
