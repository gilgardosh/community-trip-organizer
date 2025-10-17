/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Cache Middleware Tests
 * Validates that caching works correctly for API responses
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  cacheResponse,
  invalidateCache,
  cacheForRole,
  responseCache,
} from '../src/middleware/cache.js';

describe('Cache Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear cache before each test
    responseCache.clear();

    // Create mock request
    mockReq = {
      method: 'GET',
      path: '/api/test',
      query: {},
      user: { id: 'user123', role: 'FAMILY' } as Express.User,
    } as Request;

    // Create mock response with json method
    jsonMock = vi.fn().mockReturnThis();
    mockRes = {
      json: jsonMock,
      on: vi.fn(),
      statusCode: 200,
    } as unknown as Response;

    // Create mock next function
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('cacheResponse middleware', () => {
    it('should skip caching for non-GET requests', () => {
      mockReq.method = 'POST';
      const middleware = cacheResponse({ ttl: 300 });

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should cache GET request responses', () => {
      const middleware = cacheResponse({ ttl: 300 });
      const testData = { id: 1, name: 'Test Trip' };

      // First request - should not be cached
      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Simulate controller sending response
      mockRes.json(testData);
      expect(jsonMock).toHaveBeenCalledWith(testData);

      // Reset mocks
      vi.clearAllMocks();

      // Second request - should return cached data
      middleware(mockReq, mockRes, mockNext);
      expect(jsonMock).toHaveBeenCalledWith(testData);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use custom TTL when provided', () => {
      const middleware = cacheResponse({ ttl: 60 }); // 1 minute
      const testData = { id: 1, name: 'Test' };

      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      const stats = responseCache.stats();
      expect(stats.entries[0].ttl).toBe(60);
    });

    it('should generate different cache keys for different users', () => {
      const middleware = cacheResponse({ ttl: 300 });
      const testData1 = { data: 'user1' };

      // First user request
      mockReq.user = { id: 'user1', role: 'FAMILY' } as Express.User;
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData1);

      // Second user request
      vi.clearAllMocks();
      mockReq.user = { id: 'user2', role: 'FAMILY' } as Express.User;
      middleware(mockReq, mockRes, mockNext);

      // Should call next (not cached for different user)
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should expire cache after TTL', async () => {
      const middleware = cacheResponse({ ttl: 1 }); // 1 second
      const testData = { data: 'expiring' };

      // First request
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Second request - should not be cached
      vi.clearAllMocks();
      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('invalidateCache middleware', () => {
    beforeEach(() => {
      // Setup some cached data
      const middleware = cacheResponse({ ttl: 300 });
      mockReq.path = '/api/trips';
      middleware(mockReq, mockRes, mockNext);
      mockRes.json({ trips: [] });
    });

    it('should invalidate cache on successful response', async () => {
      const invalidator = invalidateCache(/^GET:.*\/api\/trips/);
      let finishCallback: (() => void) | undefined;

      mockRes.on = vi.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
        return mockRes;
      });

      mockRes.statusCode = 200;

      invalidator(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      // Wait for invalidation
      await new Promise((resolve) => setTimeout(resolve, 10));
      const stats = responseCache.stats();
      expect(stats.size).toBe(0);
    });

    it('should not invalidate cache on error response', async () => {
      const invalidator = invalidateCache(/^GET:.*\/api\/trips/);
      let finishCallback: (() => void) | undefined;

      mockRes.on = vi.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
        return mockRes;
      });

      mockRes.statusCode = 500; // Error status

      invalidator(mockReq, mockRes, mockNext);

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      // Wait and check cache still exists
      await new Promise((resolve) => setTimeout(resolve, 10));
      const stats = responseCache.stats();
      expect(stats.size).toBe(1);
    });

    it('should invalidate multiple matching cache entries', () => {
      // Add multiple cache entries
      responseCache.clear();
      const testData = { data: 'test' };

      // Create multiple cached entries
      const paths = ['/api/trips', '/api/trips/1', '/api/trips/2'];
      paths.forEach((path) => {
        mockReq.path = path;
        const middleware = cacheResponse({ ttl: 300 });
        middleware(mockReq, mockRes, mockNext);
        mockRes.json(testData);
      });

      expect(responseCache.stats().size).toBe(3);

      // Invalidate all trips endpoints
      responseCache.invalidate(/^GET:.*\/api\/trips/);

      expect(responseCache.stats().size).toBe(0);
    });
  });

  describe('cacheForRole middleware', () => {
    it('should cache for users with specified role', () => {
      mockReq.user = { id: 'user1', role: 'FAMILY' } as Express.User;
      const middleware = cacheForRole(['FAMILY'], { ttl: 300 });
      const testData = { data: 'family-only' };

      // First request
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      // Second request - should be cached
      vi.clearAllMocks();
      middleware(mockReq, mockRes, mockNext);
      expect(jsonMock).toHaveBeenCalledWith(testData);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not cache for users without specified role', () => {
      mockReq.user = { id: 'user1', role: 'TRIP_ADMIN' } as Express.User;
      const middleware = cacheForRole(['FAMILY'], { ttl: 300 });

      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });

  describe('ResponseCache class', () => {
    it('should track cache statistics correctly', () => {
      const testData = { data: 'test' };

      // Add some cache entries
      mockReq.path = '/api/trips';
      let middleware = cacheResponse({ ttl: 300 });
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      mockReq.path = '/api/families';
      middleware = cacheResponse({ ttl: 600 });
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      const stats = responseCache.stats();
      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('ttl');
    });

    it('should clear all cache entries', () => {
      const testData = { data: 'test' };

      // Add cache entries
      const middleware = cacheResponse({ ttl: 300 });
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      expect(responseCache.stats().size).toBe(1);

      responseCache.clear();

      expect(responseCache.stats().size).toBe(0);
    });

    it('should return null for non-existent cache key', () => {
      const result: unknown = responseCache.get('non-existent-key');
      expect(result).toBeNull();
    });
  });

  describe('Cache key generation', () => {
    it('should include method in cache key', () => {
      const middleware = cacheResponse({ ttl: 300 });

      mockReq.method = 'GET';
      middleware(mockReq, mockRes, mockNext);
      mockRes.json({ data: 'test' });

      const stats = responseCache.stats();
      expect(stats.entries[0].key).toContain('GET');
    });

    it('should include path in cache key', () => {
      const middleware = cacheResponse({ ttl: 300 });

      mockReq.path = '/api/specific/path';
      middleware(mockReq, mockRes, mockNext);
      mockRes.json({ data: 'test' });

      const stats = responseCache.stats();
      expect(stats.entries[0].key).toContain('/api/specific/path');
    });

    it('should include user ID in cache key', () => {
      const middleware = cacheResponse({ ttl: 300 });

      mockReq.user = {
        id: 'specific-user-123',
        role: 'FAMILY',
      } as Express.User;
      middleware(mockReq, mockRes, mockNext);
      mockRes.json({ data: 'test' });

      const stats = responseCache.stats();
      expect(stats.entries[0].key).toContain('specific-user-123');
    });
  });

  describe('Cache integration scenarios', () => {
    it('should handle rapid successive requests correctly', () => {
      const middleware = cacheResponse({ ttl: 300 });
      const testData = { data: 'rapid-test' };

      // First request
      middleware(mockReq, mockRes, mockNext);
      mockRes.json(testData);

      // Multiple rapid requests
      for (let i = 0; i < 5; i++) {
        vi.clearAllMocks();
        middleware(mockReq, mockRes, mockNext);
        expect(jsonMock).toHaveBeenCalledWith(testData);
        expect(mockNext).not.toHaveBeenCalled();
      }

      // Should still have only one cache entry
      expect(responseCache.stats().size).toBe(1);
    });

    it('should handle cache invalidation pattern for related endpoints', () => {
      responseCache.clear();
      const testData = { data: 'test' };

      // Cache multiple related endpoints
      const paths = [
        '/api/trips',
        '/api/trips/1',
        '/api/trips/1/attendees',
        '/api/trips/1/schedule',
        '/api/families',
      ];

      paths.forEach((path) => {
        mockReq.path = path;
        const middleware = cacheResponse({ ttl: 300 });
        middleware(mockReq, mockRes, mockNext);
        mockRes.json(testData);
      });

      expect(responseCache.stats().size).toBe(5);

      // Invalidate only trip-related caches
      responseCache.invalidate(/^GET:.*\/api\/trips/);

      // Should only have families cache left
      const remainingStats = responseCache.stats();
      expect(remainingStats.size).toBe(1);
      expect(remainingStats.entries[0].key).toContain('/api/families');
    });
  });
});
