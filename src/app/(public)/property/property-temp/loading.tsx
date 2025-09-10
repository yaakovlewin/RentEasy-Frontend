/**
 * Property Details Loading State
 * 
 * Professional loading experience for individual property pages
 * with detailed content skeletons and realistic layouts.
 */

import { LoadingSpinner, LoadingCard, LoadingSkeleton } from '@/components/ui/LoadingSpinner';

export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery Skeleton */}
        <div className="relative h-[60vh] bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute bottom-6 right-6 flex space-x-2">
            <LoadingSkeleton height="h-10" width="w-24" variant="rounded" />
            <LoadingSkeleton height="h-10" width="w-10" variant="circular" />
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <LoadingSkeleton height="h-8" width="w-96" />
                    <LoadingSkeleton height="h-5" width="w-64" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingSkeleton height="h-6" width="w-16" variant="rounded" />
                    <LoadingSkeleton height="h-8" width="w-8" variant="circular" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mb-6">
                  <LoadingSkeleton height="h-5" width="w-20" />
                  <LoadingSkeleton height="h-5" width="w-24" />
                  <LoadingSkeleton height="h-5" width="w-18" />
                </div>

                <div className="flex items-center space-x-4">
                  <LoadingSkeleton height="h-12" width="w-12" variant="circular" />
                  <div>
                    <LoadingSkeleton height="h-5" width="w-32" className="mb-1" />
                    <LoadingSkeleton height="h-4" width="w-24" />
                  </div>
                </div>
              </div>

              {/* Property Description */}
              <div className="space-y-4">
                <LoadingSkeleton height="h-6" width="w-40" />
                <div className="space-y-2">
                  <LoadingSkeleton height="h-4" width="w-full" />
                  <LoadingSkeleton height="h-4" width="w-5/6" />
                  <LoadingSkeleton height="h-4" width="w-4/5" />
                  <LoadingSkeleton height="h-4" width="w-3/4" />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <LoadingSkeleton height="h-6" width="w-32" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <LoadingSkeleton height="h-5" width="w-5" variant="rounded" />
                      <LoadingSkeleton height="h-4" width="w-24" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Location & Map */}
              <div className="space-y-4">
                <LoadingSkeleton height="h-6" width="w-28" />
                <div className="h-64 bg-gray-200 rounded-xl animate-pulse relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoadingSpinner size="lg" variant="spinner" />
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-xl border p-6 space-y-6">
                  <div className="text-center">
                    <LoadingSkeleton height="h-8" width="w-32" className="mx-auto mb-2" />
                    <LoadingSkeleton height="h-4" width="w-24" className="mx-auto" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <LoadingSkeleton height="h-4" width="w-16" className="mb-2" />
                        <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
                      </div>
                      <div>
                        <LoadingSkeleton height="h-4" width="w-18" className="mb-2" />
                        <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
                      </div>
                    </div>
                    
                    <div>
                      <LoadingSkeleton height="h-4" width="w-14" className="mb-2" />
                      <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
                    </div>
                  </div>
                  
                  <LoadingSkeleton height="h-14" width="w-full" variant="rounded" />
                  
                  <div className="space-y-3 pt-4 border-t">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <LoadingSkeleton height="h-4" width="w-20" />
                        <LoadingSkeleton height="h-4" width="w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="mt-16 space-y-8">
            <LoadingSkeleton height="h-8" width="w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <LoadingCard key={i} variant="property" className="w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Loading Status */}
        <div className="fixed bottom-8 right-8">
          <div className="bg-white rounded-lg shadow-lg border px-4 py-2 flex items-center space-x-3">
            <LoadingSpinner size="sm" variant="pulse" />
            <span className="text-sm font-medium text-gray-700">Loading property details...</span>
          </div>
        </div>
      </div>
    </div>
  );
}