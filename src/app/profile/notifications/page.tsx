/**
 * Notifications Preferences Page - Email, SMS, and push notification settings
 * 
 * Comprehensive notifications management page for configuring email, SMS,
 * and push notification preferences across different categories and events.
 * Supports role-based notification types and business-specific settings.
 * 
 * Features:
 * - Email notification preferences by category
 * - SMS/text message notification settings
 * - Push notification configuration
 * - Notification frequency and timing controls
 * - Role-specific notification types (guest/owner/staff/admin)
 * - Marketing and promotional email preferences
 * - Instant vs digest notification options
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

// Components
import { EmailNotifications } from '@/components/profile/notifications/EmailNotifications';
import { SMSNotifications } from '@/components/profile/notifications/SMSNotifications';
import { PushNotifications } from '@/components/profile/notifications/PushNotifications';
import { NotificationSchedule } from '@/components/profile/notifications/NotificationSchedule';
import { MarketingPreferences } from '@/components/profile/notifications/MarketingPreferences';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for notifications preferences page
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateProfileMetadata(
    'Notification Preferences',
    'Configure your email, SMS, and push notification preferences'
  );
}

/**
 * Get role-specific notification categories
 */
function getNotificationCategories(role: string) {
  const baseCategories = [
    {
      id: 'account',
      name: 'Account Security',
      description: 'Login alerts, password changes, and security notifications',
      required: true,
    },
    {
      id: 'booking',
      name: 'Booking Updates',
      description: 'Booking confirmations, changes, and cancellations',
      required: false,
    },
    {
      id: 'messages',
      name: 'Messages',
      description: 'New messages from hosts, guests, and support',
      required: false,
    },
    {
      id: 'payments',
      name: 'Payment Notifications',
      description: 'Payment confirmations, receipts, and payment issues',
      required: true,
    },
  ];

  const roleSpecificCategories = [];

  if (role === 'guest') {
    roleSpecificCategories.push(
      {
        id: 'recommendations',
        name: 'Property Recommendations',
        description: 'Personalized property suggestions and deals',
        required: false,
      },
      {
        id: 'travel_tips',
        name: 'Travel Tips',
        description: 'Travel guides and destination information',
        required: false,
      }
    );
  }

  if (role === 'owner' || role === 'host') {
    roleSpecificCategories.push(
      {
        id: 'property_updates',
        name: 'Property Management',
        description: 'Property performance, booking requests, and updates',
        required: false,
      },
      {
        id: 'earnings',
        name: 'Earnings Reports',
        description: 'Monthly earnings, payouts, and financial summaries',
        required: false,
      },
      {
        id: 'calendar',
        name: 'Calendar Reminders',
        description: 'Check-in/check-out reminders and calendar updates',
        required: false,
      }
    );
  }

  if (role === 'staff' || role === 'admin') {
    roleSpecificCategories.push(
      {
        id: 'system_alerts',
        name: 'System Alerts',
        description: 'System issues, maintenance, and administrative updates',
        required: true,
      },
      {
        id: 'reports',
        name: 'Reports & Analytics',
        description: 'Daily, weekly, and monthly operational reports',
        required: false,
      }
    );
  }

  return [...baseCategories, ...roleSpecificCategories];
}

/**
 * Notifications Preferences Page Component
 * 
 * Comprehensive notifications management page with role-based
 * categories and granular control over notification types.
 */
export default async function NotificationsPreferencesPage() {
  // Server-side auth validation (handled by layout)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const validation = validateServerToken(token!);
  const user = validation.payload!;

  const notificationCategories = getNotificationCategories(user.role);

  return (
    <div className="divide-y divide-gray-200">
      {/* Page header */}
      <div className="p-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="mt-2 text-gray-600">
          Choose how and when you want to receive notifications about your account and activities
        </p>
      </div>

      {/* Notification overview */}
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Security Notifications
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Some notifications are required for account security and cannot be disabled.
                  You can choose how you receive them (email, SMS, or both).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email notifications */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Notifications</h2>
        <p className="text-gray-600 mb-6">
          Configure which email notifications you'd like to receive
        </p>
        <Suspense fallback={<EmailNotificationsSkeleton />}>
          <EmailNotifications 
            userId={user.userId} 
            categories={notificationCategories}
            userRole={user.role}
          />
        </Suspense>
      </div>

      {/* SMS notifications */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">SMS Notifications</h2>
        <p className="text-gray-600 mb-6">
          Get important updates via text message to your phone
        </p>
        <Suspense fallback={<SMSNotificationsSkeleton />}>
          <SMSNotifications 
            userId={user.userId}
            categories={notificationCategories}
            userRole={user.role}
          />
        </Suspense>
      </div>

      {/* Push notifications */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Push Notifications</h2>
        <p className="text-gray-600 mb-6">
          Receive real-time notifications on your devices
        </p>
        <Suspense fallback={<PushNotificationsSkeleton />}>
          <PushNotifications 
            userId={user.userId}
            categories={notificationCategories}
            userRole={user.role}
          />
        </Suspense>
      </div>

      {/* Notification schedule */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Schedule</h2>
        <p className="text-gray-600 mb-6">
          Control when you receive non-urgent notifications
        </p>
        <Suspense fallback={<NotificationScheduleSkeleton />}>
          <NotificationSchedule userId={user.userId} />
        </Suspense>
      </div>

      {/* Marketing preferences */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Marketing Communications</h2>
        <p className="text-gray-600 mb-6">
          Choose what marketing emails and promotional content you'd like to receive
        </p>
        <Suspense fallback={<MarketingPreferencesSkeleton />}>
          <MarketingPreferences userId={user.userId} userRole={user.role} />
        </Suspense>
      </div>

      {/* Notification testing */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Test Notifications</h2>
        <p className="text-gray-600 mb-6">
          Send test notifications to verify your settings are working correctly
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Test Email Notification</h3>
              <p className="text-sm text-gray-600">
                Send a test email to verify your email settings
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
              Send Test Email
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Test SMS Notification</h3>
              <p className="text-sm text-gray-600">
                Send a test SMS to verify your phone number settings
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
              Send Test SMS
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Test Push Notification</h3>
              <p className="text-sm text-gray-600">
                Send a test push notification to your devices
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
              Send Test Push
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
function EmailNotificationsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function SMSNotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mb-4" />
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-40" />
          </div>
          <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function PushNotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-52 mb-4" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-36" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-44" />
          </div>
          <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function NotificationScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
        <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function MarketingPreferencesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-56" />
          </div>
          <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}