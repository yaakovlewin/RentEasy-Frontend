/**
 * Dashboard Helper Functions
 * 
 * Shared utility functions for dashboard components.
 * Extracted from the original monolithic DashboardContent.tsx for reusability.
 */

import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  Heart,
  User,
  Settings,
  Home,
  Shield,
  Bell
} from 'lucide-react';

import type { 
  Booking, 
  BookingStatusInfo, 
  BookingActions,
  DashboardNavItem,
  DashboardTab,
  UserProfileSummary,
  ProfileData 
} from '../types';

// =============================================================================
// BOOKING STATUS UTILITIES
// =============================================================================

/**
 * Get the CSS classes for a booking status badge
 * @param status - The booking status
 * @returns CSS classes for styling the status badge
 */
export function getBookingStatusColor(status: Booking['status']): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get the icon component type for a booking status
 * @param status - The booking status
 * @returns Icon component type
 */
export function getBookingStatusIcon(status: Booking['status']): React.ComponentType<{ className?: string }> {
  switch (status) {
    case 'confirmed':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'cancelled':
      return XCircle;
    case 'completed':
      return CheckCircle;
    default:
      return AlertCircle;
  }
}

/**
 * Get complete status information for a booking
 * @param status - The booking status
 * @returns Complete status information including color, icon component, and label
 */
export function getBookingStatusInfo(status: Booking['status']): BookingStatusInfo {
  const IconComponent = getBookingStatusIcon(status);
  
  return {
    status,
    colorClass: getBookingStatusColor(status),
    icon: IconComponent,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  };
}

/**
 * Get available actions for a booking based on its status
 * @param status - The booking status
 * @returns Available actions for the booking
 */
export function getBookingActions(status: Booking['status']): BookingActions {
  const baseActions: BookingActions = {
    canView: true,
    canMessage: false,
    canCancel: false,
    canReview: false,
    canBookAgain: false
  };

  switch (status) {
    case 'confirmed':
      return {
        ...baseActions,
        canMessage: true,
        canCancel: false // Note: Can be made configurable based on business rules
      };
    case 'pending':
      return {
        ...baseActions,
        canMessage: true,
        canCancel: true
      };
    case 'completed':
      return {
        ...baseActions,
        canReview: true,
        canBookAgain: true
      };
    case 'cancelled':
      return {
        ...baseActions,
        canBookAgain: true
      };
    default:
      return baseActions;
  }
}

// =============================================================================
// DASHBOARD NAVIGATION UTILITIES
// =============================================================================

/**
 * Get the default navigation items for the dashboard
 * @param bookingCount - Number of bookings (for badge display)
 * @param favoritesCount - Number of favorites (for badge display)
 * @returns Array of navigation items
 */
export function getDashboardNavItems(
  bookingCount: number = 0, 
  favoritesCount: number = 0
): DashboardNavItem[] {
  return [
    {
      id: 'bookings' as DashboardTab,
      label: 'My Bookings',
      icon: Calendar,
      badge: bookingCount > 0 ? bookingCount : undefined,
      enabled: true
    },
    {
      id: 'favorites' as DashboardTab,
      label: 'Saved Places',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      enabled: true
    },
    {
      id: 'profile' as DashboardTab,
      label: 'Profile Settings',
      icon: User,
      enabled: true
    },
    {
      id: 'settings' as DashboardTab,
      label: 'Account Settings',
      icon: Settings,
      enabled: true
    }
  ];
}

/**
 * Check if user has owner role for host dashboard link
 * @param role - User role
 * @returns Whether user can access host dashboard
 */
export function canAccessHostDashboard(role?: string): boolean {
  return role === 'owner';
}

// =============================================================================
// PROFILE UTILITIES
// =============================================================================

/**
 * Generate user profile summary for navigation display
 * @param profileData - Full profile data
 * @returns Summarized profile data for navigation
 */
