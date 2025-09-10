/**
 * Profile Overview Page - Main profile dashboard
 * 
 * Comprehensive profile overview with completion tracking, quick actions,
 * and role-based dashboard elements. Uses existing DashboardProfile component
 * as foundation while adding profile-specific features.
 * 
 * Features:
 * - Profile completion tracking with progress bar
 * - Quick action cards for common tasks
 * - Recent activity timeline
 * - Role-specific overview widgets
 * - Account verification status
 * - Profile statistics and insights
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

// Components
import { ProfileOverviewContent } from '@/components/profile/ProfileOverviewContent';
import { ProfileCompletionCard } from '@/components/profile/ProfileCompletionCard';
import { ProfileQuickActions } from '@/components/profile/ProfileQuickActions';
import { ProfileActivityFeed } from '@/components/profile/ProfileActivityFeed';
import { ProfileStatsWidget } from '@/components/profile/ProfileStatsWidget';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for profile overview page
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return generateProfileMetadata('Profile Overview');
  }

  const validation = validateServerToken(token);
  const user = validation.payload;

  return generateProfileMetadata(
    'Profile Overview',
    user ? `Manage your RentEasy profile, ${user.firstName}` : 'Manage your RentEasy profile'
  );
}

/**
 * Profile Overview Page Component
 * 
 * Main profile dashboard providing comprehensive overview of user's
 * profile status, quick actions, and role-specific information.
 */
export default async function ProfileOverviewPage() {
  // Server-side auth validation (handled by layout)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const validation = validateServerToken(token!);
  const user = validation.payload!;

  return (
    <div className="p-6 space-y-8">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Overview</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information, preferences, and settings
        </p>
      </div>

      {/* Profile overview grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main profile information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile completion card */}
          <Suspense fallback={<ProfileCompletionSkeleton />}>
            <ProfileCompletionCard userId={user.userId} />
          </Suspense>

          {/* Main profile content - uses existing DashboardProfile as base */}
          <div className="bg-white rounded-lg border border-gray-200">
            <Suspense fallback={<ProfileContentSkeleton />}>
              <ProfileOverviewContent userId={user.userId} userRole={user.role} />
            </Suspense>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <Suspense fallback={<ActivityFeedSkeleton />}>
                <ProfileActivityFeed userId={user.userId} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <ProfileQuickActions userRole={user.role} />
          </div>

          {/* Profile statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Statistics</h3>
            <Suspense fallback={<StatsWidgetSkeleton />}>
              <ProfileStatsWidget userId={user.userId} userRole={user.role} />
            </Suspense>
          </div>

          {/* Account status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verification</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phone Verification</span>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Identity Verification</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Not Started
                </span>
              </div>
            </div>
          </div>

          {/* Role-specific information */}
          {user.role === 'guest' && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h4 className="font-semibold text-blue-900 mb-2">Traveler Profile</h4>
              <p className="text-sm text-blue-700 mb-3">
                Complete your profile to improve your booking success rate
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Booking Tips →
              </button>
            </div>
          )}

          {user.role === 'owner' && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h4 className="font-semibold text-green-900 mb-2">Host Profile</h4>
              <p className="text-sm text-green-700 mb-3">
                Manage your properties and view booking performance
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                View Host Dashboard →
              </button>
            </div>
          )}

          {(user.role === 'staff' || user.role === 'admin') && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
              <h4 className="font-semibold text-purple-900 mb-2">Staff Profile</h4>
              <p className="text-sm text-purple-700 mb-3">
                Access administrative tools and customer support features
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View Admin Panel →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeletons for better UX
 */
function ProfileCompletionSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="h-2 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProfileContentSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b">
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsWidgetSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
        </div>
      ))}
    </div>
  );
}