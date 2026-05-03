/**
 * @fileoverview Dashboard Header Component
 *
 * CLIENT COMPONENT providing navigation and user controls for dashboard layout.
 * Features responsive design, role-based navigation, and search functionality.
 */

'use client';

import Link from 'next/link';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { JWTPayload } from '@/types/auth';
import { UserMenu } from './UserMenu';
import { SearchBar } from './SearchBar';
import { NotificationButton } from './NotificationButton';

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

export function DashboardHeader({ user, config, onSidebarToggle }: DashboardHeaderProps) {
  const { dashboardTitle } = useDashboard(user.role, user.email);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
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
                {dashboardTitle}
              </h1>
            </div>
          </div>
        </div>

        {config.enableSearch && (
          <SearchBar userRole={user.role} className="flex-1 max-w-md mx-4 hidden sm:block" />
        )}

        <div className="flex items-center space-x-2">
          {config.enableNotifications && (
            <NotificationButton count={3} />
          )}

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

          <UserMenu user={user} />
        </div>
      </div>

      {config.enableSearch && (
        <div className="sm:hidden px-4 pb-3 border-t border-gray-200">
          <SearchBar userRole={user.role} isMobile />
        </div>
      )}
    </header>
  );
}
