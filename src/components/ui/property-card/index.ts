// Main component
export { PropertyCard } from './PropertyCard';

// Sub-components (for advanced usage)
export {
  PropertyCardImage,
  PropertyCardHeader,
  PropertyCardContent,
  PropertyCardFooter,
  PropertyCardActions,
} from './components';

// Hooks
export { usePropertyCard } from './hooks';

// Types (comprehensive export for TypeScript users)
export type {
  // Core interfaces
  Property,
  PropertyCardProps,
  
  // Configuration types
  PropertyCardVariant,
  PropertyCardSize,
  PropertyCardFeatures,
  PropertyCardFieldConfig,
  PropertyCardField,
  
  // Action types
  PropertyCardActions,
  
  // State types
  PropertyCardLoadingState,
  PropertyCardSelectionState,
  PropertyCardInteractionState,
  
  // Sub-component types
  PropertyCardImageProps,
  PropertyCardHeaderProps,
  PropertyCardContentProps,
  PropertyCardFooterProps,
  PropertyCardActionsProps,
  
  // Hook types
  UsePropertyCardReturn,
  UsePropertyActionsReturn,
  
  // Utility types
  PropertyCardVariantConfig,
  PropertyCardTheme,
  PropertyCardDefaults,
} from './types';

// Default configurations and constants
export const PROPERTY_CARD_DEFAULTS: import('./types').PropertyCardDefaults = {
  variant: 'default',
  size: 'md',
  features: {
    favorites: false,
    quickActions: true,
    selection: false,
    management: false,
    carousel: true,
    badges: true,
    details: true,
    hostInfo: true,
    pricingDetails: true,
    animations: true,
  },
  imageAspectRatio: 1.5,
  fields: {
    showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests'],
  },
};