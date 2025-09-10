/**
 * Privacy Settings Page - Privacy controls and data management
 * 
 * Comprehensive privacy settings page for managing data visibility,
 * sharing preferences, and GDPR compliance features. Provides granular
 * control over personal data usage and third-party integrations.
 * 
 * Features:
 * - Profile visibility and sharing controls
 * - Data usage and analytics preferences
 * - Third-party integrations management
 * - GDPR compliance tools (data export, deletion)
 * - Cookie preferences and tracking controls
 * - Communication privacy settings
 * - Activity visibility controls
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

// Components
import { ProfileVisibility } from '@/components/profile/privacy/ProfileVisibility';
import { DataUsagePreferences } from '@/components/profile/privacy/DataUsagePreferences';
import { ThirdPartyIntegrations } from '@/components/profile/privacy/ThirdPartyIntegrations';
import { GDPRCompliance } from '@/components/profile/privacy/GDPRCompliance';
import { CookiePreferences } from '@/components/profile/privacy/CookiePreferences';
import { ActivityPrivacy } from '@/components/profile/privacy/ActivityPrivacy';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for privacy settings page
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateProfileMetadata(
    'Privacy Settings',
    'Manage your privacy preferences, data usage, and visibility settings'
  );
}

/**
 * Privacy Settings Page Component
 * 
 * Comprehensive privacy management page with GDPR compliance
 * tools and granular privacy controls.
 */
export default async function PrivacySettingsPage() {
  // Server-side auth validation (handled by layout)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const validation = validateServerToken(token!);
  const user = validation.payload!;

  return (
    <div className="divide-y divide-gray-200">
      {/* Page header */}
      <div className="p-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
        <p className="mt-2 text-gray-600">
          Control your privacy, data usage, and what information you share with others
        </p>
      </div>

      {/* Privacy overview */}
      <div className="p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Your Privacy Matters
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  We're committed to protecting your privacy and giving you control over your data.
                  These settings help you customize what information is shared and how it's used.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile visibility */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Visibility</h2>
        <p className="text-gray-600 mb-6">
          Control who can see your profile information and activity
        </p>
        <Suspense fallback={<ProfileVisibilitySkeleton />}>
          <ProfileVisibility userId={user.userId} userRole={user.role} />
        </Suspense>
      </div>

      {/* Activity privacy */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Privacy</h2>
        <p className="text-gray-600 mb-6">
          Choose what activities and interactions are visible to others
        </p>
        <Suspense fallback={<ActivityPrivacySkeleton />}>
          <ActivityPrivacy userId={user.userId} userRole={user.role} />
        </Suspense>
      </div>

      {/* Data usage preferences */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Usage</h2>
        <p className="text-gray-600 mb-6">
          Control how your data is used for analytics, personalization, and service improvement
        </p>
        <Suspense fallback={<DataUsagePreferencesSkeleton />}>
          <DataUsagePreferences userId={user.userId} />
        </Suspense>
      </div>

      {/* Cookie preferences */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Cookie Preferences</h2>
        <p className="text-gray-600 mb-6">
          Manage which cookies and tracking technologies you allow
        </p>
        <Suspense fallback={<CookiePreferencesSkeleton />}>
          <CookiePreferences userId={user.userId} />
        </Suspense>
      </div>

      {/* Third-party integrations */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Third-Party Integrations</h2>
        <p className="text-gray-600 mb-6">
          Manage connected apps and services that have access to your account
        </p>
        <Suspense fallback={<ThirdPartyIntegrationsSkeleton />}>
          <ThirdPartyIntegrations userId={user.userId} />
        </Suspense>
      </div>

      {/* Communication privacy */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Direct Messages</h3>
              <p className="text-sm text-gray-600">
                Allow hosts and guests to send you direct messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Phone Number Visibility</h3>
              <p className="text-sm text-gray-600">
                Show your phone number to confirmed bookings only
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Review Responses</h3>
              <p className="text-sm text-gray-600">
                Allow others to see your responses to reviews
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* GDPR compliance */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Rights & Compliance</h2>
        <p className="text-gray-600 mb-6">
          Exercise your data protection rights under GDPR and other privacy laws
        </p>
        <Suspense fallback={<GDPRComplianceSkeleton />}>
          <GDPRCompliance userId={user.userId} />
        </Suspense>
      </div>

      {/* Advanced privacy settings */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Advanced Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Search Engine Indexing</h3>
              <p className="text-sm text-gray-600">
                Allow search engines to index your public profile information
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Anonymous Analytics</h3>
              <p className="text-sm text-gray-600">
                Help improve RentEasy by sharing anonymous usage statistics
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium text-red-900">Account Deletion</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
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
function ProfileVisibilitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ActivityPrivacySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-40" />
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function DataUsagePreferencesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-52" />
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function CookiePreferencesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
              <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThirdPartyIntegrationsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function GDPRComplianceSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-56" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}