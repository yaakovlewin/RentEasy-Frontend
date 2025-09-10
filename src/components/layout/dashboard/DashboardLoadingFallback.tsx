/**
 * @fileoverview Dashboard Loading Fallback Component
 * 
 * CLIENT COMPONENT providing optimized loading states for dashboard content.
 * Features role-specific skeletons and performance-optimized animations.
 */

'use client';

import { UserRole } from '@/types/auth';

interface DashboardLoadingFallbackProps {
  userRole: UserRole;
  showSkeleton?: boolean;
  className?: string;
}

/**
 * Dashboard loading fallback with role-specific skeletons
 */
export function DashboardLoadingFallback({ 
  userRole, 
  showSkeleton = true,
  className = '' 
}: DashboardLoadingFallbackProps) {
  if (!showSkeleton) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">
            Loading {getRoleDisplayName(userRole)} dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Role-specific content skeletons */}
      {renderRoleSpecificSkeleton(userRole)}

      {/* Generic content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Render role-specific skeleton content
 */
function renderRoleSpecificSkeleton(userRole: UserRole) {
  switch (userRole) {
    case 'admin':
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* System metrics */}
          {[
            'Total Users',
            'Active Properties', 
            'Monthly Bookings',
            'System Health'
          ].map((label, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-200 rounded-full animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'staff':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Staff metrics */}
          {[
            'Pending Reviews',
            'New Properties',
            'Support Tickets'
          ].map((label, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'owner':
      return (
        <>
          {/* Host overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              'Total Earnings',
              'Active Listings',
              'Booking Rate',
              'Average Rating'
            ].map((label, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent bookings table skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );

    default: // guest
      return (
        <>
          {/* Guest quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-blue-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-44 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-28 bg-green-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );
  }
}

/**
 * Get display name for user role
 */
function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'staff':
      return 'staff';
    case 'owner':
      return 'host';
    default:
      return 'user';
  }
}