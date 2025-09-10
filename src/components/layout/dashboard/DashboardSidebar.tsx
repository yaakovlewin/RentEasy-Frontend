/**
 * @fileoverview Dashboard Sidebar Component
 * 
 * CLIENT COMPONENT providing role-based navigation for dashboard layout.
 * Features responsive design, hierarchical navigation, and active state management.
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Settings,
  Heart,
  CreditCard,
  Building2,
  Shield,
  Database,
  FileText,
  HelpCircle,
  Star,
  MessageSquare
} from 'lucide-react';

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

interface DashboardSidebarProps {
  user: JWTPayload;
  config: DashboardLayoutConfig;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

/**
 * Dashboard sidebar with role-based navigation
 */
export function DashboardSidebar({ user, config }: DashboardSidebarProps) {
  const pathname = usePathname();

  /**
   * Get role-based navigation items
   */
  const navigationItems = useMemo((): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        name: 'Overview',
        href: getDashboardPath(user.role),
        icon: Home,
      },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          {
            name: 'System',
            href: '/admin/system',
            icon: Database,
            children: [
              { name: 'Health', href: '/admin/system/health', icon: Shield },
              { name: 'Analytics', href: '/admin/system/analytics', icon: BarChart3 },
              { name: 'Logs', href: '/admin/system/logs', icon: FileText },
            ],
          },
          {
            name: 'Users',
            href: '/admin/users',
            icon: Users,
            badge: '12',
          },
          {
            name: 'Properties',
            href: '/admin/properties',
            icon: Building2,
            badge: '45',
          },
          {
            name: 'Bookings',
            href: '/admin/bookings',
            icon: Calendar,
          },
          {
            name: 'Reports',
            href: '/admin/reports',
            icon: BarChart3,
          },
          {
            name: 'Settings',
            href: '/admin/settings',
            icon: Settings,
          },
        ];

      case 'staff':
        return [
          ...baseItems,
          {
            name: 'Users',
            href: '/admin/users',
            icon: Users,
          },
          {
            name: 'Properties',
            href: '/admin/properties',
            icon: Building2,
          },
          {
            name: 'Bookings',
            href: '/admin/bookings',
            icon: Calendar,
          },
          {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
          },
          {
            name: 'Support',
            href: '/admin/support',
            icon: HelpCircle,
            badge: '3',
          },
        ];

      case 'owner':
        return [
          ...baseItems,
          {
            name: 'Properties',
            href: '/host/properties',
            icon: Building2,
            children: [
              { name: 'All Properties', href: '/host/properties', icon: Building2 },
              { name: 'Add Property', href: '/host/properties/new', icon: MapPin },
            ],
          },
          {
            name: 'Bookings',
            href: '/host/bookings',
            icon: Calendar,
            badge: 'new',
          },
          {
            name: 'Calendar',
            href: '/host/calendar',
            icon: Calendar,
          },
          {
            name: 'Reviews',
            href: '/host/reviews',
            icon: Star,
          },
          {
            name: 'Messages',
            href: '/host/messages',
            icon: MessageSquare,
            badge: '2',
          },
          {
            name: 'Earnings',
            href: '/host/earnings',
            icon: CreditCard,
          },
          {
            name: 'Insights',
            href: '/host/insights',
            icon: BarChart3,
          },
        ];

      default: // guest
        return [
          ...baseItems,
          {
            name: 'My Trips',
            href: '/dashboard/trips',
            icon: Calendar,
            children: [
              { name: 'Upcoming', href: '/dashboard/trips/upcoming', icon: Calendar },
              { name: 'Past Trips', href: '/dashboard/trips/past', icon: Calendar },
            ],
          },
          {
            name: 'Favorites',
            href: '/dashboard/favorites',
            icon: Heart,
            badge: '5',
          },
          {
            name: 'Messages',
            href: '/dashboard/messages',
            icon: MessageSquare,
            badge: '1',
          },
          {
            name: 'Payment & Billing',
            href: '/dashboard/billing',
            icon: CreditCard,
          },
          {
            name: 'Profile',
            href: '/dashboard/profile',
            icon: Users,
          },
        ];
    }
  }, [user.role]);

  /**
   * Check if navigation item is active
   */
  const isActive = (href: string): boolean => {
    if (href === getDashboardPath(user.role)) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  /**
   * Render navigation item
   */
  const renderNavItem = (item: NavigationItem, level: number = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.href}>
        <Link
          href={item.href}
          className={`
            group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200
            ${level > 0 ? 'ml-4 pl-8' : ''}
            ${active 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <div className="flex items-center">
            <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
              active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
            }`} />
            <span className="truncate">{item.name}</span>
          </div>
          
          {/* Badge */}
          {item.badge && (
            <span className={`
              inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
              ${typeof item.badge === 'number' || !isNaN(Number(item.badge))
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
              }
            `}>
              {item.badge}
            </span>
          )}
        </Link>
        
        {/* Render children */}
        {hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
        {/* Logo area */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">RE</span>
            </div>
            <span className="font-bold">RentEasy</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => renderNavItem(item))}
          </nav>

          {/* Bottom section: Help & Support */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <Link
              href="/help"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <HelpCircle className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: string): string {
  switch (role) {
    case 'owner':
      return '/host/dashboard';
    case 'staff':
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}