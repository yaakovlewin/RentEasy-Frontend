/**
 * SEO Types and Interfaces - RentEasy
 * 
 * Comprehensive TypeScript definitions for all SEO-related configurations,
 * including robots.txt, sitemap, manifest, and metadata structures.
 * 
 * Features:
 * - Type-safe SEO configurations
 * - Environment-specific settings
 * - Validation schemas
 * - Utility type helpers
 * - Extended Next.js metadata types
 */

import { MetadataRoute, Metadata } from 'next';

// ============================================================================
// ROBOTS.TXT TYPES
// ============================================================================

export interface RobotsRule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
}

export interface RobotsConfig {
  rules: RobotsRule[];
  sitemap?: string | string[];
  host?: string;
  environment: 'development' | 'production' | 'staging';
}

export interface RobotsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export type UserAgentType = 
  | 'Googlebot'
  | 'Bingbot' 
  | 'Slurp'
  | 'DuckDuckBot'
  | 'facebookexternalhit'
  | 'Twitterbot'
  | 'LinkedInBot'
  | 'Googlebot-Image'
  | 'Bingbot-Image'
  | 'GPTBot'
  | 'ChatGPT-User'
  | 'ChatGPT-Bot'
  | 'CCBot'
  | 'anthropic-ai'
  | 'AhrefsBot'
  | 'SemrushBot'
  | 'MJ12bot'
  | '*';

// ============================================================================
// SITEMAP TYPES
// ============================================================================

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
  news?: SitemapNews[];
}

export interface SitemapImage {
  url: string;
  caption?: string;
  geoLocation?: string;
  title?: string;
  license?: string;
}

export interface SitemapVideo {
  thumbnailUrl: string;
  title: string;
  description: string;
  contentUrl?: string;
  playerUrl?: string;
  duration?: number;
  expirationDate?: string;
  rating?: number;
  viewCount?: number;
  publicationDate?: string;
  familyFriendly?: boolean;
  restriction?: string;
  platform?: string;
  requiresSubscription?: boolean;
  uploader?: string;
  live?: boolean;
}

export interface SitemapNews {
  publicationName: string;
  publicationLanguage: string;
  title: string;
  publicationDate: string;
  genres?: string;
  keywords?: string;
}

export interface SitemapConfig {
  baseUrl: string;
  maxUrls: number;
  batchSize: number;
  enablePropertyPages: boolean;
  enableLocationPages: boolean;
  enableSearchPages: boolean;
  enableImageSitemap: boolean;
  enableNewsSitemap: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface SitemapStats {
  totalUrls: number;
  staticPages: number;
  propertyPages: number;
  locationPages: number;
  searchPages: number;
  estimatedSizeKB: number;
  generationTime: number;
  lastGenerated: Date;
}

export interface SitemapValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: SitemapStats;
  recommendations: string[];
}

// ============================================================================
// MANIFEST (PWA) TYPES
// ============================================================================

// Fixed manifest types with proper TypeScript syntax
export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
  platform?: string;
}

export interface ManifestShortcut {
  name: string;
  url: string;
  icons?: ManifestIcon[];
  description?: string;
}

export interface ManifestScreenshot {
  src: string;
  sizes: string;
  type: string;
  form_factor?: 'narrow' | 'wide';
  label?: string;
  platform?: string;
}

export interface ManifestConfig {
  name: string;
  shortName: string;
  description: string;
  baseUrl: string;
  themeColor: string;
  backgroundColor: string;
  accentColor: string;
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl' | 'auto';
  scope: string;
  startUrl: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'landscape-primary';
}

