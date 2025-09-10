'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Award,
  Calendar,
  Heart,
  Home,
  LogOut,
  MapPin,
  Menu,
  Shield,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/ui/notification';

import type { UserMenuProps } from './types';

/**
 * UserMenu Component
 * 
 * Renders the authenticated user menu with profile dropdown, notifications,
 * and role-based menu items. Handles logout functionality.
 */
export function UserMenu({ 
  user, 
  isAuthenticated, 
  onLogout, 
  isScrolled = false 
}: UserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const transparent = false; // UserMenu is always rendered with solid background

  const getContainerClasses = () => cn(
    'flex items-center space-x-3 rounded-2xl shadow-lg border px-4 py-2 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer backdrop-blur-xl',
    transparent && !isScrolled
      ? 'bg-white/20 border-white/30 shadow-white/10 hover:bg-white/30'
      : 'bg-white/95 border-gray-200/60 shadow-gray-900/10 hover:bg-white hover:border-primary/20'
  );

  const getNameClasses = () => cn(
    'text-sm font-semibold',
    transparent && !isScrolled ? 'text-white' : 'text-gray-900'
  );

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await onLogout();
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className='relative flex items-center space-x-2'>
      {/* Notifications */}
      <NotificationBell
        count={3}
        className={cn(
          'rounded-full hover:scale-110 transition-all duration-300',
          transparent && !isScrolled
            ? 'text-white hover:bg-white/20'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      />

      {/* User Profile Dropdown */}
      <div
        className={getContainerClasses()}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        role='button'
        tabIndex={0}
        aria-label='User menu'
        aria-expanded={isMenuOpen}
      >
        <Button variant='ghost' size='sm' className='p-1 rounded-lg'>
          <Menu className='w-4 h-4' />
        </Button>
        <div className='w-px h-6 bg-gray-300/60' />
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-gradient-to-br from-primary via-primary-light to-primary-dark rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20'>
            <User className='w-4 h-4 text-white' />
          </div>
          {user.firstName && (
            <span className={getNameClasses()}>
              {user.firstName}
            </span>
          )}
        </div>
      </div>

      {/* Enhanced User Dropdown Menu */}
      {isMenuOpen && (
        <nav 
          className='absolute top-full right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl py-2 z-50 animate-scale-in'
          aria-label="User account menu"
          role="menu"
        >
          {/* User Info Header */}
          <header className='px-6 py-4 border-b border-gray-100'>
            <div className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-primary to-pink-500 rounded-full flex items-center justify-center'>
                <User className='w-6 h-6 text-white' />
              </div>
              <div>
                <div className='font-semibold text-gray-900'>
                  {user.firstName} {user.lastName}
                </div>
                <div className='text-sm text-gray-600'>{user.email}</div>
                {user.role === 'owner' && (
                  <div className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-bold mt-1'>
                    <Award className='w-3 h-3 mr-1' />
                    Host
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Menu Items */}
          <ul className='py-2' role="none">
            <li role="none">
              <Link
                href='/dashboard?tab=profile'
                className='flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                onClick={closeMenu}
                role="menuitem"
              >
                <User className='w-5 h-5 text-gray-500' aria-hidden="true" />
                <span>Account Settings</span>
              </Link>
            </li>

            <li role="none">
              <Link
                href='/dashboard?tab=bookings'
                className='flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                onClick={closeMenu}
                role="menuitem"
              >
                <Calendar className='w-5 h-5 text-gray-500' aria-hidden="true" />
                <span>My Bookings</span>
              </Link>
            </li>

            <li role="none">
              <Link
                href='/dashboard?tab=favorites'
                className='flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                onClick={closeMenu}
                role="menuitem"
              >
                <Heart className='w-5 h-5 text-gray-500' aria-hidden="true" />
                <span>Saved Properties</span>
              </Link>
            </li>

            {/* Host-specific menu items */}
            {user.role === 'owner' && (
              <>
                <li role="none">
                  <hr className='border-t border-gray-100 my-2' />
                </li>
                <li role="none">
                  <Link
                    href='/host/dashboard'
                    className='flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    <Home className='w-5 h-5 text-gray-500' aria-hidden="true" />
                    <span>Host Dashboard</span>
                  </Link>
                </li>
                <li role="none">
                  <Link
                    href='/host/properties'
                    className='flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    <MapPin className='w-5 h-5 text-gray-500' aria-hidden="true" />
                    <span>My Properties</span>
                  </Link>
                </li>
              </>
            )}

            <li role="none">
              <hr className='border-t border-gray-100 my-2' />
            </li>
            <li role="none">
              <Link
                href='/help'
                className='flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                onClick={closeMenu}
                role="menuitem"
              >
                <Shield className='w-5 h-5 text-gray-500' aria-hidden="true" />
                <span>Help Center</span>
              </Link>
            </li>

            <li role="none">
              <button
                onClick={handleLogout}
                className='w-full flex items-center space-x-3 px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors'
                role="menuitem"
              >
                <LogOut className='w-5 h-5' aria-hidden="true" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Click outside to close */}
      {isMenuOpen && (
        <div 
          className='fixed inset-0 z-40' 
          onClick={closeMenu}
          aria-hidden='true'
        />
      )}
    </div>
  );
}