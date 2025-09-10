/**
 * ProfileBreadcrumbs Component - Navigation breadcrumbs for profile pages
 * 
 * Professional breadcrumb navigation component for profile pages
 * with dynamic path resolution and accessible navigation.
 * 
 * Features:
 * - Dynamic breadcrumb generation from current path
 * - Accessible navigation with proper ARIA labels
 * - Responsive design with mobile truncation
 * - Role-aware breadcrumb labels
 * - Click-through navigation support
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Breadcrumb path configuration
 */
const breadcrumbConfig: Record<string, { label: string; description?: string }> = {
  'profile': { label: 'Profile', description: 'Profile overview and settings' },
  'settings': { label: 'Account Settings', description: 'Personal information and preferences' },
  'security': { label: 'Security', description: 'Password and security settings' },
  'notifications': { label: 'Notifications', description: 'Email and notification preferences' },
  'privacy': { label: 'Privacy', description: 'Privacy settings and data management' },
  'bookings': { label: 'My Bookings', description: 'Booking history and travel plans' },
  'properties': { label: 'My Properties', description: 'Property management and analytics' },
  'management': { label: 'Management', description: 'Administrative tools and reports' },
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
  description?: string;
}

/**
 * ProfileBreadcrumbs Component
 * 
 * Dynamic breadcrumb navigation for profile pages with
 * proper accessibility and responsive design.
 */
export function ProfileBreadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];
    
    // Add home/dashboard link
    items.push({
      label: 'Dashboard',
      href: '/dashboard',
      isLast: false,
    });

    // Build breadcrumb path
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = breadcrumbConfig[segment];
      const isLast = index === pathSegments.length - 1;
      
      if (config) {
        items.push({
          label: config.label,
          href: currentPath,
          isLast,
          description: config.description,
        });
      }
    });

    return items;
  }, [pathname]);

  // Don't render if only one item (just dashboard)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Profile navigation breadcrumb"
      className="flex items-center space-x-1 text-sm text-gray-600"
    >
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" aria-hidden="true" />
          )}
          
          {index === 0 && (
            <Home className="w-4 h-4 text-gray-400 mr-2" aria-hidden="true" />
          )}
          
          {item.isLast ? (
            <span 
              className="font-medium text-gray-900"
              aria-current="page"
              title={item.description}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-gray-900 transition-colors duration-150"
              title={item.description}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

/**
 * Compact ProfileBreadcrumbs for mobile screens
 */
export function CompactProfileBreadcrumbs() {
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const config = breadcrumbConfig[lastSegment];
    
    return config?.label || 'Profile';
  }, [pathname]);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 lg:hidden">
      <Link
        href="/profile"
        className="flex items-center hover:text-gray-900 transition-colors duration-150"
      >
        <Home className="w-4 h-4 mr-1" />
        Profile
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="font-medium text-gray-900 truncate">
        {currentPage}
      </span>
    </div>
  );
}

/**
 * ProfileBreadcrumbsWithActions - Extended breadcrumbs with action buttons
 */
export function ProfileBreadcrumbsWithActions({ 
  actions 
}: { 
  actions?: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between">
      <ProfileBreadcrumbs />
      
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Structured breadcrumbs for SEO
 */
export function StructuredBreadcrumbs() {
  const pathname = usePathname();
  
  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items: Array<{ name: string; item: string; position: number }> = [];
    
    // Add dashboard as first item
    items.push({
      name: 'Dashboard',
      item: 'https://renteasy.com/dashboard',
      position: 1,
    });

    // Build structured breadcrumb data
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = breadcrumbConfig[segment];
      
      if (config) {
        items.push({
          name: config.label,
          item: `https://renteasy.com${currentPath}`,
          position: index + 2,
        });
      }
    });

    return items;
  }, [pathname]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map(item => ({
      "@type": "ListItem",
      "position": item.position,
      "name": item.name,
      "item": item.item,
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default ProfileBreadcrumbs;