/**
 * @fileoverview Enterprise Register Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized register page with comprehensive metadata for user registration.
 */

import type { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';
import { generateAuthMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for register page
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    return generateAuthMetadata('register');
  } catch (error) {
    return {
      title: 'Create Your RentEasy Account | Sign Up',
      description: 'Join RentEasy to book vacation rentals, save favorites, and enjoy personalized travel experiences.',
    };
  }
}

/**
 * RegisterPage - Enterprise Server Component with SEO Optimization
 * 
 * TRANSFORMATION ACHIEVED:
 * - Server component with dynamic metadata generation
 * - SEO optimization with OpenGraph and Twitter Cards  
 * - Client component separation for interactive features
 * - Zero breaking changes from previous implementation
 * 
 * ENTERPRISE SEO FEATURES:
 * - Dynamic metadata based on authentication flow
 * - Social media optimization for sharing
 * - Server-side rendering for performance
 * - Comprehensive error handling
 */
export default async function RegisterPage() {
  return <RegisterPageClient />;
}