export interface PWAInstallabilityCheck {
  installable: boolean;
  criteria: Array<{
    requirement: string;
    met: boolean;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  score: number;
  recommendations: string[];
}

export interface PWAFeatures {
  serviceWorker: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  offlineCapability: boolean;
  installPrompt: boolean;
  shortcuts: boolean;
  shareTarget: boolean;
  protocolHandlers: boolean;
}

// ============================================================================
// METADATA TYPES
// ============================================================================

export interface SEOMetadata extends Metadata {
  structuredData?: StructuredData;
  breadcrumbs?: Breadcrumb[];
  canonical?: string;
  alternates?: AlternateUrls;
  hreflang?: HrefLangEntry[];
}

export interface StructuredData {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: any;
}

export interface Breadcrumb {
  name: string;
  url: string;
  position: number;
}

export interface AlternateUrls {
  canonical?: string;
  languages?: Record<string, string>;
  media?: Record<string, string>;
  types?: Record<string, string>;
}

export interface HrefLangEntry {
  hreflang: string;
  href: string;
}

// Property-specific structured data
export interface PropertyStructuredData extends StructuredData {
  '@type': 'LodgingBusiness' | 'Accommodation' | 'Product';
  name: string;
  description: string;
  image: string | string[];
  address: PostalAddress;
  geo: GeoCoordinates;
  amenityFeature?: PropertyAmenity[];
  occupancy?: QuantitativeValue;
  numberOfRooms?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  offers: Offer;
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface PropertyAmenity {
  '@type': 'LocationFeatureSpecification';
  name: string;
  value: boolean | string | number;
}

export interface QuantitativeValue {
  '@type': 'QuantitativeValue';
  value: number;
  unitText?: string;
}

export interface Offer {
  '@type': 'Offer';
  price: number;
  priceCurrency: string;
  availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock';
  validFrom?: string;
  validThrough?: string;
  priceValidUntil?: string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  bestRating: number;
  worstRating: number;
  ratingCount: number;
  reviewCount: number;
}

export interface Review {
  '@type': 'Review';
  author: Person | Organization;
  datePublished: string;
  reviewBody: string;
  reviewRating: Rating;
}

export interface Person {
  '@type': 'Person';
  name: string;
}

export interface Organization {
  '@type': 'Organization';
  name: string;
}

export interface Rating {
  '@type': 'Rating';
  ratingValue: number;
  bestRating: number;
  worstRating: number;
}

// ============================================================================
// SEO ANALYTICS TYPES
// ============================================================================

export interface SEOMetrics {
  crawlability: CrawlabilityMetrics;
  indexability: IndexabilityMetrics;
  performance: PerformanceMetrics;
  contentQuality: ContentQualityMetrics;
  technicalSEO: TechnicalSEOMetrics;
  userExperience: UserExperienceMetrics;
}

export interface CrawlabilityMetrics {
  robotsTxtValid: boolean;
  sitemapValid: boolean;
  crawlErrors: number;
  blockedResources: number;
  crawlDepth: number;
  internalLinks: number;
  externalLinks: number;
}

export interface IndexabilityMetrics {
  indexedPages: number;
  totalPages: number;
  indexationRate: number;
  duplicateContent: number;
  canonicalIssues: number;
  metaNoindexPages: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  coreWebVitalsScore: number;
}

export interface ContentQualityMetrics {
  averageWordCount: number;
  readabilityScore: number;
  headingStructureScore: number;
  imageOptimizationScore: number;
  keywordDensity: Record<string, number>;
  contentFreshness: number;
}

export interface TechnicalSEOMetrics {
  htmlValidationErrors: number;
  structuredDataErrors: number;
  mobileUsabilityScore: number;
  httpsImplementation: boolean;
  breadcrumbsImplemented: boolean;
  schemaMarkupCoverage: number;
}

export interface UserExperienceMetrics {
  bounceRate: number;
  averageSessionDuration: number;
  pageViews: number;
  conversionRate: number;
  mobileTraffic: number;
  userSatisfactionScore: number;
}

// ============================================================================
// SEARCH ENGINE TYPES
// ============================================================================

export interface SearchEngineConfig {
  google: GoogleConfig;
  bing: BingConfig;
  yandex: YandexConfig;
  baidu: BaiduConfig;
}

export interface GoogleConfig {
  siteVerification?: string;
  analyticsId?: string;
  searchConsoleId?: string;
  tagManagerId?: string;
  adsenseId?: string;
  pagespeedInsightsEnabled: boolean;
}

export interface BingConfig {
  siteVerification?: string;
  webmasterToolsEnabled: boolean;
  adsEnabled: boolean;
}

export interface YandexConfig {
  siteVerification?: string;
  metricaId?: string;
  webmasterEnabled: boolean;
}

export interface BaiduConfig {
  siteVerification?: string;
  analyticsId?: string;
  webmasterEnabled: boolean;
}

// ============================================================================
// LOCALIZATION TYPES
// ============================================================================

export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  enableHrefLang: boolean;
  enableAlternateUrls: boolean;
  rtlSupport: boolean;
  currencySupport: Record<string, string>;
  timezoneSupport: Record<string, string>;
}

export interface LocalizedContent {
  locale: string;
  title: string;
  description: string;
  keywords: string[];
  url: string;
  canonicalUrl?: string;
  alternateUrls?: Record<string, string>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SEOPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SEORecommendation {
  type: 'error' | 'warning' | 'improvement' | 'optimization';
  priority: SEOPriority;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'technical' | 'content' | 'performance' | 'ux' | 'mobile';
  actionItems: string[];
  resources?: string[];
}

export interface SEOAuditResult {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  recommendations: SEORecommendation[];
  metrics: SEOMetrics;
  timestamp: Date;
  url: string;
  version: string;
}

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export interface SEOEnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  baseUrl: string;
  apiUrl: string;
  enableAnalytics: boolean;
  enableConsoleLogging: boolean;
  enablePerformanceMonitoring: boolean;
  debugMode: boolean;
}

// ============================================================================
// EXPORT UNIONS AND UTILITIES
// ============================================================================

export type SitemapEntryType = 'static' | 'dynamic' | 'property' | 'location' | 'search';
export type MetadataType = 'page' | 'article' | 'product' | 'service' | 'organization';
export type StructuredDataType = 'WebSite' | 'Organization' | 'LocalBusiness' | 'Product' | 'Article' | 'BreadcrumbList';

// Helper type for extracting property types
export type PropertyType<T> = T extends Record<string, infer U> ? U : never;

// Helper type for making properties optional
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Helper type for environment-specific configurations
export type EnvironmentSpecific<T> = {
  development?: Partial<T>;
  staging?: Partial<T>;
  production?: Partial<T>;
} & T;

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_SEO_CONFIG: SEOEnvironmentConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  enableAnalytics: process.env.NODE_ENV === 'production',
  enableConsoleLogging: process.env.NODE_ENV !== 'production',
  enablePerformanceMonitoring: true,
  debugMode: process.env.NODE_ENV === 'development',
};

