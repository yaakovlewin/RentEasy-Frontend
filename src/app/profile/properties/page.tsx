/**
 * My Properties Page - Property management for owners/hosts
 * 
 * Comprehensive property management page for owner and host users
 * showing property listings, performance analytics, and management
 * tools integrated with the existing property system.
 * 
 * Features:
 * - Property listings with status and performance
 * - Property analytics and earnings dashboard
 * - Quick actions (edit, deactivate, view bookings)
 * - Calendar management and availability
 * - Property creation and onboarding
 * - Integration with existing property management
 * - Staff-facilitated property approval process
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Components
import { PropertiesList } from '@/components/profile/properties/PropertiesList';
import { PropertyStats } from '@/components/profile/properties/PropertyStats';
import { PropertyQuickActions } from '@/components/profile/properties/PropertyQuickActions';
import { PropertyAnalytics } from '@/components/profile/properties/PropertyAnalytics';
import { PropertyOnboarding } from '@/components/profile/properties/PropertyOnboarding';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for properties page
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateProfileMetadata(
    'My Properties',
    'Manage your property listings, view analytics, and track performance'
  );
}

/**
 * Server-side role validation - properties page is for owners/hosts only
 */
async function validateOwnerAccess(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    redirect('/auth/login?redirect=/profile/properties');
  }

  const validation = validateServerToken(token);
  
  if (!validation.isValid || !validation.payload) {
    redirect('/auth/login?redirect=/profile/properties');
  }

  const user = validation.payload;
  
  // Redirect non-owners to appropriate pages
  if (user.role === 'guest') {
    redirect('/profile/bookings');
  } else if (user.role === 'staff' || user.role === 'admin') {
    redirect('/profile/management');
  } else if (user.role !== 'owner' && user.role !== 'host') {
    redirect('/profile');
  }

  return user;
}

/**
 * My Properties Page Component
 * 
 * Comprehensive property management for owner/host users with
 * analytics, management tools, and performance tracking.
 */
export default async function MyPropertiesPage() {
  // Server-side role validation
  const user = await validateOwnerAccess();

  return (
    <div className="p-6 space-y-8">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
            <p className="mt-2 text-gray-600">
              Manage your property listings, view analytics, and track performance
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add New Property
          </button>
        </div>
      </div>

      {/* Property stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Suspense fallback={<PropertyStatsSkeleton />}>
          <PropertyStats userId={user.userId} />
        </Suspense>
      </div>

      {/* Staff-facilitated property notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Professional Property Management
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Our team reviews each property to ensure quality standards and optimal guest matching.
                New properties are reviewed within 24-48 hours. <button className="font-medium underline">Learn more</button>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <PropertyQuickActions />
      </div>

      {/* Property analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
          <Suspense fallback={<PropertyAnalyticsSkeleton />}>
            <PropertyAnalytics userId={user.userId} timeframe="week" />
          </Suspense>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
          <Suspense fallback={<EarningsSummarySkeleton />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">This Month</span>
                <span className="text-lg font-bold text-green-600">$2,450</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Last Month</span>
                <span className="text-lg font-bold text-gray-900">$2,180</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Average per Night</span>
                <span className="text-lg font-bold text-blue-600">$185</span>
              </div>
            </div>
          </Suspense>
        </div>
      </div>

      {/* Properties list */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Your Properties</h3>
              <p className="text-gray-600 mt-1">
                Manage and monitor all your property listings
              </p>
            </div>
            <div className="flex space-x-2">
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                <option>All Properties</option>
                <option>Active</option>
                <option>Under Review</option>
                <option>Inactive</option>
              </select>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                <option>Sort by Date</option>
                <option>Sort by Performance</option>
                <option>Sort by Earnings</option>
              </select>
            </div>
          </div>
        </div>
        
        <Suspense fallback={<PropertiesListSkeleton />}>
          <PropertiesList userId={user.userId} />
        </Suspense>
      </div>

      {/* Property onboarding for new owners */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <Suspense fallback={<PropertyOnboardingSkeleton />}>
          <PropertyOnboarding userId={user.userId} />
        </Suspense>
      </div>

      {/* Host resources and support */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Host Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Host Guide</h4>
            <p className="text-sm text-gray-600 mb-3">Learn best practices for successful hosting</p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              Read Guide
            </button>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Analytics Tools</h4>
            <p className="text-sm text-gray-600 mb-3">Deep dive into your property performance</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Analytics
            </button>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Host Community</h4>
            <p className="text-sm text-gray-600 mb-3">Connect with other hosts and get advice</p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Join Community
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
function PropertyStatsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function PropertyAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function EarningsSummarySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

function PropertiesListSkeleton() {
  return (
    <div className="divide-y divide-gray-200">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-32 h-24 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-64" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="flex space-x-4 mt-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PropertyOnboardingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
      </div>
    </div>
  );
}