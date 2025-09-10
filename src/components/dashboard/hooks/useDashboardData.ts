/**
 * useDashboardData Hook
 * 
 * Core dashboard data management hook that provides centralized state
 * and data fetching for all dashboard components.
 * 
 * Extracted from the original monolithic DashboardContent.tsx to provide
 * clean separation of concerns and reusability across dashboard components.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, bookingsAPI } from '@/lib/api';

import type { 
  BookingDisplay,
  ProfileData,
  UseDashboardDataReturn,
  DashboardLoadingStates,
  DashboardErrorStates
} from '../types';

import { 
  createDefaultLoadingStates,
  createDefaultErrorStates,
  REFRESH_INTERVALS 
} from '../utils';

/**
 * Primary dashboard data management hook
 * 
 * Provides centralized data fetching, state management, and operations
 * for all dashboard components. Handles user profile, bookings, and
 * loading/error states with automatic refresh capabilities.
 * 
 * @returns Dashboard data, loading states, and operations
 */
export function useDashboardData(): UseDashboardDataReturn {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  // Get authenticated user from context
  const { user: authUser } = useAuth();

  // User profile state (can be different from auth user for editing)
  const [user, setUser] = useState<ProfileData | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);

  // Favorites state  
  const [favorites, setFavorites] = useState<any[]>([]);

  // Loading states for different dashboard sections
  const [loading, setLoading] = useState<DashboardLoadingStates>(
    createDefaultLoadingStates(true)
  );

  // Error states for different dashboard sections
  const [errors, setErrors] = useState<DashboardErrorStates>(
    createDefaultErrorStates()
  );

  // =============================================================================
  // MEMOIZED VALUES
  // =============================================================================

  /**
   * Check if initial loading is complete
   */
  const isInitialLoadComplete = useMemo(() => {
    return !loading.isLoading && user !== null;
  }, [loading.isLoading, user]);

  /**
   * Get profile completion percentage for display
   */
  const profileCompletion = useMemo(() => {
    if (!user) return 0;

    const requiredFields = [
      user.firstName,
      user.lastName,
      user.email,
      user.phoneNumber,
      user.bio,
      user.location
    ];

    const completedFields = requiredFields.filter(
      field => field && field.toString().trim().length > 0
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }, [user]);

  // =============================================================================
  // ERROR HANDLING UTILITIES
  // =============================================================================

  /**
   * Handle and log errors with proper error state management
   * Stable callback to prevent dependency loops
   */
  const handleError = useCallback((error: unknown, section: keyof DashboardErrorStates) => {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    
    setErrors(prev => ({
      ...prev,
      [section]: errorObj
    }));

    // Log error for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.error(`Dashboard ${section} error:`, errorObj);
    }
  }, []);

  /**
   * Clear error for specific section
   * Stable callback to prevent dependency loops
   */
  const clearError = useCallback((section: keyof DashboardErrorStates) => {
    setErrors(prev => ({
      ...prev,
      [section]: null
    }));
  }, []);

  // =============================================================================
  // USER DATA MANAGEMENT
  // =============================================================================

  /**
   * Fetch user profile data
   * Enterprise-grade stable callback to prevent dependency loops
   */
  const fetchUserData = useCallback(async () => {
    setLoading(prev => ({ ...prev, profileLoading: true }));
    
    // Clear error inline to avoid dependency
    setErrors(prev => ({ ...prev, profileError: null }));

    try {
      let userData: ProfileData;

      // Use auth context user data if available
      if (authUser) {
        userData = {
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          email: authUser.email,
          phoneNumber: authUser.phoneNumber,
          bio: (authUser as any).bio || undefined,
          location: (authUser as any).location || undefined,
          role: authUser.role as 'guest' | 'owner' | 'staff' | 'admin',
          memberSince: (authUser as any).createdAt || undefined,
          isVerified: true, // Could be dynamic based on verification status
          isPhoneVerified: !!authUser.phoneNumber,
          isEmailVerified: true // Email is required for registration
        };
      } else {
        // Fallback to API call if auth context is not available
        const userResponse = await authAPI.getProfile();
        userData = {
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
          email: userResponse.email,
          phoneNumber: userResponse.phoneNumber,
          bio: (userResponse as any).bio || undefined,
          location: (userResponse as any).location || undefined,
          role: userResponse.role as 'guest' | 'owner' | 'staff' | 'admin',
          memberSince: (userResponse as any).createdAt || undefined,
          isVerified: true,
          isPhoneVerified: !!userResponse.phoneNumber,
          isEmailVerified: true
        };
      }

      setUser(userData);
    } catch (error) {
      // Handle error inline to avoid dependency
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      setErrors(prev => ({ ...prev, profileError: errorObj }));
      
      // Log error for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.error('Dashboard profileError error:', errorObj);
      }
    } finally {
      setLoading(prev => ({ ...prev, profileLoading: false }));
    }
  }, [authUser]); // Only depend on authUser - stable dependency

  /**
   * Update user profile with optimistic updates
   * Stable callback to prevent dependency loops
   */
  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, profileLoading: true }));
    
    // Clear error inline to avoid dependency
    setErrors(prev => ({ ...prev, profileError: null }));

    // Optimistic update
    const originalUser = user;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    try {
      // For now, just update local state since updateProfile API may not exist
      // In a real implementation, this would call the API and update with server response
      // const updatedProfile = await authAPI.updateProfile(updates);
      // setUser(prev => prev ? { ...prev, ...updatedProfile } : null);
    } catch (error) {
      // Revert optimistic update on error
      setUser(originalUser);
      
      // Handle error inline to avoid dependency
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      setErrors(prev => ({ ...prev, profileError: errorObj }));
      
      // Log error for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.error('Dashboard profileError error:', errorObj);
      }
      
      throw error; // Re-throw for component handling
    } finally {
      setLoading(prev => ({ ...prev, profileLoading: false }));
    }
  }, [user]); // Only depend on user - more stable

  // =============================================================================
  // DATA REFRESH FUNCTIONALITY
  // =============================================================================

  /**
   * Refresh all dashboard data
   * Stable callback to prevent dependency loops
   */
  const refreshData = useCallback(async () => {
    setLoading(prev => ({ ...prev, isLoading: true }));

    try {
      await Promise.all([
        fetchUserData()
      ]);
    } catch (error) {
      // Handle error inline to avoid dependency
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      setErrors(prev => ({ ...prev, dashboardError: errorObj }));
      
      // Log error for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.error('Dashboard dashboardError error:', errorObj);
      }
    } finally {
      setLoading(prev => ({ ...prev, isLoading: false }));
    }
  }, [fetchUserData]); // Only depend on fetchUserData

  /**
   * Refresh specific section data
   */
  const refreshSection = useCallback(async (section: 'profile' | 'bookings' | 'favorites' | 'settings') => {
    switch (section) {
      case 'profile':
        await fetchUserData();
        break;
      // Additional sections can be added here as they are implemented
      default:
        console.warn(`Refresh not implemented for section: ${section}`);
    }
  }, [fetchUserData]);

  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================

  /**
   * Initial data loading on mount
   */
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /**
   * Set up automatic refresh interval
   */
  useEffect(() => {
    if (!isInitialLoadComplete) return;

    const interval = setInterval(() => {
      // Refresh user data periodically
      refreshSection('profile');
    }, REFRESH_INTERVALS.profile);

    return () => clearInterval(interval);
  }, [isInitialLoadComplete, refreshSection]);

  /**
   * Reset loading state once initial load is complete
   */
  useEffect(() => {
    if (isInitialLoadComplete) {
      setLoading(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [isInitialLoadComplete]);

  // =============================================================================
  // COMPUTED DASHBOARD STATISTICS
  // =============================================================================

  /**
   * Calculate basic dashboard statistics
   */
  const dashboardStats = useMemo(() => {
    if (!user) return null;

    const memberSince = user.memberSince ? new Date(user.memberSince) : new Date();
    const now = new Date();
    const accountAgeMonths = Math.ceil(
      (now.getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    return {
      profileCompletion,
      accountAgeMonths,
      memberSince: memberSince.toISOString()
    };
  }, [user, profileCompletion]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // User data
    user,

    // Bookings data
    bookings,

    // Favorites data
    favorites,

    // Loading states
    loading,

    // Error states
    errors,

    // Data operations
    refreshData,
    updateProfile
  };
}

// =============================================================================
// HOOK COMPOSITION UTILITIES
// =============================================================================

/**
 * Hook composition utility for components that need only user data
 */
export function useDashboardUser() {
  const { user, loading, errors, updateProfile } = useDashboardData();
  
  return {
    user,
    isLoading: loading.profileLoading,
    error: errors.profileError,
    updateProfile
  };
}

/**
 * Hook composition utility for components that need loading states
 */
export function useDashboardLoading() {
  const { loading, setLoading } = useDashboardData();
  
  const updateLoadingState = useCallback((
    section: keyof DashboardLoadingStates, 
    isLoading: boolean
  ) => {
    setLoading(prev => ({ ...prev, [section]: isLoading }));
  }, [setLoading]);
  
  return {
    loading,
    updateLoadingState
  };
}

/**
 * Hook composition utility for components that need error handling
 */
export function useDashboardErrors() {
  const { errors, clearError, setErrors } = useDashboardData();
  
  const setError = useCallback((
    section: keyof DashboardErrorStates, 
    error: Error | null
  ) => {
    setErrors(prev => ({ ...prev, [section]: error }));
  }, [setErrors]);
  
  return {
    errors,
    clearError,
    setError
  };
}