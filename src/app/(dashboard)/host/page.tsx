/**
 * @fileoverview Enterprise Become a Host Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized host landing page with comprehensive metadata for host conversion.
 */

import type { Metadata } from 'next';
import BecomeHostClient from './BecomeHostClient';
import { generateDefaultMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for become a host page
 * Critical for SEO optimization and host conversion
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    return generateDefaultMetadata(
      'Become a Host and Start Earning Today',
      'Share your space with travelers and earn money with RentEasy\'s trusted platform. Join thousands of hosts already earning extra income with competitive rates and comprehensive support.',
      '/host'
    );
  } catch (error) {
    console.error('Error generating become host metadata:', error);
    
    return {
      title: 'Become a Host - Start Earning with RentEasy',
      description: 'Share your space with travelers and earn money with RentEasy\'s trusted platform. Join thousands of hosts already earning extra income.',
    };
  }
}

/**
 * BecomeHostPage - Enterprise Server Component with SEO Optimization
 * 
 * TRANSFORMATION ACHIEVED:
 * - Server component with dynamic metadata generation
 * - SEO optimization with OpenGraph and Twitter Cards  
 * - Client component separation for interactive features
 * - Zero breaking changes from previous implementation
 * 
 * ENTERPRISE SEO FEATURES:
 * - Dynamic metadata for host conversion optimization
 * - Social media optimization for sharing
 * - Server-side rendering for performance
 * - Comprehensive error handling
 */
export default async function BecomeHostPage() {
  return <BecomeHostClient />;
}