/**
 * Unit tests for constants
 */
import { describe, expect, it } from 'node:test';

import {
  ANIMATION,
  DATE_FORMATS,
  GUEST_LIMITS,
  MAX_LOCATION_SUGGESTIONS,
  SIZES,
  WEEKDAYS,
  Z_INDEX,
} from '../constants';

describe('Constants Validation', () => {
  it('should have correct weekdays', () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  });

  it('should have reasonable guest limits', () => {
    expect(GUEST_LIMITS.MAX_TOTAL_GUESTS).toBe(16);
    expect(GUEST_LIMITS.MIN_ADULTS).toBe(1);
    expect(GUEST_LIMITS.MIN_CHILDREN).toBe(0);
    expect(GUEST_LIMITS.MIN_INFANTS).toBe(0);
    expect(GUEST_LIMITS.MAX_TOTAL_GUESTS).toBeGreaterThan(GUEST_LIMITS.MIN_ADULTS);
  });

  it('should have date format strings', () => {
    expect(typeof DATE_FORMATS.MONTH_YEAR).toBe('string');
    expect(typeof DATE_FORMATS.MONTH_DAY).toBe('string');
    expect(typeof DATE_FORMATS.MONTH_DAY_YEAR).toBe('string');
    expect(typeof DATE_FORMATS.DAY).toBe('string');
  });

  it('should have z-index values', () => {
    expect(typeof Z_INDEX.DROPDOWN).toBe('number');
    expect(typeof Z_INDEX.MODAL).toBe('number');
    expect(typeof Z_INDEX.POPOVER).toBe('number');
    expect(Z_INDEX.DROPDOWN).toBeGreaterThan(0);
  });

  it('should have animation durations', () => {
    expect(typeof ANIMATION.CLOSE_DELAY).toBe('number');
    expect(typeof ANIMATION.HOVER_DELAY).toBe('number');
    expect(ANIMATION.CLOSE_DELAY).toBeGreaterThan(0);
    expect(ANIMATION.HOVER_DELAY).toBeGreaterThan(0);
  });

  it('should have size configurations', () => {
    expect(typeof SIZES.CALENDAR_DAY).toBe('string');
    expect(typeof SIZES.CALENDAR_WEEKDAY).toBe('string');
    expect(typeof SIZES.GUEST_SELECTOR_WIDTH).toBe('string');
    expect(SIZES.CALENDAR_DAY).toContain('w-');
    expect(SIZES.CALENDAR_DAY).toContain('h-');
  });

  it('should have reasonable max location suggestions', () => {
    expect(typeof MAX_LOCATION_SUGGESTIONS).toBe('number');
    expect(MAX_LOCATION_SUGGESTIONS).toBeGreaterThan(0);
    expect(MAX_LOCATION_SUGGESTIONS).toBeLessThanOrEqual(20); // reasonable upper bound
  });
});
