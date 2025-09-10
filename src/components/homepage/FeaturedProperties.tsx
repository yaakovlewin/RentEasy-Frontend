'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Award, Play, Heart, Star, MapPin, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { FeaturedProperty } from '@/lib/data/homepage-data';

interface FeaturedPropertiesProps {
  featuredProperties: FeaturedProperty[];
}

export function FeaturedProperties({ featuredProperties }: FeaturedPropertiesProps) {
  return (
    <section className='py-32 px-4 bg-white relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-pink-500/5 rounded-full blur-3xl'></div>
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl'></div>

      <div className='container-fluid relative'>
        <div className='text-center mb-20'>
          <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-pink-500/10 text-primary rounded-full text-sm font-semibold mb-6'>
            <Award className='w-4 h-4 mr-2' />
            Editor's Choice
          </div>
          <h2 className='text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight'>
            Exceptional Properties
            <span className='text-gradient bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent'>
              {' '}
              Await You
            </span>
          </h2>
          <p className='text-gray-600 text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
            Individually selected for their unique character and unmatched luxury standards
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
          {featuredProperties.map((property, index) => (
            <article key={property.id}>
              <Link href={`/property/${property.id}`}>
                <Card
                  className='group cursor-pointer border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] animate-slide-up rounded-2xl backdrop-blur-sm'
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <header className='relative overflow-hidden'>
                    <figure className='aspect-[4/3] relative'>
                      <Image
                        src={property.image}
                        alt={`${property.title} in ${property.location}`}
                        fill
                        className='object-cover transition-transform duration-700 group-hover:scale-110'
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                      />
                    </figure>

                    {/* Enhanced badges */}
                    <div className='absolute top-4 left-4 flex flex-col gap-2'>
                      <div
                        className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                          property.badge === 'Superhost'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                            : property.badge === 'Rare Find'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : property.badge === 'Luxury'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        }`}
                      >
                        {property.badge}
                      </div>
                      {property.discount && (
                        <div className='px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg'>
                          {property.discount}% OFF
                        </div>
                      )}
                    </div>

                    {/* Enhanced favorite button */}
                    <button 
                      className='absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg'
                      aria-label={`Add ${property.title} to favorites`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // TODO: Implement favorite functionality
                      }}
                    >
                      <Heart className='w-5 h-5 text-gray-600 hover:text-red-500 transition-colors' />
                    </button>

                    {/* Premium overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                    {/* Quick view button */}
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'>
                      <Button size='sm' variant='glass' className='font-semibold'>
                        <Play className='w-4 h-4 mr-2' aria-hidden="true" />
                        Quick View
                      </Button>
                    </div>
                  </header>

                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <h3 className='font-bold text-lg leading-tight flex-1 pr-3 group-hover:text-primary transition-colors'>
                        {property.title}
                      </h3>
                      <div className='flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full border border-yellow-200'>
                        <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' aria-hidden="true" />
                        <span className='text-sm font-bold text-gray-900'>{property.rating}</span>
                      </div>
                    </div>

                    <address className='text-gray-600 text-sm mb-4 flex items-center not-italic'>
                      <MapPin className='w-4 h-4 mr-2 text-primary' aria-hidden="true" />
                      {property.location}
                    </address>

                    <ul className='grid grid-cols-2 gap-2 mb-6'>
                      {property.amenities.slice(0, 4).map(amenity => (
                        <li key={amenity}>
                          <span className='text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-lg font-medium text-center block'>
                            {amenity}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <footer className='flex items-center justify-between pt-4 border-t border-gray-100'>
                      <div className='flex items-center space-x-2'>
                        <div className='flex items-baseline'>
                          <span className='text-2xl font-bold text-gray-900'>
                            ${property.price}
                          </span>
                          <span className='text-gray-600 text-sm'>/night</span>
                        </div>
                        {property.originalPrice && (
                          <span className='text-sm text-gray-400 line-through'>
                            ${property.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center text-sm text-gray-500'>
                        <span className='font-medium'>{property.reviews} reviews</span>
                      </div>
                    </footer>
                  </CardContent>
                </Card>
              </Link>
            </article>
          ))}
        </div>

        <div className='text-center mt-20'>
          <Link href='/search'>
            <Button
              size='xl'
              variant='gradient'
              className='px-16 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl'
            >
              Explore All Luxury Properties
              <ArrowRight className='w-6 h-6 ml-3' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}