export const DEFAULT_ROBOTS_CONFIG: Partial<RobotsConfig> = {
  environment: process.env.NODE_ENV as 'development' | 'production' | 'staging',
};

export const DEFAULT_SITEMAP_CONFIG: Partial<SitemapConfig> = {
  maxUrls: process.env.NODE_ENV === 'development' ? 1000 : 50000,
  batchSize: process.env.NODE_ENV === 'development' ? 50 : 500,
  enablePropertyPages: true,
  enableLocationPages: true,
  enableSearchPages: process.env.NODE_ENV === 'production',
  enableImageSitemap: false,
  enableNewsSitemap: false,
  cacheEnabled: true,
  cacheTTL: 60 * 60 * 1000, // 1 hour
};

export const DEFAULT_MANIFEST_CONFIG: Partial<ManifestConfig> = {
  display: 'standalone',
  orientation: 'portrait-primary',
  scope: '/',
  startUrl: '/',
  lang: 'en',
  dir: 'ltr',
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidSitemapEntry(entry: any): entry is SitemapEntry {
  return (
    typeof entry === 'object' &&
    typeof entry.url === 'string' &&
    entry.url.length > 0 &&
    (entry.priority === undefined || (typeof entry.priority === 'number' && entry.priority >= 0 && entry.priority <= 1))
  );
}

export function isValidRobotsRule(rule: any): rule is RobotsRule {
  return (
    typeof rule === 'object' &&
    (typeof rule.userAgent === 'string' || Array.isArray(rule.userAgent)) &&
    (rule.crawlDelay === undefined || typeof rule.crawlDelay === 'number')
  );
}

export function isValidStructuredData(data: any): data is StructuredData {
  return (
    typeof data === 'object' &&
    data['@context'] === 'https://schema.org' &&
    typeof data['@type'] === 'string'
  );
}