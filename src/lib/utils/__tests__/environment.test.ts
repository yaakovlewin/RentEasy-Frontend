/**
 * Environment utilities tests
 */

import {
  isBrowser,
  isServer,
  isLocalhost,
  isProduction,
  isDevelopment,
  hasLocalStorage,
  hasSessionStorage,
} from '../environment';

describe('Environment Utilities', () => {
  describe('isBrowser', () => {
    it('should return true in browser environment', () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe('isServer', () => {
    it('should return false in browser environment', () => {
      expect(isServer()).toBe(false);
    });
  });

  describe('isLocalhost', () => {
    it('should detect localhost correctly', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(isLocalhost()).toBe(true);

      Object.defineProperty(window, 'location', {
        value: { hostname: '127.0.0.1' },
        writable: true,
      });
      expect(isLocalhost()).toBe(true);

      Object.defineProperty(window, 'location', {
        value: { hostname: 'example.com' },
        writable: true,
      });
      expect(isLocalhost()).toBe(false);
    });
  });

  describe('environment checks', () => {
    it('should detect development environment', () => {
      const result = isDevelopment();
      expect(typeof result).toBe('boolean');
    });

    it('should detect production environment', () => {
      const result = isProduction();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('storage availability', () => {
    it('should detect localStorage availability', () => {
      expect(hasLocalStorage()).toBe(true);
    });

    it('should detect sessionStorage availability', () => {
      expect(hasSessionStorage()).toBe(true);
    });
  });
});
