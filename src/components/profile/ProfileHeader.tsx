/**
 * ProfileHeader Component - Profile page header
 * 
 * Professional header component for profile pages with user information,
 * quick actions, and navigation breadcrumbs.
 * 
 * Features:
 * - User avatar and basic information
 * - Quick action buttons
 * - Account verification status
 * - Responsive design
 * - Role-based information display
 * - Profile completion indicator
 */

'use client';

import { useState } from 'react';
import { User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface ProfileHeaderProps {
  user: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
}

/**
 * ProfileHeader Component
 * 
 * Professional header for profile pages with user info
 * and quick actions.
 */
export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  const roleLabel = user.role === 'guest' ? 'Traveler' :
                   user.role === 'owner' ? 'Host' :
                   user.role === 'staff' ? 'Staff Member' :
                   user.role === 'admin' ? 'Administrator' : 
                   'Member';

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* User information */}
          <div className="flex items-center space-x-4">
            {/* User avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-xl">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </span>
            </div>
            
            {/* User details */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-gray-600">{roleLabel}</span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* User menu dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile completion banner */}
        <div className="pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Complete your profile</h3>
                  <p className="text-sm text-blue-700">
                    Add more information to improve your experience
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact ProfileHeader for mobile screens
 */
export function CompactProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <div className="bg-white border-b border-gray-200 p-4 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-medium text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500">Profile Settings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;