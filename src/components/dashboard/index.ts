/**
 * Dashboard Module - Main Barrel Export
 * 
 * Single entry point for the entire dashboard component system.
 * Provides clean imports for all dashboard-related functionality.
 * 
 * Usage:
 * ```typescript
 * import { 
 *   DashboardNavigation,
 *   DashboardProfile,
 *   useDashboardData,
 *   getBookingStatusInfo,
 *   DashboardTab
 * } from '@/components/dashboard';
 * ```
 */

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export {
  DashboardNavigation,
  DashboardProfile,
  DashboardBookings,
  DashboardFavorites,
  DashboardFavoritesWithErrorBoundary,
  DashboardSettings,
  DashboardSettingsWithErrorBoundary
} from './components';

// =============================================================================
// HOOK EXPORTS
// =============================================================================

export {
  useDashboardData,
  useDashboardUser,
  useDashboardLoading,
  useDashboardErrors
} from './hooks';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Core dashboard types
  DashboardTab,
  DashboardLoadingStates,
  DashboardErrorStates,

  // Booking types
  BookingDisplay,
  BookingTabType,
  BookingStatusInfo,
  BookingActions,

  // Favorites types
  FavoriteProperty,
  FavoritesState,

  // Profile types
  ProfileEditingField,
  ProfileData,
  ProfileEditingState,

  // Settings types
  NotificationSettings,
  PrivacySettings,
  SecuritySettings,
  AccountSettings,

  // Navigation types
  DashboardNavItem,
  UserProfileSummary,

  // Statistics types
  DashboardStats,

  // Component props types
  BaseDashboardComponentProps,
  DashboardNavigationProps,
  DashboardBookingsProps,
  DashboardFavoritesProps,
  DashboardProfileProps,
  DashboardSettingsProps,

  // Hook return types
  UseDashboardDataReturn,
  UseBookingHistoryReturn,
  UseFavoritesManagerReturn,
  UseProfileEditorReturn,
  UseNotificationSettingsReturn,

  // Utility types
  DashboardTheme,
  DashboardBreakpoints
} from './types';

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

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
  createDefaultErrorStates,

  // Constants
  DASHBOARD_TABS,
  DEFAULT_ACTIVE_TAB,
  TAB_LABELS,
  BOOKING_STATUS_CONFIG,
  BOOKING_TAB_TYPES,
  DEFAULT_REFUND_PERCENTAGE,
  MAX_BOOKINGS_PER_PAGE,
  EDITABLE_PROFILE_FIELDS,
  PROFILE_FIELD_LIMITS,
  REQUIRED_PROFILE_FIELDS,
  PROFILE_PHOTO_CONFIG,
  MAX_FAVORITES_COUNT,
  FAVORITES_PER_PAGE,
  FAVORITES_GRID_CONFIG,
  NOTIFICATION_TYPES,
  PRIVACY_SETTINGS,
  SECURITY_SETTINGS,
  DASHBOARD_BREAKPOINTS,
  DASHBOARD_THEME,
  LOADING_CONFIG,
  ANIMATION_DURATIONS,
  REFRESH_INTERVALS,
  CACHE_TTL,
  RETRY_CONFIG,
  EMAIL_REGEX,
  PHONE_REGEX,
  NAME_VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DASHBOARD_FEATURES,
  LOCALIZATION_KEYS
} from './utils';