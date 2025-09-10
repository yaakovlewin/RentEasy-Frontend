import { Suspense } from 'react';

import { getHomepageData } from '@/lib/data/homepage-data';
import { SearchBarPortal } from '@/components/search/SearchBarPortal';

import { HeroCarousel } from './HeroCarousel';
import { SearchWrapper } from './SearchWrapper';
import { PropertyCategories } from './PropertyCategories';
import { FeaturedProperties } from './FeaturedProperties';
import { Destinations } from './Destinations';
import { PremiumExperience } from './PremiumExperience';

/**
 * Loading components for better UX during hydration
 */
function HeroSkeleton() {
  return (
    <section className='relative min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='text-center text-gray-400'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 w-64 bg-gray-200 rounded mx-auto'></div>
          <div className='h-16 w-96 bg-gray-200 rounded mx-auto'></div>
          <div className='h-6 w-80 bg-gray-200 rounded mx-auto'></div>
        </div>
      </div>
    </section>
  );
}

function PropertiesSkeleton() {
  return (
    <section className='py-32 px-4 bg-white'>
      <div className='container-fluid'>
        <div className='text-center mb-20 animate-pulse'>
          <div className='h-8 w-48 bg-gray-200 rounded mx-auto mb-6'></div>
          <div className='h-12 w-80 bg-gray-200 rounded mx-auto mb-8'></div>
          <div className='h-6 w-96 bg-gray-200 rounded mx-auto'></div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='animate-pulse bg-white rounded-2xl shadow-lg p-0 overflow-hidden'>
              <div className='aspect-[4/3] bg-gray-200'></div>
              <div className='p-6 space-y-4'>
                <div className='h-5 bg-gray-200 rounded w-4/5'></div>
                <div className='h-4 bg-gray-200 rounded w-2/3'></div>
                <div className='grid grid-cols-2 gap-2'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className='h-6 bg-gray-200 rounded'></div>
                  ))}
                </div>
                <div className='flex justify-between items-center pt-4'>
                  <div className='h-8 bg-gray-200 rounded w-20'></div>
                  <div className='h-5 bg-gray-200 rounded w-16'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceSkeleton() {
  return (
    <section className='py-32 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-black'>
      <div className='container mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
          <div className='animate-pulse space-y-8'>
            <div className='h-10 w-80 bg-gray-700 rounded-full'></div>
            <div className='space-y-4'>
              <div className='h-16 w-full bg-gray-700 rounded'></div>
              <div className='h-16 w-4/5 bg-gray-700 rounded'></div>
            </div>
            <div className='h-24 w-full bg-gray-700 rounded'></div>
            <div className='grid grid-cols-2 gap-8'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='text-center space-y-2'>
                  <div className='h-12 w-12 bg-gray-700 rounded-full mx-auto'></div>
                  <div className='h-12 w-20 bg-gray-700 rounded mx-auto'></div>
                  <div className='h-4 w-24 bg-gray-700 rounded mx-auto'></div>
                </div>
              ))}
            </div>
          </div>
          <div className='animate-pulse'>
            <div className='aspect-[7/5] bg-gray-700 rounded-3xl'></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Main Homepage Server Component
 * 
 * PERFORMANCE IMPROVEMENTS:
 * - Server-side data fetching with parallel requests
 * - Static content rendered on server
 * - Client islands only for interactive features
 * - Progressive loading with Suspense boundaries
 * - Optimized bundle size (400 lines vs 757 lines)
 */
export async function HomePage() {
  // Server-side data fetching with error handling
  const homepageData = await getHomepageData();

  return (
    <SearchWrapper>
      <div className='w-full'>
        {/* Revolutionary Hero Section with Dynamic Carousel */}
        <section className='relative min-h-screen flex items-center justify-center'>
          <Suspense fallback={<HeroSkeleton />}>
            <HeroCarousel heroSlides={homepageData.heroSlides} />
          </Suspense>
        </section>

        {/* SearchBar Portal with View Transitions */}
        <SearchBarPortal heroVariant='hero' headerVariant='header' />

        {/* Premium Property Categories - Server Component */}
        <PropertyCategories categories={homepageData.categories} />

        {/* Premium Featured Properties - Client Component for Interactivity */}
        <Suspense fallback={<PropertiesSkeleton />}>
          <FeaturedProperties featuredProperties={homepageData.featuredProperties} />
        </Suspense>

        {/* Premium Destinations - Server Component */}
        <Destinations destinations={homepageData.destinations} />

        {/* Premium Experience Section - Client Component for Stats Animation */}
        <Suspense fallback={<ExperienceSkeleton />}>
          <PremiumExperience stats={homepageData.stats} />
        </Suspense>
      </div>
    </SearchWrapper>
  );
}