/**
 * Search Page Loading State
 * 
 * Professional loading experience for property search with
 * realistic property card skeletons and search interface.
 */

import { LoadingSpinner, LoadingCard, LoadingSkeleton } from '@/components/ui/LoadingSpinner';

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar Skeleton */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <LoadingSkeleton height="h-4" width="w-16" />
                <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
              </div>
              <div className="space-y-2">
                <LoadingSkeleton height="h-4" width="w-20" />
                <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
              </div>
              <div className="space-y-2">
                <LoadingSkeleton height="h-4" width="w-14" />
                <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
              </div>
              <div className="flex items-end">
                <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <LoadingSkeleton height="h-6" width="w-20" />
                <LoadingSpinner size="xs" variant="spinner" />
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <LoadingSkeleton height="h-5" width="w-24" className="mb-2" />
                    <LoadingSkeleton height="h-10" width="w-full" variant="rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Property Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="sm" variant="dots" />
                <LoadingSkeleton height="h-6" width="w-48" />
              </div>
              <div className="flex items-center space-x-2">
                <LoadingSkeleton height="h-8" width="w-20" variant="rounded" />
                <LoadingSkeleton height="h-8" width="w-24" variant="rounded" />
              </div>
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <LoadingCard
                  key={i}
                  variant="property"
                  className="w-full"
                  shimmer={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Loading Status */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-full shadow-lg border px-6 py-3 flex items-center space-x-3">
            <LoadingSpinner size="sm" variant="spinner" />
            <span className="text-sm font-medium text-gray-700">Finding your perfect stay...</span>
          </div>
        </div>
      </div>
    </div>
  );
}