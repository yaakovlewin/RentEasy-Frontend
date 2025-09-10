/**
 * @fileoverview Dashboard Header Component
 * 
 * CLIENT COMPONENT providing navigation and user controls for dashboard layout.
 * Features responsive design, role-based navigation, and search functionality.
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Home,
  ChevronDown
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Types
import { JWTPayload } from '@/types/auth';

interface DashboardLayoutConfig {
  showSidebar: boolean;
  enableNotifications: boolean;
  showUserProfile: boolean;
  enableSearch: boolean;
  showSystemHealth?: boolean;
  showAnalytics?: boolean;
  showPropertyManagement?: boolean;
  showBookingCalendar?: boolean;
}

interface DashboardHeaderProps {
  user: JWTPayload;
  config: DashboardLayoutConfig;
  onSidebarToggle?: () => void;
}

/**
 * Dashboard header with role-based navigation and features
 */
export function DashboardHeader({ user, config, onSidebarToggle }: DashboardHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();

  /**
   * Get user display name
   */
  const getUserDisplayName = useCallback(() => {
    // In a real app, you'd have firstName/lastName in the JWT or fetch from API
    return user.email.split('@')[0];
  }, [user.email]);

  /**
   * Get role-specific dashboard title
   */
  const getDashboardTitle = useCallback(() => {
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'staff':
        return 'Staff Dashboard';
      case 'owner':
        return 'Host Dashboard';
      default:
        return 'Dashboard';
    }
  }, [user.role]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(async () => {
    try {
      // Clear token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Redirect to login
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/auth/login';
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section: Menu toggle + Title */}
        <div className="flex items-center">
          {/* Mobile sidebar toggle */}
          {config.showSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden mr-2"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo and title */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mr-4"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">RE</span>
              </div>
              <span className="hidden sm:block font-bold">RentEasy</span>
            </Link>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {getDashboardTitle()}
              </h1>
            </div>
          </div>
        </div>

        {/* Center section: Search (if enabled) */}
        {config.enableSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                isSearchFocused ? 'text-blue-500' : 'text-gray-400'
              } transition-colors`} />
              <input
                type="text"
                placeholder={`Search ${user.role === 'admin' ? 'system...' : user.role === 'staff' ? 'properties...' : 'bookings...'}`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
        )}

        {/* Right section: Notifications + User menu */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          {config.enableNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          )}

          {/* Settings (admin/staff only) */}
          {(user.role === 'admin' || user.role === 'staff') && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              aria-label="Settings"
            >
              <Link href="/admin/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 pl-2 pr-3"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {getUserDisplayName()}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {user.role}
                    </Badge>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Home className="mr-3 h-4 w-4" />
                      Home
                    </Link>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar (if enabled and on mobile) */}
      {config.enableSearch && (
        <div className="sm:hidden px-4 pb-3 border-t border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </header>
  );
}