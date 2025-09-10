/**
 * Property Card Types and Interfaces
 * 
 * Comprehensive TypeScript definitions for the unified PropertyCard system.
 * Consolidates types from 6+ property card implementations into a single,
 * cohesive type system supporting all use cases across the application.
 */

import { ReactNode } from 'react';

// =============================================================================
// Core Property Data Types
// =============================================================================

/**
 * Core property interface - standardized across all card variants
 */
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit?: 'night' | 'month' | 'week';
  currency?: string;
  
  // Property details
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  propertyType?: string;
  
  // Visual assets
  images: string[];
  thumbnail?: string;
  
  // Rating and reviews
  rating?: number;
  reviewCount?: number;
  reviews?: number; // Alias for compatibility
  
  // Status and availability
  status?: 'available' | 'unavailable' | 'pending' | 'booked';
  availability?: {
    available: boolean;
    nextAvailable?: string;
  };
  
  // Additional metadata
  amenities?: string[];
  features?: string[];
  description?: string;
  host?: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  savedAt?: string; // For favorites
  
  // Computed fields
  isFeatured?: boolean;
  isNewListing?: boolean;
  hasDiscount?: boolean;
  discountPercent?: number;
  originalPrice?: number;
}

// =============================================================================
// Component Configuration Types
// =============================================================================

/**
 * Property card display variants
 */
export type PropertyCardVariant = 
  | 'default'     // Standard property card for general use
  | 'compact'     // Minimal size for sidebars/similar properties
  | 'luxury'      // Premium styling with enhanced animations
  | 'list'        // Horizontal layout for list views
  | 'management'  // Host dashboard with management controls
  | 'featured'    // Homepage showcase with special styling
  | 'search'      // Search results optimized
  | 'favorites';  // Favorites/saved properties optimized

/**
 * Property card sizes
 */
export type PropertyCardSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Feature flags for enabling/disabling card functionality
 */
export interface PropertyCardFeatures {
  /** Enable favorite/heart button functionality */
  favorites?: boolean;
  /** Show quick action buttons (share, save, etc.) */
  quickActions?: boolean;
  /** Enable selection checkbox for bulk operations */
  selection?: boolean;
  /** Show management controls (edit, delete, etc.) */
  management?: boolean;
  /** Enable image carousel */
  carousel?: boolean;
  /** Show status and feature badges */
  badges?: boolean;
  /** Show detailed property information */
  details?: boolean;
  /** Show host information */
  hostInfo?: boolean;
  /** Show pricing breakdown */
  pricingDetails?: boolean;
  /** Enable hover animations and effects */
  animations?: boolean;
}

/**
 * Field visibility configuration
 */
export interface PropertyCardFieldConfig {
  /** Fields to explicitly show */
  showFields?: PropertyCardField[];
  /** Fields to explicitly hide */
  hideFields?: PropertyCardField[];
  /** Custom field order */
  fieldOrder?: PropertyCardField[];
}

export type PropertyCardField = 
  | 'title'
  | 'location'
  | 'price'
  | 'rating'
  | 'reviews'
  | 'bedrooms'
  | 'bathrooms'
  | 'guests'
  | 'propertyType'
  | 'amenities'
  | 'host'
  | 'status'
  | 'availability'
  | 'description';

// =============================================================================
// Action Handler Types
// =============================================================================

/**
 * Property card action handlers
 */
export interface PropertyCardActions {
  /** Handle favorite toggle */
  onFavorite?: (propertyId: string) => void | Promise<void>;
  /** Handle share action */
  onShare?: (propertyId: string) => void | Promise<void>;
  /** Handle property selection */
  onSelect?: (propertyId: string, selected: boolean) => void | Promise<void>;
  /** Handle click on the card */
  onClick?: (property: Property) => void | Promise<void>;
  /** Handle edit action (management mode) */
  onEdit?: (propertyId: string) => void | Promise<void>;
  /** Handle delete action (management mode) */
  onDelete?: (propertyId: string) => void | Promise<void>;
  /** Handle view details action */
  onView?: (propertyId: string) => void | Promise<void>;
  /** Handle contact host action */
  onContact?: (property: Property) => void | Promise<void>;
  /** Handle book now action */
  onBook?: (propertyId: string) => void | Promise<void>;
}

// =============================================================================
// State Types
// =============================================================================

/**
 * Property card loading state
 */
export interface PropertyCardLoadingState {
  /** Overall loading state */
  loading?: boolean;
  /** Image loading state */
  imageLoading?: boolean;
  /** Action loading states */
  favoriteLoading?: boolean;
  shareLoading?: boolean;
  deleteLoading?: boolean;
  editLoading?: boolean;
}

/**
 * Property card selection state
 */
export interface PropertyCardSelectionState {
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether selection is disabled */
  selectionDisabled?: boolean;
  /** Selection mode (single or multiple) */
  selectionMode?: 'single' | 'multiple';
}

/**
 * Property card interaction state
 */
