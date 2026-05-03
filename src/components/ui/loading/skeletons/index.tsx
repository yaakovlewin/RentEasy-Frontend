/**
 * Skeleton components barrel export
 * Provides clean imports for skeleton loading states
 */

export { CoreSkeleton, type CoreSkeletonProps } from './CoreSkeleton';
export { TextSkeleton, type TextSkeletonProps } from './TextSkeleton';
export { CardSkeleton, type CardSkeletonProps } from './CardSkeleton';

// Re-export for backward compatibility
export { CoreSkeleton as LoadingSkeleton } from './CoreSkeleton';
export { CardSkeleton as LoadingCard } from './CardSkeleton';
