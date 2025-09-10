'use client';

import Link from 'next/link';

import { Award, Globe, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import type { DesktopNavigationProps } from './types';

/**
 * DesktopNavigation Component
 * 
 * Handles the desktop navigation bar including host links, language selector,
 * and authentication state. Hidden on mobile screens.
 */
export function DesktopNavigation({ 
  user, 
  isAuthenticated, 
  isScrolled = false 
}: DesktopNavigationProps) {
  // Common button classes for transparent/solid state transitions
  const getButtonClasses = (transparent: boolean) => cn(
    'px-5 py-2.5 text-sm font-semibold rounded-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm',
    transparent && !isScrolled
      ? 'text-white hover:bg-white/20 border border-white/30 shadow-lg hover:shadow-white/10'
      : 'text-gray-700 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md'
  );

  const getAuthButtonClasses = (transparent: boolean) => cn(
    'text-sm px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-300',
    transparent && !isScrolled
      ? 'text-white hover:bg-white/20'
      : 'text-gray-700 hover:bg-gray-100'
  );

  const getIconButtonClasses = (transparent: boolean) => cn(
    'rounded-full w-11 h-11 hover:scale-110 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md',
    transparent && !isScrolled
      ? 'text-white hover:bg-white/20 border border-white/20'
      : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
  );

  const getAuthContainerClasses = (transparent: boolean) => cn(
    'flex items-center space-x-3 rounded-2xl shadow-lg border px-4 py-2 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-xl',
    transparent && !isScrolled
      ? 'bg-white/20 border-white/30 shadow-white/10 hover:bg-white/30'
      : 'bg-white/95 border-gray-200/60 shadow-gray-900/10 hover:bg-white hover:border-primary/20'
  );

  return (
    <nav className='hidden lg:flex items-center space-x-2'>
      {/* Become Host / Host Dashboard */}
      {!isAuthenticated || user?.role !== 'owner' ? (
        <Link href='/host'>
          <Button
            variant='ghost'
            size='sm'
            className={getButtonClasses(false)}
          >
            <Sparkles className='w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12' />
            Become a Host
          </Button>
        </Link>
      ) : (
        <Link href='/host/dashboard'>
          <Button
            variant='ghost'
            size='sm'
            className={getButtonClasses(false)}
          >
            <Award className='w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110' />
            Host Dashboard
          </Button>
        </Link>
      )}

      {/* Language/Region Selector */}
      <Button
        variant='ghost'
        size='icon-sm'
        className={getIconButtonClasses(false)}
        aria-label='Change language or region'
      >
        <Globe className='w-5 h-5 transition-transform duration-300 hover:rotate-12' />
      </Button>

      {/* Authentication Section */}
      {!isAuthenticated ? (
        <div className={getAuthContainerClasses(false)}>
          <Link href='/auth/login'>
            <Button
              variant='ghost'
              size='sm'
              className={getAuthButtonClasses(false)}
            >
              Log in
            </Button>
          </Link>
          <div className='w-px h-5 bg-gray-300/60' />
          <Link href='/auth/register'>
            <Button
              variant='default'
              size='sm'
              className='px-4 py-2 bg-gradient-to-r from-primary to-pink-500 hover:from-primary-dark hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
            >
              Sign up
            </Button>
          </Link>
        </div>
      ) : null}
      {/* Note: Authenticated user menu is handled by UserMenu component */}
    </nav>
  );
}