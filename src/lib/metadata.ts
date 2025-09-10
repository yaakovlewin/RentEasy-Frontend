/**
 * Enterprise Metadata Generation System
 * 
 * Comprehensive SEO optimization utilities for dynamic metadata generation
 * following best practices for search discoverability and social sharing.
 */

import type { Metadata } from 'next';

// Base application metadata configuration
const APP_CONFIG = {
  name: 'RentEasy',
  description: 'Discover unique vacation rentals around the world with RentEasy. Book your perfect stay with confidence through our staff-facilitated matching service.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://renteasy.com',
  ogImage: '/images/og-default.jpg',
  keywords: [
    'vacation rentals',
    'holiday homes',
    'short-term rentals',
    'property booking',
    'travel accommodation',
    'rental properties',
    'holiday booking',
    'vacation homes'
  ]
} as const;

// Property-related types for metadata generation
interface Property {
  id: string;
  title: string;
  description?: string;
  location: {
    city: string;
    state?: string;
    country: string;
    address?: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
  };
  amenities: string[];
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  images?: Array<{ url: string; alt: string }>;
  rating?: {
    average: number;
    reviewCount: number;
  };
  host?: {
    name: string;
    avatar?: string;
  };
}

interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  propertyType?: string;
  priceMin?: string;
  priceMax?: string;
}

/**
 * Generate metadata for property detail pages
 */
export function generatePropertyMetadata(property: Property): Metadata {
  const { title, description, location, pricing, amenities, images, rating } = property;
  
  const propertyTitle = `${title} - ${location.city}, ${location.country}`;
  const propertyDescription = description || 
    `Stay at ${title} in ${location.city}, ${location.country}. ${pricing.currency}${pricing.basePrice}/night. ` +
    `${amenities.slice(0, 3).join(', ')} and more. Book with confidence on RentEasy.`;

  const propertyUrl = `${APP_CONFIG.url}/property/${property.id}`;
  const ogImage = images?.[0]?.url || APP_CONFIG.ogImage;

  return {
    title: propertyTitle,
    description: propertyDescription,
    keywords: [
      ...APP_CONFIG.keywords,
      location.city,
      location.country,
      property.propertyType,
      ...amenities.slice(0, 5)
    ],
    
    // OpenGraph for social sharing
    openGraph: {
      title: propertyTitle,
      description: propertyDescription,
      url: propertyUrl,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - Vacation rental in ${location.city}`,
        },
        ...(images?.slice(1, 4).map(img => ({
          url: img.url,
          width: 1200,
          height: 630,
          alt: img.alt || `${title} image`,
        })) || [])
      ],
      locale: 'en_US',
      type: 'website',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: propertyTitle,
      description: propertyDescription,
      images: [ogImage],
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: propertyUrl,
    },
  };
}

/**
 * Generate metadata for search pages
 */
export function generateSearchMetadata(searchParams: SearchParams): Metadata {
  const { location, checkIn, checkOut, guests, propertyType } = searchParams;
  
  // Build dynamic title based on search parameters
  let title = 'Vacation Rentals';
  let description = 'Find the perfect vacation rental';
  
  if (location) {
    title = `Vacation Rentals in ${location}`;
    description = `Discover amazing vacation rentals and holiday homes in ${location}`;
  }
  
  if (propertyType) {
    title = `${propertyType} Rentals${location ? ` in ${location}` : ''}`;
    description = `Find ${propertyType.toLowerCase()} vacation rentals${location ? ` in ${location}` : ''}`;
  }
  
  if (guests) {
    const guestText = parseInt(guests) === 1 ? '1 guest' : `${guests} guests`;
    title += ` for ${guestText}`;
    description += ` perfect for ${guestText}`;
  }
  
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn).toLocaleDateString();
    const checkOutDate = new Date(checkOut).toLocaleDateString();
    description += ` from ${checkInDate} to ${checkOutDate}`;
  }
  
  title += ' | RentEasy';
  description += '. Book with confidence on RentEasy.';

  const searchUrl = `${APP_CONFIG.url}/search`;
  
  return {
    title,
    description,
    keywords: [
      ...APP_CONFIG.keywords,
      ...(location ? [location] : []),
      ...(propertyType ? [propertyType] : []),
      'vacation rental search',
      'holiday home search'
    ],
    
    openGraph: {
      title,
      description,
      url: searchUrl,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: APP_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: 'RentEasy - Vacation Rental Search',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [APP_CONFIG.ogImage],
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: searchUrl,
    },
  };
}

/**
 * Generate metadata for user dashboard
 */
export function generateDashboardMetadata(userType: 'guest' | 'host' = 'guest'): Metadata {
  const title = userType === 'host' 
    ? 'Host Dashboard - Manage Your Properties | RentEasy'
    : 'My Dashboard - Bookings & Favorites | RentEasy';
    
  const description = userType === 'host'
    ? 'Manage your vacation rental properties, view bookings, and track earnings on your RentEasy host dashboard.'
    : 'View your bookings, manage favorites, and track your travel plans on your RentEasy dashboard.';

  return {
    title,
    description,
    robots: {
      index: false, // Private user content
      follow: false,
    },
    
    openGraph: {
      title,
      description,
      url: `${APP_CONFIG.url}/dashboard`,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: APP_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: 'RentEasy Dashboard',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/**
 * Generate metadata for authentication pages
 */
export function generateAuthMetadata(type: 'login' | 'register'): Metadata {
  const isLogin = type === 'login';
  
  const title = isLogin 
    ? 'Login to Your Account | RentEasy'
    : 'Create Your RentEasy Account | Sign Up';
    
  const description = isLogin
    ? 'Login to your RentEasy account to manage bookings, save favorites, and access your dashboard.'
    : 'Join RentEasy to book vacation rentals, save favorites, and enjoy personalized travel experiences.';

  return {
    title,
    description,
    keywords: [
      ...APP_CONFIG.keywords,
      isLogin ? 'login' : 'sign up',
      isLogin ? 'account access' : 'create account',
      'user authentication'
    ],
    
    openGraph: {
      title,
      description,
      url: `${APP_CONFIG.url}/auth/${type}`,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: APP_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: `RentEasy ${isLogin ? 'Login' : 'Sign Up'}`,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary',
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: `${APP_CONFIG.url}/auth/${type}`,
    },
  };
}

/**
 * Generate default metadata for pages
 */
export function generateDefaultMetadata(
  title?: string,
  description?: string,
  path?: string
): Metadata {
  const pageTitle = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.name;
  const pageDescription = description || APP_CONFIG.description;
  const pageUrl = path ? `${APP_CONFIG.url}${path}` : APP_CONFIG.url;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: APP_CONFIG.keywords,
    
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: APP_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: APP_CONFIG.name,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [APP_CONFIG.ogImage],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: pageUrl,
    },
  };
}

/**
 * Utility to truncate description text for metadata
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Generate homepage structured data (JSON-LD)
 */
export function generateHomepageStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${APP_CONFIG.url}/#organization`,
        name: APP_CONFIG.name,
        url: APP_CONFIG.url,
        logo: {
          '@type': 'ImageObject',
          url: `${APP_CONFIG.url}/images/logo.png`,
          width: 300,
          height: 100,
        },
        description: APP_CONFIG.description,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-800-RENT-EASY',
          contactType: 'customer service',
          availableLanguage: 'English',
        },
        sameAs: [
          'https://www.facebook.com/renteasy',
          'https://twitter.com/renteasy',
          'https://www.instagram.com/renteasy',
          'https://www.linkedin.com/company/renteasy'
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${APP_CONFIG.url}/#website`,
        url: APP_CONFIG.url,
        name: APP_CONFIG.name,
        description: APP_CONFIG.description,
        publisher: {
          '@id': `${APP_CONFIG.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${APP_CONFIG.url}/search?location={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Service',
        '@id': `${APP_CONFIG.url}/#service`,
        name: 'Vacation Rental Platform',
        description: 'Premium vacation rental booking platform with staff-facilitated matching service',
        provider: {
          '@id': `${APP_CONFIG.url}/#organization`,
        },
        serviceType: 'Vacation Rental Booking',
        areaServed: {
          '@type': 'Place',
          name: 'Worldwide',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Vacation Rental Properties',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Accommodation',
                name: 'Luxury Villas',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Accommodation',
                name: 'City Penthouses',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Accommodation',
                name: 'Beach Houses',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Accommodation',
                name: 'Mountain Cabins',
              },
            },
          ],
        },
      },
    ],
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate search page structured data (JSON-LD)
 */
