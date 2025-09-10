/**
 * Authentication Loading State
 * 
 * Clean, professional loading experience for auth pages
 * with minimal, focused design matching auth form aesthetics.
 */

import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
              <LoadingSpinner size="md" variant="spinner" color="white" />
            </div>
            <div className="space-y-2">
              <LoadingSkeleton height="h-8" width="w-48" className="mx-auto" />
              <LoadingSkeleton height="h-4" width="w-64" className="mx-auto" />
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <LoadingSkeleton height="h-4" width="w-16" />
              <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <LoadingSkeleton height="h-4" width="w-20" />
              <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
            </div>

            {/* Additional Field (for register) */}
            <div className="space-y-2">
              <LoadingSkeleton height="h-4" width="w-24" />
              <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
            </div>
          </div>

          {/* Submit Button */}
          <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <LoadingSkeleton height="h-px" width="w-full" />
            </div>
            <div className="relative flex justify-center">
              <LoadingSkeleton height="h-4" width="w-8" />
            </div>
          </div>

          {/* Social Auth */}
          <div className="space-y-3">
            <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
            <LoadingSkeleton height="h-12" width="w-full" variant="rounded" />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <LoadingSkeleton height="h-4" width="w-40" className="mx-auto" />
            <LoadingSkeleton height="h-4" width="w-32" className="mx-auto" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <LoadingSpinner size="sm" variant="dots" />
            <span className="text-sm font-medium">Preparing your experience...</span>
          </div>
        </div>
      </div>
    </div>
  );
}