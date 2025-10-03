/**
 * @fileoverview Enterprise Host Bookings Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized host bookings management page with comprehensive metadata.
 */

import type { Metadata } from 'next';
import HostBookingsClient from './HostBookingsClient';
import { generateDashboardMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for host bookings page
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const metadata = await generateDashboardMetadata('host');
    return {
      ...metadata,
      title: 'Manage Bookings - Host Dashboard | RentEasy',
      description: 'Manage your property bookings, view reservations, and communicate with guests on your RentEasy host bookings page.',
    };
  } catch (error) {
    return {
      title: 'Manage Bookings - Host Dashboard | RentEasy',
      description: 'Manage your property bookings, view reservations, and communicate with guests on your RentEasy host bookings page.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * HostBookingsPage - Enterprise Server Component with SEO Optimization
 */
export default async function HostBookingsPage() {
  return <HostBookingsClient />;
}
