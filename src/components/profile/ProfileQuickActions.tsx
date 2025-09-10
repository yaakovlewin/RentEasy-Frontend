/**
 * ProfileQuickActions Component - Quick action buttons for profile management
 * 
 * Professional quick actions component providing easy access to common
 * profile management tasks with role-based action customization.
 * 
 * Features:
 * - Role-based action buttons
 * - Common profile management tasks
 * - Quick navigation shortcuts  
 * - Responsive grid layout
 * - Icon-based visual design
 * - Contextual action descriptions
 */

'use client';

import { 
  Edit, Camera, Shield, Bell, Download, Share2,
  Calendar, Home, Users, MessageCircle, Settings,
  CreditCard, Award, HelpCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  color?: string;
}

interface ProfileQuickActionsProps {
  userRole: string;
}

/**
 * ProfileQuickActions Component
 * 
 * Role-aware quick actions for common profile management tasks.
 */
export function ProfileQuickActions({ userRole }: ProfileQuickActionsProps) {
  // Base actions available to all users
  const baseActions: QuickAction[] = [
    {
      id: 'edit_profile',
      label: 'Edit Profile',
      description: 'Update your personal information',
      icon: Edit,
      href: '/profile/settings',
      variant: 'default',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      id: 'change_photo',
      label: 'Change Photo',
      description: 'Upload a new profile picture',
      icon: Camera,
      onClick: () => {
        // Handle photo upload
        console.log('Photo upload clicked');
      },
      variant: 'outline',
      color: 'hover:bg-gray-50',
    },
    {
      id: 'security_settings',
      label: 'Security',
      description: 'Manage password and 2FA',
      icon: Shield,
      href: '/profile/security',
      variant: 'outline',
      color: 'hover:bg-gray-50',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Configure your preferences',
      icon: Bell,
      href: '/profile/notifications',
      variant: 'outline',
      color: 'hover:bg-gray-50',
    },
  ];

  // Role-specific actions
  const getRoleSpecificActions = (): QuickAction[] => {
    switch (userRole) {
      case 'guest':
        return [
          {
            id: 'view_bookings',
            label: 'My Bookings',
            description: 'View your travel history',
            icon: Calendar,
            href: '/profile/bookings',
            variant: 'secondary',
            color: 'bg-green-50 text-green-700 hover:bg-green-100',
          },
          {
            id: 'payment_methods',
            label: 'Payment Methods',
            description: 'Manage your payment options',
            icon: CreditCard,
            onClick: () => {
              console.log('Payment methods clicked');
            },
            variant: 'outline',
            color: 'hover:bg-gray-50',
          },
          {
            id: 'travel_preferences',
            label: 'Travel Preferences',
            description: 'Set your travel preferences',
            icon: Settings,
            onClick: () => {
              console.log('Travel preferences clicked');
            },
            variant: 'outline',
            color: 'hover:bg-gray-50',
          },
        ];

      case 'owner':
      case 'host':
        return [
          {
            id: 'manage_properties',
            label: 'My Properties',
            description: 'Manage your listings',
            icon: Home,
            href: '/profile/properties',
            variant: 'secondary',
            color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
          },
          {
            id: 'calendar_management',
            label: 'Calendar',
            description: 'Manage availability',
            icon: Calendar,
            onClick: () => {
              console.log('Calendar clicked');
            },
            variant: 'outline',
            color: 'hover:bg-gray-50',
          },
          {
            id: 'guest_messages',
            label: 'Messages',
            description: 'Guest communications',
            icon: MessageCircle,
            onClick: () => {
              console.log('Messages clicked');
            },
            variant: 'outline',
            color: 'hover:bg-gray-50',
          },
        ];

      case 'staff':
      case 'admin':
        return [
          {
            id: 'user_management',
            label: 'User Management',
            description: 'Manage user accounts',
            icon: Users,
            href: '/profile/management',
            variant: 'secondary',
            color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
          },
          {
            id: 'system_settings',
            label: 'System Settings',
            description: 'Configure system options',
            icon: Settings,
            onClick: () => {
              console.log('System settings clicked');
            },
            variant: 'outline',
            color: 'hover:bg-gray-50',
          },
          {
            id: 'reports',
            label: 'Reports',
            description: 'View system reports',
            icon: Award,
            onClick: () => {
              console.log('Reports clicked');
            },
            variant: 'outline',
            color: 'hover:bg-gray-50',
          },
        ];

      default:
        return [];
    }
  };

  // Common actions for all users
  const commonActions: QuickAction[] = [
    {
      id: 'download_data',
      label: 'Download Data',
      description: 'Export your account data',
      icon: Download,
      onClick: () => {
        console.log('Download data clicked');
      },
      variant: 'outline',
      color: 'hover:bg-gray-50',
    },
    {
      id: 'share_profile',
      label: 'Share Profile',
      description: 'Share your public profile',
      icon: Share2,
      onClick: () => {
        console.log('Share profile clicked');
      },
      variant: 'outline',
      color: 'hover:bg-gray-50',
    },
    {
      id: 'get_help',
      label: 'Get Help',
      description: 'Contact support',
      icon: HelpCircle,
      onClick: () => {
        console.log('Get help clicked');
      },
      variant: 'outline',
      color: 'hover:bg-gray-50',
    },
  ];

  const allActions = [
    ...baseActions,
    ...getRoleSpecificActions(),
    ...commonActions,
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.location.href = action.href;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {allActions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleActionClick(action)}
          className={cn(
            "flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 transition-all duration-150 hover:shadow-sm",
            action.color || "hover:bg-gray-50"
          )}
        >
          <div className="w-8 h-8 mb-3 flex items-center justify-center">
            <action.icon className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-sm text-gray-900 mb-1">
            {action.label}
          </h4>
          <p className="text-xs text-gray-600 leading-tight">
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
}

/**
 * Compact ProfileQuickActions for mobile screens
 */
export function CompactProfileQuickActions({ userRole }: ProfileQuickActionsProps) {
  const primaryActions = [
    {
      id: 'edit_profile',
      label: 'Edit Profile',
      icon: Edit,
      href: '/profile/settings',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      href: '/profile/security',
    },
    userRole === 'guest' 
      ? {
          id: 'bookings',
          label: 'Bookings',
          icon: Calendar,
          href: '/profile/bookings',
        }
      : {
          id: 'properties',
          label: 'Properties',
          icon: Home,
          href: '/profile/properties',
        },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      onClick: () => console.log('Help clicked'),
    },
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {primaryActions.map((action) => (
        <button
          key={action.id}
          onClick={() => {
            if ('onClick' in action && action.onClick) {
              action.onClick();
            } else if ('href' in action && action.href) {
              window.location.href = action.href;
            }
          }}
          className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex-shrink-0 min-w-[80px]"
        >
          <action.icon className="w-5 h-5 text-gray-600 mb-1" />
          <span className="text-xs font-medium text-gray-900">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Contextual ProfileQuickActions based on current page
 */
export function ContextualProfileQuickActions({ 
  userRole, 
  currentPage 
}: ProfileQuickActionsProps & { currentPage: string }) {
  const getContextualActions = () => {
    switch (currentPage) {
      case 'overview':
        return [
          { icon: Edit, label: 'Edit Profile', href: '/profile/settings' },
          { icon: Camera, label: 'Change Photo', onClick: () => {} },
          { icon: Shield, label: 'Security', href: '/profile/security' },
        ];
      case 'settings':
        return [
          { icon: Shield, label: 'Security', href: '/profile/security' },
          { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
          { icon: Download, label: 'Export Data', onClick: () => {} },
        ];
      default:
        return [];
    }
  };

  const actions = getContextualActions();

  if (actions.length === 0) return null;

  return (
    <div className="flex space-x-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => {
            if ('onClick' in action && action.onClick) {
              action.onClick();
            } else if ('href' in action && action.href) {
              window.location.href = action.href;
            }
          }}
          className="flex items-center space-x-1"
        >
          <action.icon className="w-4 h-4" />
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

export default ProfileQuickActions;