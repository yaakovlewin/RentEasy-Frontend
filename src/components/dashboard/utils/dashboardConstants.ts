/**
 * Dashboard Constants and Configurations
 * 
 * Centralized constants for dashboard components.
 * Provides consistent configuration across all dashboard features.
 */

import type { DashboardTab, DashboardBreakpoints, DashboardTheme } from '../types';

// =============================================================================
// TAB CONFIGURATION
// =============================================================================

/**
 * Valid dashboard tab identifiers
 */
export const DASHBOARD_TABS: DashboardTab[] = [
  'bookings',
  'favorites', 
  'profile',
  'settings'
];

/**
 * Default active tab when dashboard loads
 */
export const DEFAULT_ACTIVE_TAB: DashboardTab = 'bookings';

/**
 * Tab display labels
 */
export const TAB_LABELS: Record<DashboardTab, string> = {
  bookings: 'My Bookings',
  favorites: 'Saved Places',
  profile: 'Profile Settings',
  settings: 'Account Settings'
} as const;

// =============================================================================
// BOOKING CONFIGURATION
// =============================================================================

/**
 * Booking status display configuration
 */
export const BOOKING_STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    color: 'green',
    priority: 1
  },
  pending: {
    label: 'Pending',
    color: 'yellow',
    priority: 2
  },
  completed: {
    label: 'Completed',
    color: 'blue',
    priority: 3
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    priority: 4
  }
} as const;

/**
 * Booking tab types for filtering
 */
export const BOOKING_TAB_TYPES = [
  'upcoming',
  'past', 
  'cancelled'
] as const;

/**
 * Default refund percentage for cancellations
 */
export const DEFAULT_REFUND_PERCENTAGE = 0.8;

/**
 * Maximum number of bookings to display per page
 */
export const MAX_BOOKINGS_PER_PAGE = 10;

// =============================================================================
// PROFILE CONFIGURATION
// =============================================================================

/**
 * Profile fields that can be edited inline
 */
export const EDITABLE_PROFILE_FIELDS = [
  'name',
  'phone',
  'bio',
  'location',
  'profilePhoto'
] as const;

/**
 * Maximum lengths for profile fields
 */
export const PROFILE_FIELD_LIMITS = {
  firstName: 50,
  lastName: 50,
  bio: 500,
  location: 100,
  phoneNumber: 20
} as const;

/**
 * Required profile fields for completion calculation
 */
export const REQUIRED_PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'bio',
  'location'
] as const;

/**
 * Profile photo configuration
 */
export const PROFILE_PHOTO_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  dimensions: {
    min: { width: 100, height: 100 },
    max: { width: 2000, height: 2000 }
  }
} as const;

// =============================================================================
// FAVORITES CONFIGURATION
// =============================================================================

/**
 * Maximum number of favorites per user
 */
export const MAX_FAVORITES_COUNT = 50;

/**
 * Default number of favorites to display per page
 */
export const FAVORITES_PER_PAGE = 12;

/**
 * Favorite property display grid configurations
 */
export const FAVORITES_GRID_CONFIG = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  large: 4
} as const;

// =============================================================================
// SETTINGS CONFIGURATION
// =============================================================================

/**
 * Notification types available in settings
 */
export const NOTIFICATION_TYPES = [
  'emailNotifications',
  'pushNotifications', 
  'smsNotifications',
  'marketingEmails'
] as const;

/**
 * Privacy settings options
 */
export const PRIVACY_SETTINGS = [
  'profileVisible',
  'showActivityStatus',
  'allowMessages'
] as const;

/**
 * Security settings options
 */
export const SECURITY_SETTINGS = [
  'twoFactorEnabled',
  'loginActivityEnabled'
] as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * Dashboard responsive breakpoints
 */
export const DASHBOARD_BREAKPOINTS: DashboardBreakpoints = {
  mobile: '640px',
  tablet: '768px',  
  desktop: '1024px',
  large: '1280px'
};

