/**
 * Pure Rendering Helper Functions for PropertyCard
 *
 * All functions are pure - same input always produces same output.
 * No side effects, fully testable, composable functions.
 *
 * @module PropertyCard/RenderHelpers
 */

import { cn } from '@/lib/utils';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type PropertyVariant = 'default' | 'premium' | 'luxury' | 'compact';
export type BadgeType = 'Superhost' | 'Rare Find' | 'Luxury' | 'Premium' | 'Unique' | 'Featured';

// =============================================================================
// PURE RENDERING FUNCTIONS
// =============================================================================

/**
 * Get badge styling based on badge type
 * Pure function - deterministic mapping
 */
export const getBadgeStyle = (badgeText: string): string => {
  const badgeStyles: Record<string, string> = {
    Superhost: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    'Rare Find': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    Luxury: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    Premium: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    Unique: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    Featured: 'bg-gradient-to-r from-primary to-pink-500 text-white',
  };

  return badgeStyles[badgeText] || 'bg-gray-800 text-white';
};

/**
 * Get variant-specific styling classes
 * Pure function - variant to classes mapping
 */
export const getVariantStyles = (variant: PropertyVariant): string => {
  const variantStyles: Record<PropertyVariant, string> = {
    default: 'max-w-sm',
    premium: 'max-w-md',
    luxury: 'max-w-lg',
    compact: 'max-w-xs',
  };

  return variantStyles[variant];
};

/**
 * Get aspect ratio classes for different variants
 * Pure function - variant to aspect ratio mapping
 */
export const getAspectRatio = (variant: PropertyVariant): string => {
  const aspectRatios: Record<PropertyVariant, string> = {
    default: 'aspect-[4/3]',
    premium: 'aspect-[5/4]',
    luxury: 'aspect-[3/2]',
    compact: 'aspect-[4/3]',
  };

  return aspectRatios[variant];
};

/**
 * Render property price with currency formatting
 * Pure function - formats price consistently
 */
export const renderPropertyPrice = (price: number): string => {
  return `$${price}`;
};

/**
 * Render original price with discount calculation
 * Pure function - calculates and formats discount
 */
export const renderDiscountedPrice = (
  originalPrice: number,
  currentPrice: number
): { formattedOriginal: string; discountPercentage: number } => {
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  return {
    formattedOriginal: `$${originalPrice}`,
    discountPercentage: discount,
  };
};

/**
 * Get property card container classes
 * Pure function - combines variant styles with base classes
 */
export const getPropertyCardClasses = (
  variant: PropertyVariant,
  className?: string
): string => {
  return cn(
    'group cursor-pointer border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] animate-slide-up rounded-2xl backdrop-blur-sm',
    getVariantStyles(variant),
    className
  );
};

/**
 * Get image container classes
 * Pure function - combines aspect ratio with base classes
 */
export const getImageContainerClasses = (variant: PropertyVariant): string => {
  return cn('relative overflow-hidden', getAspectRatio(variant));
};

/**
 * Get image classes based on loading state
 * Pure function - conditional classes based on state
 */
export const getImageClasses = (imageLoaded: boolean): string => {
  return cn(
    'object-cover transition-all duration-700',
    'group-hover:scale-110',
    imageLoaded ? 'opacity-100' : 'opacity-0'
  );
};

/**
 * Calculate amenities to display based on variant
 * Pure function - determines slice count
 */
export const getAmenitiesCount = (variant: PropertyVariant): number => {
  return variant === 'luxury' ? 6 : 4;
};

/**
 * Get padding classes based on variant
 * Pure function - variant-specific padding
 */
export const getCardPadding = (variant: PropertyVariant): string => {
  return variant === 'compact' ? 'p-4' : 'p-6';
};

/**
 * Get title classes based on variant
 * Pure function - variant-specific typography
 */
export const getTitleClasses = (variant: PropertyVariant): string => {
  return cn(
    'font-bold leading-tight flex-1 pr-3 group-hover:text-primary transition-colors line-clamp-2',
    variant === 'luxury' ? 'text-xl' : 'text-lg'
  );
};

/**
 * Get price classes based on variant
 * Pure function - variant-specific price typography
 */
export const getPriceClasses = (variant: PropertyVariant): string => {
  return cn(
    'font-bold text-gray-900 tracking-tight',
    variant === 'luxury' ? 'text-3xl' : 'text-2xl'
  );
};

