/**
 * Advanced Schema.org Structured Data System - RentEasy
 * 
 * Comprehensive implementation of Schema.org markup for vacation rentals,
 * following Google's Rich Results guidelines and best practices.
 * 
 * Features:
 * - LocalBusiness schema for RentEasy company
 * - Enhanced Accommodation/LodgingBusiness schemas
 * - Review and AggregateRating schemas
 * - FAQPage and BreadcrumbList schemas
 * - Real estate specific schemas
 * - Multi-language support
 * - Validation utilities
 */

import type {
  StructuredData,
  PropertyStructuredData,
  PostalAddress,
  GeoCoordinates,
  AggregateRating,
  Review,
  Offer,
  PropertyAmenity,
} from '@/lib/types/seo';

// Base configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com';
const COMPANY_NAME = 'RentEasy';
const COMPANY_DESCRIPTION = 'Premium vacation rental platform with staff-facilitated matching service';

// ============================================================================
// ORGANIZATION & WEBSITE SCHEMAS
// ============================================================================

/**
 * Generate comprehensive organization schema for RentEasy
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: COMPANY_NAME,
    alternateName: ['RentEasy Platform', 'RentEasy Vacation Rentals'],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE_URL}/#logo`,
      url: `${BASE_URL}/images/logo.png`,
      contentUrl: `${BASE_URL}/images/logo.png`,
      width: 300,
      height: 100,
      caption: 'RentEasy Logo',
    },
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/og-default.jpg`,
      width: 1200,
      height: 630,
    },
    description: COMPANY_DESCRIPTION,
    slogan: 'Your Perfect Stay, Curated by Experts',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
      streetAddress: '123 Tech Street',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-800-RENT-EASY',
        contactType: 'customer service',
        availableLanguage: ['English', 'Spanish', 'French'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
          validFrom: '2024-01-01',
          validThrough: '2024-12-31',
        },
      },
      {
        '@type': 'ContactPoint',
        email: 'support@renteasy.com',
        contactType: 'customer support',
        availableLanguage: ['English', 'Spanish', 'French'],
      },
      {
        '@type': 'ContactPoint',
        email: 'host@renteasy.com',
        contactType: 'business support',
        availableLanguage: ['English'],
      },
    ],
    sameAs: [
      'https://www.facebook.com/renteasy',
      'https://twitter.com/renteasy',
      'https://www.instagram.com/renteasy',
      'https://www.linkedin.com/company/renteasy',
      'https://www.youtube.com/c/renteasy',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Vacation Rental Properties',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Accommodation',
            name: 'Luxury Villas',
            category: 'Villa',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Accommodation',
            name: 'City Apartments',
            category: 'Apartment',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Accommodation',
            name: 'Beach Houses',
            category: 'House',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Accommodation',
            name: 'Mountain Cabins',
            category: 'Cabin',
          },
        },
      ],
    },
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    knowsAbout: [
      'Vacation Rentals',
      'Holiday Homes',
      'Short-term Rentals',
      'Property Management',
      'Travel Accommodation',
      'Hospitality',
    ],
    employee: [
      {
        '@type': 'Person',
        name: 'Customer Success Team',
        jobTitle: 'Customer Success Specialist',
        worksFor: {
          '@id': `${BASE_URL}/#organization`,
        },
      },
    ],
  };
}

/**
 * Generate LocalBusiness schema for SEO
 */
export function generateLocalBusinessSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: COMPANY_NAME,
    image: `${BASE_URL}/images/office.jpg`,
    telephone: '+1-800-RENT-EASY',
    email: 'info@renteasy.com',
    url: BASE_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Tech Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '16:00',
      },
    ],
    priceRange: '$50-$5000',
    currenciesAccepted: 'USD,EUR,GBP,CAD,AUD',
    paymentAccepted: 'Cash, Credit Card, PayPal, Stripe',
    hasMap: `https://maps.google.com/?q=123+Tech+Street,San+Francisco,CA`,
  };
}

/**
 * Generate website schema with search functionality
 */
