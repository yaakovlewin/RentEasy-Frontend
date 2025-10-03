/**
 * @fileoverview Enterprise Login Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized login page with comprehensive metadata for user authentication.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { generateAuthMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for login page
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    return generateAuthMetadata('login');
  } catch (error) {
    return {
      title: 'Login to Your Account | RentEasy',
      description: 'Login to your RentEasy account to manage bookings, save favorites, and access your dashboard.',
    };
  }
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen'>
          <LoadingSpinner size='lg' />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}