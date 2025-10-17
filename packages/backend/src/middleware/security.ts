/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Content Security Policy configuration
 */
export const cspConfig = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for Next.js in development
      'https://vercel.live',
      'https://va.vercel-scripts.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for styled-components
      'https://fonts.googleapis.com',
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://*.googleusercontent.com', // Google profile photos
      'https://*.fbsbx.com', // Facebook profile photos
      'https://vercel.live',
    ],
    connectSrc: [
      "'self'",
      'https://vercel.live',
      'https://va.vercel-scripts.com',
      process.env.CLIENT_URL || 'http://localhost:3000',
    ],
    frameSrc: ["'self'", 'https://vercel.live'],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  },
});

/**
 * Additional security headers
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  // Remove powered-by header
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * CORS configuration with security
 */
export function secureCors(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get('origin');

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
      );
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  };
}

/**
 * Prevent parameter pollution
 */
export function preventParameterPollution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If multiple values for same parameter, keep only the first
  for (const [key, value] of Object.entries(req.query)) {
    if (Array.isArray(value)) {
      req.query[key] = value[0];
    }
  }

  next();
}

/**
 * Add request fingerprinting for security tracking
 */
export function requestFingerprint(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fingerprint = {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    acceptLanguage: req.get('accept-language'),
    timestamp: new Date().toISOString(),
  };

  // Attach to request for logging/tracking
  req.fingerprint = fingerprint;

  next();
}