/**
 * Dashboard theme configuration
 */
export const DASHBOARD_THEME: DashboardTheme = {
  primaryColor: 'hsl(var(--primary))',
  secondaryColor: 'hsl(var(--secondary))',
  backgroundColor: 'hsl(var(--background))',
  borderRadius: '0.5rem'
};

/**
 * Loading skeleton configuration
 */
export const LOADING_CONFIG = {
  skeletonHeight: 'h-32',
  skeletonCount: 3,
  animationDuration: '1.5s',
  fadeInDuration: '0.3s'
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  pageTransition: 200
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * Dashboard data refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  bookings: 30000, // 30 seconds
  favorites: 60000, // 1 minute  
  profile: 300000, // 5 minutes
  settings: 300000 // 5 minutes
} as const;

/**
 * Cache TTL for dashboard data (in minutes)
 */
export const CACHE_TTL = {
  bookings: 5,
  favorites: 10,
  profile: 30,
  settings: 60
} as const;

/**
 * Retry configuration for API calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1000,
  backoffMultiplier: 2
} as const;

// =============================================================================
// VALIDATION CONFIGURATION
// =============================================================================

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (international format)
 */
export const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Name validation configuration
 */
export const NAME_VALIDATION = {
  minLength: 2,
  maxLength: 50,
  allowedChars: /^[a-zA-Z\s\-'\.]*$/
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * Standard error messages for dashboard operations
 */
export const ERROR_MESSAGES = {
  // General errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  
  // Authentication errors
  AUTH_REQUIRED: 'You must be logged in to access this feature.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Booking errors
  BOOKING_CANCEL_FAILED: 'Failed to cancel booking. Please try again.',
  BOOKING_LOAD_FAILED: 'Failed to load bookings. Please refresh the page.',
  
  // Favorites errors
  FAVORITE_ADD_FAILED: 'Failed to add to favorites. Please try again.',
  FAVORITE_REMOVE_FAILED: 'Failed to remove from favorites. Please try again.',
  
  // Profile errors
  PROFILE_SAVE_FAILED: 'Failed to save profile changes. Please try again.',
  PROFILE_LOAD_FAILED: 'Failed to load profile. Please refresh the page.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  
  // Settings errors
  SETTINGS_SAVE_FAILED: 'Failed to save settings. Please try again.',
  SETTINGS_LOAD_FAILED: 'Failed to load settings. Please refresh the page.'
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

/**
 * Standard success messages for dashboard operations
 */
export const SUCCESS_MESSAGES = {
  BOOKING_CANCELLED: 'Booking successfully cancelled.',
  FAVORITE_ADDED: 'Property added to favorites.',
  FAVORITE_REMOVED: 'Property removed from favorites.',
  PROFILE_SAVED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  TWO_FACTOR_ENABLED: 'Two-factor authentication enabled.',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled.'
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

/**
 * Feature flags for dashboard functionality
 * Can be used to toggle features on/off without code changes
 */
export const DASHBOARD_FEATURES = {
  ENABLE_FAVORITES: true,
  ENABLE_REVIEWS: true,
  ENABLE_MESSAGING: true,
  ENABLE_TWO_FACTOR: true,
  ENABLE_ACTIVITY_STATUS: false,
  ENABLE_DARK_MODE: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true
} as const;

// =============================================================================
// LOCALIZATION KEYS
// =============================================================================

/**
 * Localization keys for dashboard text
 * Can be extended for internationalization
 */
export const LOCALIZATION_KEYS = {
  DASHBOARD_TITLE: 'dashboard.title',
  WELCOME_MESSAGE: 'dashboard.welcome',
  BOOKINGS_TAB: 'dashboard.tabs.bookings',
  FAVORITES_TAB: 'dashboard.tabs.favorites',
  PROFILE_TAB: 'dashboard.tabs.profile',
  SETTINGS_TAB: 'dashboard.tabs.settings'
} as const;