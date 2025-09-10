/**
 * Security Settings Page - Password, 2FA, and security management
 * 
 * Comprehensive security settings page for managing password changes,
 * two-factor authentication, session management, and security preferences.
 * Integrates with existing AuthClient for secure operations.
 * 
 * Features:
 * - Password change with current password verification
 * - Two-factor authentication setup and management
 * - Active session monitoring and management
 * - Login activity and audit log
 * - Security alerts and notifications
 * - Account security recommendations
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

// Components
import { PasswordManager } from '@/components/profile/security/PasswordManager';
import { TwoFactorManager } from '@/components/profile/security/TwoFactorManager';
import { SessionManager } from '@/components/profile/security/SessionManager';
import { LoginActivityLog } from '@/components/profile/security/LoginActivityLog';
import { SecurityAlerts } from '@/components/profile/security/SecurityAlerts';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for security settings page
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateProfileMetadata(
    'Security Settings',
    'Manage your password, two-factor authentication, and security preferences'
  );
}

/**
 * Security Settings Page Component
 * 
 * Comprehensive security management page providing access to all
 * security-related settings and monitoring tools.
 */
export default async function SecuritySettingsPage() {
  // Server-side auth validation (handled by layout)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const validation = validateServerToken(token!);
  const user = validation.payload!;

  return (
    <div className="divide-y divide-gray-200">
      {/* Page header */}
      <div className="p-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your password, two-factor authentication, and security preferences
        </p>
      </div>

      {/* Security overview */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Password Protected</p>
                <p className="text-sm text-green-700">Strong password set</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">2FA Recommended</p>
                <p className="text-sm text-yellow-700">Enable for extra security</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Recent Activity</p>
                <p className="text-sm text-blue-700">Last login: Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password management */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Password</h2>
        <p className="text-gray-600 mb-6">
          Change your password regularly and use a strong, unique password
        </p>
        <Suspense fallback={<PasswordManagerSkeleton />}>
          <PasswordManager userId={user.userId} />
        </Suspense>
      </div>

      {/* Two-factor authentication */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-6">
          Add an extra layer of security to your account with two-factor authentication
        </p>
        <Suspense fallback={<TwoFactorManagerSkeleton />}>
          <TwoFactorManager userId={user.userId} />
        </Suspense>
      </div>

      {/* Active sessions */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Sessions</h2>
        <p className="text-gray-600 mb-6">
          Monitor and manage devices that are currently logged into your account
        </p>
        <Suspense fallback={<SessionManagerSkeleton />}>
          <SessionManager userId={user.userId} />
        </Suspense>
      </div>

      {/* Login activity */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Login Activity</h2>
        <p className="text-gray-600 mb-6">
          Review recent login attempts and account access history
        </p>
        <Suspense fallback={<LoginActivitySkeleton />}>
          <LoginActivityLog userId={user.userId} />
        </Suspense>
      </div>

      {/* Security alerts */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Alerts</h2>
        <p className="text-gray-600 mb-6">
          Configure when and how you want to be notified about security events
        </p>
        <Suspense fallback={<SecurityAlertsSkeleton />}>
          <SecurityAlerts userId={user.userId} />
        </Suspense>
      </div>

      {/* Advanced security options */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Advanced Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Force Logout All Devices</h3>
              <p className="text-sm text-gray-600">
                Sign out of all devices and require password re-entry
              </p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
              Force Logout
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Download Security Report</h3>
              <p className="text-sm text-gray-600">
                Export a detailed report of your account security activity
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
              Download Report
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
function PasswordManagerSkeleton() {
  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
    </div>
  );
}

function TwoFactorManagerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-48" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function SessionManagerSkeleton() {
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
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function LoginActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

function SecurityAlertsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
          <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}