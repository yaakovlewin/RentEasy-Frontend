import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  RequestCache,
  requestCache,
  generateApiCacheKey,
  generateSearchCacheKey,
  MemoryCache,
} from '../cache';

describe('RequestCache', () => {
  let cache: RequestCache;

  beforeEach(() => {
    cache = RequestCache.getInstance();
    cache.clear();
  });

  afterEach(() => {
    cache.clear();
    cache.stopCleanupInterval();
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = RequestCache.getInstance();
      const instance2 = RequestCache.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should have global instance available', () => {
      expect(requestCache).toBeInstanceOf(RequestCache);
    });
  });

  describe('get', () => {
    it('should fetch and cache data', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      const result = await cache.get('test-key', fetcher);

      expect(result).toEqual({ data: 'test' });
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should return cached data on subsequent calls', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      const result1 = await cache.get('test-key', fetcher);
      const result2 = await cache.get('test-key', fetcher);

      expect(result1).toEqual(result2);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate concurrent requests', async () => {
      const fetcher = jest.fn().mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ data: 'test' }), 100)
          )
      );

      const [result1, result2] = await Promise.all([
        cache.get('test-key', fetcher),
        cache.get('test-key', fetcher),
      ]);

      expect(result1).toEqual(result2);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should respect TTL and refetch after expiration', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' });

      const result1 = await cache.get('test-key', fetcher, { ttl: 100 });

      await new Promise(resolve => setTimeout(resolve, 150));

      const result2 = await cache.get('test-key', fetcher, { ttl: 100 });

      expect(result1).toEqual({ data: 'first' });
      expect(result2).toEqual({ data: 'second' });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should force refresh when requested', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' });

      await cache.get('test-key', fetcher);
      const result = await cache.get('test-key', fetcher, { force: true });

      expect(result).toEqual({ data: 'second' });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should skip cache when requested', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' });

      await cache.get('test-key', fetcher);
      const result = await cache.get('test-key', fetcher, { skipCache: true });

      expect(result).toEqual({ data: 'second' });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should handle errors and not cache failed requests', async () => {
      const fetcher = jest.fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ data: 'success' });

      await expect(cache.get('test-key', fetcher)).rejects.toThrow('API Error');

      const result = await cache.get('test-key', fetcher);

      expect(result).toEqual({ data: 'success' });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('set', () => {
    it('should manually set cache data', () => {
      cache.set('test-key', { data: 'manual' });

      expect(cache.hasValid('test-key')).toBe(true);
    });

    it('should respect custom TTL', async () => {
      cache.set('test-key', { data: 'manual' }, 100);

      expect(cache.hasValid('test-key')).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.hasValid('test-key')).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should invalidate specific cache entry', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      await cache.get('test-key', fetcher);
      cache.invalidate('test-key');

      expect(cache.hasValid('test-key')).toBe(false);
    });

    it('should invalidate pending requests', async () => {
      const fetcher = jest.fn().mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ data: 'test' }), 200)
          )
      );

      const promise = cache.get('test-key', fetcher);
      cache.invalidate('test-key');

      await promise;

      expect(cache.has('test-key')).toBe(true);
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate entries matching string pattern', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      await cache.get('user:1', fetcher);
      await cache.get('user:2', fetcher);
      await cache.get('property:1', fetcher);

      cache.invalidatePattern('user:');

      expect(cache.hasValid('user:1')).toBe(false);
      expect(cache.hasValid('user:2')).toBe(false);
      expect(cache.hasValid('property:1')).toBe(true);
    });

    it('should invalidate entries matching regex pattern', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      await cache.get('user:1', fetcher);
      await cache.get('user:2', fetcher);
      await cache.get('property:1', fetcher);

      cache.invalidatePattern(/user:\d+/);

      expect(cache.hasValid('user:1')).toBe(false);
      expect(cache.hasValid('user:2')).toBe(false);
      expect(cache.hasValid('property:1')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      await cache.get('key1', fetcher);
      await cache.get('key2', fetcher);

      cache.clear();

      expect(cache.hasValid('key1')).toBe(false);
      expect(cache.hasValid('key2')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' });

      await cache.get('key1', fetcher);
      await cache.get('key2', fetcher);

      const stats = cache.getStats();

      expect(stats.cacheSize).toBe(2);
      expect(stats.pendingSize).toBe(0);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('expiresAt');
    });

    it('should track pending requests', async () => {
      const fetcher = jest.fn().mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ data: 'test' }), 200)
          )
      );

      cache.get('key1', fetcher);

      const stats = cache.getStats();

      expect(stats.pendingSize).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      cache.set('key1', { data: 'test' }, 100);
      cache.set('key2', { data: 'test' }, 10000);

      await new Promise(resolve => setTimeout(resolve, 150));

      cache.cleanup();

      expect(cache.hasValid('key1')).toBe(false);
      expect(cache.hasValid('key2')).toBe(true);
    });
  });

  describe('has and hasValid', () => {
    it('should check if key exists', () => {
      cache.set('test-key', { data: 'test' });

      expect(cache.has('test-key')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should check if key has valid data', async () => {
      cache.set('test-key', { data: 'test' }, 100);

      expect(cache.hasValid('test-key')).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.has('test-key')).toBe(true);
      expect(cache.hasValid('test-key')).toBe(false);
    });
  });
});

