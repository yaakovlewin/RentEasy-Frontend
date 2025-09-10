/**
 * ProfileSidebar Component - Profile navigation sidebar
 * 
 * Professional sidebar navigation for profile pages with role-based
 * menu items, profile completion tracking, and responsive design.
 * 
 * Features:
 * - Role-based navigation items
 * - Profile completion progress
 * - Active state highlighting  
 * - Mobile-responsive design
 * - User avatar and info display
 * - Quick actions menu
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, Settings, Shield, Bell, Lock, Calendar, 
  Home, Users, ChevronRight, Check, AlertCircle
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Types
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: string;
}

interface ProfileSidebarProps {
  user: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
  navigationItems: NavigationItem[];
}

/**
 * Icon mapping for navigation items
 */
const iconMap = {
  User,
  Settings,
  Shield,
  Bell,
  Lock,
  Calendar,
  Home,
  Users,
};

/**
 * ProfileSidebar Component
 * 
 * Comprehensive profile navigation sidebar with role-based
 * menu items and profile completion tracking.
 */
export function ProfileSidebar({ user, navigationItems }: ProfileSidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock profile completion calculation
  const profileCompletion = useMemo(() => {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      // Add more fields as needed
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [user]);

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200",
      isExpanded ? "p-6" : "p-4"
    )}>
      {/* User profile section */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-lg">
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email
              }
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.role === 'guest' ? 'Traveler' :
               user.role === 'owner' ? 'Host' :
               user.role === 'staff' ? 'Staff Member' :
               user.role === 'admin' ? 'Administrator' : 
               'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile completion */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile completion</span>
          <span className="text-sm font-semibold text-gray-900">{profileCompletion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        {profileCompletion < 100 && (
          <p className="text-xs text-gray-600 mt-2">
            Complete your profile to improve your experience
          </p>
        )}
      </div>

      {/* Navigation items */}
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || User;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                isActive
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <IconComponent className="w-4 h-4 mr-3" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          {user.role === 'guest' && (
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              View Bookings
            </Button>
          )}
          {(user.role === 'owner' || user.role === 'host') && (
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Home className="w-4 h-4 mr-2" />
              Manage Properties
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Account status */}
      <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Check className="w-4 h-4 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Account Verified</p>
            <p className="text-xs text-green-700">
              Your account is in good standing
            </p>
          </div>
        </div>
      </div>

      {/* Help and support */}
      <div className="mt-4">
        <Button variant="ghost" size="sm" className="w-full text-gray-600">
          Need help? Contact support
        </Button>
      </div>
    </div>
  );
}

/**
 * Mobile Profile Sidebar
 * Simplified sidebar for mobile screens
 */
export function MobileProfileSidebar({ user, navigationItems }: ProfileSidebarProps) {
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
            <p className="font-medium text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email
              }
            </p>
            <p className="text-sm text-gray-500">Profile Settings</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Mobile navigation */}
      <div className="mt-4 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {navigationItems.slice(0, 4).map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || User;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg whitespace-nowrap"
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProfileSidebar;