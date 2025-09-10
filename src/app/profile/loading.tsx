/**
 * Profile Loading State - Comprehensive loading UI
 * 
 * Professional loading state for profile pages with skeleton layouts
 * that match the actual profile structure for better UX.
 * 
 * Features:
 * - Skeleton layouts matching actual profile structure
 * - Animated loading states
 * - Role-aware loading content
 * - Responsive design
 * - Accessibility considerations
 */

import { Suspense } from 'react';

/**
 * Profile Loading Component
 * 
 * Provides comprehensive loading states for all profile pages
 * with skeleton layouts that match the actual content structure.
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile header skeleton */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main profile container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Profile sidebar skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {/* User info skeleton */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                </div>

                {/* Profile completion skeleton */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Navigation items skeleton */}
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content area skeleton */}
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            {/* Breadcrumb skeleton */}
            <div className="mb-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-64" />
            </div>

            {/* Main content card skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Content header skeleton */}
              <div className="p-6 border-b border-gray-200">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-96" />
              </div>

              {/* Content sections skeleton */}
              <div className="p-6 space-y-8">
                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form sections skeleton */}
                <div className="space-y-8">
                  {[...Array(3)].map((_, sectionIndex) => (
                    <div key={sectionIndex}>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4" />
                      <div className="space-y-4">
                        {[...Array(3)].map((_, fieldIndex) => (
                          <div key={fieldIndex} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                            <div className="h-10 bg-gray-200 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* List items skeleton */}
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-12 bg-gray-200 rounded animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
                          </div>
                          <div className="flex space-x-2">
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="flex space-x-4">
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Profile Loading Component
 * 
 * Simplified loading state for quick transitions
 */
export function CompactProfileLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex space-x-3">
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Profile List Loading Component
 * 
 * Loading state for list-heavy pages like bookings and properties
 */
export function ProfileListLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex space-x-4">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* List skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-16 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-64" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}