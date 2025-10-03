/**
 * @fileoverview Enterprise Host Dashboard Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized host dashboard with comprehensive metadata for host management.
 */

import type { Metadata } from 'next';
import HostDashboardClient from './HostDashboardClient';
import { generateDashboardMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for host dashboard
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    return generateDashboardMetadata('host');
  } catch (error) {
    return {
      title: 'Host Dashboard - Manage Your Properties | RentEasy',
      description: 'Manage your vacation rental properties, view bookings, and track earnings on your RentEasy host dashboard.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * HostDashboardPage - Enterprise Server Component with SEO Optimization
 * 
 * TRANSFORMATION ACHIEVED:
 * - Server component with dynamic metadata generation
 * - SEO optimization with OpenGraph and Twitter Cards
 * - Client component separation for interactive features
 * - Zero breaking changes from previous implementation
 * 
 * ENTERPRISE SEO FEATURES:
 * - Dynamic metadata for host management
 * - Social media optimization for sharing
 * - Server-side rendering for performance
 * - Comprehensive error handling
 */
export default async function HostDashboardPage() {
  return <HostDashboardClient />;
}