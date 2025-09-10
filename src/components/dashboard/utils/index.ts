/**
 * Dashboard Utils - Barrel Exports
 * 
 * Clean, organized exports for all dashboard utility functions and constants.
 * Provides a single import point for consuming components.
 */

// Export all helper functions
export {
  // Booking status utilities
  getBookingStatusColor,
  getBookingStatusIcon,
  getBookingStatusInfo,
  getBookingActions,

  // Navigation utilities
  getDashboardNavItems,
  canAccessHostDashboard,

  // Profile utilities
  generateUserProfileSummary,
  getProfileCompletionPercentage,
  validateProfileField,

  // Settings utilities
  getDefaultNotificationSettings,
  getDefaultPrivacySettings,
  getDefaultSecuritySettings,

  // Formatting utilities
  formatMembershipType,
  formatUserRole,
  formatRefundAmount,

  // Statistics utilities
  calculateAccountAge,
  getUserActivityLevel,

  // State utilities
  createDefaultLoadingStates,
  createDefaultErrorStates
} from './dashboardHelpers';

// Export all constants
export {
  // Tab configuration
  DASHBOARD_TABS,
  DEFAULT_ACTIVE_TAB,
  TAB_LABELS,

  // Booking configuration
  BOOKING_STATUS_CONFIG,
  BOOKING_TAB_TYPES,
  DEFAULT_REFUND_PERCENTAGE,
  MAX_BOOKINGS_PER_PAGE,

  // Profile configuration
  EDITABLE_PROFILE_FIELDS,
  PROFILE_FIELD_LIMITS,
  REQUIRED_PROFILE_FIELDS,
  PROFILE_PHOTO_CONFIG,

  // Favorites configuration
  MAX_FAVORITES_COUNT,
  FAVORITES_PER_PAGE,
  FAVORITES_GRID_CONFIG,

  // Settings configuration
  NOTIFICATION_TYPES,
  PRIVACY_SETTINGS,
  SECURITY_SETTINGS,

  // UI configuration
  DASHBOARD_BREAKPOINTS,
  DASHBOARD_THEME,
  LOADING_CONFIG,
  ANIMATION_DURATIONS,

  // API configuration
  REFRESH_INTERVALS,
  CACHE_TTL,
  RETRY_CONFIG,

  // Validation configuration
  EMAIL_REGEX,
  PHONE_REGEX,
  NAME_VALIDATION,

  // Messages
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,

  // Feature flags
  DASHBOARD_FEATURES,

  // Localization
  LOCALIZATION_KEYS
} from './dashboardConstants';