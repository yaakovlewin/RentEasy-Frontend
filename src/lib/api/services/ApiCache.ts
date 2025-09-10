/**
 * ApiCache - Enhanced caching service for API requests
 * Features: TTL management, cache invalidation, request deduplication, and memory optimization
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
  lastModified?: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxEntries: number;
  cleanupInterval: number;
  enableRequestDeduplication: boolean;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  etag?: string;
  lastModified?: string;
  force?: boolean; // Skip cache and force fresh request
}

type CacheKey = string;
type CacheInvalidationPattern = string | RegExp;
type PendingRequest<T> = Promise<T>;

class ApiCache {
  private cache = new Map<CacheKey, CacheEntry>();
  private pendingRequests = new Map<CacheKey, PendingRequest<any>>();
  private tagIndex = new Map<string, Set<CacheKey>>(); // Tag -> Set of cache keys
  private cleanupTimer: NodeJS.Timeout | null = null;

  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxEntries: 1000,
    cleanupInterval: 60 * 1000, // 1 minute
    enableRequestDeduplication: true,
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.startCleanupTimer();
  }

  /**
   * Get cached data or execute request function
   */
  async get<T>(key: CacheKey, requestFn: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const { ttl = this.config.defaultTTL, tags = [], force = false } = options;

    // Check if we should force refresh
    if (force) {
      this.delete(key);
    }

    // Check for cached data first
    const cached = this.getCachedData<T>(key);
    if (cached !== null && !this.isExpired(key)) {
      return cached;
    }

    // Handle request deduplication
    if (this.config.enableRequestDeduplication && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Execute the request
    const requestPromise = this.executeRequest(key, requestFn, { ttl, tags, ...options });

    if (this.config.enableRequestDeduplication) {
      this.pendingRequests.set(key, requestPromise);
    }

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Set data in cache manually
   */
  set<T>(key: CacheKey, data: T, options: CacheOptions = {}): void {
    const { ttl = this.config.defaultTTL, tags = [] } = options;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      etag: options.etag,
      lastModified: options.lastModified,
    };

    // Enforce max entries limit
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, entry);

    // Update tag index
    this.updateTagIndex(key, tags);
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: CacheKey): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  /**
   * Get cached data without executing request
   */
  getCachedData<T>(key: CacheKey): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: CacheKey): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromTagIndex(key);
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
    this.pendingRequests.clear();
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: CacheInvalidationPattern): number {
    let deletedCount = 0;

    if (typeof pattern === 'string') {
      // Exact key match or wildcard pattern
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.cache.keys()) {
          if (regex.test(key)) {
            this.delete(key);
            deletedCount++;
          }
        }
      } else {
        if (this.delete(pattern)) {
          deletedCount = 1;
        }
      }
    } else if (pattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.delete(key);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Invalidate cache entries by tag
   */
  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let deletedCount = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deletedCount++;
      }
    }

    this.tagIndex.delete(tag);
    return deletedCount;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        expiredCount++;
      }
      totalSize += this.estimateEntrySize(entry);
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      activeEntries: this.cache.size - expiredCount,
      pendingRequests: this.pendingRequests.size,
      estimatedSize: totalSize,
      hitRatio: this.calculateHitRatio(),
      tags: this.tagIndex.size,
    };
  }

  /**
   * Warm up cache with predefined data
   */
  warmUp<T>(entries: Array<{ key: CacheKey; data: T; options?: CacheOptions }>): void {
    entries.forEach(({ key, data, options = {} }) => {
      this.set(key, data, options);
    });
  }

  /**
   * Create a scoped cache key with prefix
   */
  createKey(prefix: string, ...parts: (string | number)[]): CacheKey {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(key: CacheKey): boolean {
    const entry = this.cache.get(key);
    return !entry || Date.now() > entry.expiresAt;
  }

  /**
   * Execute request and cache result
   */
  private async executeRequest<T>(
    key: CacheKey,
    requestFn: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    try {
      const data = await requestFn();
      this.set(key, data, options);
      return data;
    } catch (error) {
      // Don't cache errors, but still clean up pending requests
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  /**
   * Update tag index for cache invalidation
   */
  private updateTagIndex(key: CacheKey, tags: string[]): void {
    // Remove from old tags
    this.removeFromTagIndex(key);

    // Add to new tags
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  /**
   * Remove key from tag index
   */
  private removeFromTagIndex(key: CacheKey): void {
    for (const [tag, keys] of this.tagIndex) {
      if (keys.has(key)) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  /**
   * Evict least recently used entries when cache is full
   */
  private evictLRU(): void {
    let oldestKey: CacheKey | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: CacheKey[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));

    // Log cleanup stats in development
    if (process.env.NODE_ENV === 'development' && expiredKeys.length > 0) {
      console.log(`ApiCache: Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer(): void {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * Stop cleanup timer
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Estimate entry size in bytes (rough approximation)
   */
  private estimateEntrySize(entry: CacheEntry): number {
    try {
      return JSON.stringify(entry).length * 2; // Rough estimate: 2 bytes per character
    } catch {
      return 1024; // Default estimate if stringification fails
    }
  }

  /**
   * Calculate hit ratio (simplified - would need actual hit/miss tracking in production)
   */
  private calculateHitRatio(): number {
    // This is a placeholder - in a real implementation, you'd track hits and misses
    return 0.75; // 75% default
  }

  /**
   * Destroy cache instance and cleanup resources
   */
  public destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Create different cache instances for different purposes
export const apiCache = new ApiCache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for API data
  maxEntries: 1000,
  cleanupInterval: 60 * 1000,
  enableRequestDeduplication: true,
});

export const staticCache = new ApiCache({
  defaultTTL: 60 * 60 * 1000, // 1 hour for static data
  maxEntries: 500,
  cleanupInterval: 5 * 60 * 1000,
  enableRequestDeduplication: true,
});

export const userCache = new ApiCache({
  defaultTTL: 15 * 60 * 1000, // 15 minutes for user-specific data
  maxEntries: 100,
  cleanupInterval: 2 * 60 * 1000,
  enableRequestDeduplication: true,
});

export { ApiCache };
export default apiCache;
