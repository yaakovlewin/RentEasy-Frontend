// Main search components - Clean Enterprise Architecture
export { SearchBar, type SearchData } from './SearchBar';
export { SearchBarCore } from './SearchBarCore';

// Legacy search bar variants (maintained for backward compatibility)
export { SearchBarCompact } from './SearchBarCompact';
export { SearchBarHeader } from './SearchBarHeader';
export { SearchBarHero } from './SearchBarHero';

// Core search components
export { Calendar } from './Calendar';
export { GuestCounter } from './GuestCounter';
export { GuestSelector } from './GuestSelector';
export { LocationInput } from './LocationInput';
export { UnifiedDatePicker as DatePicker } from './UnifiedDatePicker';

// Legacy component exports removed - files no longer exist

// Utilities and hooks
export * from './hooks';
export * from './utils';

// Constants - explicit exports to avoid conflicts
export {
  ANIMATION,
  CALENDAR_GRID_COLS,
  COMMON_CLASSES,
  DATE_FORMATS,
  GUEST_LIMITS,
  MAX_LOCATION_SUGGESTIONS,
  MONTHS_TO_SHOW,
  SIZES,
  WEEKDAYS,
  Z_INDEX,
  type DateSelectionState,
  type SearchBarVariant as SearchBarVariantFromConstants,
} from './constants';

// Types - explicit exports to avoid conflicts with constants
export type {
  AccessibilityProps,
  BaseComponentProps,
  CalendarProps,
  DateEvent,
  DatePickerBaseProps,
  DatePickerPopupProps,
  DatePickerVariant,
  DateRange,
  DateSelectionMode,
  GuestCounterProps,
  GuestCounts,
  GuestEvent,
  GuestLimits,
  GuestSelectorProps,
  GuestType,
  LocationEvent,
  LocationInputProps,
  LocationSuggestion,
  LocationType,
  PerformanceMetrics,
  SearchBarConfig,
  SearchBarEvent,
  SearchBarVariant,
  SearchContextValue,
  SearchError,
  StyleVariant,
  Theme,
  UseClickOutsideOptions,
  UseDateSelectionOptions,
  UseGuestCounterOptions,
  UseKeyboardNavigationOptions,
} from './types';

// Optimized components
export * from './OptimizedComponents';