export function generateWebsiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: COMPANY_NAME,
    alternateName: 'RentEasy Vacation Rentals',
    description: COMPANY_DESCRIPTION,
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?location={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
    mainEntity: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

interface PropertyData {
  id: string;
  title: string;
  description: string;
  images: Array<{ url: string; alt: string; caption?: string }>;
  location: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  pricing: {
    basePrice: number;
    currency: string;
    priceValidUntil?: string;
  };
  amenities: Array<{ name: string; available: boolean; description?: string }>;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests: number;
  checkIn: string;
  checkOut: string;
  rating?: {
    average: number;
    count: number;
    reviews: Array<{
      author: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  host: {
    name: string;
    avatar?: string;
    joinDate?: string;
    verified?: boolean;
  };
  policies: {
    cancellation: string;
    petPolicy?: string;
    smokingPolicy?: string;
  };
}

/**
 * Generate comprehensive accommodation schema for property pages
 */
export function generateAccommodationSchema(property: PropertyData): StructuredData {
  const address: PostalAddress = {
    '@type': 'PostalAddress',
    addressLocality: property.location.city,
    addressCountry: property.location.country,
    ...(property.location.address && { streetAddress: property.location.address }),
    ...(property.location.state && { addressRegion: property.location.state }),
    ...(property.location.postalCode && { postalCode: property.location.postalCode }),
  };

  const geoCoordinates: GeoCoordinates | undefined = 
    property.location.latitude && property.location.longitude
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.location.latitude,
          longitude: property.location.longitude,
        }
      : undefined;

  const offers: Offer = {
    '@type': 'Offer',
    price: property.pricing.basePrice,
    priceCurrency: property.pricing.currency,
    availability: 'https://schema.org/InStock',
    validFrom: new Date().toISOString(),
    ...(property.pricing.priceValidUntil && { 
      priceValidUntil: property.pricing.priceValidUntil 
    }),
    seller: {
      '@id': `${BASE_URL}/#organization`,
    },
    url: `${BASE_URL}/property/${property.id}`,
    category: property.propertyType,
  };

  const amenityFeatures: PropertyAmenity[] = property.amenities
    .filter(amenity => amenity.available)
    .map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity.name,
      value: true,
      ...(amenity.description && { description: amenity.description }),
    }));

  const aggregateRating: AggregateRating | undefined = property.rating
    ? {
        '@type': 'AggregateRating',
        ratingValue: property.rating.average,
        bestRating: 5,
        worstRating: 1,
        ratingCount: property.rating.count,
        reviewCount: property.rating.count,
      }
    : undefined;

  const reviews: Review[] = property.rating?.reviews.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.date,
    reviewBody: review.comment,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  })) || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${BASE_URL}/property/${property.id}#accommodation`,
    name: property.title,
    description: property.description,
    url: `${BASE_URL}/property/${property.id}`,
    image: property.images.map(img => ({
      '@type': 'ImageObject',
      url: img.url,
      caption: img.caption || img.alt,
      description: img.alt,
    })),
    address,
    ...(geoCoordinates && { geo: geoCoordinates }),
    telephone: '+1-800-RENT-EASY',
    priceRange: `${property.pricing.currency}${property.pricing.basePrice}+`,
    checkinTime: property.checkIn,
    checkoutTime: property.checkOut,
    numberOfRooms: property.bedrooms || 1,
    occupancy: {
      '@type': 'QuantitativeValue',
      value: property.maxGuests,
      unitText: 'person',
    },
    amenityFeature: amenityFeatures,
    petsAllowed: property.policies.petPolicy ? property.policies.petPolicy.includes('allowed') : false,
    smokingAllowed: property.policies.smokingPolicy ? property.policies.smokingPolicy.includes('allowed') : false,
    offers,
    ...(aggregateRating && { aggregateRating }),
    ...(reviews.length > 0 && { review: reviews }),
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
    brand: {
      '@type': 'Brand',
      name: COMPANY_NAME,
    },
    category: property.propertyType,
    additionalType: 'https://schema.org/Accommodation',
    hasMap: geoCoordinates 
      ? `https://maps.google.com/?q=${geoCoordinates.latitude},${geoCoordinates.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(`${property.location.city}, ${property.location.country}`)}`,
  };
}

// ============================================================================
// FAQ SCHEMA
// ============================================================================

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

/**
 * Generate FAQ page schema
 */
export function generateFAQPageSchema(faqs: FAQItem[], pageName?: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: pageName ? `${pageName} - Frequently Asked Questions` : 'Frequently Asked Questions',
    description: 'Common questions and answers about RentEasy vacation rentals',
    mainEntity: faqs.map((faq, index) => ({
      '@type': 'Question',
      '@id': `#faq-${index + 1}`,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
      ...(faq.category && { category: faq.category }),
    })),
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================

interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

/**
 * Generate breadcrumb navigation schema
 */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map(crumb => ({
      '@type': 'ListItem',
      position: crumb.position,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${BASE_URL}${crumb.url}`,
    })),
  };
}

// ============================================================================
// SEARCH RESULTS SCHEMA
// ============================================================================

interface SearchResultsData {
  query: string;
  totalResults: number;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  propertyType?: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Generate search results page schema
 */
export function generateSearchResultsSchema(searchData: SearchResultsData): StructuredData[] {
  const searchResultsPage: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    url: `${BASE_URL}/search`,
    name: `Vacation Rentals${searchData.location ? ` in ${searchData.location}` : ''}`,
    description: `Find vacation rentals${searchData.location ? ` in ${searchData.location}` : ''} on RentEasy`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Search Results',
      description: `${searchData.totalResults} vacation rental${searchData.totalResults === 1 ? '' : 's'} found`,
      numberOfItems: searchData.totalResults,
    },
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema(searchData.breadcrumbs);

  return [searchResultsPage, breadcrumbSchema];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate structured data against basic Schema.org requirements
 */
export function validateStructuredData(data: StructuredData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!data['@context']) {
    errors.push('Missing required @context field');
  } else if (data['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context value');
  }

  if (!data['@type']) {
    errors.push('Missing required @type field');
  }

  // Type-specific validations
  if (data['@type'] === 'Organization') {
    if (!data.name) errors.push('Organization missing required name field');
    if (!data.url) warnings.push('Organization missing recommended url field');
  }

  if (data['@type'] === 'LodgingBusiness' || data['@type'] === 'Accommodation') {
    if (!data.name) errors.push('Accommodation missing required name field');
    if (!data.address) warnings.push('Accommodation missing recommended address field');
    if (!data.image) warnings.push('Accommodation missing recommended image field');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate JSON-LD script tag string
 */
export function generateJSONLD(data: StructuredData | StructuredData[]): string {
  const structuredData = Array.isArray(data) 
    ? { '@graph': data }
    : data;

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Sanitize structured data to remove potentially harmful content
 */
export function sanitizeStructuredData(data: any): any {
  if (typeof data === 'string') {
    // Basic HTML tag removal and script prevention
    return data
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeStructuredData(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeStructuredData(value);
    }
    return sanitized;
  }

  return data;
}

// Export types for external use
export type { PropertyData, FAQItem, BreadcrumbItem, SearchResultsData };