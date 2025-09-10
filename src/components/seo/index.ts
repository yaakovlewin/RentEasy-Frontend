/**
 * SEO Components Index - RentEasy
 * 
 * Central export file for all SEO components.
 * Provides easy imports for SEO-related React components.
 */

// Core SEO Components
export { default as StructuredDataComponent, OrganizationSchema, WebsiteSchema, LocalBusinessSchema, PropertySchema } from './StructuredData';
export { default as Breadcrumbs, useBreadcrumbs, RENTEASY_BREADCRUMB_CONFIGS } from './Breadcrumbs';
export { default as SocialShareOptimizer, useSocialShareData, injectSocialMetadata } from './SocialShareOptimizer';
export { default as RichSnippets, PropertyRichSnippet, ReviewRichSnippet, FAQRichSnippet, OfferRichSnippet } from './RichSnippets';
export { default as HrefLangTags, useHrefLangEntries, RENTEASY_HREFLANG_CONFIGS } from './HrefLangTags';
export { default as SEOOptimizedImage, useImagePerformance } from './SEOOptimizedImage';

// Component type exports for external use
export type { 
  SocialShareData,
  SharePlatform 
} from './SocialShareOptimizer';

export type {
  BreadcrumbItem,
  PropertyData,
  FAQItem,
  SearchResultsData
} from '../lib/seo/structured-data';

export type {
  SupportedLocale,
  HrefLangEntry,
  GeoTargetingData
} from '../lib/seo/international';

// Convenience component collections
export const SEOComponents = {
  StructuredData: StructuredDataComponent,
  Breadcrumbs,
  SocialShare: SocialShareOptimizer,
  RichSnippets,
  HrefLang: HrefLangTags,
  OptimizedImage: SEOOptimizedImage,
} as const;

// Pre-configured component variants
export const SEOPresets = {
  // Property page SEO bundle
  PropertyPageSEO: {
    components: [
      'StructuredData',
      'Breadcrumbs', 
      'SocialShare',
      'RichSnippets',
      'HrefLang'
    ],
    config: {
      enableStructuredData: true,
      enableSocialSharing: true,
      enableBreadcrumbs: true,
      enableHrefLang: true,
    }
  },
  
  // Search page SEO bundle  
  SearchPageSEO: {
    components: [
      'StructuredData',
      'Breadcrumbs',
      'HrefLang'
    ],
    config: {
      enableStructuredData: true,
      enableBreadcrumbs: true,
      enableHrefLang: true,
    }
  },
  
  // Static page SEO bundle
  StaticPageSEO: {
    components: [
      'StructuredData',
      'Breadcrumbs',
      'SocialShare',
      'HrefLang'
    ],
    config: {
      enableStructuredData: true,
      enableSocialSharing: true,
      enableBreadcrumbs: true,
      enableHrefLang: true,
    }
  },
} as const;