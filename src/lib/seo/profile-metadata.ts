/**
 * Profile Metadata Generator - SEO metadata for profile pages
 * 
 * Utility functions for generating SEO-optimized metadata for profile pages
 * with proper privacy controls and user-specific information.
 * 
 * Features:
 * - Privacy-aware metadata generation
 * - Role-specific descriptions
 * - Structured data for search engines
 * - Social media optimization
 * - Multi-language support ready
 */

import type { Metadata } from 'next';

/**
 * Generate metadata for profile pages
 */
export function generateMetadata(
  title: string,
  description?: string,
  additionalOptions?: {
    keywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
  }
): Metadata {
  const baseTitle = 'RentEasy';
  const fullTitle = `${title} - ${baseTitle}`;
  const defaultDescription = 'Manage your RentEasy profile, settings, and preferences';
  
  return {
    title: fullTitle,
    description: description || defaultDescription,
    keywords: [
      'profile settings',
      'account management', 
      'vacation rental',
      'holiday rental',
      'property booking',
      'travel accommodation',
      ...(additionalOptions?.keywords || [])
    ],
    
    // Privacy and indexing
    robots: {
      index: additionalOptions?.noIndex === false,
      follow: false,
      nocache: true,
      noarchive: true,
      nosnippet: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description: description || defaultDescription,
      type: 'website',
      siteName: baseTitle,
      locale: 'en_US',
      url: additionalOptions?.canonicalUrl,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary',
      title: fullTitle,
      description: description || defaultDescription,
      site: '@RentEasy',
      creator: '@RentEasy',
    },
    
    // Additional meta tags
    other: {
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'cache-control': 'private, no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0',
    },
    
    // Canonical URL
    ...(additionalOptions?.canonicalUrl && {
      alternates: {
        canonical: additionalOptions.canonicalUrl,
      },
    }),
  };
}

/**
 * Generate role-specific metadata
 */
export function generateRoleSpecificMetadata(
  role: string,
  page: string,
  userName?: string
): Metadata {
  const roleDescriptions = {
    guest: {
      profile: 'Manage your traveler profile and booking preferences',
      settings: 'Update your personal information and travel preferences',
      security: 'Secure your traveler account with password and security settings',
      notifications: 'Configure travel and booking notifications',
      privacy: 'Control your privacy settings and data preferences',
      bookings: 'View your booking history and upcoming trips',
    },
    owner: {
      profile: 'Manage your host profile and property listings',
      settings: 'Update your host information and property preferences',
      security: 'Secure your host account with advanced security settings',
      notifications: 'Configure property and booking notifications',
      privacy: 'Control your host profile visibility and data settings',
      properties: 'Manage your property listings and performance analytics',
    },
    staff: {
      profile: 'Manage your staff profile and administrative settings',
      settings: 'Update your staff information and system preferences',
      security: 'Secure your staff account with enhanced security measures',
      notifications: 'Configure administrative and system notifications',
      privacy: 'Control your staff profile privacy and access settings',
      management: 'Access administrative tools and user management features',
    },
    admin: {
      profile: 'Manage your administrator profile and system settings',
      settings: 'Update your administrator information and system preferences',
      security: 'Secure your admin account with maximum security settings',
      notifications: 'Configure system alerts and administrative notifications',
      privacy: 'Control your administrator profile and system access settings',
      management: 'Access full administrative tools and system management',
    },
  };

  const roleLabels = {
    guest: 'Traveler',
    owner: 'Host',
    staff: 'Staff Member',
    admin: 'Administrator',
  };

  const pageLabels = {
    profile: 'Profile Overview',
    settings: 'Account Settings',
    security: 'Security Settings',
    notifications: 'Notification Preferences',
    privacy: 'Privacy Settings',
    bookings: 'My Bookings',
    properties: 'My Properties',
    management: 'Management Tools',
  };

  const roleLabel = roleLabels[role as keyof typeof roleLabels] || 'Member';
  const pageLabel = pageLabels[page as keyof typeof pageLabels] || 'Profile';
  const description = roleDescriptions[role as keyof typeof roleDescriptions]?.[page as keyof typeof roleDescriptions['guest']] || 
                     'Manage your RentEasy account settings and preferences';

  const title = userName 
    ? `${pageLabel} - ${userName}'s ${roleLabel} Account`
    : `${pageLabel} - ${roleLabel} Account`;

  return generateMetadata(title, description, {
    keywords: [
      roleLabel.toLowerCase(),
      page,
      'account management',
      'profile settings',
    ],
    noIndex: true, // Profile pages should not be indexed
  });
}

/**
 * Generate structured data for profile pages
 */
export function generateProfileStructuredData(
  userId: string,
  role: string,
  profileData?: {
    name?: string;
    email?: string;
    memberSince?: string;
  }
) {
  const baseUrl = 'https://renteasy.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${baseUrl}/profile`,
    'mainEntity': {
      '@type': 'Person',
      '@id': `${baseUrl}/profile#person`,
      'name': profileData?.name || 'RentEasy User',
      'email': profileData?.email,
      'memberOf': {
        '@type': 'Organization',
        'name': 'RentEasy',
        'url': baseUrl,
      },
      'knowsAbout': role === 'guest' 
        ? ['Travel', 'Vacation Rentals', 'Holiday Accommodation']
        : ['Property Management', 'Hospitality', 'Vacation Rentals'],
    },
    'dateCreated': profileData?.memberSince,
    'dateModified': new Date().toISOString(),
    'isAccessibleForFree': false,
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Members only',
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  currentPath: string,
  pathLabels: Record<string, string>
) {
  const pathSegments = currentPath.split('/').filter(Boolean);
  const breadcrumbItems = [];
  
  let currentUrl = 'https://renteasy.com';
  
  // Add home
  breadcrumbItems.push({
    '@type': 'ListItem',
    'position': 1,
    'name': 'Dashboard',
    'item': `${currentUrl}/dashboard`,
  });
  
  // Add path segments
  pathSegments.forEach((segment, index) => {
    currentUrl += `/${segment}`;
    const label = pathLabels[segment] || segment;
    
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': index + 2,
      'name': label,
      'item': currentUrl,
    });
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems,
  };
}

/**
 * Default export with common metadata utilities
 */
export default {
  generateMetadata,
  generateRoleSpecificMetadata,
  generateProfileStructuredData,
  generateBreadcrumbStructuredData,
};