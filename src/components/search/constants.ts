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
