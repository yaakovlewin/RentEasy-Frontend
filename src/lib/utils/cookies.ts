/**
 * Cookie Management Utilities
 *
 * Type-safe, functional cookie operations following SOLID principles.
 * Single responsibility: Each function handles one aspect of cookie management.
 */

import { isBrowser, isLocalhost } from './environment';
import { TIME } from './time';

/**
 * Cookie configuration options
 */
export interface CookieOptions {
  path?: string;
  expires?: Date | string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Default cookie options following security best practices
 */
const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  sameSite: 'lax',
} as const;

/**
 * Build cookie string from options
 * Pure function that constructs cookie string
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 * @returns Cookie string
 */
const buildCookieString = (
  name: string,
  value: string,
  options: CookieOptions
): string => {
  const parts = [`${name}=${value}`];

  if (options.path) parts.push(`path=${options.path}`);

  if (options.expires) {
    const expiresStr = typeof options.expires === 'string'
      ? options.expires
      : options.expires.toUTCString();
    parts.push(`expires=${expiresStr}`);
  }

  if (options.maxAge !== undefined) parts.push(`max-age=${options.maxAge}`);
  if (options.secure) parts.push('secure');
  if (options.sameSite) parts.push(`samesite=${options.sameSite}`);

  return parts.join('; ');
};

/**
 * Determine if secure flag should be set
 * Pure function for security flag determination
 *
 * @param explicitSecure - Explicitly set secure value
 * @returns True if secure flag should be set
 */
const shouldBeSecure = (explicitSecure?: boolean): boolean => {
  if (explicitSecure !== undefined) return explicitSecure;
  return !isLocalhost();
};

/**
 * Set a cookie with automatic secure flag handling
 * Side effect: Modifies document.cookie (isolated to this function)
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  if (!isBrowser()) return;

  const opts: CookieOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    secure: shouldBeSecure(options.secure),
  };

  document.cookie = buildCookieString(name, value, opts);
};

/**
 * Get cookie value by name
 * Pure function (reading is idempotent)
 *
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  if (!isBrowser()) return null;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
};

/**
 * Delete a cookie by setting it to expire
 * Side effect: Modifies document.cookie
 *
 * @param name - Cookie name to delete
 * @param path - Cookie path (default: '/')
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  setCookie(name, '', {
    path,
    expires: new Date('Thu, 01 Jan 1970 00:00:01 GMT'),
  });
};

/**
 * Set authentication token cookies with standard configuration
 * Domain-specific function for auth tokens (DRY principle)
 *
 * @param accessToken - Access token value
 * @param refreshToken - Optional refresh token value
 * @param accessTokenExpiry - Optional access token expiry timestamp
 */
export const setAuthTokenCookies = (
  accessToken: string,
  refreshToken?: string,
  accessTokenExpiry?: number
): void => {
  // Set access token with provided or default expiry (24 hours)
  setCookie('token', accessToken, {
    expires: accessTokenExpiry
      ? new Date(accessTokenExpiry)
      : new Date(Date.now() + TIME.DAY),
  });

  // Set refresh token with 7 day expiry if provided
  if (refreshToken) {
    setCookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + TIME.WEEK),
    });
  }
};

/**
 * Clear all authentication token cookies
 * Domain-specific function for auth cleanup (DRY principle)
 */
export const clearAuthTokenCookies = (): void => {
  deleteCookie('token');
  deleteCookie('refreshToken');
};

/**
 * Check if a cookie exists
 * Pure function
 *
 * @param name - Cookie name
 * @returns True if cookie exists, false otherwise
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};
