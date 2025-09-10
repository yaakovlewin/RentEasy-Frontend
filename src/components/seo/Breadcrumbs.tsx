/**
 * SEO-Optimized Breadcrumb Navigation - RentEasy
 * 
 * Accessible breadcrumb navigation with Schema.org markup for enhanced SEO.
 * Supports nested navigation, custom separators, and rich snippets.
 * 
 * Features:
 * - Automatic Schema.org BreadcrumbList generation
 * - Accessible navigation with ARIA labels
 * - Customizable styling and separators
 * - Mobile-responsive design
 * - Click tracking for analytics
 * - Truncation for long paths
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { StructuredDataComponent } from './StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { BreadcrumbItem } from '@/lib/seo/structured-data';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeLabel?: string;
  homeUrl?: string;
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  linkClassName?: string;
  currentClassName?: string;
  enableStructuredData?: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

/**
 * SEO-optimized breadcrumb navigation component
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 8,
  showHome = true,
  homeLabel = 'Home',
  homeUrl = '/',
  className,
  itemClassName,
  separatorClassName,
  linkClassName,
  currentClassName,
  enableStructuredData = true,
  onItemClick,
}) => {
  // Prepare breadcrumb items with home if enabled
  const allItems: BreadcrumbItem[] = showHome
    ? [{ name: homeLabel, url: homeUrl, position: 1 }, ...items.map(item => ({ ...item, position: item.position + 1 }))]
    : items;

  // Truncate items if needed
  const displayItems = maxItems && allItems.length > maxItems
    ? [
        allItems[0],
        { name: '...', url: '#', position: 2 },
        ...allItems.slice(-(maxItems - 2))
      ]
    : allItems;

  // Generate structured data
  const structuredData = enableStructuredData ? generateBreadcrumbSchema(allItems) : null;

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    onItemClick?.(item, index);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'breadcrumb_click', {
        event_category: 'navigation',
        event_label: item.name,
        breadcrumb_position: index + 1,
      });
    }
  };

  return (
    <>
      <nav 
        aria-label="Breadcrumb navigation"
        className={cn(
          'flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300',
          className
        )}
      >
        <ol className="flex items-center space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isEllipsis = item.name === '...';
            const isHome = index === 0 && showHome;

            return (
              <li
                key={`${item.url}-${index}`}
                className={cn(
                  'flex items-center',
                  itemClassName
                )}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {/* Breadcrumb Item */}
                {isEllipsis ? (
                  <span 
                    className="px-2 py-1 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  >
                    {item.name}
                  </span>
                ) : isLast ? (
                  <span
                    className={cn(
                      'px-2 py-1 font-medium text-gray-900 dark:text-gray-100',
                      currentClassName
                    )}
                    aria-current="page"
                    itemProp="name"
                  >
                    {isHome && <Home className="inline h-4 w-4 mr-1" aria-hidden="true" />}
                    {item.name}
                    <meta itemProp="position" content={String(item.position)} />
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className={cn(
                      'px-2 py-1 rounded-md transition-colors duration-200',
                      'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      linkClassName
                    )}
                    onClick={() => handleItemClick(item, index)}
                    itemProp="item"
                  >
                    <span itemProp="name">
                      {isHome && <Home className="inline h-4 w-4 mr-1" aria-hidden="true" />}
                      {item.name}
                    </span>
                    <meta itemProp="position" content={String(item.position)} />
                  </Link>
                )}

                {/* Separator */}
                {!isLast && (
                  <span 
                    className={cn(
                      'mx-1 flex items-center text-gray-400 dark:text-gray-500',
                      separatorClassName
                    )}
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Structured Data */}
      {structuredData && (
        <StructuredDataComponent data={structuredData} />
      )}
    </>
  );
};

/**
 * Hook to generate breadcrumbs from current pathname
 */
export const useBreadcrumbs = (
  pathname: string,
  customLabels?: Record<string, string>,
  excludePaths?: string[]
): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const url = '/' + segments.slice(0, index + 1).join('/');
    
    // Skip excluded paths
    if (excludePaths?.includes(url)) return;

    // Generate readable name
    const name = customLabels?.[url] || 
                 customLabels?.[segment] || 
                 segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    breadcrumbs.push({
      name,
      url,
      position: breadcrumbs.length + 1,
    });
  });

  return breadcrumbs;
};

/**
 * Predefined breadcrumb configurations for common RentEasy pages
 */
export const RENTEASY_BREADCRUMB_CONFIGS = {
  property: (propertyId: string, propertyTitle?: string) => [
    { name: 'Properties', url: '/properties', position: 1 },
    { name: propertyTitle || `Property ${propertyId}`, url: `/property/${propertyId}`, position: 2 },
  ],
  
  search: (location?: string) => [
    { 
      name: location ? `Search in ${location}` : 'Search Results', 
      url: '/search', 
      position: 1 
    },
  ],
  
  profile: (section?: string) => [
    { name: 'Profile', url: '/profile', position: 1 },
    ...(section ? [{ name: section, url: `/profile/${section.toLowerCase()}`, position: 2 }] : []),
  ],

  dashboard: (section?: string) => [
    { name: 'Dashboard', url: '/dashboard', position: 1 },
    ...(section ? [{ name: section, url: `/dashboard/${section.toLowerCase()}`, position: 2 }] : []),
  ],

  booking: (bookingId?: string) => [
    { name: 'Bookings', url: '/bookings', position: 1 },
    ...(bookingId ? [{ name: `Booking ${bookingId}`, url: `/booking/${bookingId}`, position: 2 }] : []),
  ],
} as const;

export default Breadcrumbs;