export interface PropertyCardInteractionState {
  /** Whether the card is favorited */
  isFavorited?: boolean;
  /** Whether favorite action is available */
  favoriteDisabled?: boolean;
  /** Whether the card is hovered */
  isHovered?: boolean;
  /** Whether the card is focused */
  isFocused?: boolean;
}

// =============================================================================
// Main Component Props
// =============================================================================

/**
 * Main PropertyCard component props
 */
export interface PropertyCardProps {
  // Core data
  /** Property data to display */
  property: Property;
  
  // Display configuration
  /** Card variant for different contexts */
  variant?: PropertyCardVariant;
  /** Card size */
  size?: PropertyCardSize;
  /** Feature flags */
  features?: PropertyCardFeatures;
  /** Field visibility configuration */
  fields?: PropertyCardFieldConfig;
  
  // State
  /** Loading states */
  loading?: PropertyCardLoadingState;
  /** Selection state */
  selection?: PropertyCardSelectionState;
  /** Interaction state */
  interaction?: PropertyCardInteractionState;
  
  // Actions
  /** Action handlers */
  actions?: PropertyCardActions;
  
  // Styling
  /** Additional CSS classes */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Image aspect ratio */
  imageAspectRatio?: number;
  
  // Accessibility
  /** ARIA label for the card */
  'aria-label'?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  
  // Advanced configuration
  /** Custom render functions */
  renderPrice?: (property: Property) => ReactNode;
  renderTitle?: (property: Property) => ReactNode;
  renderActions?: (property: Property, actions: PropertyCardActions) => ReactNode;
  renderBadges?: (property: Property) => ReactNode;
}

// =============================================================================
// Sub-Component Props
// =============================================================================

/**
 * Property card image component props
 */
export interface PropertyCardImageProps {
  property: Property;
  variant: PropertyCardVariant;
  size: PropertyCardSize;
  aspectRatio?: number;
  enableCarousel?: boolean;
  onImageClick?: () => void;
  className?: string;
}

/**
 * Property card header component props
 */
export interface PropertyCardHeaderProps {
  property: Property;
  variant: PropertyCardVariant;
  showBadges?: boolean;
  actions?: {
    onFavorite?: () => void;
    onShare?: () => void;
    onSelect?: (selected: boolean) => void;
  };
  interaction?: PropertyCardInteractionState;
  loading?: PropertyCardLoadingState;
  className?: string;
}

/**
 * Property card content component props
 */
export interface PropertyCardContentProps {
  property: Property;
  variant: PropertyCardVariant;
  fields?: PropertyCardFieldConfig;
  showDetails?: boolean;
  showHost?: boolean;
  renderPrice?: (property: Property) => ReactNode;
  renderTitle?: (property: Property) => ReactNode;
  className?: string;
}

/**
 * Property card actions component props
 */
export interface PropertyCardActionsProps {
  property: Property;
  variant: PropertyCardVariant;
  actions?: PropertyCardActions;
  features?: PropertyCardFeatures;
  loading?: PropertyCardLoadingState;
  className?: string;
}

/**
 * Property card footer component props
 */
export interface PropertyCardFooterProps {
  property: Property;
  variant: PropertyCardVariant;
  showRating?: boolean;
  showHost?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Property card hook return type
 */
export interface UsePropertyCardReturn {
  // State
  isHovered: boolean;
  isFocused: boolean;
  isSelected: boolean;
  isFavorited: boolean;
  
  // Actions
  handleClick: () => void;
  handleFavorite: () => void;
  handleShare: () => void;
  handleSelect: (selected: boolean) => void;
  handleEdit: () => void;
  handleDelete: () => void;
  handleView: () => void;
  
  // Event handlers
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  
  // Utilities
  getCardClassName: () => string;
  getVariantClassName: () => string;
  getSizeClassName: () => string;
}

/**
 * Property actions hook return type
 */
export interface UsePropertyActionsReturn {
  // Action states
  isLoading: Record<string, boolean>;
  
  // Action handlers
  favorite: (propertyId: string) => Promise<void>;
  share: (propertyId: string) => Promise<void>;
  select: (propertyId: string, selected: boolean) => void;
  edit: (propertyId: string) => Promise<void>;
  delete: (propertyId: string) => Promise<void>;
  view: (propertyId: string) => void;
  contact: (property: Property) => void;
  book: (propertyId: string) => void;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Property card variant configuration
 */
export interface PropertyCardVariantConfig {
  /** Default features for this variant */
  defaultFeatures: PropertyCardFeatures;
  /** Default field configuration */
  defaultFields: PropertyCardFieldConfig;
  /** CSS classes for the variant */
  classNames: Record<string, string>;
  /** Size constraints */
  sizeConstraints?: {
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: number;
  };
}

/**
 * Property card theme configuration
 */
export interface PropertyCardTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
  shadows: {
    card: string;
    hover: string;
  };
}

// =============================================================================
// Constants Export
// =============================================================================

/**
 * Default property card configuration
 */
export interface PropertyCardDefaults {
  variant: PropertyCardVariant;
  size: PropertyCardSize;
  features: PropertyCardFeatures;
  imageAspectRatio: number;
  fields: PropertyCardFieldConfig;
}