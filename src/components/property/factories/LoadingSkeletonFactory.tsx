/**
 * @fileoverview Loading Skeleton Factory
 *
 * Enterprise-grade loading skeleton system following FP and SOLID principles.
 * Eliminates code duplication through pure function composition.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Constants
 */
const SKELETON_DEFAULTS = {
  ANIMATION_ENABLED: true,
  ROUNDED: 'md' as const,
  GRID_GAP: 'md' as const,
  GRID_COLUMNS: 3 as const,
  PROPERTY_GRID_COUNT: 6,
} as const;

const HEIGHT = {
  IMAGE_DEFAULT: 'h-48',
  IMAGE_COMPACT: 'h-32',
  IMAGE_LIST: 'h-32',
  IMAGE_HERO: 'h-96',
  IMAGE_THUMB: 'h-24',
  TEXT_SMALL: 'h-4',
  TEXT_MEDIUM: 'h-5',
  BUTTON: 'h-12',
} as const;

const WIDTH = {
  FULL: 'w-full',
  THREE_QUARTERS: 'w-3/4',
  TWO_THIRDS: 'w-2/3',
  HALF: 'w-1/2',
  THIRD: 'w-1/3',
  QUARTER: 'w-1/4',
  IMAGE_LIST: 'w-32',
  SMALL: 'w-16',
  MEDIUM: 'w-20',
  ICON: 'w-4',
  RATING: 'w-12',
} as const;

/**
 * Type definitions
 */
type RoundedSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type GapSize = 'sm' | 'md' | 'lg';
type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;
type TextWidth = 'full' | '3/4' | '1/2' | '1/3' | '1/4' | '2/3';
type PropertyVariant = 'default' | 'compact' | 'list';

interface SkeletonConfig {
  className?: string;
  animate?: boolean;
  rounded?: RoundedSize;
  'data-testid'?: string;
}

interface SkeletonGridConfig extends SkeletonConfig {
  columns: GridColumns;
  rows: number;
  gap?: GapSize;
}

interface PropertySkeletonConfig extends SkeletonConfig {
  variant?: PropertyVariant;
  showImage?: boolean;
  showDetails?: boolean;
  showActions?: boolean;
}

interface TextSkeletonConfig extends SkeletonConfig {
  lines: number;
  widths?: TextWidth[];
}

interface PropertyGridConfig {
  count?: number;
  variant?: PropertyVariant;
  columns?: GridColumns;
  gap?: GapSize;
  className?: string;
  'data-testid'?: string;
}

interface TextBlockConfig {
  lines?: number;
  widths?: TextWidth[];
  className?: string;
  'data-testid'?: string;
}

interface DetailPageConfig {
  showImage?: boolean;
  showGallery?: boolean;
  showDescription?: boolean;
  showAmenities?: boolean;
  className?: string;
  'data-testid'?: string;
}

/**
 * Type-to-class mappings (pure data structures)
 */
const ROUNDED_CLASSES: Record<RoundedSize, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const GAP_CLASSES: Record<GapSize, string> = {
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
};

const GRID_COL_CLASSES: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

const TEXT_WIDTH_CLASSES: Record<TextWidth, string> = {
  full: WIDTH.FULL,
  '3/4': WIDTH.THREE_QUARTERS,
  '2/3': WIDTH.TWO_THIRDS,
  '1/2': WIDTH.HALF,
  '1/3': WIDTH.THIRD,
  '1/4': WIDTH.QUARTER,
};

const PROPERTY_VARIANT_CLASSES: Record<PropertyVariant, string> = {
  default: 'space-y-4',
  compact: 'space-y-2',
  list: 'flex space-x-4 space-y-0',
};

const PROPERTY_IMAGE_CLASSES: Record<PropertyVariant, string> = {
  default: `${WIDTH.FULL} ${HEIGHT.IMAGE_DEFAULT}`,
  compact: `${WIDTH.FULL} ${HEIGHT.IMAGE_COMPACT}`,
  list: `${WIDTH.IMAGE_LIST} ${HEIGHT.IMAGE_LIST} flex-shrink-0`,
};

/**
 * Pure utility functions
 */
const generateArray = (length: number): number[] =>
  Array.from({ length }, (_, i) => i);

const getDefaultTextWidths = (lines: number): TextWidth[] => {
  const pattern: TextWidth[] = ['full', '3/4', '1/2', '2/3'];
  return generateArray(lines).map(i => pattern[i % pattern.length] as TextWidth);
};

const buildTestId = (base: string | undefined, suffix: string): string | undefined =>
  base ? `${base}-${suffix}` : undefined;

const buildAriaProps = () => ({
  'aria-busy': 'true' as const,
  'aria-live': 'polite' as const,
  role: 'status' as const,
});

/**
 * Base Skeleton Component (pure presentational component)
 */
