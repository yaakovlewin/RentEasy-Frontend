/**
 * Unit tests for search utility functions
 * Run with: node --test utils.test.ts
 */
import { describe, expect, it } from 'node:test';

import {
  calculateNights,
  cn,
  formatDateForDisplay,
  formatDateRange,
  formatGuestText,
  formatGuestTextShort,
  getGuestTypeDescription,
  getTotalGuests,
  isDateDisabled,
  isDateInRange,
} from '../utils';

describe('Date Utility Functions', () => {
  it('should format date range correctly', () => {
    const checkIn = new Date('2024-01-15');
    const checkOut = new Date('2024-01-20');

    const result = formatDateRange(checkIn, checkOut);
    expect(result).toBe('Jan 15 - Jan 20');
  });

  it('should handle partial date range', () => {
    const checkIn = new Date('2024-01-15');

    const result = formatDateRange(checkIn, null);
    expect(result).toBe('Jan 15 - Add dates');
  });

  it('should return placeholder for empty dates', () => {
    const result = formatDateRange(null, null, 'Custom placeholder');
    expect(result).toBe('Custom placeholder');
  });

  it('should calculate nights correctly', () => {
    const checkIn = new Date('2024-01-15');
    const checkOut = new Date('2024-01-20');

    const result = calculateNights(checkIn, checkOut);
    expect(result).toBe(5);
  });

  it('should check if date is disabled (past date)', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const result = isDateDisabled(pastDate);
    expect(result).toBe(true);
  });

  it('should check if date is in range', () => {
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-20');
    const dateInRange = new Date('2024-01-17');
    const dateOutOfRange = new Date('2024-01-25');

    expect(isDateInRange(dateInRange, startDate, endDate)).toBe(true);
    expect(isDateInRange(dateOutOfRange, startDate, endDate)).toBe(false);
  });
});

describe('Guest Utility Functions', () => {
  it('should calculate total guests correctly', () => {
    const guests = { adults: 2, children: 1, infants: 1 };

    const result = getTotalGuests(guests);
    expect(result).toBe(3); // infants don't count
  });

  it('should format guest text correctly', () => {
    const guests = { adults: 2, children: 1, infants: 1 };

    const result = formatGuestText(guests);
    expect(result).toBe('3 guests, 1 infant');
  });

  it('should format single guest correctly', () => {
    const guests = { adults: 1, children: 0, infants: 0 };

    const result = formatGuestText(guests);
    expect(result).toBe('1 guest');
  });

  it('should handle no guests', () => {
    const guests = { adults: 0, children: 0, infants: 0 };

    const result = formatGuestText(guests);
    expect(result).toBe('Add guests');
  });

  it('should format guest text short version', () => {
    const guests = { adults: 2, children: 1, infants: 1 };

    const result = formatGuestTextShort(guests);
    expect(result).toBe('3 guests');
  });

  it('should get guest type descriptions', () => {
    expect(getGuestTypeDescription('adults')).toBe('Ages 13 or above');
    expect(getGuestTypeDescription('children')).toBe('Ages 2-12');
    expect(getGuestTypeDescription('infants')).toBe('Under 2');
  });
});

describe('Class Name Utility', () => {
  it('should combine class names correctly', () => {
    const result = cn('class1', 'class2', null, undefined, false, 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
