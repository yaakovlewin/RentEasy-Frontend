/**
 * @fileoverview Dashboard Loading Fallback Component
 *
 * CLIENT COMPONENT providing optimized loading states for dashboard content.
 * Refactored to use Dependency Inversion Principle with role skeleton registry.
 */

'use client';

import { memo, Suspense, useMemo } from 'react';
import type { UserRole } from '@/types/auth';
import { RoleSkeletonRegistry, getRoleDisplayName } from './skeletons';

interface DashboardLoadingFallbackProps {
  userRole: UserRole;
  showSkeleton?: boolean;
  className?: string;
}

/**
 * Dashboard loading fallback with role-specific skeletons
 * Implements DIP - depends on abstractions (registry) not concrete implementations
 */
const DashboardLoadingFallbackComponent = ({
  userRole,
  showSkeleton = true,
  className = ''
}: DashboardLoadingFallbackProps) => {
  // Memoize skeleton component lookup
  const SkeletonComponent = useMemo(
    () => RoleSkeletonRegistry[userRole],
    [userRole]
  );

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

      {/* Role-specific content skeletons - lazy loaded with Suspense */}
      <Suspense fallback={<div className="h-48 bg-gray-100 rounded animate-pulse" />}>
        <SkeletonComponent />
      </Suspense>

      {/* Generic content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
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
};

export const DashboardLoadingFallback = memo(DashboardLoadingFallbackComponent);
DashboardLoadingFallback.displayName = 'DashboardLoadingFallback';