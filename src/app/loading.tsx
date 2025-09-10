/**
 * Root Application Loading State
 * 
 * Professional loading experience for the main application
 * with branded design and smooth animations.
 */

import { LoadingOverlay } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <LoadingOverlay
      show={true}
      text="Welcome to RentEasy"
      variant="fullscreen"
      spinnerVariant="spinner"
    />
  );
}