export function generateUserProfileSummary(profileData: ProfileData | null): UserProfileSummary {
  if (!profileData) {
    return {
      displayName: 'User',
      email: '',
      membershipType: 'Free',
      role: 'guest',
      isVerified: false
    };
  }

  const displayName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}` 
    : profileData.firstName || profileData.email?.split('@')[0] || 'User';

  return {
    displayName,
    email: profileData.email || '',
    profileImage: profileData.profilePhoto,
    membershipType: 'Premium', // Could be dynamic based on user data
    role: profileData.role || 'guest',
    isVerified: profileData.isVerified || false
  };
}

/**
 * Get profile completion percentage
 * @param profileData - Profile data to analyze
 * @returns Completion percentage (0-100)
 */
export function getProfileCompletionPercentage(profileData: ProfileData | null): number {
  if (!profileData) return 0;

  const fields = [
    profileData.firstName,
    profileData.lastName,
    profileData.email,
    profileData.phoneNumber,
    profileData.bio,
    profileData.location,
    profileData.profilePhoto
  ];

  const completedFields = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((completedFields / fields.length) * 100);
}

/**
 * Validate profile field input
 * @param field - Field name
 * @param value - Field value
 * @returns Validation error message or null if valid
 */
export function validateProfileField(field: string, value: string): string | null {
  if (!value || value.trim().length === 0) {
    return null; // Empty is allowed for most fields
  }

  switch (field) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
      
    case 'phoneNumber':
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : 'Please enter a valid phone number';
      
    case 'firstName':
    case 'lastName':
      return value.length >= 2 ? null : 'Name must be at least 2 characters';
      
    case 'bio':
      return value.length <= 500 ? null : 'Bio must be less than 500 characters';
      
    default:
      return null;
  }
}

// =============================================================================
// SETTINGS UTILITIES
// =============================================================================

/**
 * Get default notification settings
 * @returns Default notification settings object
 */
export function getDefaultNotificationSettings() {
  return {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  };
}

/**
 * Get default privacy settings
 * @returns Default privacy settings object
 */
export function getDefaultPrivacySettings() {
  return {
    profileVisible: true,
    showActivityStatus: false,
    allowMessages: true
  };
}

/**
 * Get default security settings
 * @returns Default security settings object
 */
export function getDefaultSecuritySettings() {
  return {
    passwordLastUpdated: new Date().toISOString(),
    twoFactorEnabled: false,
    loginActivityEnabled: true
  };
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format membership type for display
 * @param membershipType - Membership type
 * @returns Formatted membership display string
 */
export function formatMembershipType(membershipType: string | undefined | null): string {
  // Handle undefined or null membershipType
  if (!membershipType) {
    return 'Guest';
  }
  
  switch (membershipType.toLowerCase()) {
    case 'free':
      return 'Free Member';
    case 'premium':
      return 'Premium Member';
    case 'premium plus':
      return 'Premium Plus Member';
    default:
      return 'Member';
  }
}

/**
 * Format user role for display
 * @param role - User role
 * @returns Formatted role display string
 */
export function formatUserRole(role: string | undefined | null): string {
  // Handle undefined or null role
  if (!role) {
    return 'Guest';
  }
  
  switch (role.toLowerCase()) {
    case 'guest':
      return 'Guest';
    case 'owner':
      return 'Host';
    case 'staff':
      return 'Staff Member';
    case 'admin':
      return 'Administrator';
    default:
      return 'User';
  }
}

/**
 * Format booking refund amount based on cancellation policy
 * @param totalPrice - Original booking price
 * @param refundPercentage - Refund percentage (default 80%)
 * @returns Formatted refund amount
 */
export function formatRefundAmount(totalPrice: number, refundPercentage: number = 0.8): string {
  const refundAmount = totalPrice * refundPercentage;
  return `$${refundAmount.toFixed(0)}`;
}

// =============================================================================
// DASHBOARD STATISTICS UTILITIES
// =============================================================================

/**
 * Calculate account age in months
 * @param memberSince - Date when user joined
 * @returns Account age in months
 */
export function calculateAccountAge(memberSince: string | undefined): number {
  if (!memberSince) return 0;
  
  const joinDate = new Date(memberSince);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return diffMonths;
}

/**
 * Get user activity level based on bookings and account age
 * @param bookingCount - Number of bookings
 * @param accountAgeMonths - Account age in months
 * @returns Activity level string
 */
export function getUserActivityLevel(bookingCount: number, accountAgeMonths: number): string {
  const bookingsPerMonth = accountAgeMonths > 0 ? bookingCount / accountAgeMonths : 0;
  
  if (bookingsPerMonth >= 1) return 'Very Active';
  if (bookingsPerMonth >= 0.5) return 'Active';
  if (bookingsPerMonth >= 0.2) return 'Moderate';
  return 'New User';
}

// =============================================================================
// LOADING AND ERROR UTILITIES
// =============================================================================

/**
 * Create default loading states
 * @param initialLoading - Whether dashboard is initially loading
 * @returns Default loading states object
 */
export function createDefaultLoadingStates(initialLoading: boolean = true) {
  return {
    isLoading: initialLoading,
    bookingsLoading: initialLoading,
    favoritesLoading: initialLoading,
    profileLoading: initialLoading,
    settingsLoading: initialLoading,
    isCancelling: null
  };
}

/**
 * Create default error states
 * @returns Default error states object
 */
export function createDefaultErrorStates() {
  return {
    dashboardError: null,
    bookingsError: null,
    favoritesError: null,
    profileError: null,
    settingsError: null
  };
}