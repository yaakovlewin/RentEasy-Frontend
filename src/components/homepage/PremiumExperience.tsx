'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, Star, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PremiumExperienceProps {
  stats: {
    totalTravelers: string;
    totalProperties: string;
    fiveStarReviews: string;
    conciergeService: string;
  };
}

export function PremiumExperience({ stats }: PremiumExperienceProps) {
  return (
    <section className='py-32 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow'></div>
        <div
          className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow'
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className='container mx-auto relative'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
          <div className='animate-slide-up'>
            <div className='inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20'>
              <Sparkles className='w-4 h-4 mr-2 text-yellow-300' />
              <span>Trusted by Over 2 Million Travelers</span>
            </div>

            <h2 className='text-5xl lg:text-6xl font-bold mb-8 leading-tight'>
              Redefining Luxury
              <span className='text-gradient bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent block'>
                Travel Experiences
              </span>
            </h2>

            <p className='text-gray-300 text-xl lg:text-2xl mb-12 leading-relaxed'>
              We don't just offer accommodations – we craft extraordinary journeys. Every property
              in our collection is personally vetted for exceptional quality, unique character,
              and unforgettable experiences.
            </p>

            <div className='grid grid-cols-2 gap-8 mb-12'>
              {[
                {
                  value: stats.totalTravelers,
                  label: 'Happy Travelers',
                  icon: '🌟',
                },
                {
                  value: stats.totalProperties,
                  label: 'Luxury Properties',
                  icon: '🏖️',
                },
                {
                  value: stats.fiveStarReviews,
                  label: '5-Star Reviews',
                  icon: '⭐',
                },
                {
                  value: stats.conciergeService,
                  label: 'Concierge Service',
                  icon: '🎯',
                },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className='text-center group'
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  <div className='text-4xl mb-3'>{stat.icon}</div>
                  <div className='text-4xl lg:text-5xl font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors'>
                    {stat.value}
                  </div>
                  <div className='text-gray-400 font-medium'>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <Link href='/search'>
                <Button size='xl' variant='gradient' className='px-8 py-4 text-lg font-bold'>
                  Begin Your Journey
                  <ArrowRight className='w-6 h-6 ml-3' />
                </Button>
              </Link>
              <Button
                size='xl'
                variant='outline'
                className='px-8 py-4 text-lg font-bold border-white/30 text-white hover:bg-white hover:text-gray-900'
              >
                Watch Our Story
                <Play className='w-5 h-5 ml-3' />
              </Button>
            </div>
          </div>

          <div className='relative animate-slide-up lg:animate-slide-up-right'>
            <div className='relative'>
              {/* Decorative elements */}
              <div className='absolute -top-12 -left-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float'></div>
              <div
                className='absolute -bottom-12 -right-12 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl animate-float'
                style={{ animationDelay: '1s' }}
              ></div>

              {/* Main showcase image */}
              <div className='relative rounded-3xl overflow-hidden shadow-2xl'>
                <div className='relative w-full aspect-[7/5]'>
                  <Image
                    src='https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&h=500&fit=crop'
                    alt='Luxury experience showcase'
                    fill
                    className='object-cover hover:scale-105 transition-transform duration-700'
                    sizes='(max-width: 1024px) 100vw, 50vw'
                  />
                </div>
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />
              </div>

              {/* Floating testimonial card */}
              <aside className='absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl animate-float max-w-sm'>
                <figure>
                  <header className='flex items-center mb-4'>
                    <div className='relative w-12 h-12 rounded-full mr-4 overflow-hidden'>
                      <Image
                        src='https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop'
                        alt='Sarah Chen, verified guest'
                        fill
                        className='object-cover'
                        sizes='48px'
                      />
                    </div>
                    <div>
                      <div className='font-bold text-gray-900'>Sarah Chen</div>
                      <div className='text-sm text-gray-600'>Verified Guest</div>
                    </div>
                  </header>
                  <div className='flex mb-3' role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className='text-gray-800 text-sm italic'>
                    "Absolutely extraordinary! Every detail was perfect, from the stunning property
                    to the personalized service."
                  </blockquote>
                </figure>
              </aside>

              {/* Floating amenity badges */}
              <div
                className='absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float'
                style={{ animationDelay: '0.5s' }}
              >
                <div className='text-center'>
                  <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                    <Shield className='w-5 h-5 text-green-600' />
                  </div>
                  <div className='text-xs font-bold text-gray-900'>100% Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}