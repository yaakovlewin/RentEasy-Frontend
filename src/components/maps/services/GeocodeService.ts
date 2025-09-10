/**
 * @fileoverview Geocoding Service with Intelligent Caching
 * 
 * Enterprise-grade geocoding service that converts addresses to coordinates
 * with intelligent caching and error handling following established patterns.
 */

import type { GeocodeResult, MapError } from '../types/MapTypes';

/**
 * Cache entry for geocoding results
 */
interface GeocodeCacheEntry {
  result: GeocodeResult;
  timestamp: number;
  address: string;
}

/**
 * Geocoding service with intelligent caching
 */
export class GeocodeService {
  private cache = new Map<string, GeocodeCacheEntry>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private pendingRequests = new Map<string, Promise<GeocodeResult>>();

  /**
   * Geocodes an address to coordinates with caching
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!address?.trim()) {
      throw this.createMapError(
        'Address is required for geocoding',
        'GEOCODING',
        'medium',
        new Error('Empty address provided')
      );
    }

    const cacheKey = this.createCacheKey(address);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // Create new geocoding request
    const geocodePromise = this.performGeocoding(address);
    this.pendingRequests.set(cacheKey, geocodePromise);

    try {
      const result = await geocodePromise;
      
      // Cache successful result
      this.setCacheResult(cacheKey, result, address);
      
      return result;
    } catch (error) {
      throw this.createMapError(
        `Geocoding failed for address: ${address}`,
        'GEOCODING',
        'medium',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Performs the actual geocoding using Google Maps Geocoding API
   */
  private async performGeocoding(address: string): Promise<GeocodeResult> {
    return new Promise((resolve, reject) => {
      if (!window.google?.maps?.Geocoder) {
        reject(new Error('Google Maps Geocoder not available'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const accuracy = this.determineAccuracy(results[0]);
          
          const result: GeocodeResult = {
            coordinates: {
              lat: location.lat(),
              lng: location.lng(),
            },
            formattedAddress: results[0].formatted_address,
            accuracy,
          };
          
          resolve(result);
        } else {
          reject(new Error(`Geocoding failed with status: ${status}`));
        }
      });
    });
  }

  /**
   * Determines the accuracy of geocoding result based on result types
   */
  private determineAccuracy(result: google.maps.GeocoderResult): 'high' | 'medium' | 'low' {
    const types = result.types;
    
    if (types.includes('street_address') || types.includes('premise')) {
      return 'high';
    } else if (types.includes('route') || types.includes('intersection')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Creates a normalized cache key from address
   */
  private createCacheKey(address: string): string {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Gets cached result if valid and not expired
   */
  private getCachedResult(cacheKey: string): GeocodeResult | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.result;
  }

  /**
   * Sets cache result with automatic cleanup
   */
  private setCacheResult(cacheKey: string, result: GeocodeResult, address: string): void {
    // Implement LRU-style cache cleanup if at capacity
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupCache();
    }

    const entry: GeocodeCacheEntry = {
      result,
      timestamp: Date.now(),
      address,
    };

    this.cache.set(cacheKey, entry);
  }

  /**
   * Cleans up expired cache entries and enforces size limits
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => this.cache.delete(key));

    // If still at capacity, remove oldest entries (LRU)
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2); // Remove 20% of entries
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Validates coordinates are within valid ranges
   */
  static validateCoordinates(coordinates: google.maps.LatLngLiteral): boolean {
    const { lat, lng } = coordinates;
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }

  /**
   * Converts string coordinates to numbers with validation
   */
  static parseCoordinates(
    latitude?: string | number, 
    longitude?: string | number
  ): google.maps.LatLngLiteral | null {
    try {
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
      
      if (lat == null || lng == null) {
        return null;
      }

      const coordinates = { lat, lng };
      
      return this.validateCoordinates(coordinates) ? coordinates : null;
    } catch {
      return null;
    }
  }

  /**
   * Calculates distance between two coordinates in kilometers
   */
  static calculateDistance(
    coord1: google.maps.LatLngLiteral,
    coord2: google.maps.LatLngLiteral
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converts degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Creates structured map error following established patterns
   */
  private createMapError(
    message: string,
    category: 'GEOCODING',
    severity: 'medium',
    originalError: Error
  ): MapError {
    return {
      message,
      category,
      severity,
      originalError,
      context: {
        service: 'GeocodeService',
        timestamp: new Date().toISOString(),
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size,
      },
    };
  }

  /**
   * Gets cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    pendingRequests: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Clears all cached results
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Preloads geocoding results for common addresses
   */
  async preloadAddresses(addresses: string[]): Promise<void> {
    const promises = addresses.map(async address => {
      try {
        await this.geocodeAddress(address);
      } catch (error) {
        // Silently ignore preload errors
        console.warn(`Failed to preload address: ${address}`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Cleanup method for destroying service instance
   */
  destroy(): void {
    this.clearCache();
  }
}