const BaseSkeleton: React.FC<SkeletonConfig> = ({
  className,
  animate = SKELETON_DEFAULTS.ANIMATION_ENABLED,
  rounded = SKELETON_DEFAULTS.ROUNDED,
  'data-testid': testId,
}) => (
  <div
    className={cn(
      'bg-gray-200',
      animate && 'animate-pulse',
      ROUNDED_CLASSES[rounded],
      className
    )}
    data-testid={testId}
    {...buildAriaProps()}
    aria-label="Loading content"
  />
);

/**
 * Text Skeleton Component (functional composition)
 */
const TextSkeleton: React.FC<TextSkeletonConfig> = ({
  lines,
  widths,
  className,
  animate = SKELETON_DEFAULTS.ANIMATION_ENABLED,
  'data-testid': testId,
}) => {
  const lineWidths = widths ?? getDefaultTextWidths(lines);

  return (
    <div className={cn('space-y-2', className)} data-testid={testId} {...buildAriaProps()}>
      {generateArray(lines).map(index => (
        <BaseSkeleton
          key={index}
          className={cn(HEIGHT.TEXT_SMALL, TEXT_WIDTH_CLASSES[lineWidths[index] ?? 'full'])}
          animate={animate}
          data-testid={buildTestId(testId, `line-${index}`)}
        />
      ))}
    </div>
  );
};

/**
 * Property Details Component (extracted for SRP)
 */
const PropertyDetails: React.FC<{
  animate: boolean;
  testId?: string;
}> = ({ animate, testId }) => (
  <>
    <div className="flex space-x-4 mb-3">
      {generateArray(3).map(i => (
        <BaseSkeleton
          key={i}
          className={`${HEIGHT.TEXT_SMALL} ${WIDTH.SMALL}`}
          animate={animate}
          data-testid={buildTestId(testId, `detail-${i}`)}
        />
      ))}
    </div>

    <div className="flex items-center space-x-2 mb-3">
      <BaseSkeleton
        className={`${HEIGHT.TEXT_SMALL} ${WIDTH.ICON}`}
        animate={animate}
        rounded="sm"
        data-testid={buildTestId(testId, 'rating-icon')}
      />
      <BaseSkeleton
        className={`${HEIGHT.TEXT_SMALL} ${WIDTH.RATING}`}
        animate={animate}
        data-testid={buildTestId(testId, 'rating-value')}
      />
    </div>
  </>
);

/**
 * Property Card Skeleton Component (composed of smaller components)
 */
const PropertyCardSkeleton: React.FC<PropertySkeletonConfig> = ({
  variant = 'default',
  showImage = true,
  showDetails = true,
  showActions = true,
  className,
  animate = SKELETON_DEFAULTS.ANIMATION_ENABLED,
  'data-testid': testId,
}) => (
  <div
    className={cn('bg-white rounded-lg p-4', PROPERTY_VARIANT_CLASSES[variant], className)}
    data-testid={testId}
    {...buildAriaProps()}
  >
    {showImage && (
      <BaseSkeleton
        className={PROPERTY_IMAGE_CLASSES[variant]}
        animate={animate}
        rounded="lg"
        data-testid={buildTestId(testId, 'image')}
      />
    )}

    <div className={variant === 'list' ? 'flex-1' : ''}>
      <BaseSkeleton
        className={`${HEIGHT.TEXT_MEDIUM} ${WIDTH.THREE_QUARTERS} mb-2`}
        animate={animate}
        data-testid={buildTestId(testId, 'title')}
      />

      <BaseSkeleton
        className={`${HEIGHT.TEXT_SMALL} ${WIDTH.HALF} mb-3`}
        animate={animate}
        data-testid={buildTestId(testId, 'location')}
      />

      {showDetails && <PropertyDetails animate={animate} testId={testId} />}

      <div className="flex justify-between items-center">
        <BaseSkeleton
          className={`${HEIGHT.TEXT_MEDIUM} ${WIDTH.MEDIUM}`}
          animate={animate}
          data-testid={buildTestId(testId, 'price')}
        />
        {showActions && (
          <BaseSkeleton
            className={`${HEIGHT.TEXT_SMALL} ${WIDTH.ICON}`}
            animate={animate}
            rounded="sm"
            data-testid={buildTestId(testId, 'action')}
          />
        )}
      </div>
    </div>
  </div>
);

/**
 * Skeleton Grid Component (pure layout component)
 */
const SkeletonGrid: React.FC<SkeletonGridConfig & { children: React.ReactNode }> = ({
  columns,
  rows,
  gap = SKELETON_DEFAULTS.GRID_GAP,
  className,
  children,
  'data-testid': testId,
}) => (
  <div
    className={cn('grid', GRID_COL_CLASSES[columns], GAP_CLASSES[gap], className)}
    data-testid={testId}
    role="list"
    aria-busy="true"
    aria-live="polite"
  >
    {generateArray(rows * columns).map(index => (
      <div key={index} role="listitem">
        {children}
      </div>
    ))}
  </div>
);

/**
 * Gallery Grid Component (extracted for SRP)
 */
