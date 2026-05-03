// Calendar Constants
export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
export const CALENDAR_GRID_COLS = 7;
export const MONTHS_TO_SHOW = 2;

// Guest Limits
export const GUEST_LIMITS = {
  MAX_TOTAL_GUESTS: 16,
  MIN_ADULTS: 1,
  MIN_CHILDREN: 0,
  MIN_INFANTS: 0,
} as const;

// Date Formats
export const DATE_FORMATS = {
  MONTH_YEAR: 'MMMM yyyy',
  MONTH_DAY: 'MMM d',
  MONTH_DAY_YEAR: 'MMM d, yyyy',
  DAY: 'd',
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 50,
  MODAL: 60,
  POPOVER: 60,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  CLOSE_DELAY: 200,
  HOVER_DELAY: 150,
} as const;

// Component Sizes
export const SIZES = {
  CALENDAR_DAY: 'w-10 h-10',
  CALENDAR_WEEKDAY: 'w-10 h-8',
  GUEST_SELECTOR_WIDTH: 'w-80',
  SEARCH_BAR_MAX_WIDTH: {
    HERO: 'max-w-4xl',
    HEADER: 'max-w-2xl',
  },
} as const;

// Location Suggestions
export const MAX_LOCATION_SUGGESTIONS = 6;

// Default Location Suggestions Data
export const DEFAULT_LOCATION_SUGGESTIONS = [
  { id: '1', name: 'Paris', description: 'France', type: 'city' as const, coordinates: { lat: 48.8566, lng: 2.3522 } },
  { id: '2', name: 'London', description: 'United Kingdom', type: 'city' as const, coordinates: { lat: 51.5074, lng: -0.1278 } },
  { id: '3', name: 'New York', description: 'New York, United States', type: 'city' as const, coordinates: { lat: 40.7128, lng: -74.0060 } },
  { id: '4', name: 'Tokyo', description: 'Japan', type: 'city' as const, coordinates: { lat: 35.6762, lng: 139.6503 } },
  { id: '5', name: 'Barcelona', description: 'Spain', type: 'city' as const, coordinates: { lat: 41.3851, lng: 2.1734 } },
  { id: '6', name: 'Rome', description: 'Italy', type: 'city' as const, coordinates: { lat: 41.9028, lng: 12.4964 } },
  { id: '7', name: 'Amsterdam', description: 'Netherlands', type: 'city' as const, coordinates: { lat: 52.3676, lng: 4.9041 } },
  { id: '8', name: 'Berlin', description: 'Germany', type: 'city' as const, coordinates: { lat: 52.5200, lng: 13.4050 } },
  { id: '9', name: 'Sydney', description: 'Australia', type: 'city' as const, coordinates: { lat: -33.8688, lng: 151.2093 } },
  { id: '10', name: 'Los Angeles', description: 'California, United States', type: 'city' as const, coordinates: { lat: 34.0522, lng: -118.2437 } },
] as const;

// Styling Classes
export const COMMON_CLASSES = {
  BUTTON_HOVER: 'hover:bg-gray-50',
  ROUNDED_FULL: 'rounded-full',
  TRANSITION: 'transition-colors duration-200',
  SHADOW_DROPDOWN: 'shadow-xl',
  BORDER_DEFAULT: 'border border-gray-200',
} as const;

// Search Bar Variants
export type SearchBarVariant = 'hero' | 'header' | 'compact';

// Date Selection States
export type DateSelectionState = 'check-in' | 'check-out' | null;
