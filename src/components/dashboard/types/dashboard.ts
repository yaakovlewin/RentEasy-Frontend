/**
 * Dashboard Types and Interfaces
 * 
 * Comprehensive TypeScript definitions for the Dashboard component system.
 * This file provides type safety across all dashboard-related components and hooks.
 */

import type { Booking } from '@/lib/api';

// =============================================================================
// CORE DASHBOARD TYPES
// =============================================================================

/**
 * Main dashboard tabs available to users
 */
export type DashboardTab = 'bookings' | 'favorites' | 'profile' | 'settings';

/**
 * Dashboard loading states for different sections
 */
export interface DashboardLoadingStates {
  /** Overall dashboard loading state */
  isLoading: boolean;
  /** Bookings section loading */
  bookingsLoading: boolean;
  /** Favorites section loading */
  favoritesLoading: boolean;
  /** Profile section loading */
  profileLoading: boolean;
  /** Settings section loading */
  settingsLoading: boolean;
  /** Specific booking cancellation loading */
  isCancelling: string | null;
}

/**
 * Dashboard error states with specific error handling
 */
export interface DashboardErrorStates {
  /** General dashboard error */
  dashboardError: Error | null;
  /** Bookings-specific errors */
  bookingsError: Error | null;
  /** Favorites-specific errors */
  favoritesError: Error | null;
  /** Profile-specific errors */
  profileError: Error | null;
  /** Settings-specific errors */
  settingsError: Error | null;
}

// =============================================================================
// BOOKING TYPES
// =============================================================================

/**
 * Extended booking interface for dashboard display with additional UI fields
 * Extends the base Booking interface with display-specific properties
 */
export interface BookingDisplay extends Booking {
  /** Property title for display */
  propertyTitle?: string;
  /** Property image URL */
  propertyImage?: string;
  /** Property location string */
  propertyLocation?: string;
  /** Host name for display */
  hostName?: string;
  /** Host profile image URL */
  hostImage?: string;
  /** Formatted check-in date (maps from checkInDate) */
  checkIn: string;
  /** Formatted check-out date (maps from checkOutDate) */
  checkOut: string;
  /** Number of guests (maps from numberOfGuests) */
  guests: number;
  /** Location for display purposes */
  location?: string;
  /** Booking date for display purposes */
  bookingDate?: string;
}

/**
 * Booking tab types for filtering
 */
export type BookingTabType = 'upcoming' | 'past' | 'cancelled';

/**
 * Booking status with associated styling information
 */
export interface BookingStatusInfo {
  /** Status value */
  status: Booking['status'];
  /** CSS classes for styling */
  colorClass: string;
  /** Icon component type for status */
  icon: React.ComponentType<{ className?: string }>;
  /** Display label */
  label: string;
}

/**
 * Booking actions available per status
 */
export interface BookingActions {
  /** Can view booking details */
  canView: boolean;
  /** Can message host */
  canMessage: boolean;
  /** Can cancel booking */
  canCancel: boolean;
  /** Can leave review */
  canReview: boolean;
  /** Can book again */
  canBookAgain: boolean;
}

// =============================================================================
// FAVORITES TYPES
// =============================================================================

/**
 * Favorite property interface for dashboard display
 */
export interface FavoriteProperty {
  /** Unique property identifier */
  id: string;
  /** Property title */
  title: string;
  /** Property location */
  location: string;
  /** Price per night */
  price: number;
  /** Property rating */
  rating: number;
  /** Number of reviews */
  reviews: number;
  /** Property image URL */
  image: string;
  /** Date when property was saved */
  saved: string;
  /** Property type for filtering */
  propertyType?: 'apartment' | 'house' | 'villa' | 'cottage' | 'loft';
  /** Availability status */
  isAvailable?: boolean;
}

/**
 * Favorites management actions and state
 */
export interface FavoritesState {
  /** List of favorite properties */
  favorites: FavoriteProperty[];
  /** Loading state for favorites operations */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Currently processing favorite (add/remove) */
  processingId: string | null;
}

// =============================================================================
// PROFILE TYPES
// =============================================================================

/**
 * Profile editing field types
 */
