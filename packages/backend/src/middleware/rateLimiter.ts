/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { isTest } from '../config/env.js';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;

  constructor() {
    this.limits = new Map();
    this.startCleanupInterval();
  }

  /**
   * Check if request should be rate limited
   */
  check(
    key: string,
    windowMs: number,
    maxRequests: number,
  ): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No existing entry or expired
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.limits.set(key, newEntry);
      return {
        limited: false,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);

    const remaining = Math.max(0, maxRequests - entry.count);
    const limited = entry.count > maxRequests;

    return {
      limited,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Cleanup expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits.entries()) {
        if (now > entry.resetTime) {
          this.limits.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Reset limits for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all limits
   */
  clear(): void {
    this.limits.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => {
      const user = req.user;
      const baseKey = user ? `user:${user.id}` : `ip:${req.ip}`;
      // Include the endpoint path to ensure separate buckets per endpoint
      return `${baseKey}:${req.path}`;
    },
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in test environment unless explicitly testing rate limits
    // Check process.env directly for dynamic evaluation
    const shouldSkipRateLimit = isTest && !process.env.TEST_RATE_LIMITING;
    
    if (shouldSkipRateLimit) {
      return next();
    }

    const key = keyGenerator(req);
    const result = rateLimiter.check(key, windowMs, maxRequests);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(result.resetTime).toISOString(),
    );

    if (result.limited) {
      throw new ApiError(429, message);
    }

    // Reset on successful request if configured
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          rateLimiter.reset(key);
        }
      });
    }

    next();
  };
}

/**
 * Preset rate limiters for different endpoint types
 */
export const rateLimiters = {
  // Strict limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts, please try again later',
  }),

  // General API limit
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),

  // Lenient limit for read operations
  read: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  }),

  // Strict limit for write operations
  write: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),

  // Very strict for admin operations
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  }),
};

/**
 * Clear all rate limits (for testing)
 */
export function clearRateLimits(): void {
  rateLimiter.clear();
}
