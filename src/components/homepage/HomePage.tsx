import { Suspense } from 'react';

import { getHomepageData } from '@/lib/data/homepage-data';
import { SearchBarPortal } from '@/components/search/SearchBarPortal';
import { CoreSkeleton } from '@/components/ui/loading/skeletons';

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
        <div className='space-y-4'>
          <CoreSkeleton height='h-8' width='w-64' variant='rounded' shimmer={true} className='mx-auto' />
          <CoreSkeleton height='h-16' width='w-96' variant='rounded' shimmer={true} className='mx-auto' />
          <CoreSkeleton height='h-6' width='w-80' variant='rounded' shimmer={true} className='mx-auto' />
        </div>
      </div>
    </section>
  );
}

function PropertiesSkeleton() {
  return (
    <section className='py-32 px-4 bg-white'>
      <div className='container-fluid'>
        <div className='text-center mb-20'>
          <CoreSkeleton height='h-8' width='w-48' variant='rounded' shimmer={true} className='mx-auto mb-6' />
          <CoreSkeleton height='h-12' width='w-80' variant='rounded' shimmer={true} className='mx-auto mb-8' />
          <CoreSkeleton height='h-6' width='w-96' variant='rounded' shimmer={true} className='mx-auto' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='bg-white rounded-2xl shadow-lg p-0 overflow-hidden'>
              <CoreSkeleton variant='rectangular' className='aspect-[4/3]' shimmer={true} />
              <div className='p-6 space-y-4'>
                <CoreSkeleton height='h-5' width='w-4/5' variant='rounded' shimmer={true} />
                <CoreSkeleton height='h-4' width='w-2/3' variant='rounded' shimmer={true} />
                <div className='grid grid-cols-2 gap-2'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <CoreSkeleton key={j} height='h-6' variant='rounded' shimmer={true} />
                  ))}
                </div>
                <div className='flex justify-between items-center pt-4'>
                  <CoreSkeleton height='h-8' width='w-20' variant='rounded' shimmer={true} />
                  <CoreSkeleton height='h-5' width='w-16' variant='rounded' shimmer={true} />
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
          <div className='space-y-8'>
            <CoreSkeleton height='h-10' width='w-80' variant='rounded' shimmer={true} className='bg-gray-700' />
            <div className='space-y-4'>
              <CoreSkeleton height='h-16' width='w-full' variant='rounded' shimmer={true} className='bg-gray-700' />
              <CoreSkeleton height='h-16' width='w-4/5' variant='rounded' shimmer={true} className='bg-gray-700' />
            </div>
            <CoreSkeleton height='h-24' width='w-full' variant='rounded' shimmer={true} className='bg-gray-700' />
            <div className='grid grid-cols-2 gap-8'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='text-center space-y-2'>
                  <CoreSkeleton variant='circular' width='w-12' height='h-12' shimmer={true} className='bg-gray-700 mx-auto' />
                  <CoreSkeleton height='h-12' width='w-20' variant='rounded' shimmer={true} className='bg-gray-700 mx-auto' />
                  <CoreSkeleton height='h-4' width='w-24' variant='rounded' shimmer={true} className='bg-gray-700 mx-auto' />
                </div>
              ))}
            </div>
          </div>
          <div>
            <CoreSkeleton variant='rounded' className='aspect-[7/5] bg-gray-700' shimmer={true} />
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