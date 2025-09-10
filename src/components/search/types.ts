import type { ReactNode } from 'react';

import type { SearchData } from '@/contexts/SearchContext';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Search Bar Types
export type SearchBarVariant = 'hero' | 'header' | 'compact';

export interface SearchBarBaseProps extends BaseComponentProps {
  variant?: SearchBarVariant;
  onSearch?: (searchData: SearchData) => void;
  isDocked?: boolean;
}

// Location Types
export type LocationType = 'city' | 'country' | 'region' | 'landmark' | 'airport';

export interface LocationSuggestion {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  coordinates?: {
    lat: number;
    lng: number;
  };
  countryCode?: string;
  timezone?: string;
}

export interface LocationInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  suggestions?: LocationSuggestion[];
  maxSuggestions?: number;
  debounceMs?: number;
  autoComplete?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Date Types
export type DateSelectionMode = 'single' | 'range';
export type DatePickerVariant = 'compact' | 'enhanced' | 'inline';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DatePickerBaseProps extends BaseComponentProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  variant?: DatePickerVariant;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  excludeDates?: Date[];
  locale?: string;
}

export interface DatePickerPopupProps extends DatePickerBaseProps {
  isOpen?: boolean;
  onClose?: () => void;
  focusedField?: 'check-in' | 'check-out';
  showHeader?: boolean;
  autoClose?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
}

export interface CalendarProps extends BaseComponentProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  checkIn?: Date | null;
  checkOut?: Date | null;
  selectingCheckOut?: boolean;
  monthOffset?: number;
  showNavigation?: boolean;
  minDate?: Date;
  maxDate?: Date;
  excludeDates?: Date[];
  locale?: string;
}

// Guest Types
export type GuestType = 'adults' | 'children' | 'infants';

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface GuestLimits {
  maxTotal: number;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  minAdults: number;
}

export interface GuestCounterProps extends BaseComponentProps {
  label: string;
  description: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export interface GuestSelectorProps extends BaseComponentProps {
  guests: GuestCounts;
  onChange: (guests: GuestCounts) => void;
  limits?: Partial<GuestLimits>;
  variant?: 'full' | 'compact';
  isOpenByDefault?: boolean;
  showMaxGuestWarning?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Hook Types
export interface UseClickOutsideOptions {
  enabled?: boolean;
  excludeSelectors?: string[];
}

export interface UseDateSelectionOptions {
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
  onDateSelect?: (checkIn: Date | null, checkOut: Date | null) => void;
  autoProgressToCheckOut?: boolean;
  minDate?: Date;
  maxDate?: Date;
  excludeDates?: Date[];
}

export interface UseGuestCounterOptions {
  guests: GuestCounts;
  onChange: (guests: GuestCounts) => void;
  limits?: Partial<GuestLimits>;
}

export interface UseKeyboardNavigationOptions<T> {
  items: T[];
  onSelect: (item: T, index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
  loop?: boolean;
  enabled?: boolean;
}

// Search Context Types
export interface SearchContextValue {
  searchData: SearchData;
  updateSearchData: (data: Partial<SearchData>) => void;
  updateLocation: (location: string) => void;
  updateDates: (checkIn: Date | null, checkOut: Date | null) => void;
  updateGuests: (guests: GuestCounts) => void;
  resetSearch: () => void;
  onSearch?: (searchData: SearchData) => void;
  setOnSearch: (callback: (searchData: SearchData) => void) => void;
  isLoading?: boolean;
  error?: string | null;
}

// Utility Types
export type Theme = 'light' | 'dark' | 'auto';

export interface StyleVariant {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ghost' | 'outline' | 'filled';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Event Types
export type SearchBarEvent =
  | { type: 'search'; payload: SearchData }
  | { type: 'field-focus'; payload: { field: string } }
  | { type: 'field-blur'; payload: { field: string } }
  | { type: 'reset'; payload: null };

export type LocationEvent =
  | { type: 'input-change'; payload: { value: string } }
  | { type: 'suggestion-select'; payload: { suggestion: LocationSuggestion } }
  | { type: 'suggestion-hover'; payload: { suggestion: LocationSuggestion; index: number } }
  | { type: 'clear'; payload: null };

export type DateEvent =
  | { type: 'date-select'; payload: { date: Date; field: 'check-in' | 'check-out' } }
  | { type: 'range-select'; payload: { checkIn: Date | null; checkOut: Date | null } }
  | { type: 'month-change'; payload: { month: Date } }
  | { type: 'clear'; payload: null };

export type GuestEvent =
  | { type: 'increment'; payload: { type: GuestType } }
  | { type: 'decrement'; payload: { type: GuestType } }
  | { type: 'set'; payload: { guests: GuestCounts } }
  | { type: 'reset'; payload: null };

// Error Types
export interface SearchError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  props: Record<string, any>;
  timestamp: number;
}

// Configuration Types
export interface SearchBarConfig {
  features: {
    location: boolean;
    dates: boolean;
    guests: boolean;
    filters: boolean;
  };
  limits: {
    maxSuggestions: number;
    maxGuests: number;
    debounceMs: number;
  };
  ui: {
    theme: Theme;
    animations: boolean;
    compactMode: boolean;
  };
  accessibility: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
  };
}
