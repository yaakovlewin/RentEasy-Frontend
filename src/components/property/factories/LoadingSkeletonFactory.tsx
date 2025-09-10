/**
 * @fileoverview Loading Skeleton Factory
 * 
 * Enterprise-grade loading skeleton factory that eliminates code duplication across
 * loading states by providing a centralized, configurable skeleton system.
 * 
 * Follows Netflix and Airbnb patterns for consistent loading experiences.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Base skeleton component configuration
 */
interface SkeletonConfig {
  className?: string;
  animate?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  'data-testid'?: string;
}

/**
 * Skeleton grid configuration
 */
interface SkeletonGridConfig extends SkeletonConfig {
  columns: 1 | 2 | 3 | 4 | 5 | 6;
  rows: number;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

/**
 * Property card skeleton configuration
 */
interface PropertySkeletonConfig extends SkeletonConfig {
  variant?: 'default' | 'compact' | 'list';
  showImage?: boolean;
  showDetails?: boolean;
  showActions?: boolean;
}

/**
 * Text skeleton configuration
 */
interface TextSkeletonConfig extends SkeletonConfig {
  lines: number;
  widths?: Array<'full' | '3/4' | '1/2' | '1/3' | '1/4' | '2/3'>;
}

/**
 * Base Skeleton Component
 */
const BaseSkeleton: React.FC<SkeletonConfig> = ({
  className,
  animate = true,
  rounded = 'md',
  'data-testid': testId,
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        animate && 'animate-pulse',
        roundedClasses[rounded],
        className
      )}
      data-testid={testId}
      aria-label="Loading..."
      role="status"
    />
  );
};

/**
 * Text Skeleton Component
 */
const TextSkeleton: React.FC<TextSkeletonConfig> = ({
  lines,
  widths,
  className,
  animate = true,
  ...props
}) => {
  const defaultWidths = ['full', '3/4', '1/2', '2/3'];
  const lineWidths = widths || Array(lines).fill(null).map((_, i) => 
    defaultWidths[i % defaultWidths.length]
  );

  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '2/3': 'w-2/3',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array(lines).fill(null).map((_, index) => (
        <BaseSkeleton
          key={index}
          className={cn('h-4', widthClasses[lineWidths[index] as keyof typeof widthClasses])}
          animate={animate}
        />
      ))}
    </div>
  );
};

/**
 * Property Card Skeleton Component
 */
