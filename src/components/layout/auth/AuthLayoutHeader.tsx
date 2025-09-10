/**
 * @fileoverview Minimal Auth Layout Header
 * 
 * CLIENT COMPONENT providing a minimal header for authentication pages.
 * Features clean branding without navigation clutter.
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * Minimal header component for auth pages
 * Shows only branding and optional back navigation
 */
export function AuthLayoutHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname?.includes('/login');
  const isRegisterPage = pathname?.includes('/register');

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">RE</span>
            </div>
            <span>RentEasy</span>
          </Link>

          {/* Navigation links */}
          <nav className="flex items-center space-x-4">
            {isLoginPage && (
              <Link
                href="/auth/register"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign up
              </Link>
            )}
            
            {isRegisterPage && (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
            )}
            
            {/* Back to home */}
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}