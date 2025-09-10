import { describe, expect, it } from '@jest/globals';

import { cn, generateCSSVariables, responsive } from '../styling';

describe('Styling Utilities', () => {
  describe('cn (className merger)', () => {
    it('should merge basic class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('px-4', 'py-2', 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
      expect(cn('base', 1 > 0 && 'active', 1 < 0 && 'inactive')).toBe('base active');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid');
      expect(cn(undefined, null, 'only-valid')).toBe('only-valid');
    });

    it('should merge conflicting Tailwind classes correctly', () => {
      // twMerge should handle conflicting classes
      expect(cn('px-2 px-4')).toBe('px-4');
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500');
      expect(cn('p-2 px-4')).toBe('p-2 px-4'); // These don't conflict
    });

    it('should handle arrays and objects (clsx features)', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
      expect(cn({ active: true, disabled: false })).toBe('active');
      expect(cn('base', ['array1', 'array2'], { conditional: true })).toBe(
        'base array1 array2 conditional'
      );
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
      expect(cn(null, undefined, false)).toBe('');
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate CSS variables correctly', () => {
      const colors = {
        primary: '#3b82f6',
        secondary: '#10b981',
        danger: '#ef4444',
      };

      const result = generateCSSVariables(colors);
      expect(result).toEqual({
        '--color-primary': '#3b82f6',
        '--color-secondary': '#10b981',
        '--color-danger': '#ef4444',
      });
    });

    it('should handle empty object', () => {
      expect(generateCSSVariables({})).toEqual({});
    });

    it('should handle various color formats', () => {
      const colors = {
        hex: '#ff0000',
        rgb: 'rgb(255, 0, 0)',
        hsl: 'hsl(0, 100%, 50%)',
        named: 'red',
      };

      const result = generateCSSVariables(colors);
      expect(result['--color-hex']).toBe('#ff0000');
      expect(result['--color-rgb']).toBe('rgb(255, 0, 0)');
      expect(result['--color-hsl']).toBe('hsl(0, 100%, 50%)');
      expect(result['--color-named']).toBe('red');
    });
  });

  describe('responsive', () => {
    it('should return base class when no responsive options', () => {
      expect(responsive('text-lg')).toBe('text-lg');
      expect(responsive('p-4', undefined)).toBe('p-4');
      expect(responsive('m-2', {})).toBe('m-2');
    });

    it('should add responsive prefixes correctly', () => {
      const result = responsive('text-base', {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
      });

      expect(result).toBe('text-base sm:text-lg md:text-xl lg:text-2xl');
    });

    it('should handle partial responsive options', () => {
      expect(responsive('p-2', { md: 'p-4', xl: 'p-8' })).toBe('p-2 md:p-4 xl:p-8');

      expect(responsive('grid-cols-1', { lg: 'grid-cols-3' })).toBe('grid-cols-1 lg:grid-cols-3');
    });

    it('should handle all breakpoints', () => {
      const result = responsive('text-xs', {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
      });

      expect(result).toBe('text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl');
    });

    it('should handle complex class combinations', () => {
      const result = responsive('flex flex-col space-y-2', {
        md: 'flex-row space-y-0 space-x-4',
        lg: 'space-x-8',
      });

      expect(result).toBe('flex flex-col space-y-2 md:flex-row space-y-0 space-x-4 lg:space-x-8');
    });

    it('should work with empty base class', () => {
      expect(responsive('', { md: 'block', lg: 'flex' })).toBe(' md:block lg:flex');
    });
  });
});
