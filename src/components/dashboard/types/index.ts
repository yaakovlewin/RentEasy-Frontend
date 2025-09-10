/**
 * Dashboard Types - Barrel Exports
 * 
 * Clean, organized exports for all dashboard-related types and interfaces.
 * This provides a single import point for consuming components.
 */

// Export all dashboard types
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
  DashboardBreakpoints,

  // Re-exported from API
  Booking,
} from './dashboard';