export function generateSearchStructuredData(searchParams: SearchParams) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    url: `${APP_CONFIG.url}/search`,
    name: `Vacation Rentals${searchParams.location ? ` in ${searchParams.location}` : ''}`,
    description: `Find the perfect vacation rental${searchParams.location ? ` in ${searchParams.location}` : ''}`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Vacation Rental Search Results',
      description: `Search results for vacation rentals${searchParams.location ? ` in ${searchParams.location}` : ''}`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: APP_CONFIG.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Search',
          item: `${APP_CONFIG.url}/search`,
        },
      ],
    },
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate structured data for properties (JSON-LD)
 */
export function generatePropertyStructuredData(property: Property) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: property.title,
    description: property.description,
    url: `${APP_CONFIG.url}/property/${property.id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      addressCountry: property.location.country,
      ...(property.location.address && { streetAddress: property.location.address }),
    },
    priceRange: `${property.pricing.currency}${property.pricing.basePrice}`,
    ...(property.images && {
      image: property.images.map(img => img.url),
    }),
    ...(property.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: property.rating.average,
        reviewCount: property.rating.reviewCount,
      },
    }),
    ...(property.amenities && {
      amenityFeature: property.amenities.map(amenity => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity,
      })),
    }),
    ...(property.bedrooms && { numberOfBedrooms: property.bedrooms }),
    ...(property.bathrooms && { numberOfBathroomsTotal: property.bathrooms }),
    ...(property.maxGuests && { occupancy: property.maxGuests }),
  };

  return JSON.stringify(structuredData);
}

// Export types for use in components
export type { Property, SearchParams };