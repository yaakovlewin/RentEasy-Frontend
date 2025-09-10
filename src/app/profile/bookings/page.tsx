/**
 * My Bookings Page - Booking history for guests
 * 
 * Comprehensive booking management page for guest users showing
 * current, past, and cancelled bookings with detailed information,
 * actions, and integration with the existing booking system.
 * 
 * Features:
 * - Upcoming, past, and cancelled bookings tabs
 * - Booking details with property information
 * - Quick actions (cancel, modify, review, contact host)
 * - Booking status tracking and updates
 * - Receipt and document downloads
 * - Integration with existing DashboardBookings component
 * - Staff-facilitated booking support
 */

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Components
import { BookingsList } from '@/components/profile/bookings/BookingsList';
import { BookingFilters } from '@/components/profile/bookings/BookingFilters';
import { BookingStats } from '@/components/profile/bookings/BookingStats';
import { BookingQuickActions } from '@/components/profile/bookings/BookingQuickActions';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';
import { generateMetadata as generateProfileMetadata } from '@/lib/seo/profile-metadata';

// Types
import type { JWTPayload } from '@/types/auth';

/**
 * Generate metadata for bookings page
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateProfileMetadata(
    'My Bookings',
    'View and manage your booking history, upcoming trips, and travel plans'
  );
}

/**
 * Server-side role validation - bookings page is for guests only
 */
async function validateGuestAccess(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    redirect('/auth/login?redirect=/profile/bookings');
  }

  const validation = validateServerToken(token);
  
  if (!validation.isValid || !validation.payload) {
    redirect('/auth/login?redirect=/profile/bookings');
  }

  const user = validation.payload;
  
  // Redirect non-guests to appropriate pages
  if (user.role === 'owner' || user.role === 'host') {
    redirect('/profile/properties');
  } else if (user.role === 'staff' || user.role === 'admin') {
    redirect('/profile/management');
  } else if (user.role !== 'guest') {
    redirect('/profile');
  }

  return user;
}

/**
 * My Bookings Page Component
 * 
 * Comprehensive booking management for guest users with
 * tabbed interface and detailed booking information.
 */
export default async function MyBookingsPage() {
  // Server-side role validation
  const user = await validateGuestAccess();

  return (
    <div className="p-6 space-y-8">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">
          View and manage your booking history, upcoming trips, and travel plans
        </p>
      </div>

      {/* Booking stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Suspense fallback={<BookingStatsSkeleton />}>
          <BookingStats userId={user.userId} />
        </Suspense>
      </div>

      {/* Quick actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <BookingQuickActions />
      </div>

      {/* Staff-facilitated booking notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Personalized Booking Service
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Our team reviews your preferences and manually matches you with perfect properties.
                Need help with a booking? <button className="font-medium underline">Contact our staff</button>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings filters and search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Filter Bookings</h3>
        <Suspense fallback={<BookingFiltersSkeleton />}>
          <BookingFilters />
        </Suspense>
      </div>

      {/* Bookings list */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Your Bookings</h3>
          <p className="text-gray-600 mt-1">
            All your travel bookings and reservations
          </p>
        </div>
        
        <Suspense fallback={<BookingsListSkeleton />}>
          <BookingsList userId={user.userId} />
        </Suspense>
      </div>

      {/* Help and support */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Live Chat</h4>
            <p className="text-sm text-gray-600 mb-3">Get instant help from our support team</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Start Chat
            </button>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Phone Support</h4>
            <p className="text-sm text-gray-600 mb-3">Call us for urgent booking assistance</p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              Call Now
            </button>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium mb-1">Help Center</h4>
            <p className="text-sm text-gray-600 mb-3">Browse frequently asked questions</p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Visit FAQ
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
function BookingStatsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-1" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function BookingFiltersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function BookingsListSkeleton() {
  return (
    <div className="divide-y divide-gray-200">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-18 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
              <div className="flex space-x-2 mt-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-2" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}