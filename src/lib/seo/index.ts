/**
 * SEO Library Index - RentEasy
 * 
 * Central export file for all SEO utilities, components, and configurations.
 * Provides a unified API for accessing all SEO functionality across the application.
 */

// Core SEO utilities
export * from './structured-data';
export * from './analytics';
export * from './international';
export * from './performance';

// Re-export types from the types file
export type * from '../types/seo';

// Re-export metadata utilities
export * from '../metadata';

// Convenience re-exports for commonly used functions
export {
  // Structured Data
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebsiteSchema,
  generateAccommodationSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
  validateStructuredData,
  sanitizeStructuredData,
  generateJSONLD,
  
  // Analytics & Monitoring
  CoreWebVitalsMonitor,
  SEOHealthChecker,
  SEOAuditor,
  SearchConsoleIntegration,
  
  // International SEO
  generateHrefLangEntries,
  generateHrefLangTags,
  validateHrefLangEntries,
  parseLocale,
  detectBrowserLocale,
  formatCurrency,
  formatDate,
  formatNumber,
  getGeoTargetingData,
  generateLocalizedUrls,
  extractLocaleFromPath,
  buildInternationalSEOConfig,
  SUPPORTED_LOCALES,
  LOCALE_METADATA,
  
  // Performance
  generateSEOImageConfig,
  generateResponsiveSizes,
  ProgressiveContentLoader,
  createSEOLazyLoader,
  CriticalResourceManager,
  PerformanceBudgetMonitor,
  
  // Metadata
  generatePropertyMetadata,
  generateSearchMetadata,
  generateDashboardMetadata,
  generateAuthMetadata,
  generateDefaultMetadata,
  truncateDescription,
  generateHomepageStructuredData,
  generateSearchStructuredData,
  generatePropertyStructuredData,
} from './structured-data';

// Default configurations
export const DEFAULT_SEO_CONFIG = {
  siteName: 'RentEasy',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com',
  defaultLocale: 'en-US' as const,
  supportedLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'] as const,
  enableStructuredData: true,
  enableHrefLang: true,
  enablePerformanceMonitoring: true,
  enableAnalytics: process.env.NODE_ENV === 'production',
} as const;

// SEO utility functions
export const SEOUtils = {
  // Quick access to common operations
  generatePageMetadata: (title: string, description: string, path?: string) => {
    return {
      title: `${title} | RentEasy`,
      description,
      openGraph: {
        title: `${title} | RentEasy`,
        description,
        url: `${DEFAULT_SEO_CONFIG.siteUrl}${path || ''}`,
        siteName: DEFAULT_SEO_CONFIG.siteName,
      },
      twitter: {
        title: `${title} | RentEasy`,
        description,
        card: 'summary_large_image' as const,
      },
    };
  },
  
  // Generate canonical URL
  generateCanonicalUrl: (path: string) => {
    return `${DEFAULT_SEO_CONFIG.siteUrl}${path}`;
  },
  
  // Validate SEO configuration
  validateSEOConfig: (config: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!config.title) errors.push('Missing title');
    if (!config.description) errors.push('Missing description');
    if (config.title && config.title.length > 60) warnings.push('Title too long (>60 chars)');
    if (config.description && config.description.length > 160) warnings.push('Description too long (>160 chars)');
    
    return { errors, warnings, isValid: errors.length === 0 };
  },
} as const;