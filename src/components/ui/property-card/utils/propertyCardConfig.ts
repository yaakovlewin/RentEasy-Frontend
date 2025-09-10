import type { 
  PropertyCardVariant, 
  PropertyCardVariantConfig, 
  PropertyCardFeatures,
  PropertyCardFieldConfig,
  PropertyCardField
} from '../types';

/**
 * Predefined variant configurations
 */
export const VARIANT_CONFIGS: Record<PropertyCardVariant, PropertyCardVariantConfig> = {
  default: {
    defaultFeatures: {
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
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests'],
    },
    classNames: {
      card: 'flex flex-col',
      image: 'w-full aspect-[3/2] rounded-t-lg overflow-hidden',
      content: 'p-4 flex-1',
    },
    sizeConstraints: {
      minHeight: 280,
      aspectRatio: 1.5,
    },
  },

  compact: {
    defaultFeatures: {
      favorites: true,
      quickActions: false,
      selection: false,
      management: false,
      carousel: false,
      badges: false,
      details: false,
      hostInfo: false,
      pricingDetails: true,
      animations: true,
    },
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating'],
    },
    classNames: {
      card: 'flex flex-col min-h-0',
      image: 'w-full h-32 rounded-lg overflow-hidden',
      content: 'space-y-2',
    },
    sizeConstraints: {
      maxHeight: 220,
    },
  },

  luxury: {
    defaultFeatures: {
      favorites: true,
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
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests', 'amenities'],
    },
    classNames: {
      card: 'flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-xl border-0',
      image: 'w-full aspect-[4/3] rounded-t-lg overflow-hidden',
      content: 'p-6 flex-1',
    },
    sizeConstraints: {
      minHeight: 320,
      aspectRatio: 1.33,
    },
  },

  list: {
    defaultFeatures: {
      favorites: true,
      quickActions: true,
      selection: false,
      management: false,
      carousel: false,
      badges: true,
      details: true,
      hostInfo: false,
      pricingDetails: true,
      animations: false,
    },
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests'],
    },
    classNames: {
      card: 'flex flex-row items-start p-4',
      image: 'w-32 h-24 rounded-lg overflow-hidden flex-shrink-0',
      content: 'flex-1 min-w-0 ml-4',
    },
    sizeConstraints: {
      minHeight: 120,
    },
  },

  management: {
    defaultFeatures: {
      favorites: false,
      quickActions: false,
      selection: true,
      management: true,
      carousel: true,
      badges: true,
      details: true,
      hostInfo: false,
      pricingDetails: true,
      animations: true,
    },
    defaultFields: {
      showFields: ['title', 'location', 'price', 'status', 'bedrooms', 'bathrooms', 'guests'],
    },
    classNames: {
      card: 'flex flex-col border-dashed border-gray-300 hover:border-solid hover:border-primary',
      image: 'w-full aspect-[3/2] rounded-t-lg overflow-hidden',
      content: 'p-4 flex-1',
    },
    sizeConstraints: {
      minHeight: 300,
      aspectRatio: 1.5,
    },
  },

  featured: {
    defaultFeatures: {
      favorites: true,
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
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests', 'amenities'],
    },
    classNames: {
      card: 'flex flex-col bg-gradient-to-br from-primary/5 to-white border-primary/20 shadow-lg',
      image: 'w-full aspect-[5/3] rounded-t-lg overflow-hidden',
      content: 'p-5 flex-1',
    },
    sizeConstraints: {
      minHeight: 340,
      aspectRatio: 1.67,
    },
  },

  search: {
    defaultFeatures: {
      favorites: true,
      quickActions: true,
      selection: false,
      management: false,
      carousel: true,
      badges: true,
      details: true,
      hostInfo: false,
      pricingDetails: true,
      animations: true,
    },
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms', 'guests'],
    },
    classNames: {
      card: 'flex flex-col hover:shadow-md',
      image: 'w-full aspect-[3/2] rounded-t-lg overflow-hidden',
      content: 'p-4 flex-1',
    },
    sizeConstraints: {
      minHeight: 280,
      aspectRatio: 1.5,
    },
  },

  favorites: {
    defaultFeatures: {
      favorites: true,
      quickActions: true,
      selection: false,
      management: false,
      carousel: true,
      badges: false,
      details: true,
      hostInfo: false,
      pricingDetails: true,
      animations: true,
    },
    defaultFields: {
      showFields: ['title', 'location', 'price', 'rating', 'bedrooms', 'bathrooms'],
    },
    classNames: {
      card: 'flex flex-col relative group',
      image: 'w-full aspect-[3/2] rounded-t-lg overflow-hidden',
      content: 'p-4 flex-1',
    },
    sizeConstraints: {
      minHeight: 260,
      aspectRatio: 1.5,
    },
  },
};

/**
 * Get configuration for a specific variant
 */
export function getVariantConfig(variant: PropertyCardVariant): PropertyCardVariantConfig {
  return VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.default;
}

/**
 * Merge user features with variant defaults
 */
export function mergeFeatures(
  variant: PropertyCardVariant,
  userFeatures?: Partial<PropertyCardFeatures>
): PropertyCardFeatures {
  const variantConfig = getVariantConfig(variant);
  return {
    ...variantConfig.defaultFeatures,
    ...userFeatures,
  };
}

/**
 * Merge user field configuration with variant defaults
 */
export function mergeFieldConfig(
  variant: PropertyCardVariant,
  userFields?: PropertyCardFieldConfig
): PropertyCardFieldConfig {
  const variantConfig = getVariantConfig(variant);
  
  if (!userFields) {
    return variantConfig.defaultFields;
  }

  return {
    showFields: userFields.showFields || variantConfig.defaultFields.showFields,
    hideFields: userFields.hideFields || variantConfig.defaultFields.hideFields,
    fieldOrder: userFields.fieldOrder || variantConfig.defaultFields.fieldOrder,
  };
}

/**
 * Get recommended fields for a variant
 */
export function getRecommendedFields(variant: PropertyCardVariant): PropertyCardField[] {
  const config = getVariantConfig(variant);
  return config.defaultFields.showFields || [];
}

/**
 * Utility to create a complete PropertyCard configuration
 */
export function createPropertyCardConfig(
  variant: PropertyCardVariant = 'default',
  overrides?: {
    features?: Partial<PropertyCardFeatures>;
    fields?: PropertyCardFieldConfig;
  }
) {
  return {
    variant,
    features: mergeFeatures(variant, overrides?.features),
    fields: mergeFieldConfig(variant, overrides?.fields),
  };
}