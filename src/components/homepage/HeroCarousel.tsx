'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Shield, Award, Clock } from 'lucide-react';

import type { HeroSlide } from '@/lib/data/homepage-data';

interface HeroCarouselProps {
  heroSlides: HeroSlide[];
}

export function HeroCarousel({ heroSlides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <>
      {/* Dynamic Background Carousel */}
      <div className='absolute inset-0 overflow-hidden'>
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className='absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 animate-ken-burns'
              style={{
                backgroundImage: `url('${slide.image}')`,
              }}
            />
            <div className='absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50' />
          </div>
        ))}

        {/* Animated gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20 animate-pulse-slow' />
      </div>

      {/* Hero Content with Floating Animation */}
      <div className='relative z-10 text-center text-white px-4 max-w-6xl'>
        <div className='animate-float'>
          {/* Premium badge */}
          <div className='inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20'>
            <Sparkles className='w-4 h-4 mr-2 text-yellow-300' />
            <span>Curated Luxury Experiences Since 2024</span>
          </div>

          <h1 className='text-5xl sm:text-7xl lg:text-9xl font-bold mb-8 leading-none'>
            <span className='block text-white/90'>Discover</span>
            <span className='block text-gradient bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient-x'>
              Extraordinary
            </span>
            <span className='block text-white/90'>Stays</span>
          </h1>

          <p className='text-xl sm:text-2xl lg:text-3xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed font-light'>
            Access exclusive properties and bespoke experiences curated by our luxury travel
            specialists.
            <span className='text-yellow-300 font-medium'>
              {' '}
              Every stay is a story waiting to unfold.
            </span>
          </p>
        </div>

        {/* Revolutionary Search Interface - Portal Slot */}
        <div
          id='search-hero-slot'
          className='animate-slide-up mb-12 relative'
          style={{
            animationDelay: '0.5s',
            minHeight: '64px', // Reserve space to prevent collapse when search bar portals out
          }}
        >
          {/* SearchBar will be portaled here */}
        </div>

        {/* Premium Trust Indicators */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-medium opacity-90'>
          <div className='flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full'>
            <Shield className='w-5 h-5 text-green-300' />
            <span>Verified Properties</span>
          </div>
          <div className='flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full'>
            <Award className='w-5 h-5 text-blue-300' />
            <span>5-Star Service</span>
          </div>
          <div className='flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full'>
            <Clock className='w-5 h-5 text-purple-300' />
            <span>24/7 Concierge</span>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Dots */}
      <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3'>
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce'>
        <div className='flex flex-col items-center space-y-2'>
          <div className='w-6 h-10 border-2 border-white/40 rounded-full flex justify-center'>
            <div className='w-1.5 h-4 bg-white/80 rounded-full mt-2 animate-pulse'></div>
          </div>
          <span className='text-xs font-medium opacity-70'>Scroll to explore</span>
        </div>
      </div>
    </>
  );
}