/**
 * Get amenities layout classes based on variant
 * Pure function - grid vs flex layout
 */
export const getAmenitiesLayoutClasses = (variant: PropertyVariant): string => {
  return variant === 'luxury'
    ? 'grid grid-cols-2 gap-2'
    : 'flex flex-wrap gap-2';
};

/**
 * Render amenity count overflow text
 * Pure function - calculates and formats overflow
 */
export const renderAmenityOverflow = (
  totalCount: number,
  displayCount: number
): string | null => {
  const overflow = totalCount - displayCount;
  return overflow > 0 ? `+${overflow} more` : null;
};

/**
 * Get overlay classes based on hover state
 * Pure function - conditional overlay opacity
 */
export const getOverlayClasses = (isHovered: boolean): string => {
  return cn(
    'absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-all duration-500',
    isHovered ? 'opacity-100' : 'opacity-0'
  );
};

/**
 * Get shimmer effect classes based on hover state
 * Pure function - shimmer animation classes
 */
export const getShimmerClasses = (isHovered: boolean): string => {
  return cn(
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-1000',
    isHovered ? 'translate-x-full' : '-translate-x-full'
  );
};

/**
 * Get favorite button classes based on favorited state
 * Pure function - button styling based on state
 */
export const getFavoriteButtonClasses = (isFavorited: boolean): string => {
  return cn(
    'p-3 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-110 group/fav',
    isFavorited
      ? 'bg-red-50/90 hover:bg-red-100/90 ring-2 ring-red-200'
      : 'bg-white/90 hover:bg-white ring-1 ring-white/20'
  );
};

/**
 * Get favorite icon classes based on favorited state
 * Pure function - icon styling and fill
 */
export const getFavoriteIconClasses = (isFavorited: boolean): string => {
  return cn(
    'w-4 h-4 transition-all duration-300 group-hover/fav:scale-110',
    isFavorited
      ? 'text-red-500 fill-red-500'
      : 'text-gray-600 hover:text-red-500'
  );
};

/**
 * Get verification status color
 * Pure function - verification badge color
 */
export const getVerificationColor = (isVerified: boolean): string => {
  return isVerified ? 'bg-green-500' : 'bg-gray-400';
};

/**
 * Get current image index with bounds checking
 * Pure function - safe image index calculation
 */
export const getNextImageIndex = (
  currentIndex: number,
  totalImages: number
): number => {
  return (currentIndex + 1) % totalImages;
};

/**
 * Get previous image index with bounds checking
 * Pure function - safe image index calculation
 */
export const getPreviousImageIndex = (
  currentIndex: number,
  totalImages: number
): number => {
  return currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
};

/**
 * Check if should show luxury features
 * Pure function - feature flag based on variant
 */
export const shouldShowLuxuryFeatures = (variant: PropertyVariant): boolean => {
  return variant === 'luxury';
};

/**
 * Get grid column classes for property grid
 * Pure function - responsive grid classes
 */
export const getGridColumnClasses = (columns: {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}): string => {
  return cn(
    'grid gap-8',
    `grid-cols-1`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  );
};

// =============================================================================
// COMPOSITE HELPERS (Combining Multiple Pure Functions)
// =============================================================================

/**
 * Get all classes for property card
 * Composite function - combines multiple helpers
 */
export const getPropertyCardStyles = (
  variant: PropertyVariant,
  className?: string
) => ({
  card: getPropertyCardClasses(variant, className),
  imageContainer: getImageContainerClasses(variant),
  content: getCardPadding(variant),
  title: getTitleClasses(variant),
  price: getPriceClasses(variant),
  amenities: getAmenitiesLayoutClasses(variant),
});

/**
 * Get all price-related data
 * Composite function - price formatting and discount calculation
 */
export const getPriceDisplayData = (
  price: number,
  originalPrice?: number
) => {
  const formattedPrice = renderPropertyPrice(price);

  if (originalPrice && originalPrice > price) {
    const { formattedOriginal, discountPercentage } = renderDiscountedPrice(
      originalPrice,
      price
    );

    return {
      currentPrice: formattedPrice,
      originalPrice: formattedOriginal,
      hasDiscount: true,
      discountPercentage,
    };
  }

  return {
    currentPrice: formattedPrice,
    originalPrice: null,
    hasDiscount: false,
    discountPercentage: 0,
  };
};
