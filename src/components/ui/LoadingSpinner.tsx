/**
 * @deprecated This file is maintained for backward compatibility only.
 * Import from specific component files instead for better tree-shaking and Next.js 15 optimization.
 *
 * @example
 * // Old (still works)
 * import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
 *
 * // New (recommended - direct imports)
 * import { LoadingSpinner } from '@/components/ui/loading/spinners';
 * import { LoadingSkeleton } from '@/components/ui/loading/skeletons';
 * import { LoadingOverlay } from '@/components/ui/loading/overlays/LoadingOverlay';
 */

// Re-export components from new modular structure
export { LoadingSpinner } from './loading/spinners';
export { LoadingSkeleton, LoadingCard } from './loading/skeletons';
export { LoadingOverlay } from './loading/overlays/LoadingOverlay';

export type { LoadingSpinnerProps } from './loading/spinners';
export type { CoreSkeletonProps as LoadingSkeletonProps } from './loading/skeletons';
export type { CardSkeletonProps as LoadingCardProps } from './loading/skeletons';
export type { LoadingOverlayProps } from './loading/overlays/LoadingOverlay';
