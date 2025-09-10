/**
 * HrefLang Tags Component - RentEasy
 * 
 * Manages hreflang tags for international SEO optimization.
 * Supports dynamic generation based on available locales and current page.
 * 
 * Features:
 * - Automatic hreflang tag generation
 * - x-default support
 * - Validation and error handling
 * - Dynamic locale detection
 * - Custom URL mapping support
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  generateHrefLangEntries,
  validateHrefLangEntries,
  type SupportedLocale,
  type HrefLangEntry 
} from '@/lib/seo/international';

interface HrefLangTagsProps {
  availableLocales?: SupportedLocale[];
  baseUrl?: string;
  customMappings?: Record<string, Record<SupportedLocale, string>>;
  validate?: boolean;
  onValidationError?: (errors: string[], warnings: string[]) => void;
}

/**
 * HrefLang Tags Component for international SEO
 */
export const HrefLangTags: React.FC<HrefLangTagsProps> = ({
  availableLocales = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com',
  customMappings,
  validate = process.env.NODE_ENV === 'development',
  onValidationError,
}) => {
  const pathname = usePathname();
  const [hrefLangEntries, setHrefLangEntries] = useState<HrefLangEntry[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  useEffect(() => {
    // Generate hreflang entries
    let entries: HrefLangEntry[];

    // Check if we have custom mappings for this path
    const customMapping = customMappings?.[pathname];
    if (customMapping) {
      entries = Object.entries(customMapping).map(([locale, url]) => ({
        hreflang: locale as SupportedLocale,
        href: url.startsWith('http') ? url : `${baseUrl}${url}`,
      }));
      
      // Add x-default if not present
      if (!entries.find(entry => entry.hreflang === 'x-default')) {
        const defaultEntry = entries.find(entry => entry.hreflang === 'en-US');
        if (defaultEntry) {
          entries.push({
            hreflang: 'x-default',
            href: defaultEntry.href,
          });
        }
      }
    } else {
      // Generate standard entries
      entries = generateHrefLangEntries(pathname, availableLocales, baseUrl);
    }

    // Validation
    if (validate) {
      const validation = validateHrefLangEntries(entries);
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);

      if (validation.errors.length > 0 || validation.warnings.length > 0) {
        onValidationError?.(validation.errors, validation.warnings);
        
        // Console logging in development
        if (process.env.NODE_ENV === 'development') {
          if (validation.errors.length > 0) {
            console.error('HrefLang Validation Errors:', validation.errors);
          }
          if (validation.warnings.length > 0) {
            console.warn('HrefLang Validation Warnings:', validation.warnings);
          }
        }
      }

      // Don't render if there are critical errors in production
      if (validation.errors.length > 0 && process.env.NODE_ENV === 'production') {
        setHrefLangEntries([]);
        return;
      }
    }

    setHrefLangEntries(entries);
  }, [pathname, availableLocales, baseUrl, customMappings, validate, onValidationError]);

  // Don't render anything if no entries
  if (hrefLangEntries.length === 0) {
    return null;
  }

  return (
    <>
      {hrefLangEntries.map((entry, index) => (
        <link
          key={`hreflang-${entry.hreflang}-${index}`}
          rel="alternate"
          hrefLang={entry.hreflang}
          href={entry.href}
        />
      ))}
      
      {/* Development mode validation display */}
      {process.env.NODE_ENV === 'development' && validate && (
        <div style={{ display: 'none' }} data-testid="hreflang-validation">
          {validationErrors.length > 0 && (
            <div data-validation="errors">
              {validationErrors.join('; ')}
            </div>
          )}
          {validationWarnings.length > 0 && (
            <div data-validation="warnings">
              {validationWarnings.join('; ')}
            </div>
          )}
        </div>
      )}
    </>
  );
};

/**
 * Hook to generate hreflang entries for use in metadata
 */
