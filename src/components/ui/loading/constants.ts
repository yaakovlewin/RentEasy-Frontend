/**
 * Centralized loading component constants
 * Eliminates DRY violations and improves performance by preventing object recreation
 */

/**
 * Size classes for loading spinners and elements
 */
export const SPINNER_SIZE_CLASSES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
} as const;

/**
 * Color classes for loading spinners
 */
export const SPINNER_COLOR_CLASSES = {
  primary: 'border-primary text-primary',
  white: 'border-white text-white',
  gray: 'border-gray-400 text-gray-400',
} as const;

/**
 * Text size classes corresponding to spinner sizes
 */
export const TEXT_SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
} as const;

/**
 * Animation delay styles for staggered animations
 * Using const objects prevents recreation on every render
 */
export const ANIMATION_DELAYS = [
  { animationDelay: '0ms' },
  { animationDelay: '150ms' },
  { animationDelay: '300ms' },
  { animationDelay: '450ms' },
] as const;

/**
 * Skeleton variant classes
 */
export const SKELETON_VARIANT_CLASSES = {
  text: 'rounded',
  rectangular: 'rounded-lg',
  circular: 'rounded-full',
  rounded: 'rounded-xl',
} as const;

/**
 * Skeleton color classes
 */
export const SKELETON_COLORS = {
  base: 'bg-gray-200',
  shimmer: 'relative bg-gray-200 overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
  pulse: 'bg-gray-200 animate-pulse',
} as const;

/**
 * Rounded classes for skeleton components
 */
export const ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

/**
 * Grid gap classes
 */
export const GRID_GAP_CLASSES = {
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
} as const;

/**
 * Grid column classes with responsive breakpoints
 */
export const GRID_COLUMN_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
} as const;

/**
 * Width classes for text skeletons
 */
export const WIDTH_CLASSES = {
  full: 'w-full',
  '3/4': 'w-3/4',
  '2/3': 'w-2/3',
  '1/2': 'w-1/2',
  '1/3': 'w-1/3',
  '1/4': 'w-1/4',
} as const;

/**
 * Default widths for multi-line text skeletons
 */
export const DEFAULT_TEXT_WIDTHS = ['full', '3/4', '1/2', '2/3'] as const;

/**
 * Shimmer animation classes for overlay variants
 */
export const SHIMMER_CLASSES = {
  enabled: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
  disabled: 'animate-pulse',
} as const;

/**
 * Type definitions for const objects
 */
export type SpinnerSize = keyof typeof SPINNER_SIZE_CLASSES;
export type SpinnerColor = keyof typeof SPINNER_COLOR_CLASSES;
export type SkeletonVariant = keyof typeof SKELETON_VARIANT_CLASSES;
export type RoundedSize = keyof typeof ROUNDED_CLASSES;
export type GridGap = keyof typeof GRID_GAP_CLASSES;
export type GridColumns = keyof typeof GRID_COLUMN_CLASSES;
export type WidthClass = keyof typeof WIDTH_CLASSES;
