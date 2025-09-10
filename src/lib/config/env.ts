/**
 * Environment variable validation and type-safe configuration
 * This file provides runtime validation of environment variables and type-safe access
 */

// Define the expected environment variables with their types and validation rules
interface EnvironmentConfig {
  // Google Maps Configuration
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;

  // API Configuration
  NEXT_PUBLIC_API_URL: string;

  // App Configuration
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_APP_URL: string;

  // Debug Configuration
  NEXT_PUBLIC_DEBUG_SEARCH: boolean;
  NEXT_PUBLIC_DEBUG_API?: boolean;
  NEXT_PUBLIC_DEBUG_PERFORMANCE?: boolean;

  // Development Tools
  NEXT_PUBLIC_SHOW_DEV_TOOLS?: boolean;
  NEXT_PUBLIC_ENABLE_SOURCE_MAPS?: boolean;

  // Production Features
  NEXT_PUBLIC_ENABLE_ANALYTICS?: boolean;
  NEXT_PUBLIC_ENABLE_ERROR_TRACKING?: boolean;
}

/**
 * Validates and parses a boolean environment variable
 */
function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Validates that a required environment variable exists and is not empty
 */
function validateRequired(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is missing or empty`);
  }
  return value.trim();
}

/**
 * Validates that a URL is properly formatted
 */
function validateUrl(key: string, value: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`Environment variable ${key} must be a valid URL, got: ${value}`);
  }
}

/**
 * Validates that an API key has the correct format (basic validation)
 */
function validateApiKey(key: string, value: string): string {
  if (
    value === 'your_google_maps_api_key_here' ||
    value === 'your_production_google_maps_api_key_here'
  ) {
    console.warn(
      `⚠️  ${key} is using placeholder value. Google Maps functionality will be disabled.`
    );
  }
  return value;
}

/**
 * Loads and validates all environment variables
 * Throws an error if required variables are missing or invalid
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  const errors: string[] = [];

  try {
    const config: EnvironmentConfig = {
      // Required variables
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: validateApiKey(
        'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
        validateRequired(
          'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        )
      ),
      NEXT_PUBLIC_API_URL: validateUrl(
        'NEXT_PUBLIC_API_URL',
        validateRequired('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL)
      ),
      NEXT_PUBLIC_APP_NAME: validateRequired(
        'NEXT_PUBLIC_APP_NAME',
        process.env.NEXT_PUBLIC_APP_NAME
      ),
      NEXT_PUBLIC_APP_URL: validateUrl(
        'NEXT_PUBLIC_APP_URL',
        validateRequired('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL)
      ),

      // Debug configuration
      NEXT_PUBLIC_DEBUG_SEARCH: parseBoolean(process.env.NEXT_PUBLIC_DEBUG_SEARCH, false),
      NEXT_PUBLIC_DEBUG_API: parseBoolean(process.env.NEXT_PUBLIC_DEBUG_API, false),
      NEXT_PUBLIC_DEBUG_PERFORMANCE: parseBoolean(process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE, false),

      // Development tools
      NEXT_PUBLIC_SHOW_DEV_TOOLS: parseBoolean(process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS, false),
      NEXT_PUBLIC_ENABLE_SOURCE_MAPS: parseBoolean(
        process.env.NEXT_PUBLIC_ENABLE_SOURCE_MAPS,
        process.env.NODE_ENV === 'development'
      ),

      // Production features
      NEXT_PUBLIC_ENABLE_ANALYTICS: parseBoolean(
        process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
        process.env.NODE_ENV === 'production'
      ),
      NEXT_PUBLIC_ENABLE_ERROR_TRACKING: parseBoolean(
        process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING,
        process.env.NODE_ENV === 'production'
      ),
    };

    return config;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  if (errors.length > 0) {
    const errorMessage = `Environment configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('Unexpected error in environment configuration');
}

/**
 * Validated environment configuration
 * This is loaded once and cached for the application lifecycle
 */
export const env: EnvironmentConfig = loadEnvironmentConfig();

/**
 * Runtime configuration object with computed values
 */
export const config = {
  ...env,

  // Computed values
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Feature flags
  features: {
    debugMode:
      env.NEXT_PUBLIC_DEBUG_SEARCH ||
      env.NEXT_PUBLIC_DEBUG_API ||
      env.NEXT_PUBLIC_DEBUG_PERFORMANCE,
    googleMapsEnabled:
      env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' &&
      env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'your_production_google_maps_api_key_here',
    analyticsEnabled: env.NEXT_PUBLIC_ENABLE_ANALYTICS ?? false,
    errorTrackingEnabled: env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING ?? false,
  },

  // API configuration
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeout: 10000, // 10 seconds
  },

  // App metadata
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    url: env.NEXT_PUBLIC_APP_URL,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
} as const;

/**
 * Type-safe environment variable access
 * Use this instead of process.env for type safety and validation
 */
export default config;

// Development-only configuration logging
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    nodeEnv: process.env.NODE_ENV,
    apiUrl: config.api.baseUrl,
    features: config.features,
    debugFlags: {
      search: env.NEXT_PUBLIC_DEBUG_SEARCH,
      api: env.NEXT_PUBLIC_DEBUG_API,
      performance: env.NEXT_PUBLIC_DEBUG_PERFORMANCE,
    },
  });
}
