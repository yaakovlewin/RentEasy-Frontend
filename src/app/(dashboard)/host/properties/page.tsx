/**
 * @fileoverview Enterprise Host Properties Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized host properties management page with comprehensive metadata.
 */

import type { Metadata } from 'next';
import HostPropertiesClient from './HostPropertiesClient';
import { generateDashboardMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for host properties page
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const metadata = await generateDashboardMetadata('host');
    return {
      ...metadata,
      title: 'Manage Properties - Host Dashboard | RentEasy',
      description: 'Manage your vacation rental properties, update listings, and track performance on your RentEasy host properties page.',
    };
  } catch (error) {
    console.error('Error generating host properties metadata:', error);
    
    return {
      title: 'Manage Properties - Host Dashboard | RentEasy',
      description: 'Manage your vacation rental properties, update listings, and track performance on your RentEasy host properties page.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * HostPropertiesPage - Enterprise Server Component with SEO Optimization
 */
export default async function HostPropertiesPage() {
  return <HostPropertiesClient />;
}
