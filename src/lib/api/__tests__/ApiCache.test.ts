/**
 * ApiCache Tests
 * Comprehensive tests for API caching functionality
 */
import { ApiCache, CacheOptions } from '../services/ApiCache';

// Mock setTimeout/clearTimeout for testing
jest.useFakeTimers();

describe('ApiCache', () => {
  let cache: ApiCache;

  beforeEach(() => {
    cache = new ApiCache({
      defaultTTL: 5000, // 5 seconds
      maxEntries: 10,
      cleanupInterval: 10000,
      enableRequestDeduplication: true,
    });
  });

  afterEach(() => {
    cache.destroy();
    jest.clearAllTimers();
  });

  describe('Basic Cache Operations', () => {
    test('should cache and retrieve data', async () => {
      const testData = { id: 1, name: 'test' };
      const requestFn = jest.fn().mockResolvedValue(testData);

      const result = await cache.get('test-key', requestFn);

      expect(result).toEqual(testData);
      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    test('should return cached data on subsequent calls', async () => {
      const testData = { id: 1, name: 'test' };
      const requestFn = jest.fn().mockResolvedValue(testData);

      // First call
      const result1 = await cache.get('test-key', requestFn);
      // Second call
      const result2 = await cache.get('test-key', requestFn);

      expect(result1).toEqual(testData);
      expect(result2).toEqual(testData);
      expect(requestFn).toHaveBeenCalledTimes(1); // Only called once
    });

    test('should respect TTL and refetch expired data', async () => {
      const testData1 = { id: 1, name: 'test1' };
      const testData2 = { id: 2, name: 'test2' };
      const requestFn = jest.fn().mockResolvedValueOnce(testData1).mockResolvedValueOnce(testData2);

      // First call
      const result1 = await cache.get('test-key', requestFn, { ttl: 1000 });

      // Fast-forward time to expire cache
      jest.advanceTimersByTime(1500);

      // Second call after expiration
      const result2 = await cache.get('test-key', requestFn);

      expect(result1).toEqual(testData1);
      expect(result2).toEqual(testData2);
      expect(requestFn).toHaveBeenCalledTimes(2);
    });

    test('should force refresh when force option is true', async () => {
      const testData1 = { id: 1, name: 'test1' };
      const testData2 = { id: 2, name: 'test2' };
      const requestFn = jest.fn().mockResolvedValueOnce(testData1).mockResolvedValueOnce(testData2);

      // First call
      await cache.get('test-key', requestFn);

      // Second call with force refresh
      const result2 = await cache.get('test-key', requestFn, { force: true });

      expect(result2).toEqual(testData2);
      expect(requestFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Manual Cache Management', () => {
    test('should set and get data manually', () => {
      const testData = { id: 1, name: 'test' };

      cache.set('manual-key', testData);
      const retrieved = cache.getCachedData('manual-key');

      expect(retrieved).toEqual(testData);
    });

    test('should check if key exists', () => {
      const testData = { id: 1, name: 'test' };

      expect(cache.has('test-key')).toBe(false);

      cache.set('test-key', testData);

      expect(cache.has('test-key')).toBe(true);
    });

    test('should delete specific entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);

      const deleted = cache.delete('key1');

      expect(deleted).toBe(true);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
    });

    test('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('Request Deduplication', () => {
    test('should deduplicate concurrent requests', async () => {
      const testData = { id: 1, name: 'test' };
      const requestFn = jest
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(testData), 100)));

      // Make concurrent requests
      const promise1 = cache.get('dedupe-key', requestFn);
      const promise2 = cache.get('dedupe-key', requestFn);
      const promise3 = cache.get('dedupe-key', requestFn);

      // Advance timers to resolve promises
      jest.advanceTimersByTime(100);

      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

      expect(result1).toEqual(testData);
      expect(result2).toEqual(testData);
      expect(result3).toEqual(testData);
      expect(requestFn).toHaveBeenCalledTimes(1); // Only called once despite 3 concurrent requests
    });

    test('should handle request failures in deduplication', async () => {
      const error = new Error('Request failed');
      const requestFn = jest.fn().mockRejectedValue(error);

      const promise1 = cache.get('failing-key', requestFn);
      const promise2 = cache.get('failing-key', requestFn);

      await expect(promise1).rejects.toThrow('Request failed');
      await expect(promise2).rejects.toThrow('Request failed');
      expect(requestFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cache Invalidation', () => {
    beforeEach(() => {
      cache.set('user:1', { id: 1, name: 'John' });
      cache.set('user:2', { id: 2, name: 'Jane' });
      cache.set('posts:1', { id: 1, title: 'Post 1' });
      cache.set('posts:2', { id: 2, title: 'Post 2' });
    });

    test('should invalidate by exact key', () => {
      const deleted = cache.invalidate('user:1');

      expect(deleted).toBe(1);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(true);
    });

    test('should invalidate by wildcard pattern', () => {
      const deleted = cache.invalidate('user:*');

      expect(deleted).toBe(2);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(false);
      expect(cache.has('posts:1')).toBe(true);
    });

    test('should invalidate by regex pattern', () => {
      const deleted = cache.invalidate(/^posts:/);

      expect(deleted).toBe(2);
      expect(cache.has('posts:1')).toBe(false);
      expect(cache.has('posts:2')).toBe(false);
      expect(cache.has('user:1')).toBe(true);
    });
  });

  describe('Tag-based Invalidation', () => {
    test('should invalidate by tag', () => {
      cache.set('key1', 'value1', { tags: ['users', 'admins'] });
      cache.set('key2', 'value2', { tags: ['users'] });
      cache.set('key3', 'value3', { tags: ['posts'] });

      const deleted = cache.invalidateByTag('users');

      expect(deleted).toBe(2);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
    });

    test('should handle multiple tags per entry', () => {
      cache.set('key1', 'value1', { tags: ['tag1', 'tag2'] });

      expect(cache.invalidateByTag('tag1')).toBe(1);
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('Cache Statistics', () => {
    test('should provide cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2', { tags: ['test'] });

      const stats = cache.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.activeEntries).toBeGreaterThanOrEqual(0);
      expect(stats.estimatedSize).toBeGreaterThan(0);
      expect(stats.tags).toBe(1);
    });

    test('should identify expired entries in stats', () => {
      cache.set('key1', 'value1', { ttl: 1000 });
      cache.set('key2', 'value2', { ttl: 10000 });

      // Fast-forward to expire first entry
      jest.advanceTimersByTime(1500);

      const stats = cache.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.expiredEntries).toBe(1);
      expect(stats.activeEntries).toBe(1);
    });
  });

  describe('Cache Warmup', () => {
    test('should warm up cache with predefined entries', () => {
      const entries = [
        { key: 'key1', data: 'value1', options: { tags: ['test'] } },
        { key: 'key2', data: 'value2', options: { ttl: 10000 } },
      ];

      cache.warmUp(entries);

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.getCachedData('key1')).toBe('value1');
      expect(cache.getCachedData('key2')).toBe('value2');
    });
  });

  describe('Memory Management', () => {
    test('should enforce max entries limit', () => {
      // Create cache with small limit
      const smallCache = new ApiCache({
        maxEntries: 2,
        defaultTTL: 10000,
      });

      // Add entries beyond limit
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Should evict oldest

      const stats = smallCache.getStats();
      expect(stats.totalEntries).toBeLessThanOrEqual(2);
      expect(smallCache.has('key1')).toBe(false); // Should be evicted
      expect(smallCache.has('key3')).toBe(true); // Should be present

      smallCache.destroy();
    });
  });

  describe('Key Generation', () => {
    test('should create scoped cache keys', () => {
      const key1 = cache.createKey('users', '123', 'profile');
      const key2 = cache.createKey('posts', 456, 'comments');

      expect(key1).toBe('users:123:profile');
      expect(key2).toBe('posts:456:comments');
    });
  });

  describe('Cache Cleanup', () => {
    test('should clean up expired entries periodically', () => {
      // Create cache with short cleanup interval
      const cleanupCache = new ApiCache({
        cleanupInterval: 1000,
        defaultTTL: 500,
      });

      cleanupCache.set('key1', 'value1');
      cleanupCache.set('key2', 'value2');

      // Fast-forward to expire entries
      jest.advanceTimersByTime(600);

      // Trigger cleanup
      jest.advanceTimersByTime(1000);

      const stats = cleanupCache.getStats();
      expect(stats.totalEntries).toBe(0);

      cleanupCache.destroy();
    });
  });

  describe('Error Handling', () => {
    test('should handle request function errors', async () => {
      const error = new Error('Request failed');
      const requestFn = jest.fn().mockRejectedValue(error);

      await expect(cache.get('error-key', requestFn)).rejects.toThrow('Request failed');
      expect(requestFn).toHaveBeenCalledTimes(1);

      // Should not cache the error
      expect(cache.has('error-key')).toBe(false);
    });

    test('should not break on invalid data', () => {
      // Test with circular reference (can't be JSON.stringified)
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => cache.set('circular', circularObj)).not.toThrow();
    });
  });
});
