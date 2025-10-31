/**
 * Frontend Environment Variables Validation
 * Validates and provides type-safe access to frontend environment variables
 */

import { z } from 'zod';

/**
 * Schema for frontend environment variables
 * All public variables must be prefixed with NEXT_PUBLIC_
 */
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.url(),

  // OAuth
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_FACEBOOK_CLIENT_ID: z.string().optional(),

  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('טיולי השכונה'),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_REGISTRATION: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_FACEBOOK_AUTH: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_DARK_MODE: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),

  // Development Settings
  NEXT_PUBLIC_DEBUG: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_SHOW_DEV_TOOLS: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),

  // Image Configuration
  NEXT_PUBLIC_MAX_IMAGE_SIZE: z.string().default('5').transform(Number),
  NEXT_PUBLIC_ALLOWED_IMAGE_FORMATS: z
    .string()
    .default('image/jpeg,image/png,image/webp'),

  // WhatsApp Configuration
  NEXT_PUBLIC_DEFAULT_COUNTRY_CODE: z.string().default('+972'),
  NEXT_PUBLIC_WHATSAPP_WEB_URL: z
    .string()
    .url()
    .default('https://web.whatsapp.com/send'),

  // Locale Configuration
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('he'),
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().default('Asia/Jerusalem'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('ILS'),

  // Analytics (Optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

/**
 * Validated environment variables type
 */
export type ClientEnv = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): ClientEnv {
  // On the client side, only NEXT_PUBLIC_ variables are available
  const envVars =
    typeof window === 'undefined'
      ? process.env
      : Object.fromEntries(
          Object.entries(window).filter(([key]) =>
            key.startsWith('NEXT_PUBLIC_'),
          ),
        );

  try {
    return envSchema.parse(envVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');

      console.error(
        `❌ Invalid environment variables:\n${missingVars}\n\n` +
          'Please check your .env.local file against .env.example',
      );

      // Return defaults in development to prevent crashes
      if (process.env.NODE_ENV === 'development') {
        return envSchema.parse({
          NEXT_PUBLIC_API_URL: 'http://localhost:3001',
          NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
          NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'placeholder',
        });
      }

      throw error;
    }
    throw error;
  }
}

/**
 * Validated environment variables (singleton)
 */
export const clientEnv = parseEnv();

/**
 * Get API configuration
 */
export function getApiConfig() {
  return {
    baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    timeout: 30000, // 30 seconds
  };
}

/**
 * Get OAuth configuration
 */
export function getOAuthConfig() {
  return {
    google: {
      clientId: clientEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      enabled: true,
    },
    facebook: {
      clientId: clientEnv.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
      enabled: clientEnv.NEXT_PUBLIC_ENABLE_FACEBOOK_AUTH,
    },
  };
}

/**
 * Get feature flags
 */
export function getFeatureFlags() {
  return {
    registration: clientEnv.NEXT_PUBLIC_ENABLE_REGISTRATION,
    facebookAuth: clientEnv.NEXT_PUBLIC_ENABLE_FACEBOOK_AUTH,
    darkMode: clientEnv.NEXT_PUBLIC_ENABLE_DARK_MODE,
    debug: clientEnv.NEXT_PUBLIC_DEBUG,
    devTools: clientEnv.NEXT_PUBLIC_SHOW_DEV_TOOLS,
  };
}

/**
 * Get image configuration
 */
export function getImageConfig() {
  return {
    maxSize: clientEnv.NEXT_PUBLIC_MAX_IMAGE_SIZE * 1024 * 1024, // Convert to bytes
    allowedFormats: clientEnv.NEXT_PUBLIC_ALLOWED_IMAGE_FORMATS.split(','),
  };
}

/**
 * Get locale configuration
 */
export function getLocaleConfig() {
  return {
    locale: clientEnv.NEXT_PUBLIC_DEFAULT_LOCALE,
    timezone: clientEnv.NEXT_PUBLIC_DEFAULT_TIMEZONE,
    currency: clientEnv.NEXT_PUBLIC_DEFAULT_CURRENCY,
  };
}
