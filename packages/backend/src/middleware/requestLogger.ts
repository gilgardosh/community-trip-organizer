/**
 * Request Logging Middleware
 * Logs all HTTP requests with timing and metadata
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return randomUUID();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Generate request ID
  const requestId = generateRequestId();
  req.requestId = requestId;

  // Start time
  const startTime = Date.now();

  // Get user ID if authenticated
  const userId = (req.user as any)?.id;

  // Log request
  logger.withContext(userId, requestId).info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - startTime;

    // Log response
    logger.withContext(userId, requestId).info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    return originalJson(data);
  };

  // Log errors
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    if (res.statusCode >= 400) {
      logger.withContext(userId, requestId).warn('Request failed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
}

/**
 * Error logging middleware
 */
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = (req.user as any)?.id;
  const requestId = req.requestId;

  logger.withContext(userId, requestId).error('Request error', err, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });

  next(err);
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
