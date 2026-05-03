/**
 * Environment Detection Utilities
 *
 * Pure functions for environment detection following FP principles.
 * Single responsibility: Each function does one thing well (SOLID).
 */

/**
 * Check if code is running in browser environment
 *
 * @returns True if in browser, false in SSR/Node.js
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if code is running in server environment
 *
 * @returns True if on server, false in browser
 */
export const isServer = (): boolean => {
  return !isBrowser();
};

/**
 * Check if running on localhost
 *
 * @returns True if localhost, false otherwise or if not in browser
 */
export const isLocalhost = (): boolean => {
  if (!isBrowser()) return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Check if in production environment
 *
 * @returns True if production, false otherwise
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if in development environment
 *
 * @returns True if development, false otherwise
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if localStorage is available
 *
 * @returns True if localStorage available, false otherwise
 */
export const hasLocalStorage = (): boolean => {
  return isBrowser() && 'localStorage' in window;
};

/**
 * Check if sessionStorage is available
 *
 * @returns True if sessionStorage available, false otherwise
 */
export const hasSessionStorage = (): boolean => {
  return isBrowser() && 'sessionStorage' in window;
};
