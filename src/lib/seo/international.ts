/**
 * International SEO System - RentEasy
 * 
 * Comprehensive internationalization and localization support for SEO.
 * Handles hreflang, geo-targeting, currency localization, and multi-language content.
 * 
 * Features:
 * - Hreflang tag generation and management
 * - Geo-targeted content optimization
 * - Currency and locale-specific formatting
 * - Multi-language URL structure
 * - International structured data
 * - Regional search optimization
 * - Cultural content adaptation
 */

import type { 
  LocalizationConfig, 
  LocalizedContent, 
  HrefLangEntry 
} from '@/lib/types/seo';

// ============================================================================
// CONFIGURATION AND CONSTANTS
// ============================================================================

export const SUPPORTED_LOCALES = [
  'en-US', // English (United States)
  'en-GB', // English (United Kingdom)
  'en-CA', // English (Canada)
  'en-AU', // English (Australia)
  'es-ES', // Spanish (Spain)
  'es-MX', // Spanish (Mexico)
  'fr-FR', // French (France)
  'fr-CA', // French (Canada)
  'de-DE', // German (Germany)
  'de-AT', // German (Austria)
  'de-CH', // German (Switzerland)
  'it-IT', // Italian (Italy)
  'pt-PT', // Portuguese (Portugal)
  'pt-BR', // Portuguese (Brazil)
  'nl-NL', // Dutch (Netherlands)
  'nl-BE', // Dutch (Belgium)
  'ja-JP', // Japanese (Japan)
  'ko-KR', // Korean (South Korea)
  'zh-CN', // Chinese (Simplified, China)
  'zh-TW', // Chinese (Traditional, Taiwan)
  'ru-RU', // Russian (Russia)
  'pl-PL', // Polish (Poland)
  'tr-TR', // Turkish (Turkey)
  'ar-SA', // Arabic (Saudi Arabia)
  'he-IL', // Hebrew (Israel)
  'hi-IN', // Hindi (India)
  'th-TH', // Thai (Thailand)
  'vi-VN', // Vietnamese (Vietnam)
  'sv-SE', // Swedish (Sweden)
  'da-DK', // Danish (Denmark)
  'no-NO', // Norwegian (Norway)
  'fi-FI', // Finnish (Finland)
  'cs-CZ', // Czech (Czech Republic)
  'hu-HU', // Hungarian (Hungary)
  'ro-RO', // Romanian (Romania)
  'bg-BG', // Bulgarian (Bulgaria)
  'hr-HR', // Croatian (Croatia)
  'sk-SK', // Slovak (Slovakia)
  'sl-SI', // Slovenian (Slovenia)
  'et-EE', // Estonian (Estonia)
  'lv-LV', // Latvian (Latvia)
  'lt-LT', // Lithuanian (Lithuania)
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_METADATA: Record<SupportedLocale, {
  name: string;
  nativeName: string;
  currency: string;
  currencySymbol: string;
  rtl: boolean;
  region: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}> = {
  'en-US': {
    name: 'English (United States)',
    nativeName: 'English',
    currency: 'USD',
    currencySymbol: '$',
    rtl: false,
    region: 'Americas',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
  },
  'en-GB': {
    name: 'English (United Kingdom)',
    nativeName: 'English',
    currency: 'GBP',
    currencySymbol: '£',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-GB',
  },
  'en-CA': {
    name: 'English (Canada)',
    nativeName: 'English',
    currency: 'CAD',
    currencySymbol: 'C$',
    rtl: false,
    region: 'Americas',
    timezone: 'America/Toronto',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-CA',
  },
  'en-AU': {
    name: 'English (Australia)',
    nativeName: 'English',
    currency: 'AUD',
    currencySymbol: 'A$',
    rtl: false,
    region: 'Oceania',
    timezone: 'Australia/Sydney',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-AU',
  },
  'es-ES': {
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'es-ES',
  },
  'es-MX': {
    name: 'Spanish (Mexico)',
    nativeName: 'Español',
    currency: 'MXN',
    currencySymbol: '$',
    rtl: false,
    region: 'Americas',
    timezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'es-MX',
  },
  'fr-FR': {
    name: 'French (France)',
    nativeName: 'Français',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR',
  },
  'fr-CA': {
    name: 'French (Canada)',
    nativeName: 'Français',
    currency: 'CAD',
    currencySymbol: 'C$',
    rtl: false,
    region: 'Americas',
    timezone: 'America/Toronto',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-CA',
  },
  'de-DE': {
    name: 'German (Germany)',
    nativeName: 'Deutsch',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-DE',
  },
  'de-AT': {
    name: 'German (Austria)',
    nativeName: 'Deutsch',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Vienna',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-AT',
  },
  'de-CH': {
    name: 'German (Switzerland)',
    nativeName: 'Deutsch',
    currency: 'CHF',
    currencySymbol: 'CHF',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Zurich',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-CH',
  },
  'it-IT': {
    name: 'Italian (Italy)',
    nativeName: 'Italiano',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Rome',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'it-IT',
  },
  'pt-PT': {
    name: 'Portuguese (Portugal)',
    nativeName: 'Português',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Lisbon',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-PT',
  },
  'pt-BR': {
    name: 'Portuguese (Brazil)',
    nativeName: 'Português',
    currency: 'BRL',
    currencySymbol: 'R$',
    rtl: false,
    region: 'Americas',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-BR',
  },
  'nl-NL': {
    name: 'Dutch (Netherlands)',
    nativeName: 'Nederlands',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Amsterdam',
    dateFormat: 'DD-MM-YYYY',
    numberFormat: 'nl-NL',
  },
  'nl-BE': {
    name: 'Dutch (Belgium)',
    nativeName: 'Nederlands',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Brussels',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'nl-BE',
  },
  'ja-JP': {
    name: 'Japanese (Japan)',
    nativeName: '日本語',
    currency: 'JPY',
    currencySymbol: '¥',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Tokyo',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'ja-JP',
  },
  'ko-KR': {
    name: 'Korean (South Korea)',
    nativeName: '한국어',
    currency: 'KRW',
    currencySymbol: '₩',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY.MM.DD',
    numberFormat: 'ko-KR',
  },
  'zh-CN': {
    name: 'Chinese (Simplified, China)',
    nativeName: '简体中文',
    currency: 'CNY',
    currencySymbol: '¥',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'zh-CN',
  },
  'zh-TW': {
    name: 'Chinese (Traditional, Taiwan)',
    nativeName: '繁體中文',
    currency: 'TWD',
    currencySymbol: 'NT$',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Taipei',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'zh-TW',
  },
  'ru-RU': {
    name: 'Russian (Russia)',
    nativeName: 'Русский',
    currency: 'RUB',
    currencySymbol: '₽',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Moscow',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'ru-RU',
  },
  'pl-PL': {
    name: 'Polish (Poland)',
    nativeName: 'Polski',
    currency: 'PLN',
    currencySymbol: 'zł',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Warsaw',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'pl-PL',
  },
  'tr-TR': {
    name: 'Turkish (Turkey)',
    nativeName: 'Türkçe',
    currency: 'TRY',
    currencySymbol: '₺',
    rtl: false,
    region: 'Asia',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'tr-TR',
  },
  'ar-SA': {
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
    currency: 'SAR',
    currencySymbol: '﷼',
    rtl: true,
    region: 'Middle East',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ar-SA',
  },
  'he-IL': {
    name: 'Hebrew (Israel)',
    nativeName: 'עברית',
    currency: 'ILS',
    currencySymbol: '₪',
    rtl: true,
    region: 'Middle East',
    timezone: 'Asia/Jerusalem',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'he-IL',
  },
  'hi-IN': {
    name: 'Hindi (India)',
    nativeName: 'हिन्दी',
    currency: 'INR',
    currencySymbol: '₹',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'hi-IN',
  },
  'th-TH': {
    name: 'Thai (Thailand)',
    nativeName: 'ไทย',
    currency: 'THB',
    currencySymbol: '฿',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Bangkok',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'th-TH',
  },
  'vi-VN': {
    name: 'Vietnamese (Vietnam)',
    nativeName: 'Tiếng Việt',
    currency: 'VND',
    currencySymbol: '₫',
    rtl: false,
    region: 'Asia',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'vi-VN',
  },
  'sv-SE': {
    name: 'Swedish (Sweden)',
    nativeName: 'Svenska',
    currency: 'SEK',
    currencySymbol: 'kr',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Stockholm',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'sv-SE',
  },
  'da-DK': {
    name: 'Danish (Denmark)',
    nativeName: 'Dansk',
    currency: 'DKK',
    currencySymbol: 'kr',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Copenhagen',
    dateFormat: 'DD-MM-YYYY',
    numberFormat: 'da-DK',
  },
  'no-NO': {
    name: 'Norwegian (Norway)',
    nativeName: 'Norsk',
    currency: 'NOK',
    currencySymbol: 'kr',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Oslo',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'no-NO',
  },
  'fi-FI': {
    name: 'Finnish (Finland)',
    nativeName: 'Suomi',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Helsinki',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'fi-FI',
  },
  'cs-CZ': {
    name: 'Czech (Czech Republic)',
    nativeName: 'Čeština',
    currency: 'CZK',
    currencySymbol: 'Kč',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Prague',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'cs-CZ',
  },
  'hu-HU': {
    name: 'Hungarian (Hungary)',
    nativeName: 'Magyar',
    currency: 'HUF',
    currencySymbol: 'Ft',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Budapest',
    dateFormat: 'YYYY.MM.DD',
    numberFormat: 'hu-HU',
  },
  'ro-RO': {
    name: 'Romanian (Romania)',
    nativeName: 'Română',
    currency: 'RON',
    currencySymbol: 'lei',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Bucharest',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'ro-RO',
  },
  'bg-BG': {
    name: 'Bulgarian (Bulgaria)',
    nativeName: 'Български',
    currency: 'BGN',
    currencySymbol: 'лв',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Sofia',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'bg-BG',
  },
  'hr-HR': {
    name: 'Croatian (Croatia)',
    nativeName: 'Hrvatski',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Zagreb',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'hr-HR',
  },
  'sk-SK': {
    name: 'Slovak (Slovakia)',
    nativeName: 'Slovenčina',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Bratislava',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'sk-SK',
  },
  'sl-SI': {
    name: 'Slovenian (Slovenia)',
    nativeName: 'Slovenščina',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Ljubljana',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'sl-SI',
  },
  'et-EE': {
    name: 'Estonian (Estonia)',
    nativeName: 'Eesti',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Tallinn',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'et-EE',
  },
  'lv-LV': {
    name: 'Latvian (Latvia)',
    nativeName: 'Latviešu',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Riga',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'lv-LV',
  },
  'lt-LT': {
    name: 'Lithuanian (Lithuania)',
    nativeName: 'Lietuvių',
    currency: 'EUR',
    currencySymbol: '€',
    rtl: false,
    region: 'Europe',
    timezone: 'Europe/Vilnius',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'lt-LT',
  },
};

// ============================================================================
// HREFLANG MANAGEMENT
// ============================================================================

/**
 * Generate hreflang entries for a given page
 */
export function generateHrefLangEntries(
  currentPath: string,
  availableLocales: SupportedLocale[],
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com'
): HrefLangEntry[] {
  const entries: HrefLangEntry[] = [];

  // Add entries for all available locales
  availableLocales.forEach(locale => {
    const localizedPath = locale === 'en-US' 
      ? currentPath 
      : `/${locale}${currentPath === '/' ? '' : currentPath}`;

    entries.push({
      hreflang: locale,
      href: `${baseUrl}${localizedPath}`,
    });
  });

  // Add x-default for the default locale (usually en-US)
  entries.push({
    hreflang: 'x-default',
    href: `${baseUrl}${currentPath}`,
  });

  return entries;
}

/**
 * Generate hreflang HTML tags
 */
export function generateHrefLangTags(entries: HrefLangEntry[]): string {
  return entries
    .map(entry => `<link rel="alternate" hreflang="${entry.hreflang}" href="${entry.href}" />`)
    .join('\n');
}

/**
 * Validate hreflang entries
 */
export function validateHrefLangEntries(entries: HrefLangEntry[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenLangs = new Set<string>();

  entries.forEach((entry, index) => {
    // Check for duplicates
    if (seenLangs.has(entry.hreflang)) {
      errors.push(`Duplicate hreflang "${entry.hreflang}" at index ${index}`);
    } else {
      seenLangs.add(entry.hreflang);
    }

    // Validate hreflang format
    const hreflangRegex = /^(x-default|[a-z]{2}(-[A-Z]{2})?(-[a-z]+)*)$/;
    if (!hreflangRegex.test(entry.hreflang)) {
      errors.push(`Invalid hreflang format "${entry.hreflang}" at index ${index}`);
    }

    // Validate URL format
    try {
      new URL(entry.href);
    } catch {
      errors.push(`Invalid URL "${entry.href}" at index ${index}`);
    }
  });

  // Check for x-default
  if (!seenLangs.has('x-default')) {
    warnings.push('Missing x-default hreflang entry');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// LOCALE UTILITIES
// ============================================================================

/**
 * Parse locale from various formats
 */
export function parseLocale(locale: string): SupportedLocale | null {
  // Normalize locale format
  const normalized = locale
    .replace('_', '-')
    .toLowerCase()
    .replace(/^([a-z]{2})-([a-z]{2})$/, (_, lang, country) => `${lang}-${country.toUpperCase()}`);

  return SUPPORTED_LOCALES.find(supported => 
    supported.toLowerCase() === normalized
  ) || null;
}

/**
 * Get locale from browser language preferences
 */
export function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en-US';

  const browserLocales = navigator.languages || [navigator.language];
  
  for (const browserLocale of browserLocales) {
    const parsed = parseLocale(browserLocale);
    if (parsed) return parsed;
    
    // Try language-only fallback
    const languageOnly = browserLocale.split('-')[0];
    const fallback = SUPPORTED_LOCALES.find(locale => 
      locale.split('-')[0] === languageOnly
    );
    if (fallback) return fallback;
  }

  return 'en-US';
}

/**
 * Format currency for locale
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const localeMetadata = LOCALE_METADATA[locale];
  
  return new Intl.NumberFormat(localeMetadata.numberFormat, {
    style: 'currency',
    currency: localeMetadata.currency,
    ...options,
  }).format(amount);
}

/**
 * Format date for locale
 */
export function formatDate(
  date: Date,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const localeMetadata = LOCALE_METADATA[locale];
  
  return new Intl.DateTimeFormat(localeMetadata.numberFormat, {
    timeZone: localeMetadata.timezone,
    ...options,
  }).format(date);
}

/**
 * Format number for locale
 */
export function formatNumber(
  number: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const localeMetadata = LOCALE_METADATA[locale];
  
  return new Intl.NumberFormat(localeMetadata.numberFormat, options).format(number);
}

// ============================================================================
// GEO-TARGETING
// ============================================================================

interface GeoTargetingData {
  country: string;
  region?: string;
  city?: string;
  currency: string;
  suggestedLocale: SupportedLocale;
  timeZone: string;
}

/**
 * Get geo-targeting data based on IP (placeholder for actual implementation)
 */
export async function getGeoTargetingData(): Promise<GeoTargetingData | null> {
  // This would typically integrate with a geo-location service
  // For now, we'll detect from browser locale as fallback
  
  if (typeof window === 'undefined') return null;

  try {
    // Placeholder for actual geo-location API call
    // const response = await fetch('/api/geo-location');
    // const data = await response.json();
    
    // Fallback to browser detection
    const suggestedLocale = detectBrowserLocale();
    const localeMetadata = LOCALE_METADATA[suggestedLocale];
    
    return {
      country: suggestedLocale.split('-')[1] || 'US',
      currency: localeMetadata.currency,
      suggestedLocale,
      timeZone: localeMetadata.timezone,
    };
  } catch (error) {
    console.warn('Failed to get geo-targeting data:', error);
    return null;
  }
}

/**
 * Generate geo-targeted structured data
 */
export function generateGeoTargetedStructuredData(
  baseData: any,
  geoData: GeoTargetingData
): any {
  return {
    ...baseData,
    areaServed: {
      '@type': 'Country',
      name: geoData.country,
    },
    ...(baseData.offers && {
      offers: {
        ...baseData.offers,
        priceCurrency: geoData.currency,
        availableAtOrFrom: {
          '@type': 'Place',
          addressCountry: geoData.country,
        },
      },
    }),
  };
}

// ============================================================================
// URL STRUCTURE MANAGEMENT
// ============================================================================

/**
 * Generate localized URL patterns
 */
export function generateLocalizedUrls(
  basePath: string,
  availableLocales: SupportedLocale[],
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com'
): Record<SupportedLocale, string> {
  const urls: Record<string, string> = {};

  availableLocales.forEach(locale => {
    if (locale === 'en-US') {
      // Default locale doesn't have prefix
      urls[locale] = `${baseUrl}${basePath}`;
    } else {
      // Other locales have locale prefix
      urls[locale] = `${baseUrl}/${locale}${basePath}`;
    }
  });

  return urls as Record<SupportedLocale, string>;
}

/**
 * Extract locale from pathname
 */
export function extractLocaleFromPath(pathname: string): {
  locale: SupportedLocale;
  pathWithoutLocale: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  const parsedLocale = parseLocale(firstSegment || '');
  
  if (parsedLocale && parsedLocale !== 'en-US') {
    return {
      locale: parsedLocale,
      pathWithoutLocale: '/' + segments.slice(1).join('/'),
    };
  }

  return {
    locale: 'en-US',
    pathWithoutLocale: pathname,
  };
}

// ============================================================================
// CONTENT ADAPTATION
// ============================================================================

/**
 * Adapt content for cultural preferences
 */
export function adaptContentForCulture(
  content: any,
  locale: SupportedLocale
): any {
  const localeMetadata = LOCALE_METADATA[locale];

  // Adapt numerical formats
  if (typeof content === 'object' && content !== null) {
    const adapted = { ...content };

    // Currency formatting
    if ('price' in adapted && typeof adapted.price === 'number') {
      adapted.formattedPrice = formatCurrency(adapted.price, locale);
    }

    // Date formatting
    if ('date' in adapted && adapted.date instanceof Date) {
      adapted.formattedDate = formatDate(adapted.date, locale);
    }

    // RTL text direction
    adapted.textDirection = localeMetadata.rtl ? 'rtl' : 'ltr';
    adapted.locale = locale;
    adapted.region = localeMetadata.region;

    return adapted;
  }

  return content;
}

/**
 * Generate region-specific keywords
 */
export function generateRegionalKeywords(
  baseKeywords: string[],
  locale: SupportedLocale
): string[] {
  const localeMetadata = LOCALE_METADATA[locale];
  const country = locale.split('-')[1];
  const language = locale.split('-')[0];

  const regionalKeywords = [
    ...baseKeywords,
    `vacation rentals ${country}`,
    `holiday homes ${country}`,
    `${localeMetadata.region} vacation rentals`,
  ];

  // Add language-specific variations if not English
  if (language !== 'en') {
    regionalKeywords.push(
      `${localeMetadata.nativeName} vacation rentals`,
      `holiday rentals ${localeMetadata.nativeName}`
    );
  }

  return regionalKeywords;
}

// ============================================================================
// CONFIGURATION BUILDER
// ============================================================================

/**
 * Build international SEO configuration
 */
export function buildInternationalSEOConfig(
  enabledLocales: SupportedLocale[],
  defaultLocale: SupportedLocale = 'en-US'
): LocalizationConfig {
  return {
    defaultLocale,
    supportedLocales: enabledLocales,
    enableHrefLang: true,
    enableAlternateUrls: true,
    rtlSupport: enabledLocales.some(locale => LOCALE_METADATA[locale].rtl),
    currencySupport: enabledLocales.reduce((acc, locale) => {
      const metadata = LOCALE_METADATA[locale];
      acc[locale] = metadata.currency;
      return acc;
    }, {} as Record<string, string>),
    timezoneSupport: enabledLocales.reduce((acc, locale) => {
      const metadata = LOCALE_METADATA[locale];
      acc[locale] = metadata.timezone;
      return acc;
    }, {} as Record<string, string>),
  };
}

// Export types and constants
export type { GeoTargetingData };
export { 
  LOCALE_METADATA,
  type SupportedLocale,
};