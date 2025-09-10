'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Calendar,
  Home,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { MobileMenu, MobileMenuTrigger } from '@/components/ui/mobile-menu';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';

import type { MobileNavigationProps } from './types';

/**
 * MobileNavigation Component
 * 
 * Handles mobile navigation including menu button, mobile search trigger,
 * and mobile menu with role-based content. Uses the reusable MobileMenu component.
 */
export function MobileNavigation({ 
  isMenuOpen, 
  onMenuToggle, 
  user, 
  isAuthenticated, 
  onLogout 
}: MobileNavigationProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const transparent = false; // Mobile nav typically uses solid background
  const isScrolled = false;

  const closeMobileMenu = () => onMenuToggle(false);
  const handleLogout = async () => {
    closeMobileMenu();
    await onLogout();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className='lg:hidden'>
        <MobileMenuTrigger
          onClick={() => onMenuToggle(!isMenuOpen)}
          isOpen={isMenuOpen}
          className={cn(
            'rounded-xl p-2 hover:scale-110 transition-all duration-300',
            transparent && !isScrolled
              ? 'text-white hover:bg-white/20 backdrop-blur-md'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        />
      </div>

      {/* Mobile Search Trigger */}
      <div className='lg:hidden px-4 pb-4'>
        <Button
          onClick={() => setIsMobileSearchOpen(true)}
          variant='outline'
          className={cn(
            'w-full h-14 rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 justify-start text-left',
            transparent && !isScrolled
              ? 'border-white/30 bg-white/20 text-white hover:bg-white/30'
              : 'text-gray-600 hover:bg-gray-50 hover:border-primary/20'
          )}
        >
          <Search className='w-5 h-5 mr-3 opacity-60' />
          <span className='text-base font-medium'>Search destinations...</span>
        </Button>
      </div>

      {/* Mobile Menu using reusable MobileMenu component */}
      <MobileMenu
        isOpen={isMenuOpen}
        onOpenChange={onMenuToggle}
        side='bottom'
        size='md'
        className='lg:hidden'
      >
        <nav aria-label="Mobile navigation menu">
          {!isAuthenticated ? (
            // Non-authenticated menu items
            <ul className='space-y-4' role="none">
              <li>
                <Link href='/auth/login' className='block' onClick={closeMobileMenu}>
                  <Button variant='ghost' className='w-full justify-start text-lg py-3'>
                    Log in
                  </Button>
                </Link>
              </li>
              <li>
                <Link href='/auth/register' className='block' onClick={closeMobileMenu}>
                  <Button variant='default' className='w-full text-lg py-3 shadow-lg bg-gradient-to-r from-primary to-pink-500 hover:from-primary-dark hover:to-pink-600'>
                    Sign up
                  </Button>
                </Link>
              </li>
              <li>
                <Link href='/host' className='block' onClick={closeMobileMenu}>
                  <Button variant='ghost' className='w-full justify-start text-lg py-3'>
                    <Sparkles className='w-5 h-5 mr-3' aria-hidden="true" />
                    Become a Host
                  </Button>
                </Link>
              </li>
            </ul>
          ) : (
            // Authenticated menu items
            <>
              {/* User Info Header */}
              <header className='flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl mb-4'>
                <div className='w-12 h-12 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center'>
                  <User className='w-6 h-6 text-white' />
                </div>
                <div>
                  <div className='font-semibold text-gray-900'>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className='text-sm text-gray-600'>{user?.email}</div>
                </div>
              </header>

              {/* Menu Items */}
              <ul className='space-y-2' role="none">
                <li>
                  <Link href='/dashboard?tab=profile' className='block' onClick={closeMobileMenu}>
                    <Button variant='ghost' className='w-full justify-start text-lg py-3'>
                      <User className='w-5 h-5 mr-3' aria-hidden="true" />
                      Account Settings
                    </Button>
                  </Link>
                </li>

                <li>
                  <Link href='/dashboard?tab=bookings' className='block' onClick={closeMobileMenu}>
                    <Button variant='ghost' className='w-full justify-start text-lg py-3'>
                      <Calendar className='w-5 h-5 mr-3' aria-hidden="true" />
                      My Bookings
                    </Button>
                  </Link>
                </li>

                {/* Host-specific items */}
                {user?.role === 'owner' && (
                  <li>
                    <Link href='/host/dashboard' className='block' onClick={closeMobileMenu}>
                      <Button variant='ghost' className='w-full justify-start text-lg py-3'>
                        <Home className='w-5 h-5 mr-3' aria-hidden="true" />
                        Host Dashboard
                      </Button>
                    </Link>
                  </li>
                )}

                {/* Logout */}
                <li>
                  <hr className='border-t border-gray-200 my-4' />
                  <Button
                    variant='ghost'
                    onClick={handleLogout}
                    className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-lg py-3'
                  >
                    <LogOut className='w-5 h-5 mr-3' aria-hidden="true" />
                    Logout
                  </Button>
                </li>
              </ul>
            </>
          )}
        </nav>
      </MobileMenu>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </>
  );
}