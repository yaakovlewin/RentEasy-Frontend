/**
 * @fileoverview Enterprise Search Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized search page with dynamic metadata based on search parameters.
 */

import type { Metadata } from 'next';
import SearchClient from './SearchClient';
import { generateSearchMetadata, generateSearchStructuredData, type SearchParams } from '@/lib/metadata';

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * Generate dynamic metadata for search pages
 * Critical for SEO optimization based on search parameters
 */
export async function generateMetadata(
  { searchParams }: SearchPageProps
): Promise<Metadata> {
  try {
    const params = await searchParams;
    return generateSearchMetadata(params);
  } catch (error) {
    console.error('Error generating search metadata:', error);
    
    return {
      title: 'Search Vacation Rentals | RentEasy',
      description: 'Find the perfect vacation rental for your next trip. Browse thousands of properties worldwide.',
    };
  }
}

/**
 * SearchPage - Enterprise Server Component with SEO Optimization
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateSearchStructuredData(params),
        }}
      />
      
      {/* Search Page Content */}
      <SearchClient />
    </>
  );
}