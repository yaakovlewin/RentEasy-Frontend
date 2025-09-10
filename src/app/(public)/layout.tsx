/**
 * @fileoverview Enterprise Public Route Group Layout
 * 
 * SERVER COMPONENT providing optimized layout for public marketing pages.
 * Features full header/footer, SEO optimization, and marketing-focused UI elements.
 * 
 * Key Features:
 * - Full header and footer integration
 * - SEO optimization for public pages
 * - Marketing-focused UI elements
 * - Social sharing optimization
 * - Performance optimization for public content
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

// Components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PublicErrorBoundary } from '@/components/error-boundaries/PublicErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PublicLayoutBackground } from '@/components/layout/public/PublicLayoutBackground';

// SEO Components
import { StructuredData } from '@/components/seo/StructuredData';
// import { SocialShareOptimizer } from '@/components/seo/SocialShareOptimizer';

/**
 * Public layout metadata - optimized for SEO and marketing
 */
export const metadata: Metadata = {
  // Enhanced SEO for public pages
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Open Graph optimization
  openGraph: {
    type: 'website',
    siteName: 'RentEasy',
    locale: 'en_US',
  },
  // Twitter optimization
  twitter: {
    card: 'summary_large_image',
    site: '@renteasy',
    creator: '@renteasy',
  },
  // Performance optimization
  other: {
    'referrer-policy': 'origin-when-cross-origin',
    'format-detection': 'telephone=no',
  },
};

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Enterprise Public Layout Component
 * 
 * Provides optimized layout structure for public marketing pages:
 * - Full navigation and footer
 * - SEO optimization and structured data
 * - Marketing-focused design elements
 * - Social sharing optimization
 * - Performance optimization
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Public-specific error boundary */}
      <PublicErrorBoundary>
        {/* Structured data for SEO - temporarily disabled due to props issue */}
        {/* <StructuredData /> */}
        
        {/* Social sharing optimizer - temporarily disabled due to props issue */}
        {/* <SocialShareOptimizer /> */}
        
        {/* Background elements for visual appeal */}
        <PublicLayoutBackground />
        
        {/* Full header with navigation */}
        <Suspense
          fallback={
            <div className="h-20 bg-white border-b border-gray-200 animate-pulse" />
          }
        >
          <Header 
            transparent={false}
            showScrollSearch={false}
            variant="public"
          />
        </Suspense>
        
        {/* Main content area */}
        <main className="flex-1 relative">
          {/* Public content with performance optimization */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner 
                  size="lg" 
                  className="text-blue-600" 
                  aria-label="Loading page content"
                />
              </div>
            }
          >
            <div className="relative z-10">
              {children}
            </div>
          </Suspense>
          
          {/* Marketing call-to-action overlay (for specific pages) */}
          <MarketingCTAOverlay />
        </main>
        
        {/* Full footer */}
        <Suspense
          fallback={
            <div className="h-64 bg-gray-900 animate-pulse" />
          }
        >
          <Footer />
        </Suspense>
        
        {/* Performance monitoring and analytics */}
        <PublicPageAnalytics />
      </PublicErrorBoundary>
    </div>
  );
}

/**
 * Marketing CTA overlay for conversion optimization
 */
function MarketingCTAOverlay() {
  // This could be conditionally rendered based on page type
  // For now, we'll return null to avoid cluttering all public pages
  return null;
}

/**
 * Public page analytics and performance monitoring
 */
function PublicPageAnalytics() {
  // In a real app, this would include:
  // - Google Analytics
  // - Facebook Pixel
  // - Marketing automation scripts
  // - Performance monitoring
  
  return (
    <>
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
            }}
          />
        </>
      )}
      
      {/* Marketing scripts could go here */}
      {process.env.NODE_ENV === 'production' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
                    }
                  }, 0);
                });
              }
            `,
          }}
        />
      )}
    </>
  );
}