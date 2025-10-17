/**
 * Server-side API Response Caching Middleware
 * Implements Redis-like in-memory caching for API responses
 */

import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: (req: Request) => string; // Custom cache key generator
  excludeQuery?: string[]; // Query params to exclude from cache key
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300) {
    // Default 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.startCleanupInterval();
  }

  /**
   * Generate cache key from request
   */
  private generateKey(req: Request, options?: CacheOptions): string {
    if (options?.key) {
      return options.key(req);
    }

    const { method, path, query, user } = req;
    const userId = user?.id || 'anonymous';

    // Filter query params
    const filteredQuery = { ...query };
    options?.excludeQuery?.forEach((param) => {
      delete filteredQuery[param];
    });

    return `${method}:${path}:${userId}:${JSON.stringify(filteredQuery)}`;
  }

  /**
   * Get cached response
   */
  get(key: string): unknown {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached response
   */
  set(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache by key or pattern
   */
  invalidate(keyOrPattern: string | RegExp): void {
    if (typeof keyOrPattern === 'string') {
      this.cache.delete(keyOrPattern);
    } else {
      for (const key of this.cache.keys()) {
        if (keyOrPattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
      })),
    };
  }
}

// Singleton instance
export const responseCache = new ResponseCache();

/**
 * Cache middleware for Express routes
 */
export function cacheResponse(options: CacheOptions = {}) {
  const ttl = options.ttl || 300; // 5 minutes default

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = responseCache['generateKey'](req, options);

    // Try to get from cache
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function (data: unknown) {
      responseCache.set(cacheKey, data, ttl);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 * Call after mutations to invalidate related cache entries
 */
export function invalidateCache(pattern: string | RegExp) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        responseCache.invalidate(pattern);
      }
    });
    next();
  };
}

/**
 * Conditional cache middleware based on user role
 */
export function cacheForRole(roles: string[], options: CacheOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user && roles.includes(user.role)) {
      return cacheResponse(options)(req, res, next);
    }
    next();
  };
}