export type ProfileEditingField = 'name' | 'phone' | 'bio' | 'location' | 'profilePhoto' | null;

/**
 * User profile data with editing states
 */
export interface ProfileData {
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's email address */
  email?: string;
  /** User's phone number */
  phoneNumber?: string;
  /** User's bio/description */
  bio?: string;
  /** User's location */
  location?: string;
  /** Profile photo URL */
  profilePhoto?: string;
  /** Account creation date */
  memberSince?: string;
  /** Account role */
  role?: 'guest' | 'owner' | 'staff' | 'admin';
  /** Verification status */
  isVerified?: boolean;
  /** Phone verification status */
  isPhoneVerified?: boolean;
  /** Email verification status */
  isEmailVerified?: boolean;
}

/**
 * Profile editing state management
 */
export interface ProfileEditingState {
  /** Currently editing field */
  editingField: ProfileEditingField;
  /** Temporary value for editing */
  tempValue: string;
  /** Profile save loading state */
  isSaving: boolean;
  /** Validation errors */
  validationErrors: Record<string, string>;
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

/**
 * Notification settings configuration
 */
export interface NotificationSettings {
  /** Email notifications enabled */
  emailNotifications: boolean;
  /** Push notifications enabled */
  pushNotifications: boolean;
  /** SMS notifications enabled */
  smsNotifications: boolean;
  /** Marketing emails enabled */
  marketingEmails: boolean;
}

/**
 * Privacy and visibility settings
 */
export interface PrivacySettings {
  /** Profile visibility to others */
  profileVisible: boolean;
  /** Show activity status */
  showActivityStatus: boolean;
  /** Allow direct messages */
  allowMessages: boolean;
}

/**
 * Security settings and status
 */
export interface SecuritySettings {
  /** Password last updated date */
  passwordLastUpdated?: string;
  /** Two-factor authentication enabled */
  twoFactorEnabled: boolean;
  /** Login activity tracking */
  loginActivityEnabled: boolean;
}

/**
 * Complete account settings
 */
export interface AccountSettings {
  /** Notification preferences */
  notifications: NotificationSettings;
  /** Privacy preferences */
  privacy: PrivacySettings;
  /** Security preferences */
  security: SecuritySettings;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

/**
 * Dashboard navigation item
 */
export interface DashboardNavItem {
  /** Tab identifier */
  id: DashboardTab;
  /** Display label */
  label: string;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Badge count (optional) */
  badge?: number;
  /** Whether item is enabled */
  enabled: boolean;
}

/**
 * User profile summary for navigation sidebar
 */
export interface UserProfileSummary {
  /** User's display name */
  displayName: string;
  /** User's email */
  email: string;
  /** Profile image URL */
  profileImage?: string;
  /** Membership type */
  membershipType: 'Free' | 'Premium' | 'Premium Plus';
  /** User role */
  role: 'guest' | 'owner' | 'staff' | 'admin';
  /** Verification status */
  isVerified: boolean;
}

// =============================================================================
// STATISTICS & ANALYTICS TYPES
// =============================================================================

/**
 * Dashboard statistics for user overview
 */
export interface DashboardStats {
  /** Total bookings count */
  totalBookings: number;
  /** Upcoming bookings count */
  upcomingBookings: number;
  /** Total spent amount */
  totalSpent: number;
  /** Saved properties count */
  savedProperties: number;
  /** Reviews given count */
  reviewsGiven: number;
  /** Account age in months */
  accountAgeMonths: number;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

/**
 * Common dashboard component props
 */
export interface BaseDashboardComponentProps {
  /** Whether component is currently active/visible */
  isActive: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Props for dashboard navigation component
 */
export interface DashboardNavigationProps extends BaseDashboardComponentProps {
  /** User profile summary */
  userProfile: UserProfileSummary;
  /** Currently active tab */
  activeTab: DashboardTab;
  /** Tab change handler */
  onTabChange: (tab: DashboardTab) => void;
  /** Navigation items */
  navItems: DashboardNavItem[];
  /** Logout handler */
  onLogout: () => Promise<void>;
}

/**
 * Props for dashboard bookings component
 */
export interface DashboardBookingsProps extends BaseDashboardComponentProps {
  /** List of booking displays */
  bookings: BookingDisplay[];
  /** Booking cancellation handler */
  onCancelBooking: (bookingId: string) => Promise<void>;
  /** Currently cancelling booking ID */
  cancellingBookingId: string | null;
}

/**
 * Props for dashboard favorites component
 */
export interface DashboardFavoritesProps extends BaseDashboardComponentProps {
  /** Favorites state */
  favoritesState: FavoritesState;
  /** Remove favorite handler */
  onRemoveFavorite: (propertyId: string) => Promise<void>;
}

/**
 * Props for dashboard profile component
 */
export interface DashboardProfileProps extends BaseDashboardComponentProps {
  /** Profile data */
  profileData: ProfileData;
  /** Profile editing state */
  editingState: ProfileEditingState;
  /** Field edit handler */
  onEditField: (field: ProfileEditingField) => void;
  /** Profile save handler */
  onSaveProfile: (updates: Partial<ProfileData>) => Promise<void>;
  /** Cancel edit handler */
  onCancelEdit: () => void;
}

/**
 * Props for dashboard settings component
 */
export interface DashboardSettingsProps extends BaseDashboardComponentProps {
  /** Current account settings */
  settings: AccountSettings;
  /** Settings update handler */
  onUpdateSettings: (updates: Partial<AccountSettings>) => Promise<void>;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

/**
 * Return type for useDashboardData hook
 */
export interface UseDashboardDataReturn {
  /** Current user data */
  user: ProfileData | null;
  /** User bookings data */
  bookings: any[];
  /** User favorites data */
  favorites: any[];
  /** Dashboard loading states */
  loading: DashboardLoadingStates;
  /** Dashboard error states */
  errors: DashboardErrorStates;
  /** Refresh data function */
  refreshData: () => Promise<void>;
  /** Update user profile */
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
}

/**
 * Return type for useBookingHistory hook
 */
export interface UseBookingHistoryReturn {
  /** List of booking displays */
  bookings: BookingDisplay[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Cancel booking function */
  cancelBooking: (bookingId: string) => Promise<void>;
  /** Currently cancelling booking */
  cancellingBookingId: string | null;
  /** Refresh bookings */
  refreshBookings: () => Promise<void>;
}

/**
 * Return type for useFavoritesManager hook
 */
export interface UseFavoritesManagerReturn {
  /** Favorites state */
  favoritesState: FavoritesState;
  /** Add favorite function */
  addFavorite: (propertyId: string) => Promise<void>;
  /** Remove favorite function */
  removeFavorite: (propertyId: string) => Promise<void>;
  /** Refresh favorites */
  refreshFavorites: () => Promise<void>;
}

/**
 * Return type for useProfileEditor hook
 */
export interface UseProfileEditorReturn {
  /** Profile data */
  profileData: ProfileData;
  /** Editing state */
  editingState: ProfileEditingState;
  /** Start editing field */
  startEditing: (field: ProfileEditingField) => void;
  /** Cancel editing */
  cancelEditing: () => void;
  /** Save profile changes */
  saveProfile: (updates: Partial<ProfileData>) => Promise<void>;
  /** Update temp value */
  updateTempValue: (value: string) => void;
}

/**
 * Return type for useNotificationSettings hook
 */
export interface UseNotificationSettingsReturn {
  /** Current settings */
  settings: AccountSettings;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Update settings function */
  updateSettings: (updates: Partial<AccountSettings>) => Promise<void>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Dashboard theme configuration
 */
export interface DashboardTheme {
  /** Primary color scheme */
  primaryColor: string;
  /** Secondary color scheme */
  secondaryColor: string;
  /** Background colors */
  backgroundColor: string;
  /** Border radius */
  borderRadius: string;
}

/**
 * Dashboard responsive breakpoints
 */
export interface DashboardBreakpoints {
  /** Mobile breakpoint */
  mobile: string;
  /** Tablet breakpoint */
  tablet: string;
  /** Desktop breakpoint */
  desktop: string;
  /** Large desktop breakpoint */
  large: string;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export for convenience
  Booking,
} from '@/lib/api';