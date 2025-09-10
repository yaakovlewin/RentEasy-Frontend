/**
 * PropertiesClient - Modern properties API client
 * 
 * Clean, type-safe property management with intelligent caching,
 * search optimization, and availability checking.
 */

import { HttpClient, ApiResponse } from '../core/HttpClient';

// Type definitions
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  amenities?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  amenities?: string[];
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  isActive?: boolean;
}

export interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AvailabilityResponse {
  available: boolean;
  conflictingBookings?: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
  }>;
}

class PropertiesClient {
  constructor(private http: HttpClient) {}

  /**
   * Search properties with intelligent caching
   */
  async searchProperties(params: SearchParams = {}): Promise<PaginatedResponse<Property>> {
    // Clean empty parameters
    const cleanParams = this.cleanSearchParams(params);
    
    const response = await this.http.get<PaginatedResponse<Property>>('/properties/search', {
      params: cleanParams,
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes for search results
        tags: ['properties', 'search'],
      },
    });

    return response.data;
  }

  /**
   * Get property by ID with caching
   */
  async getPropertyById(id: string): Promise<Property> {
    const response = await this.http.get<Property>(`/properties/${id}`, {
      cache: {
        ttl: 15 * 60 * 1000, // 15 minutes for individual properties
        tags: ['properties', `property-${id}`],
      },
    });

    return response.data;
  }

  /**
   * Create new property
   */
  async createProperty(propertyData: CreatePropertyRequest): Promise<Property> {
    const response = await this.http.post<Property>('/properties', propertyData);
    return response.data;
  }

  /**
   * Update existing property
   */
  async updateProperty(id: string, propertyData: UpdatePropertyRequest): Promise<Property> {
    const response = await this.http.put<Property>(`/properties/${id}`, propertyData);
    return response.data;
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<{ message: string }> {
    const response = await this.http.delete<{ message: string }>(`/properties/${id}`);
    return response.data;
  }

  /**
   * Get current user's properties
   */
  async getMyProperties(): Promise<Property[]> {
    const response = await this.http.get<Property[]>('/properties/user/properties', {
      cache: {
        ttl: 2 * 60 * 1000, // 2 minutes for user properties
        tags: ['properties', 'my-properties'],
      },
    });

    return response.data;
  }

  /**
   * Check property availability for dates
   */
  async checkAvailability(
    id: string,
    checkIn: string,
    checkOut: string
  ): Promise<AvailabilityResponse> {
    const response = await this.http.get<AvailabilityResponse>(
      `/properties/${id}/availability`,
      {
        params: { checkIn, checkOut },
        cache: {
          ttl: 1 * 60 * 1000, // 1 minute for availability (time-sensitive)
          tags: [`property-${id}`, 'availability'],
        },
      }
    );

    return response.data;
  }

  /**
   * Get featured/recommended properties
   */
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    const response = await this.http.get<Property[]>('/properties/featured', {
      params: { limit },
      cache: {
        ttl: 30 * 60 * 1000, // 30 minutes for featured properties
        tags: ['properties', 'featured'],
      },
    });

    return response.data;
  }

  /**
   * Get similar properties
   */
  async getSimilarProperties(propertyId: string, limit: number = 4): Promise<Property[]> {
    const response = await this.http.get<Property[]>(`/properties/${propertyId}/similar`, {
      params: { limit },
      cache: {
        ttl: 15 * 60 * 1000, // 15 minutes for similar properties
        tags: ['properties', `similar-${propertyId}`],
      },
    });

    return response.data;
  }

  /**
   * Upload property images
   */
  async uploadImages(propertyId: string, images: File[]): Promise<{ imageUrls: string[] }> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    const response = await this.http.post<{ imageUrls: string[] }>(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Delete property image
   */
  async deleteImage(propertyId: string, imageUrl: string): Promise<{ message: string }> {
    const response = await this.http.delete<{ message: string }>(
      `/properties/${propertyId}/images`,
      {
        data: { imageUrl },
      }
    );

    return response.data;
  }

  /**
   * Get properties by location with radius
   */
  async getPropertiesByLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<Property[]> {
    const response = await this.http.get<Property[]>('/properties/nearby', {
      params: { latitude, longitude, radius: radiusKm, limit },
      cache: {
        ttl: 10 * 60 * 1000, // 10 minutes for location-based search
        tags: ['properties', 'location'],
      },
    });

    return response.data;
  }

  /**
   * Get property statistics for owners
   */
  async getPropertyStats(propertyId: string): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    occupancyRate: number;
  }> {
    const response = await this.http.get(`/properties/${propertyId}/stats`, {
      cache: {
        ttl: 60 * 60 * 1000, // 1 hour for stats
        tags: [`property-${propertyId}`, 'stats'],
      },
    });

    return response.data;
  }

  /**
   * Search properties with advanced filters
   */
  async advancedSearch(filters: {
    query?: string;
    location?: string;
    priceRange?: [number, number];
    dateRange?: [string, string];
    guests?: number;
    propertyType?: string[];
    amenities?: string[];
    rating?: number;
    sortBy?: 'price' | 'rating' | 'distance' | 'newest';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Property>> {
    const response = await this.http.post<PaginatedResponse<Property>>(
      '/properties/advanced-search',
      filters,
      {
        cache: {
          ttl: 3 * 60 * 1000, // 3 minutes for advanced search
          tags: ['properties', 'advanced-search'],
        },
      }
    );

    return response.data;
  }

  // Utility methods

  /**
   * Clean search parameters by removing empty values
   */
  private cleanSearchParams(params: SearchParams): Record<string, any> {
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        // Handle array parameters
        if (Array.isArray(value) && value.length > 0) {
          cleanParams[key] = value;
        } else if (!Array.isArray(value)) {
          cleanParams[key] = value;
        }
      }
    });

    return cleanParams;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  /**
   * Calculate property rating from reviews
   */
  calculateAverageRating(reviews: Array<{ rating: number }>): number {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Check if property is available for dates
   */
  isPropertyAvailable(
    property: Property,
    checkIn: Date,
    checkOut: Date,
    existingBookings: Array<{ checkIn: string; checkOut: string }>
  ): boolean {
    const checkInTime = checkIn.getTime();
    const checkOutTime = checkOut.getTime();

    return !existingBookings.some(booking => {
      const bookingCheckIn = new Date(booking.checkIn).getTime();
      const bookingCheckOut = new Date(booking.checkOut).getTime();

      // Check for any overlap
      return checkInTime < bookingCheckOut && checkOutTime > bookingCheckIn;
    });
  }
}

export { PropertiesClient };
export type {
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  SearchParams,
  PaginatedResponse,
  AvailabilityResponse,
};