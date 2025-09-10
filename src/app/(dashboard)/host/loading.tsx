/**
 * Host Dashboard Loading State
 * 
 * Professional loading experience for host/property owner pages
 * with management-focused layouts and action skeletons.
 */

import { LoadingSpinner, LoadingCard, LoadingSkeleton } from '@/components/ui/LoadingSpinner';

export default function HostLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Host Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6">
              <LoadingSkeleton height="h-20" width="w-20" variant="circular" />
              <div className="space-y-2">
                <LoadingSkeleton height="h-8" width="w-64" />
                <LoadingSkeleton height="h-5" width="w-48" />
                <div className="flex items-center space-x-4 mt-3">
                  <LoadingSkeleton height="h-4" width="w-20" />
                  <LoadingSkeleton height="h-4" width="w-24" />
                  <LoadingSkeleton height="h-4" width="w-18" />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6 lg:mt-0">
              <LoadingSkeleton height="h-10" width="w-32" variant="rounded" />
              <LoadingSkeleton height="h-10" width="w-28" variant="rounded" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <LoadingSkeleton height="h-4" width="w-20" />
                  <LoadingSkeleton height="h-8" width="w-16" />
                </div>
                <LoadingSkeleton height="h-12" width="w-12" variant="rounded" />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <LoadingSkeleton height="h-3" width="w-6" />
                <LoadingSkeleton height="h-3" width="w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border">
          {/* Tab Header */}
          <div className="border-b px-8 py-4">
            <div className="flex space-x-8">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} height="h-6" width="w-20" />
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="sm" variant="dots" />
                <LoadingSkeleton height="h-5" width="w-40" />
              </div>
              <div className="flex space-x-3">
                <LoadingSkeleton height="h-10" width="w-24" variant="rounded" />
                <LoadingSkeleton height="h-10" width="w-32" variant="rounded" />
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <LoadingSkeleton height="h-48" width="w-full" variant="rounded" />
                  <div className="space-y-3">
                    <LoadingSkeleton height="h-5" width="w-4/5" />
                    <LoadingSkeleton height="h-4" width="w-3/5" />
                    <div className="flex items-center justify-between">
                      <LoadingSkeleton height="h-4" width="w-20" />
                      <LoadingSkeleton height="h-4" width="w-16" />
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <LoadingSkeleton height="h-8" width="w-16" variant="rounded" />
                    <LoadingSkeleton height="h-8" width="w-16" variant="rounded" />
                    <LoadingSkeleton height="h-8" width="w-16" variant="rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
          <div className="bg-white rounded-lg shadow-lg border px-4 py-2 flex items-center space-x-3">
            <LoadingSpinner size="sm" variant="spinner" />
            <span className="text-sm font-medium text-gray-700">Loading your properties...</span>
          </div>
        </div>
      </div>
    </div>
  );
}