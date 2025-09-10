/**
 * Caching utilities for request deduplication and performance optimization
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

type PendingRequest<T> = Promise<T>;

/**
 * Request cache for preventing duplicate API calls and caching responses
 * Implements a singleton pattern with TTL-based expiration
 */
export class RequestCache {
  private static instance: RequestCache | null = null;
  private cache = new Map<string, CacheEntry<any>>();
  private pending = new Map<string, PendingRequest<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start cleanup interval in browser environment only
    if (typeof window !== 'undefined') {
      this.startCleanupInterval();
    }
  }

  /**
   * Gets the singleton instance of RequestCache
   * @returns RequestCache instance
   */
  public static getInstance(): RequestCache {
    if (!RequestCache.instance) {
      RequestCache.instance = new RequestCache();
    }
    return RequestCache.instance;
  }

  /**
   * Gets or creates a cached request
   * @param key - Unique key for the request
   * @param fetcher - Function that returns a promise with the data
   * @param options - Cache options
   * @returns Cached or fresh data
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      force?: boolean;
      skipCache?: boolean;
    } = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, force = false, skipCache = false } = options;

    // Skip cache entirely if requested
    if (skipCache) {
      return fetcher();
    }

    // Force refresh if requested
    if (force) {
      this.invalidate(key);
    }

    // Check for valid cached entry
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }

    // Check for pending request
    const pending = this.pending.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Create new request
    const request = this.createRequest<T>(key, fetcher, ttl);
    return request;
  }

  /**
   * Creates and caches a new request
   * @param key - Cache key
   * @param fetcher - Data fetcher function
   * @param ttl - Time to live in milliseconds
   * @returns Promise with the data
   */
  private async createRequest<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    const request = fetcher()
      .then(data => {
        // Cache successful result
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
        });
        this.pending.delete(key);
        return data;
      })
      .catch(error => {
        // Remove from pending on error
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, request);
    return request;
  }

  /**
   * Invalidates a specific cache entry
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pending.delete(key);
  }

  /**
   * Invalidates cache entries matching a pattern
   * @param pattern - Regular expression or string pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }

    for (const key of this.pending.keys()) {
      if (regex.test(key)) {
        this.pending.delete(key);
      }
    }
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }

  /**
   * Gets the current cache size
   * @returns Object with cache statistics
   */
  getStats(): {
    cacheSize: number;
    pendingSize: number;
    entries: Array<{ key: string; expiresAt: number }>;
  } {
    return {
      cacheSize: this.cache.size,
      pendingSize: this.pending.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresAt: entry.expiresAt,
      })),
    };
  }

  /**
   * Removes expired entries from the cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Starts the automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  /**
   * Stops the automatic cleanup interval
   */
  public stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Preloads data into the cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live
   */
  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Checks if a key exists in the cache (valid or expired)
   * @param key - Cache key
   * @returns True if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key) || this.pending.has(key);
  }

  /**
   * Checks if a key has valid (non-expired) data
   * @param key - Cache key
   * @returns True if valid data exists
   */
  hasValid(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && Date.now() < entry.expiresAt;
  }
}

// Export singleton instance
export const requestCache = RequestCache.getInstance();

// ========================
// Cache Key Generators
// ========================

/**
 * Generates a cache key for API endpoints
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @returns Cache key
 */
export function generateApiCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return `api:${endpoint}`;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `api:${endpoint}:${sortedParams}`;
}

/**
 * Generates a cache key for search queries
 * @param searchParams - Search parameters
 * @returns Cache key
 */
export function generateSearchCacheKey(searchParams: Record<string, any>): string {
  const { location, checkIn, checkOut, guests, ...filters } = searchParams;

  const parts = [
    'search',
    location || 'any',
    checkIn || 'any',
    checkOut || 'any',
    guests ? `g${guests.adults}-${guests.children}-${guests.infants}` : 'any',
  ];

  if (Object.keys(filters).length > 0) {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join(',');
    parts.push(filterStr);
  }

  return parts.join(':');
}

// ========================
// Memory Cache for UI State
// ========================

/**
 * Simple memory cache for UI state that doesn't need persistence
 */
export class MemoryCache<T> {
  private data = new Map<string, T>();

  set(key: string, value: T): void {
    this.data.set(key, value);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  get size(): number {
    return this.data.size;
  }
}