const PropertyCardSkeleton: React.FC<PropertySkeletonConfig> = ({
  variant = 'default',
  showImage = true,
  showDetails = true,
  showActions = true,
  className,
  animate = true,
  ...props
}) => {
  const variants = {
    default: 'space-y-4',
    compact: 'space-y-2',
    list: 'flex space-x-4 space-y-0',
  };

  const imageClasses = {
    default: 'w-full h-48',
    compact: 'w-full h-32',
    list: 'w-32 h-32 flex-shrink-0',
  };

  return (
    <div className={cn('bg-white rounded-lg p-4', variants[variant], className)} {...props}>
      {/* Image Skeleton */}
      {showImage && (
        <BaseSkeleton 
          className={imageClasses[variant]}
          animate={animate}
          rounded="lg"
        />
      )}

      {/* Content Area */}
      <div className={variant === 'list' ? 'flex-1' : ''}>
        {/* Title */}
        <BaseSkeleton 
          className="h-5 w-3/4 mb-2" 
          animate={animate}
        />

        {/* Location */}
        <BaseSkeleton 
          className="h-4 w-1/2 mb-3" 
          animate={animate}
        />

        {showDetails && (
          <>
            {/* Details */}
            <div className="flex space-x-4 mb-3">
              <BaseSkeleton className="h-4 w-16" animate={animate} />
              <BaseSkeleton className="h-4 w-16" animate={animate} />
              <BaseSkeleton className="h-4 w-16" animate={animate} />
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-3">
              <BaseSkeleton className="h-4 w-4" animate={animate} rounded="sm" />
              <BaseSkeleton className="h-4 w-12" animate={animate} />
            </div>
          </>
        )}

        {/* Price */}
        <div className="flex justify-between items-center">
          <BaseSkeleton className="h-5 w-20" animate={animate} />
          {showActions && (
            <BaseSkeleton className="h-4 w-4" animate={animate} rounded="sm" />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Grid Component
 */
const SkeletonGrid: React.FC<SkeletonGridConfig & { children: React.ReactNode }> = ({
  columns,
  rows,
  gap = 'md',
  responsive,
  className,
  children,
  ...props
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const responsiveClasses = responsive ? Object.entries(responsive)
    .map(([breakpoint, cols]) => `${breakpoint}:grid-cols-${cols}`)
    .join(' ') : '';

  return (
    <div 
      className={cn(
        'grid',
        gridCols[columns],
        responsiveClasses,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {Array(rows * columns).fill(null).map((_, index) => (
        <React.Fragment key={index}>
          {children}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * LoadingSkeletonFactory - Main factory class
 */
export class LoadingSkeletonFactory {
  /**
   * Create a property grid skeleton
   */
  static createPropertyGrid(config: {
    count?: number;
    variant?: PropertySkeletonConfig['variant'];
    columns?: SkeletonGridConfig['columns'];
    className?: string;
  } = {}) {
    const {
      count = 6,
      variant = 'default',
      columns = 3,
      className
    } = config;

    const rows = Math.ceil(count / columns);

    return (
      <SkeletonGrid
        columns={columns}
        rows={rows}
        gap="md"
        className={className}
      >
        <PropertyCardSkeleton variant={variant} />
      </SkeletonGrid>
    );
  }

  /**
   * Create a dashboard skeleton
   */
  static createDashboard(config: { className?: string } = {}) {
    const { className } = config;

    return (
      <div className={cn('space-y-8', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <BaseSkeleton className="h-8 w-48" />
            <BaseSkeleton className="h-4 w-32" />
          </div>
          <BaseSkeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BaseSkeleton className="h-6 w-24" />
            {Array(5).fill(null).map((_, i) => (
              <BaseSkeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                <BaseSkeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PropertyCardSkeleton variant="compact" />
                  <PropertyCardSkeleton variant="compact" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Create a search results skeleton
   */
  static createSearchResults(config: {
    count?: number;
    layout?: 'grid' | 'list';
    className?: string;
  } = {}) {
    const {
      count = 12,
      layout = 'grid',
      className
    } = config;

    if (layout === 'list') {
      return (
        <div className={cn('space-y-4', className)}>
          {Array(count).fill(null).map((_, i) => (
            <PropertyCardSkeleton key={i} variant="list" />
          ))}
        </div>
      );
    }

    return this.createPropertyGrid({ count, className });
  }

  /**
   * Create a homepage skeleton
   */
  static createHomepage(config: { className?: string } = {}) {
    const { className } = config;

    return (
      <div className={cn('space-y-12', className)}>
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <BaseSkeleton className="h-12 w-80 mx-auto" />
          <BaseSkeleton className="h-6 w-96 mx-auto" />
          <BaseSkeleton className="h-14 w-72 mx-auto rounded-lg" />
        </div>

        {/* Featured Properties */}
        <div className="space-y-6">
          <BaseSkeleton className="h-8 w-64" />
          {this.createPropertyGrid({ count: 8, columns: 4 })}
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <BaseSkeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(null).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <BaseSkeleton className="h-16 w-16 mx-auto rounded-full" />
                <BaseSkeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Create a property details skeleton
   */
  static createPropertyDetails(config: { className?: string } = {}) {
    const { className } = config;

    return (
      <div className={cn('space-y-8', className)}>
        {/* Image Gallery */}
        <BaseSkeleton className="w-full h-96 rounded-lg" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <BaseSkeleton className="h-8 w-3/4" />
              <BaseSkeleton className="h-5 w-1/2" />
              <div className="flex items-center space-x-4">
                <BaseSkeleton className="h-5 w-20" />
                <BaseSkeleton className="h-5 w-24" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <BaseSkeleton className="h-6 w-32" />
              <TextSkeleton lines={4} />
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <BaseSkeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-3">
                {Array(8).fill(null).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <BaseSkeleton className="h-5 w-5 rounded" />
                    <BaseSkeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <BaseSkeleton className="h-8 w-24" />
              <BaseSkeleton className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <BaseSkeleton className="h-12 rounded" />
              <BaseSkeleton className="h-12 rounded" />
            </div>
            <BaseSkeleton className="h-10 rounded" />
            <BaseSkeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Create custom skeleton with builder pattern
   */
  static custom() {
    return new SkeletonBuilder();
  }
}

/**
 * Skeleton Builder for complex custom skeletons
 */
class SkeletonBuilder {
  private components: React.ReactNode[] = [];

  text(config: TextSkeletonConfig): this {
    this.components.push(<TextSkeleton key={this.components.length} {...config} />);
    return this;
  }

  skeleton(config: SkeletonConfig): this {
    this.components.push(<BaseSkeleton key={this.components.length} {...config} />);
    return this;
  }

  propertyCard(config: PropertySkeletonConfig = {}): this {
    this.components.push(<PropertyCardSkeleton key={this.components.length} {...config} />);
    return this;
  }

  spacer(size: 'sm' | 'md' | 'lg' = 'md'): this {
    const heights = { sm: 'h-2', md: 'h-4', lg: 'h-8' };
    this.components.push(<div key={this.components.length} className={heights[size]} />);
    return this;
  }

  build(containerClass?: string): React.ReactElement {
    return (
      <div className={containerClass}>
        {this.components}
      </div>
    );
  }
}

// Export components for direct use
export { BaseSkeleton, TextSkeleton, PropertyCardSkeleton, SkeletonGrid };
export default LoadingSkeletonFactory;