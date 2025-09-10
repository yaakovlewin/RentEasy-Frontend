/**
 * Account Settings Page - Personal information and preferences
 * 
 * Comprehensive account settings page using the existing DashboardProfile component
 * as foundation while adding settings-specific features like preferences management,
 * profile photo upload, and account information management.
 * 
 * Features:
 * - Personal information editing (uses existing DashboardProfile)
 * - Profile photo upload and management
 * - Account preferences and settings
 * - Email and phone verification management
 * - Language and timezone preferences
 * - Account deactivation options
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

// Components
import { AccountSettingsContent } from '@/components/profile/settings/AccountSettingsContent';
import { ProfilePhotoManager } from '@/components/profile/settings/ProfilePhotoManager';
import { PreferencesManager } from '@/components/profile/settings/PreferencesManager';
import { VerificationManager } from '@/components/profile/settings/VerificationManager';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for account settings page
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateProfileMetadata(
    'Account Settings',
    'Manage your personal information, preferences, and account settings'
  );
}

/**
 * Account Settings Page Component
 * 
 * Comprehensive settings page for managing personal information,
 * preferences, and account configuration.
 */
export default async function AccountSettingsPage() {
  // Server-side auth validation (handled by layout)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const validation = validateServerToken(token!);
  const user = validation.payload!;

  return (
    <div className="divide-y divide-gray-200">
      {/* Page header */}
      <div className="p-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your personal information, preferences, and account configuration
        </p>
      </div>

      {/* Profile photo section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Photo</h2>
        <Suspense fallback={<ProfilePhotoSkeleton />}>
          <ProfilePhotoManager userId={user.userId} />
        </Suspense>
      </div>

      {/* Personal information section - uses existing DashboardProfile */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
        <Suspense fallback={<PersonalInfoSkeleton />}>
          <AccountSettingsContent userId={user.userId} />
        </Suspense>
      </div>

      {/* Verification section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Verification</h2>
        <p className="text-gray-600 mb-6">
          Verify your email and phone number to improve account security and booking success
        </p>
        <Suspense fallback={<VerificationSkeleton />}>
          <VerificationManager userId={user.userId} />
        </Suspense>
      </div>

      {/* Preferences section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>
        <p className="text-gray-600 mb-6">
          Customize your experience with language, timezone, and display preferences
        </p>
        <Suspense fallback={<PreferencesSkeleton />}>
          <PreferencesManager userId={user.userId} />
        </Suspense>
      </div>

      {/* Account information section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="text-sm text-gray-900">
                {user.role === 'guest' ? 'Guest Account' : 
                 user.role === 'owner' ? 'Host Account' :
                 user.role === 'staff' ? 'Staff Account' :
                 user.role === 'admin' ? 'Administrator Account' : 
                 'Standard Account'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <div className="text-sm text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account ID
              </label>
              <div className="text-sm text-gray-500 font-mono">
                {user.userId}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <div className="text-sm text-gray-900">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account management section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Export Account Data</h3>
              <p className="text-sm text-gray-600">
                Download a copy of your account data and activity
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
              Request Export
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div>
              <h3 className="font-medium text-yellow-900">Deactivate Account</h3>
              <p className="text-sm text-yellow-700">
                Temporarily deactivate your account. You can reactivate anytime.
              </p>
            </div>
            <button className="text-sm text-yellow-700 hover:text-yellow-800 font-medium px-4 py-2 border border-yellow-300 rounded-md hover:bg-yellow-100 transition-colors">
              Deactivate
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button className="text-sm text-red-700 hover:text-red-800 font-medium px-4 py-2 border border-red-300 rounded-md hover:bg-red-100 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeletons for better UX
 */
function ProfilePhotoSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
        <div className="flex space-x-2">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function PersonalInfoSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function VerificationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function PreferencesSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}