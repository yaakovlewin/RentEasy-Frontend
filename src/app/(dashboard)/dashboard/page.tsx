/**
 * @fileoverview Enterprise Guest Dashboard Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized guest dashboard with comprehensive metadata for user experience.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { generateDashboardMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for guest dashboard
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    return generateDashboardMetadata('guest');
  } catch (error) {
    console.error('Error generating guest dashboard metadata:', error);
    
    return {
      title: 'My Dashboard - Bookings & Favorites | RentEasy',
      description: 'View your bookings, manage favorites, and track your travel plans on your RentEasy dashboard.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className='flex items-center justify-center min-h-screen'>
            <LoadingSpinner size='lg' />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}