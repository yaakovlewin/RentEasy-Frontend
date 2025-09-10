'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { useAuth } from '@/contexts/AuthContext';

import { DesktopNavigation } from './header/DesktopNavigation';
import { HeaderLogo } from './header/HeaderLogo';
import { HeaderSearchSlot } from './header/HeaderSearchSlot';
import { MobileNavigation } from './header/MobileNavigation';
import { UserMenu } from './header/UserMenu';
import { useHeaderResponsive, useHeaderScroll } from './header/hooks';
import type { HeaderProps } from './header/types';

/**
 * Header Component - Refactored with Composition
 * 
 * Main header orchestrator that composes all header sub-components.
 * Significantly reduced from 544 lines to clean, focused composition.
 * 
 * Maintains backward compatibility with the original Header component.
 */
export function Header({
  transparent = false,
  showCategoryTabs = false,
  showScrollSearch = false,
}: HeaderProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const { isAuthenticated, user, logout } = useAuth();
  const { scrollPosition, isScrolled } = useHeaderScroll();
  const {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeAllMobile,
  } = useHeaderResponsive();

  // Handle logout with mobile menu cleanup
  const handleLogout = async () => {
    closeAllMobile();
    await logout();
  };

  // Category tabs configuration (preserved from original)
  const categoryTabs = [
    { id: 'all', label: 'All', icon: '🏠' },
    { id: 'beachfront', label: 'Beachfront', icon: '🏖️' },
    { id: 'lakefront', label: 'Lakefront', icon: '🏞️' },
    { id: 'luxury', label: 'Luxury', icon: '💎' },
    { id: 'mountain', label: 'Mountain', icon: '⛰️' },
    { id: 'city', label: 'City', icon: '🌆' },
    { id: 'countryside', label: 'Countryside', icon: '🌾' },
    { id: 'unique', label: 'Unique', icon: '🦄' },
  ];

  const headerClasses = cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out', {
    'bg-white shadow-md border-b border-gray-100': !transparent || isScrolled,
    'bg-transparent shadow-none border-transparent': transparent && !isScrolled,
  });

  return (
    <>
      <header id='main-header' className={headerClasses}>
        <div className='container mx-auto px-4'>
          {/* Main Header Row */}
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-300',
              isScrolled ? 'h-20' : 'h-20' // Consistent height
            )}
          >
            {/* Logo */}
            <HeaderLogo transparent={transparent} isScrolled={isScrolled} />

            {/* Desktop Search Slot */}
            <HeaderSearchSlot showSearch={showScrollSearch} isScrolled={isScrolled} />

            {/* Desktop Navigation */}
            <div className='flex items-center space-x-2'>
              <DesktopNavigation
                user={user}
                isAuthenticated={isAuthenticated}
                isScrolled={isScrolled}
              />

              {/* Authenticated User Menu (Desktop) */}
              {isAuthenticated && (
                <UserMenu
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                  isScrolled={isScrolled}
                />
              )}
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation
              isMenuOpen={isMobileMenuOpen}
              onMenuToggle={toggleMobileMenu}
              user={user}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Premium Category Navigation Tabs */}
        {showCategoryTabs && (
          <nav
            aria-label="Property categories"
            className={cn(
              'border-t transition-all duration-300',
              transparent && !isScrolled
                ? 'border-white/20 bg-black/20 backdrop-blur-xl'
                : 'border-gray-100 bg-white/95'
            )}
          >
            <div className='container mx-auto px-4'>
              <ul className='flex items-center space-x-1 py-4 overflow-x-auto scrollbar-hide' role="tablist">
                {categoryTabs.map(category => (
                  <li key={category.id} role="presentation">
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      role="tab"
                      aria-selected={activeCategory === category.id}
                      aria-controls={`${category.id}-panel`}
                      className={cn(
                        'flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:scale-105',
                        activeCategory === category.id
                          ? transparent && !isScrolled
                            ? 'bg-white/30 text-white backdrop-blur-md border border-white/40'
                            : 'bg-primary text-white shadow-lg'
                          : transparent && !isScrolled
                            ? 'text-white/80 hover:bg-white/20 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <span className='text-base' aria-hidden="true">{category.icon}</span>
                      <span>{category.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* Spacer to prevent content overlap - only when not transparent */}
      {!transparent && (
        <div className={cn(isScrolled ? 'h-24' : 'h-20', showCategoryTabs && 'h-32')} />
      )}
    </>
  );
}