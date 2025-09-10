'use client';

import Link from 'next/link';

import { Home } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { HeaderLogoProps } from './types';

/**
 * HeaderLogo Component
 * 
 * Renders the RentEasy logo with luxury branding and responsive styling.
 * Handles transparent/solid state transitions based on scroll position.
 */
export function HeaderLogo({ transparent = false, isScrolled = false }: HeaderLogoProps) {
  const logoClasses = cn('text-2xl font-bold transition-all duration-300', {
    'text-primary': !transparent || isScrolled,
    'text-white drop-shadow-lg': transparent && !isScrolled,
  });

  const textClasses = cn('transition-all duration-300', {
    'text-gray-700': !transparent || isScrolled,
    'text-white drop-shadow-sm': transparent && !isScrolled,
  });

  return (
    <Link href='/' className='flex items-center space-x-3 group' aria-label='RentEasy - Home'>
      <div className='relative'>
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg',
            transparent && !isScrolled
              ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-white/10'
              : 'bg-gradient-to-br from-primary via-primary-light to-primary shadow-primary/30'
          )}
        >
          <Home
            className={cn(
              'w-6 h-6 transition-all duration-300 group-hover:scale-110',
              transparent && !isScrolled ? 'text-white' : 'text-white'
            )}
          />
        </div>
        <div className='absolute inset-0 bg-primary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 -z-10 scale-110' />
      </div>
      <div className='flex flex-col'>
        <span className={logoClasses}>
          RentEasy
        </span>
        <span className={cn('text-xs font-medium opacity-75', textClasses)}>
          Luxury Escapes
        </span>
      </div>
    </Link>
  );
}