describe('generateApiCacheKey', () => {
  it('should generate key for endpoint without params', () => {
    const key = generateApiCacheKey('/users/profile');

    expect(key).toBe('api:/users/profile');
  });

  it('should generate key for endpoint with params', () => {
    const key = generateApiCacheKey('/users', { page: 1, limit: 10 });

    expect(key).toBe('api:/users:limit=10&page=1');
  });

  it('should sort params for consistent keys', () => {
    const key1 = generateApiCacheKey('/users', { limit: 10, page: 1 });
    const key2 = generateApiCacheKey('/users', { page: 1, limit: 10 });

    expect(key1).toBe(key2);
  });

  it('should handle empty params object', () => {
    const key = generateApiCacheKey('/users', {});

    expect(key).toBe('api:/users');
  });

  it('should handle various param types', () => {
    const key = generateApiCacheKey('/search', {
      query: 'test',
      page: 1,
      active: true,
    });

    expect(key).toContain('query=test');
    expect(key).toContain('page=1');
    expect(key).toContain('active=true');
  });
});

describe('generateSearchCacheKey', () => {
  it('should generate key for basic search params', () => {
    const key = generateSearchCacheKey({
      location: 'Miami',
      checkIn: '2024-06-01',
      checkOut: '2024-06-05',
    });

    expect(key).toBe('search:Miami:2024-06-01:2024-06-05:any');
  });

  it('should handle guest counts', () => {
    const key = generateSearchCacheKey({
      location: 'Miami',
      checkIn: '2024-06-01',
      checkOut: '2024-06-05',
      guests: { adults: 2, children: 1, infants: 0 },
    });

    expect(key).toContain('g2-1-0');
  });

  it('should include additional filters', () => {
    const key = generateSearchCacheKey({
      location: 'Miami',
      checkIn: '2024-06-01',
      checkOut: '2024-06-05',
      minPrice: 100,
      maxPrice: 300,
    });

    expect(key).toContain('maxPrice:300');
    expect(key).toContain('minPrice:100');
  });

  it('should handle missing optional params', () => {
    const key = generateSearchCacheKey({});

    expect(key).toBe('search:any:any:any:any');
  });

  it('should sort filters for consistency', () => {
    const key1 = generateSearchCacheKey({
      location: 'Miami',
      maxPrice: 300,
      minPrice: 100,
    });

    const key2 = generateSearchCacheKey({
      location: 'Miami',
      minPrice: 100,
      maxPrice: 300,
    });

    expect(key1).toBe(key2);
  });
});

describe('MemoryCache', () => {
  let memCache: MemoryCache<any>;

  beforeEach(() => {
    memCache = new MemoryCache();
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      memCache.set('key1', { data: 'test' });

      expect(memCache.get('key1')).toEqual({ data: 'test' });
    });

    it('should return undefined for nonexistent keys', () => {
      expect(memCache.get('nonexistent')).toBeUndefined();
    });

    it('should handle various data types', () => {
      memCache.set('string', 'test');
      memCache.set('number', 123);
      memCache.set('boolean', true);
      memCache.set('object', { key: 'value' });
      memCache.set('array', [1, 2, 3]);

      expect(memCache.get('string')).toBe('test');
      expect(memCache.get('number')).toBe(123);
      expect(memCache.get('boolean')).toBe(true);
      expect(memCache.get('object')).toEqual({ key: 'value' });
      expect(memCache.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('has', () => {
    it('should check if key exists', () => {
      memCache.set('key1', 'value');

      expect(memCache.has('key1')).toBe(true);
      expect(memCache.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete entries', () => {
      memCache.set('key1', 'value');

      expect(memCache.delete('key1')).toBe(true);
      expect(memCache.has('key1')).toBe(false);
    });

    it('should return false for nonexistent keys', () => {
      expect(memCache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      memCache.set('key1', 'value1');
      memCache.set('key2', 'value2');

      memCache.clear();

      expect(memCache.size).toBe(0);
      expect(memCache.has('key1')).toBe(false);
      expect(memCache.has('key2')).toBe(false);
    });
  });

  describe('size', () => {
    it('should track cache size', () => {
      expect(memCache.size).toBe(0);

      memCache.set('key1', 'value1');
      expect(memCache.size).toBe(1);

      memCache.set('key2', 'value2');
      expect(memCache.size).toBe(2);

      memCache.delete('key1');
      expect(memCache.size).toBe(1);
    });
  });

  describe('overwrite values', () => {
    it('should overwrite existing values', () => {
      memCache.set('key1', 'value1');
      memCache.set('key1', 'value2');

      expect(memCache.get('key1')).toBe('value2');
      expect(memCache.size).toBe(1);
    });
  });
});
