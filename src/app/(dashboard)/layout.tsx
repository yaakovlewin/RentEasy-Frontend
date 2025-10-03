/**
 * @fileoverview Enterprise Dashboard Route Group Layout
 * 
 * SERVER COMPONENT providing protected layout for dashboard/user areas.
 * Features server-side auth validation, role-based navigation, and performance optimization.
 * 
 * Key Features:
 * - Server-side authentication validation with redirect logic
 * - Role-based layout variations (guest/owner/staff/admin)
 * - Dashboard-specific navigation sidebar
 * - Performance optimization for dashboard components
 * - Enterprise error handling and loading states
 */

import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Components
import { DashboardErrorBoundary } from '@/components/error-boundaries/DashboardErrorBoundary';
import { DashboardSidebar } from '@/components/layout/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/dashboard/DashboardHeader';
import { DashboardLoadingFallback } from '@/components/layout/dashboard/DashboardLoadingFallback';

// Utils
import { validateServerToken } from '@/lib/auth/server-utils';

// Types
import { JWTPayload } from '@/types/auth';

/**
 * Dashboard layout metadata - optimized for user dashboard pages
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  // Security headers for protected content
  other: {
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'cache-control': 'private, no-cache, no-store, must-revalidate',
  },
};

/**
 * Server-side authentication validation for dashboard access
 * Redirects unauthenticated users to login with return URL
 */
async function validateDashboardAccess(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/dashboard';
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;

    redirect(loginUrl);
  }

  const validation = validateServerToken(token);

  if (!validation.isValid || !validation.payload) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/dashboard';
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;

    redirect(loginUrl);
  }

  return validation.payload;
}

/**
 * Get layout configuration based on user role
 */
function getDashboardLayoutConfig(role: string) {
  const baseConfig = {
    showSidebar: true,
    enableNotifications: true,
    showUserProfile: true,
    enableSearch: false,
  };

  switch (role) {
    case 'admin':
      return {
        ...baseConfig,
        enableSearch: true,
        showSystemHealth: true,
        showAnalytics: true,
      };
    case 'staff':
      return {
        ...baseConfig,
        enableSearch: true,
        showAnalytics: true,
      };
    case 'owner':
      return {
        ...baseConfig,
        showPropertyManagement: true,
        showBookingCalendar: true,
      };
    default: // guest
      return baseConfig;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Enterprise Dashboard Layout Component
 * 
 * Provides protected layout structure for dashboard pages:
 * - Server-side authentication validation
 * - Role-based navigation and features
 * - Responsive sidebar and header
 * - Performance-optimized loading states
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Server-side auth validation
  const userPayload = await validateDashboardAccess();
  const layoutConfig = getDashboardLayoutConfig(userPayload.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard-specific error boundary */}
      <DashboardErrorBoundary userRole={userPayload.role}>
        {/* Dashboard header */}
        <DashboardHeader 
          user={userPayload}
          config={layoutConfig}
        />
        
        {/* Main dashboard container */}
        <div className="flex">
          {/* Sidebar navigation */}
          {layoutConfig.showSidebar && (
            <Suspense fallback={<DashboardSidebarSkeleton />}>
              <DashboardSidebar 
                user={userPayload}
                config={layoutConfig}
              />
            </Suspense>
          )}
          
          {/* Main content area */}
          <main className={`flex-1 ${layoutConfig.showSidebar ? 'lg:ml-64' : ''} transition-all duration-200`}>
            {/* Content wrapper with proper spacing */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {/* Dashboard content with loading boundary */}
              <Suspense
                fallback={
                  <DashboardLoadingFallback 
                    userRole={userPayload.role}
                    showSkeleton={true}
                  />
                }
              >
                {/* Performance-optimized content wrapper */}
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </Suspense>
            </div>
          </main>
        </div>
        
        {/* Background notification system */}
        {layoutConfig.enableNotifications && (
          <Suspense fallback={null}>
            <DashboardNotificationSystem userId={userPayload.userId} />
          </Suspense>
        )}
      </DashboardErrorBoundary>
    </div>
  );
}

/**
 * Sidebar loading skeleton for better UX
 */
function DashboardSidebarSkeleton() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="ml-2 h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center px-2 py-2 text-sm">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="ml-3 h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

/**
 * Background notification system for dashboard
 */
async function DashboardNotificationSystem({ userId }: { userId: string }) {
  // In a real app, this would fetch user-specific notifications
  // For now, we'll just return null to avoid making API calls in layout
  return null;
}