/**
 * Dashboard Loading State
 * 
 * Professional loading experience for the dashboard with 
 * contextual messaging and skeleton layouts.
 */

import { LoadingSpinner, LoadingCard } from '@/components/ui/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
            <div className="flex items-center space-x-4">
              <LoadingSpinner size="sm" variant="spinner" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Content Cards */}
            {[...Array(3)].map((_, i) => (
              <LoadingCard key={i} variant="booking" className="w-full" />
            ))}
          </div>
        </div>

        {/* Centered Loading Message */}
        <div className="fixed bottom-8 right-8">
          <div className="bg-white rounded-lg shadow-lg border px-4 py-2 flex items-center space-x-3">
            <LoadingSpinner size="sm" variant="dots" />
            <span className="text-sm font-medium text-gray-700">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    </div>
  );
}