export const useHrefLangEntries = (
  availableLocales?: SupportedLocale[],
  baseUrl?: string,
  customMappings?: Record<string, Record<SupportedLocale, string>>
): HrefLangEntry[] => {
  const pathname = usePathname();
  const [entries, setEntries] = useState<HrefLangEntry[]>([]);

  useEffect(() => {
    const defaultLocales: SupportedLocale[] = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'];
    const locales = availableLocales || defaultLocales;
    const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com';

    // Check for custom mappings
    const customMapping = customMappings?.[pathname];
    if (customMapping) {
      const customEntries = Object.entries(customMapping).map(([locale, href]) => ({
        hreflang: locale as SupportedLocale,
        href: href.startsWith('http') ? href : `${url}${href}`,
      }));
      
      // Add x-default if not present
      if (!customEntries.find(entry => entry.hreflang === 'x-default')) {
        const defaultEntry = customEntries.find(entry => entry.hreflang === 'en-US');
        if (defaultEntry) {
          customEntries.push({
            hreflang: 'x-default',
            href: defaultEntry.href,
          });
        }
      }
      
      setEntries(customEntries);
    } else {
      setEntries(generateHrefLangEntries(pathname, locales, url));
    }
  }, [pathname, availableLocales, baseUrl, customMappings]);

  return entries;
};

/**
 * Predefined hreflang configurations for common RentEasy pages
 */
export const RENTEASY_HREFLANG_CONFIGS = {
  // Property pages with locale-specific URLs
  property: (propertyId: string, propertySlug: string) => ({
    'en-US': `/property/${propertyId}/${propertySlug}`,
    'en-GB': `/en-gb/property/${propertyId}/${propertySlug}`,
    'es-ES': `/es/propiedad/${propertyId}/${propertySlug}`,
    'fr-FR': `/fr/propriete/${propertyId}/${propertySlug}`,
    'de-DE': `/de/immobilie/${propertyId}/${propertySlug}`,
    'it-IT': `/it/proprieta/${propertyId}/${propertySlug}`,
    'pt-PT': `/pt/propriedade/${propertyId}/${propertySlug}`,
    'nl-NL': `/nl/eigendom/${propertyId}/${propertySlug}`,
  }),

  // Search pages with localized paths
  search: (location?: string) => {
    const baseConfig = {
      'en-US': `/search${location ? `?location=${encodeURIComponent(location)}` : ''}`,
      'en-GB': `/en-gb/search${location ? `?location=${encodeURIComponent(location)}` : ''}`,
      'es-ES': `/es/buscar${location ? `?ubicacion=${encodeURIComponent(location)}` : ''}`,
      'fr-FR': `/fr/recherche${location ? `?lieu=${encodeURIComponent(location)}` : ''}`,
      'de-DE': `/de/suche${location ? `?ort=${encodeURIComponent(location)}` : ''}`,
      'it-IT': `/it/cerca${location ? `?posizione=${encodeURIComponent(location)}` : ''}`,
      'pt-PT': `/pt/pesquisa${location ? `?localizacao=${encodeURIComponent(location)}` : ''}`,
      'nl-NL': `/nl/zoeken${location ? `?locatie=${encodeURIComponent(location)}` : ''}`,
    };
    return baseConfig;
  },

  // Location pages
  location: (countryCode: string, citySlug: string) => ({
    'en-US': `/destinations/${countryCode}/${citySlug}`,
    'en-GB': `/en-gb/destinations/${countryCode}/${citySlug}`,
    'es-ES': `/es/destinos/${countryCode}/${citySlug}`,
    'fr-FR': `/fr/destinations/${countryCode}/${citySlug}`,
    'de-DE': `/de/reiseziele/${countryCode}/${citySlug}`,
    'it-IT': `/it/destinazioni/${countryCode}/${citySlug}`,
    'pt-PT': `/pt/destinos/${countryCode}/${citySlug}`,
    'nl-NL': `/nl/bestemmingen/${countryCode}/${citySlug}`,
  }),

  // Static pages
  about: {
    'en-US': '/about',
    'en-GB': '/en-gb/about',
    'es-ES': '/es/acerca-de',
    'fr-FR': '/fr/a-propos',
    'de-DE': '/de/uber-uns',
    'it-IT': '/it/chi-siamo',
    'pt-PT': '/pt/sobre-nos',
    'nl-NL': '/nl/over-ons',
  },

  contact: {
    'en-US': '/contact',
    'en-GB': '/en-gb/contact',
    'es-ES': '/es/contacto',
    'fr-FR': '/fr/contact',
    'de-DE': '/de/kontakt',
    'it-IT': '/it/contatti',
    'pt-PT': '/pt/contacto',
    'nl-NL': '/nl/contact',
  },

  help: {
    'en-US': '/help',
    'en-GB': '/en-gb/help',
    'es-ES': '/es/ayuda',
    'fr-FR': '/fr/aide',
    'de-DE': '/de/hilfe',
    'it-IT': '/it/aiuto',
    'pt-PT': '/pt/ajuda',
    'nl-NL': '/nl/hulp',
  },
} as const;

export default HrefLangTags;