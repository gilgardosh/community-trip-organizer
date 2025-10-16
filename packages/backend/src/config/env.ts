/**
 * Environment Variables Validation
 * Validates and provides type-safe access to environment variables
 */

import { z } from 'zod';

/**
 * Schema for backend environment variables
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),

  // OAuth - Facebook (optional)
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CALLBACK_URL: z.string().url().optional(),

  // Server
  PORT: z.string().transform(Number).default(3001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CLIENT_URL: z.url(),

  // CORS
  ALLOWED_ORIGINS: z.string().transform((str) => str.split(',')),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Security
  SESSION_SECRET: z.string().min(32).optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Feature Flags
  ENABLE_REGISTRATION: z
    .string()
    .transform((v) => v === 'true')
    .default(true),
  ENABLE_FACEBOOK_AUTH: z
    .string()
    .transform((v) => v === 'true')
    .default(false),
  ENABLE_EMAIL_NOTIFICATIONS: z
    .string()
    .transform((v) => v === 'true')
    .default(false),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `❌ Invalid environment variables:\n${missingVars}\n\n` +
          'Please check your .env file against .env.example',
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables (singleton)
 */
export const env = parseEnv();

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get database connection options
 */
export function getDatabaseConfig() {
  return {
    url: env.DATABASE_URL,
    log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  } as const;
}

/**
 * Get CORS configuration
 */
export function getCorsConfig() {
  return {
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig() {
  return {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  };
}