const GalleryGrid: React.FC = () => (
  <div className="grid grid-cols-4 gap-4">
    {generateArray(4).map(i => (
      <BaseSkeleton
        key={i}
        className={`${WIDTH.FULL} ${HEIGHT.IMAGE_THUMB}`}
        rounded="md"
      />
    ))}
  </div>
);

/**
 * Amenities Section Component (extracted for SRP)
 */
const AmenitiesSection: React.FC = () => (
  <div className="space-y-3 mt-6">
    <BaseSkeleton className={`${HEIGHT.TEXT_MEDIUM} ${WIDTH.THIRD}`} />
    <div className="grid grid-cols-2 gap-3">
      {generateArray(6).map(i => (
        <BaseSkeleton
          key={i}
          className={`${HEIGHT.TEXT_SMALL} ${WIDTH.FULL}`}
        />
      ))}
    </div>
  </div>
);

/**
 * Booking Card Component (extracted for SRP)
 */
const BookingCard: React.FC = () => (
  <div className="bg-white rounded-lg p-4 space-y-4">
    <BaseSkeleton className={`${HEIGHT.TEXT_MEDIUM} ${WIDTH.FULL}`} />
    <BaseSkeleton className={`${HEIGHT.TEXT_SMALL} ${WIDTH.FULL}`} />
    <BaseSkeleton className={`${HEIGHT.BUTTON} ${WIDTH.FULL}`} rounded="md" />
  </div>
);

/**
 * Factory functions (pure functions, not a class)
 */
const createPropertyGrid = (config: PropertyGridConfig = {}) => {
  const {
    count = SKELETON_DEFAULTS.PROPERTY_GRID_COUNT,
    variant = 'default',
    columns = SKELETON_DEFAULTS.GRID_COLUMNS,
    gap = SKELETON_DEFAULTS.GRID_GAP,
    className,
    'data-testid': testId,
  } = config;

  const rows = Math.ceil(count / columns);

  return (
    <SkeletonGrid columns={columns} rows={rows} gap={gap} className={className} data-testid={testId}>
      <PropertyCardSkeleton variant={variant} />
    </SkeletonGrid>
  );
};

const createPropertyCard = (config: PropertySkeletonConfig = {}) =>
  <PropertyCardSkeleton {...config} />;

const createTextBlock = (config: TextBlockConfig = {}) => {
  const { lines = 3, widths, className, 'data-testid': testId } = config;
  return <TextSkeleton lines={lines} widths={widths} className={className} data-testid={testId} />;
};

const createDetailPage = (config: DetailPageConfig = {}) => {
  const {
    showImage = true,
    showGallery = true,
    showDescription = true,
    showAmenities = true,
    className,
    'data-testid': testId,
  } = config;

  return (
    <div className={cn('space-y-6', className)} data-testid={testId} {...buildAriaProps()}>
      {showImage && (
        <BaseSkeleton
          className={`${WIDTH.FULL} ${HEIGHT.IMAGE_HERO}`}
          rounded="lg"
          data-testid={buildTestId(testId, 'hero')}
        />
      )}

      {showGallery && <GalleryGrid />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <BaseSkeleton className={`${HEIGHT.TEXT_MEDIUM} ${WIDTH.HALF}`} />
          <BaseSkeleton className={`${HEIGHT.TEXT_SMALL} ${WIDTH.THIRD}`} />

          {showDescription && <TextSkeleton lines={5} className="mt-6" />}
          {showAmenities && <AmenitiesSection />}
        </div>

        <div className="space-y-4">
          <BookingCard />
        </div>
      </div>
    </div>
  );
};

const createListView = (config: PropertyGridConfig = {}) => {
  const { count = 5, className, 'data-testid': testId } = config;

  return (
    <div className={cn('space-y-4', className)} data-testid={testId} role="list" aria-busy="true" aria-live="polite">
      {generateArray(count).map(i => (
        <PropertyCardSkeleton key={i} variant="list" data-testid={buildTestId(testId, `item-${i}`)} />
      ))}
    </div>
  );
};

const createCompactGrid = (config: PropertyGridConfig = {}) =>
  createPropertyGrid({
    ...config,
    variant: 'compact',
    columns: config.columns ?? 4,
  });

/**
 * LoadingSkeletonFactory - Pure function-based factory (no class needed)
 */
export const LoadingSkeletonFactory = {
  createPropertyGrid,
  createPropertyCard,
  createTextBlock,
  createDetailPage,
  createListView,
  createCompactGrid,
} as const;

/**
 * Export individual components for direct use
 */
export { BaseSkeleton, TextSkeleton, PropertyCardSkeleton, SkeletonGrid };

/**
 * Export type definitions
 */
export type {
  SkeletonConfig,
  SkeletonGridConfig,
  PropertySkeletonConfig,
  TextSkeletonConfig,
  PropertyGridConfig,
  TextBlockConfig,
  DetailPageConfig,
  RoundedSize,
  GapSize,
  GridColumns,
  TextWidth,
  PropertyVariant,
};

export default LoadingSkeletonFactory;
