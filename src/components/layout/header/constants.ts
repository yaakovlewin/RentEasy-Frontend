/**
 * Header Configuration Constants
 * Centralized configuration following DRY and YAGNI principles
 */

export const HEADER_CONFIG = {
  HEIGHTS: {
    DEFAULT: 'h-20',
    SCROLLED: 'h-20',
    SPACER_DEFAULT: 'h-20',
    SPACER_SCROLLED: 'h-24',
    SPACER_WITH_TABS: 'h-32',
  },
  SCROLL: {
    THRESHOLD: 10,
    THROTTLE: 50,
  },
  RESPONSIVE: {
    DESKTOP_BREAKPOINT: 1024,
  },
} as const;

export interface Category {
  readonly id: string;
  readonly label: string;
}

export const CATEGORIES: readonly Category[] = [
  { id: 'all', label: 'All' },
  { id: 'beachfront', label: 'Beachfront' },
  { id: 'lakefront', label: 'Lakefront' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'city', label: 'City' },
  { id: 'countryside', label: 'Countryside' },
  { id: 'unique', label: 'Unique' },
] as const;
