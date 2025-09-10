/**
 * Homepage Data Layer - Server-Side Data Fetching
 * 
 * Provides server-side data fetching functions for homepage content
 * with caching, error handling, and performance optimizations.
 */

import { api } from '@/lib/api';
import type { Property } from '@/lib/api';

// Types for homepage-specific data structures
export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

export interface PropertyCategory {
  title: string;
  subtitle: string;
  icon: string;
  image: string;
  count: string;
}

export interface FeaturedProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  badge: string;
  isFeatured: boolean;
  discount?: number;
}

export interface Destination {
  name: string;
  country: string;
  properties: number;
  image: string;
  specialty: string;
}

export interface HomepageData {
  heroSlides: HeroSlide[];
  categories: PropertyCategory[];
  featuredProperties: FeaturedProperty[];
  destinations: Destination[];
  stats: {
    totalTravelers: string;
    totalProperties: string;
    fiveStarReviews: string;
    conciergeService: string;
  };
}

/**
 * Static data that doesn't change frequently
 */
const getStaticHomepageData = (): Omit<HomepageData, 'featuredProperties'> => {
  return {
    heroSlides: [
      {
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop',
        title: 'Luxury Villas',
        subtitle: 'Experience ultimate comfort',
      },
      {
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=1080&fit=crop',
        title: 'Ocean Views',
        subtitle: 'Wake up to paradise',
      },
      {
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop',
        title: 'Mountain Retreats',
        subtitle: 'Find your peaceful escape',
      },
    ],

    categories: [
      {
        title: 'Luxury Villas',
        subtitle: '5-star amenities',
        icon: '🏖️',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
        count: '450+ properties',
      },
      {
        title: 'City Penthouses',
        subtitle: 'Urban sophistication',
        icon: '🏙️',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        count: '280+ properties',
      },
      {
        title: 'Mountain Cabins',
        subtitle: "Nature's tranquility",
        icon: '🏔️',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        count: '320+ properties',
      },
      {
        title: 'Beach Houses',
        subtitle: 'Oceanfront escapes',
        icon: '🌊',
        image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
        count: '380+ properties',
      },
    ],

    destinations: [
      {
        name: 'Santorini',
        country: 'Greece',
        properties: 1200,
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
        specialty: 'Luxury Suites',
      },
      {
        name: 'Bali',
        country: 'Indonesia',
        properties: 800,
        image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
        specialty: 'Private Villas',
      },
      {
        name: 'Swiss Alps',
        country: 'Switzerland',
        properties: 450,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        specialty: 'Mountain Chalets',
      },
      {
        name: 'Maldives',
        country: 'Indian Ocean',
        properties: 320,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        specialty: 'Overwater Bungalows',
      },
    ],

    stats: {
      totalTravelers: '2M+',
      totalProperties: '15K+',
      fiveStarReviews: '95%',
      conciergeService: '24/7',
    },
  };
};

/**
 * Mock featured properties data (in production this would come from API)
 */
const getMockFeaturedProperties = (): FeaturedProperty[] => {
  return [
    {
      id: 1,
      title: 'Malibu Dream Villa',
      location: 'Malibu, California',
      price: 850,
      originalPrice: 950,
      rating: 4.9,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
      amenities: ['Ocean View', 'Private Pool', 'Chef Kitchen', 'Wine Cellar'],
      badge: 'Superhost',
      isFeatured: true,
      discount: 11,
    },
    {
      id: 2,
      title: 'Alpine Luxury Chalet',
      location: 'Aspen, Colorado',
      price: 680,
      rating: 5.0,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=400&fit=crop',
      amenities: ['Ski Access', 'Hot Tub', 'Fireplace', 'Mountain View'],
      badge: 'Rare Find',
      isFeatured: true,
    },
    {
      id: 3,
      title: 'Manhattan Penthouse Suite',
      location: 'New York, New York',
      price: 720,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
      amenities: ['City Views', 'Rooftop Terrace', 'Concierge', 'Gym Access'],
      badge: 'Luxury',
      isFeatured: true,
    },
    {
      id: 4,
      title: 'Tuscan Countryside Villa',
      location: 'Tuscany, Italy',
      price: 590,
      rating: 4.9,
      reviews: 94,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop',
      amenities: ['Vineyard Views', 'Pool', 'Chef Kitchen', 'Wine Tasting'],
      badge: 'Unique',
      isFeatured: true,
    },
  ];
};

/**
 * Fetch featured properties from API with error handling and fallback
 */
const fetchFeaturedProperties = async (): Promise<FeaturedProperty[]> => {
  // TODO: Enable this when backend implements /properties/featured endpoint
  // try {
  //   const apiProperties = await api.properties.getFeaturedProperties(4);
  //   
  //   // Transform API properties to homepage format
  //   if (apiProperties && apiProperties.length > 0) {
  //     return apiProperties.map((prop: Property, index: number) => ({
  //       id: parseInt(prop.id),
  //       title: prop.title,
  //       location: prop.location,
  //       price: prop.pricePerNight,
  //       rating: 4.8 + (Math.random() * 0.4), // Mock rating for now
  //       reviews: Math.floor(Math.random() * 200) + 50,
  //       image: prop.images?.[0] || `https://images.unsplash.com/photo-${1566073771259 + index}?w=500&h=400&fit=crop`,
  //       amenities: prop.amenities?.slice(0, 4) || ['Premium Amenity', 'Luxury Feature'],
  //       badge: index === 0 ? 'Superhost' : index === 1 ? 'Rare Find' : index === 2 ? 'Luxury' : 'Unique',
  //       isFeatured: true,
  //       discount: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 5 : undefined,
  //     }));
  //   }
  // } catch (error) {
  //   console.warn('Failed to fetch featured properties from API, using fallback:', error);
  // }

  // Using mock data until backend implements /properties/featured endpoint
  return getMockFeaturedProperties();
};

/**
 * Main function to fetch all homepage data
 * Uses parallel fetching for optimal performance
 */
export const getHomepageData = async (): Promise<HomepageData> => {
  try {
    // Parallel data fetching for optimal performance
    const [staticData, featuredProperties] = await Promise.all([
      Promise.resolve(getStaticHomepageData()),
      fetchFeaturedProperties(),
    ]);

    return {
      ...staticData,
      featuredProperties,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    // Return fallback data to ensure the page always renders
    return {
      ...getStaticHomepageData(),
      featuredProperties: getMockFeaturedProperties(),
    };
  }
};

/**
 * Utility function to get hero slides for meta tags
 */
export const getHeroImages = (): string[] => {
  const { heroSlides } = getStaticHomepageData();
  return heroSlides.map(slide => slide.image);
};

/**
 * Utility function to get category data for structured data
 */
export const getCategoryNames = (): string[] => {
  const { categories } = getStaticHomepageData();
  return categories.map(cat => cat.title);
};