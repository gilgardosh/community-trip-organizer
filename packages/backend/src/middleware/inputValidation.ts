/**
 * Input Validation Middleware
 * Sanitizes and validates user input
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Israeli format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+972|0)?[1-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Middleware to validate required fields
 */
export function validateRequired(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
    }

    next();
  };
}

/**
 * Middleware to validate email fields
 */
export function validateEmail(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      const email = req.body[field];
      if (email && !isValidEmail(email)) {
        throw new ApiError(400, `Invalid email format: ${field}`);
      }
    }

    next();
  };
}

/**
 * Middleware to validate URL fields
 */
export function validateUrl(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      const url = req.body[field];
      if (url && !isValidUrl(url)) {
        throw new ApiError(400, `Invalid URL format: ${field}`);
      }
    }

    next();
  };
}

/**
 * Middleware to prevent SQL injection in raw queries
 */
export function preventSqlInjection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const checkValue = (value: unknown): boolean => {
    if (typeof value === 'string') {
      // Check for common SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
        /(--|\|\||;|\/\*|\*\/)/gi,
        /(\bOR\b.*=.*)/gi,
        /(\bAND\b.*=.*)/gi,
      ];

      return sqlPatterns.some((pattern) => pattern.test(value));
    }

    if (Array.isArray(value)) {
      return value.some(checkValue);
    }

    if (value && typeof value === 'object') {
      return Object.values(value).some(checkValue);
    }

    return false;
  };

  if (checkValue(req.body) || checkValue(req.query)) {
    throw new ApiError(400, 'Invalid input detected');
  }

  next();
}

/**
 * Middleware to limit request body size
 */
export function limitBodySize(maxSizeInMB: number = 1) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSize) {
      throw new ApiError(
        413,
        `Request body too large. Maximum size: ${maxSizeInMB}MB`,
      );
    }

    next();
  };
}
