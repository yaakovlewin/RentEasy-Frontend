/**
 * @fileoverview Property Components - Direct Exports Only
 *
 * NOTE: This barrel export file exists for backward compatibility only.
 *
 * BEST PRACTICE: Import components directly from their source files:
 * ✅ import { PropertyBookingCard } from '@/components/property/components/PropertyBookingCard';
 * ❌ import { PropertyBookingCard } from '@/components/property/components';
 *
 * Direct imports improve:
 * - Tree-shaking and bundle optimization
 * - Fast Refresh performance in development
 * - Build times and module resolution
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/package-bundling
 */

// Core property components (prefer direct imports)
export { PropertyImageGallery } from './PropertyImageGallery';
export { PropertyPriceBreakdown } from './PropertyPriceBreakdown';
export { PropertyAmenities } from './PropertyAmenities';
export { PropertyReviews } from './PropertyReviews';
export { PropertyBookingCard } from './PropertyBookingCard';
export { PropertyHeader } from './PropertyHeader';
export { PropertyInfo } from './PropertyInfo';
export { PropertyDescription } from './PropertyDescription';
export { PropertyRules } from './PropertyRules';

// Booking card sub-components (prefer direct imports)
export { PropertyBookingForm } from './PropertyBookingForm';
export { PropertyBookingButton } from './PropertyBookingButton';
export { ValidationSection } from './ValidationSection';
