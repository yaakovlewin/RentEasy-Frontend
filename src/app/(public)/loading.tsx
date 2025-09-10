/**
 * Homepage Loading State - Optimized for Core Web Vitals
 * 
 * Provides immediate visual feedback while homepage data loads
 */

export default function Loading() {
  return (
    <div className='w-full'>
      {/* Hero Section Skeleton */}
      <section className='relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50'>
        <div className='text-center px-4 max-w-6xl'>
          <div className='animate-pulse space-y-8'>
            {/* Premium badge skeleton */}
            <div className='inline-block h-10 w-80 bg-gray-200 rounded-full'></div>
            
            {/* Main heading skeleton */}
            <div className='space-y-4'>
              <div className='h-16 sm:h-20 lg:h-24 w-96 bg-gray-200 rounded mx-auto'></div>
              <div className='h-16 sm:h-20 lg:h-24 w-80 bg-gray-300 rounded mx-auto'></div>
              <div className='h-16 sm:h-20 lg:h-24 w-72 bg-gray-200 rounded mx-auto'></div>
            </div>
            
            {/* Description skeleton */}
            <div className='space-y-3 max-w-4xl mx-auto'>
              <div className='h-6 bg-gray-200 rounded w-full'></div>
              <div className='h-6 bg-gray-200 rounded w-3/4 mx-auto'></div>
            </div>
            
            {/* Search bar skeleton */}
            <div className='h-16 w-full max-w-4xl bg-gray-200 rounded-2xl mx-auto'></div>
            
            {/* Trust indicators skeleton */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-8'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='h-12 w-48 bg-gray-200 rounded-full'></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className='py-32 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50'>
        <div className='container-fluid'>
          <div className='text-center mb-20 animate-pulse'>
            <div className='h-8 w-64 bg-gray-200 rounded mx-auto mb-6'></div>
            <div className='h-12 w-96 bg-gray-200 rounded mx-auto mb-8'></div>
            <div className='h-6 w-80 bg-gray-200 rounded mx-auto'></div>
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='aspect-[4/3] bg-gray-200 rounded-3xl mb-4'></div>
                <div className='space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/3'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section Skeleton */}
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
          
          <div className='text-center mt-20'>
            <div className='h-14 w-80 bg-gray-200 rounded-xl mx-auto animate-pulse'></div>
          </div>
        </div>
      </section>

      {/* Destinations Section Skeleton */}
      <section className='py-32 px-4 bg-gradient-to-br from-gray-50 via-white to-slate-50'>
        <div className='container mx-auto'>
          <div className='text-center mb-20 animate-pulse'>
            <div className='h-8 w-56 bg-gray-200 rounded mx-auto mb-6'></div>
            <div className='h-12 w-72 bg-gray-200 rounded mx-auto mb-8'></div>
            <div className='h-6 w-96 bg-gray-200 rounded mx-auto'></div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='aspect-[3/4] bg-gray-200 rounded-3xl'></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Experience Section Skeleton */}
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
              <div className='flex gap-4'>
                <div className='h-14 w-48 bg-gray-700 rounded-xl'></div>
                <div className='h-14 w-40 bg-gray-700 rounded-xl'></div>
              </div>
            </div>
            <div className='animate-pulse'>
              <div className='aspect-[7/5] bg-gray-700 rounded-3xl'></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}