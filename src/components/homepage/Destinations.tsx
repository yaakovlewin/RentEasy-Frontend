import Image from 'next/image';
import { MapPin, ChevronRight } from 'lucide-react';

import type { Destination } from '@/lib/data/homepage-data';

interface DestinationsProps {
  destinations: Destination[];
}

export function Destinations({ destinations }: DestinationsProps) {
  return (
    <section className='py-32 px-4 bg-gradient-to-br from-gray-50 via-white to-slate-50'>
      <div className='container mx-auto'>
        <div className='text-center mb-20'>
          <div className='inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6'>
            <MapPin className='w-4 h-4 mr-2' />
            Curated Destinations
          </div>
          <h2 className='text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight'>
            World-Class
            <span className='text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              {' '}
              Destinations
            </span>
          </h2>
          <p className='text-gray-600 text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
            Immerse yourself in the world's most desirable locations, each offering unique luxury
            experiences
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {destinations.map((destination, index) => (
            <article
              key={destination.name}
              className='group cursor-pointer animate-slide-up'
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className='relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2'>
                <figure className='aspect-[3/4] relative'>
                  <Image
                    src={destination.image}
                    alt={`${destination.name}, ${destination.country} - ${destination.specialty}`}
                    fill
                    className='object-cover transition-transform duration-700 group-hover:scale-110'
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  />
                </figure>

                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

                {/* Content */}
                <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                  <header className='mb-2'>
                    <h3 className='text-2xl font-bold mb-1 group-hover:text-yellow-300 transition-colors'>
                      {destination.name}
                    </h3>
                    <p className='text-sm opacity-90'>{destination.country}</p>
                  </header>

                  <footer className='flex items-center justify-between'>
                    <div>
                      <p className='text-xs opacity-75 mb-1'>{destination.specialty}</p>
                      <p className='text-sm font-semibold'>
                        {destination.properties.toLocaleString()} properties
                      </p>
                    </div>
                    <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100' aria-hidden="true">
                      <ChevronRight className='w-5 h-5 text-white' />
                    </div>
                  </footer>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}