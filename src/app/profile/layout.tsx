/**
 * Profile Layout - Comprehensive user profile management layout
 * 
 * Provides role-aware profile navigation and layout structure for all profile sub-pages.
 * Integrates seamlessly with existing authentication and dashboard systems.
 * 
 * Features:
 * - Server-side authentication validation
 * - Role-based navigation items
 * - Responsive sidebar navigation
 * - Profile completion tracking
 * - Breadcrumb navigation
 * - Mobile-optimized experience
 */

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Components
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileBreadcrumbs } from '@/components/profile/ProfileBreadcrumbs';
import { FeatureErrorBoundary } from '@/components/error-boundaries';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';

// Types
import { JWTPayload } from '@/types/auth';

/**
 * Profile pages metadata - private pages with no indexing
 */
export const metadata: Metadata = {
  title: 'Profile Settings - RentEasy',
  description: 'Manage your profile, settings, and preferences',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  other: {
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'cache-control': 'private, no-cache, no-store, must-revalidate',
  },
};

/**
 * Server-side authentication validation for profile access
 */
async function validateProfileAccess(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login?redirect=/profile');
  }

  const validation = validateServerToken(token);
  
  if (!validation.isValid || !validation.payload) {
    redirect('/auth/login?redirect=/profile');
  }

  return validation.payload;
}

/**
 * Get role-based navigation configuration
 */
function getProfileNavigation(role: string) {
  const baseNavItems = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/profile',
      description: 'Profile summary and completion',
      icon: 'User',
    },
    {
      id: 'settings',
      label: 'Account Settings',
      href: '/profile/settings',
      description: 'Personal information and preferences',
      icon: 'Settings',
    },
    {
      id: 'security',
      label: 'Security',
      href: '/profile/security',
      description: 'Password and security settings',
      icon: 'Shield',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/profile/notifications',
      description: 'Email and notification preferences',
      icon: 'Bell',
    },
    {
      id: 'privacy',
      label: 'Privacy',
      href: '/profile/privacy',
      description: 'Privacy settings and data management',
      icon: 'Lock',
    },
  ];

  // Add role-specific navigation items
  const roleSpecificItems = [];

  if (role === 'guest') {
    roleSpecificItems.push({
      id: 'bookings',
      label: 'My Bookings',
      href: '/profile/bookings',
      description: 'Booking history and upcoming trips',
      icon: 'Calendar',
    });
  }

  if (role === 'owner' || role === 'host') {
    roleSpecificItems.push({
      id: 'properties',
      label: 'My Properties',
      href: '/profile/properties',
      description: 'Property management and analytics',
      icon: 'Home',
    });
  }

  if (role === 'staff' || role === 'admin') {
    roleSpecificItems.push({
      id: 'management',
      label: 'Management Tools',
      href: '/profile/management',
      description: 'Administrative tools and reports',
      icon: 'Users',
    });
  }

  return [...baseNavItems, ...roleSpecificItems];
}

interface ProfileLayoutProps {
  children: React.ReactNode;
}

/**
 * Profile Layout Component
 * 
 * Provides comprehensive profile management layout with:
 * - Server-side authentication validation
 * - Role-based navigation
 * - Responsive design with mobile support
 * - Profile completion tracking
 * - Breadcrumb navigation
 */
export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  // Server-side auth validation
  const userPayload = await validateProfileAccess();
  const navigationItems = getProfileNavigation(userPayload.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile-specific error boundary */}
      <FeatureErrorBoundary featureName="Profile Management" level="high">
        {/* Profile header with user info and actions */}
        <Suspense fallback={<ProfileHeaderSkeleton />}>
          <ProfileHeader user={userPayload} />
        </Suspense>

        {/* Main profile container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Profile sidebar navigation */}
            <div className="lg:col-span-3">
              <Suspense fallback={<ProfileSidebarSkeleton />}>
                <ProfileSidebar 
                  user={userPayload}
                  navigationItems={navigationItems}
                />
              </Suspense>
            </div>

            {/* Main profile content area */}
            <div className="lg:col-span-9 mt-8 lg:mt-0">
              {/* Breadcrumb navigation */}
              <div className="mb-6">
                <Suspense fallback={<div className="h-6 bg-gray-200 rounded animate-pulse w-64" />}>
                  <ProfileBreadcrumbs />
                </Suspense>
              </div>

              {/* Profile page content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {children}
              </div>
            </div>
          </div>
        </div>
      </FeatureErrorBoundary>
    </div>
  );
}

/**
 * Profile header loading skeleton
 */
function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Profile sidebar loading skeleton
 */
function ProfileSidebarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-6">
        {/* User info skeleton */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        </div>

        {/* Profile completion skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-2 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Navigation items skeleton */}
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}