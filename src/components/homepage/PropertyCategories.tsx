import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';

import type { PropertyCategory } from '@/lib/data/homepage-data';

interface PropertyCategoriesProps {
  categories: PropertyCategory[];
}

export function PropertyCategories({ categories }: PropertyCategoriesProps) {
  return (
    <section className='py-32 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50'>
      <div className='container-fluid'>
        <div className='text-center mb-20'>
          <div className='inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6'>
            <Star className='w-4 h-4 mr-2 fill-current' />
            Handpicked Categories
          </div>
          <h2 className='text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight'>
            Choose Your Perfect
            <span className='text-gradient bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent'>
              {' '}
              Experience
            </span>
          </h2>
          <p className='text-gray-600 text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
            From luxury villas to urban penthouses, each category offers unique experiences
            tailored to your desires
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
          {categories.map((category, index) => (
            <article
              key={category.title}
              className='group cursor-pointer animate-slide-up'
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className='relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] backdrop-blur-sm'>
                <figure className='aspect-[4/3] overflow-hidden relative'>
                  <Image
                    src={category.image}
                    alt={`${category.title} - ${category.subtitle}`}
                    fill
                    className='object-cover transition-transform duration-700 group-hover:scale-110'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />
                </figure>

                {/* Category badge */}
                <div className='absolute top-4 left-4 text-3xl' aria-hidden="true">{category.icon}</div>

                {/* Content */}
                <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                  <h3 className='text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors'>
                    {category.title}
                  </h3>
                  <p className='text-sm opacity-90 mb-2'>{category.subtitle}</p>
                  <p className='text-xs opacity-75'>{category.count}</p>
                </div>

                {/* Hover arrow */}
                <div className='absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100' aria-hidden="true">
                  <ArrowRight className='w-5 h-5 text-white' />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}