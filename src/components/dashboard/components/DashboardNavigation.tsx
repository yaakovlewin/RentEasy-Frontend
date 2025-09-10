/**
 * DashboardNavigation Component
 * 
 * Dashboard sidebar navigation component providing user profile summary,
 * tab navigation, and logout functionality. Extracted from the original
 * monolithic DashboardContent.tsx for better separation of concerns.
 * 
 * Features:
 * - User profile display with avatar and membership status
 * - Tab-based navigation with active state management
 * - Host dashboard access for owners
 * - Logout functionality with error handling
 * - Responsive design with sticky positioning
 * - Performance optimized with React.memo
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { LogOut, User, Home } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { FeatureErrorBoundary } from '@/components/error-boundaries';

import type { DashboardNavigationProps } from '../types';
import { 
  getDashboardNavItems,
  canAccessHostDashboard,
  formatMembershipType,
  generateUserProfileSummary
} from '../utils';

/**
 * Dashboard Navigation Component
 * 
 * Renders the sidebar navigation for the dashboard with user profile,
 * navigation tabs, and additional actions like logout and host dashboard access.
 */
const DashboardNavigation: React.FC<DashboardNavigationProps> = React.memo(({
  userProfile,
  activeTab,
  onTabChange,
  navItems,
  onLogout,
  isActive,
  isLoading = false,
  error,
  className
}) => {
  // =============================================================================
  // MEMOIZED VALUES
  // =============================================================================

  /**
   * Memoized user display information
   */
  const userDisplayInfo = useMemo(() => {
    // Handle case where userProfile is undefined or null
    if (!userProfile) {
      return {
        initials: 'U',
        formattedMembership: 'Guest',
        canAccessHost: false
      };
    }

    // Generate initials from displayName or fallback to first/last name
    const displayName = userProfile.displayName || 
      `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 
      'User';
    
    const initials = displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

    return {
      initials,
      formattedMembership: formatMembershipType(userProfile.membershipType),
      canAccessHost: canAccessHostDashboard(userProfile.role)
    };
  }, [userProfile]);

  /**
   * Memoized navigation items with current counts
   */
  const navigationItems = useMemo(() => {
    // If custom navItems are provided, use them; otherwise generate defaults
    return navItems.length > 0 ? navItems : getDashboardNavItems();
  }, [navItems]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handle tab click with proper event handling
   */
  const handleTabClick = useCallback((tabId: string) => {
    if (tabId !== activeTab) {
      onTabChange(tabId as any); // Type assertion needed due to generic constraint
    }
  }, [activeTab, onTabChange]);

  /**
   * Handle logout with error handling
   */
  const handleLogout = useCallback(async () => {
    try {
      await onLogout();
    } catch (error) {
      // Error is handled by the parent component or error boundary
      console.error('Logout error:', error);
    }
  }, [onLogout]);

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  if (isLoading) {
    return (
      <div className={cn('lg:col-span-1', className)}>
        <Card className='sticky top-24'>
          <CardContent className='p-4'>
            {/* User Profile Skeleton */}
            <div className='flex items-center space-x-3 mb-6 pb-4 border-b'>
              <div className='w-12 h-12 bg-gray-200 rounded-full animate-pulse' />
              <div className='space-y-2 flex-1'>
                <div className='h-4 bg-gray-200 rounded animate-pulse' />
                <div className='h-3 bg-gray-200 rounded w-3/4 animate-pulse' />
              </div>
            </div>

            {/* Navigation Skeleton */}
            <nav className='space-y-2'>
              {[...Array(4)].map((_, index) => (
                <div key={index} className='h-10 bg-gray-200 rounded-lg animate-pulse' />
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =============================================================================
  // ERROR STATE
  // =============================================================================

  if (error) {
    return (
      <div className={cn('lg:col-span-1', className)}>
        <Card className='sticky top-24'>
          <CardContent className='p-4 text-center'>
            <div className='text-red-500 mb-2'>
              <User className='w-8 h-8 mx-auto' />
            </div>
            <p className='text-sm text-gray-600 mb-4'>
              Unable to load navigation
            </p>
            <button
              onClick={() => window.location.reload()}
              className='text-xs text-primary hover:underline'
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =============================================================================
  // RENDER NAVIGATION
  // =============================================================================

  return (
    <FeatureErrorBoundary featureName="Dashboard Navigation" level="medium">
      <div className={cn('lg:col-span-1', className)}>
        <Card className='sticky top-24'>
          <CardContent className='p-4'>
            {/* User Profile Section */}
            <div className='flex items-center space-x-3 mb-6 pb-4 border-b'>
              <div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center relative overflow-hidden'>
                {userProfile?.profileImage ? (
                  <img
                    src={userProfile.profileImage}
                    alt={`${userProfile?.displayName || userProfile?.firstName || 'User'} profile`}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-white font-medium text-sm'>
                    {userDisplayInfo.initials}
                  </span>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold truncate'>
                  {userProfile?.displayName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'User'}
                </h3>
                <p className='text-sm text-gray-600 flex items-center'>
                  {userDisplayInfo.formattedMembership}
                  {userProfile?.isVerified && (
                    <span className='ml-1 text-green-600'>✓</span>
                  )}
                </p>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className='space-y-2'>
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  disabled={!item.enabled}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    activeTab === item.id 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-50 text-gray-700',
                    !item.enabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <item.icon className='w-4 h-4 flex-shrink-0' aria-hidden="true" />
                  <span className='flex-1 truncate'>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span 
                      className={cn(
                        'px-2 py-1 text-xs rounded-full font-medium',
                        activeTab === item.id
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary'
                      )}
                      aria-label={`${item.badge} items`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {/* Host Dashboard Link (for owners) */}
              {userDisplayInfo.canAccessHost && (
                <>
                  <hr className='my-4' />
                  <Link
                    href='/host/dashboard'
                    className='w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-blue-50 text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  >
                    <Home className='w-4 h-4 flex-shrink-0' aria-hidden="true" />
                    <span className='flex-1 truncate'>Host Dashboard</span>
                  </Link>
                </>
              )}

              {/* Logout Section */}
              <hr className='my-4' />
              <button
                onClick={handleLogout}
                className='w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-red-50 text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20'
              >
                <LogOut className='w-4 h-4 flex-shrink-0' aria-hidden="true" />
                <span className='flex-1 truncate'>Sign Out</span>
              </button>
            </nav>
          </CardContent>
        </Card>
      </div>
    </FeatureErrorBoundary>
  );
});

DashboardNavigation.displayName = 'DashboardNavigation';

export { DashboardNavigation };