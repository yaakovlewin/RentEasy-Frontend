/**
 * @fileoverview Enterprise Auth Route Group Layout
 * 
 * SERVER COMPONENT providing optimized layout for authentication pages.
 * Features server-side auth checks, minimal UI design, and SEO optimization.
 * 
 * Key Features:
 * - Server-side authentication validation with redirect logic
 * - Minimal UI design without header/footer clutter
 * - Auth-specific error boundaries and loading states
 * - SEO optimization with noindex for auth pages
 * - Performance optimization for auth flows
 */

import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Components
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthLayoutBackground } from '@/components/layout/auth/AuthLayoutBackground';
import { AuthLayoutHeader } from '@/components/layout/auth/AuthLayoutHeader';

// Utils
import { decodeServerJWT, isTokenExpired } from '@/lib/auth/server-utils';

/**
 * Auth layout metadata - optimized for authentication pages
 * Uses noindex to prevent indexing of auth pages
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    noimageindex: true,
  },
  // Remove from search results
  alternates: {
    canonical: null,
  },
  // Security-focused metadata
  other: {
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  },
};

/**
 * Server-side authentication check
 * Redirects authenticated users to appropriate dashboard
 */
async function checkAuthStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null; // Not authenticated
  }

  try {
    const payload = decodeServerJWT(token);
    
    if (!payload || isTokenExpired(payload)) {
      return null; // Invalid or expired token
    }

    // User is authenticated, determine redirect URL
    switch (payload.role) {
      case 'owner':
        return '/host/dashboard';
      case 'staff':
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  } catch (error) {
    console.error('Auth check error in layout:', error);
    return null;
  }
}

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Enterprise Auth Layout Component
 * 
 * Provides optimized layout structure for authentication pages:
 * - Server-side auth validation
 * - Minimal UI without navigation clutter
 * - Auth-specific error handling
 * - Performance optimization
 */
export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Server-side auth check
  const redirectUrl = await checkAuthStatus();
  
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Auth-specific error boundary */}
      <AuthErrorBoundary>
        {/* Minimal header for auth pages */}
        <AuthLayoutHeader />
        
        {/* Background elements for visual appeal */}
        <AuthLayoutBackground />
        
        {/* Main content area optimized for auth forms */}
        <main className="relative flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            {/* Auth content with loading boundary */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-12">
                  <LoadingSpinner 
                    size="lg" 
                    className="text-blue-600" 
                    aria-label="Loading authentication form"
                  />
                </div>
              }
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8">
                  {children}
                </div>
              </div>
            </Suspense>
          </div>
        </main>
        
        {/* Minimal footer for auth pages */}
        <footer className="relative z-10 py-6 text-center text-sm text-gray-600">
          <div className="max-w-md mx-auto px-4">
            <p>
              © {new Date().getFullYear()} RentEasy. All rights reserved. 
              <span className="block mt-1">
                <a 
                  href="/privacy" 
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                {' • '}
                <a 
                  href="/terms" 
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>
              </span>
            </p>
          </div>
        </footer>
      </AuthErrorBoundary>
    </div>
  );
}