'use client';

import { useState, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { CategoryTabs } from './header/CategoryTabs';
import { HEADER_CONFIG } from './header/constants';
import { DesktopNavigation } from './header/DesktopNavigation';
import { HeaderLogo } from './header/HeaderLogo';
import { HeaderSearchSlot } from './header/HeaderSearchSlot';
import { MobileNavigation } from './header/MobileNavigation';
import { UserMenu } from './header/UserMenu';
import { useHeaderResponsive, useHeaderScroll } from './header/hooks';
import { getHeaderClassName, getSpacerClassName } from './header/styles';
import type { HeaderProps } from './header/types';

/**
 * Header Component - Clean Architecture
 *
 * Follows SOLID, DRY, YAGNI, and FP principles:
 * - Single Responsibility: Orchestrates sub-components only
 * - Open/Closed: Extensible via props, closed for modification
 * - Dependency Inversion: Depends on abstractions (hooks, pure functions)
 * - DRY: No repeated logic, extracted to pure functions
 * - YAGNI: Removed unused features (emoji icons)
 * - FP: Pure functions for computations, immutable data
 */
export function Header({
  transparent = false,
  showCategoryTabs = false,
  showScrollSearch = false,
}: HeaderProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const { isAuthenticated, user, logout } = useAuth();
  const { isScrolled } = useHeaderScroll();
  const { isMobileMenuOpen, toggleMobileMenu, closeAllMobile } = useHeaderResponsive();

  const handleLogout = useCallback(async () => {
    closeAllMobile();
    await logout();
  }, [closeAllMobile, logout]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  return (
    <>
      <header id="main-header" className={getHeaderClassName({ transparent, isScrolled })}>
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${HEADER_CONFIG.HEIGHTS.DEFAULT}`}>
            <HeaderLogo transparent={transparent} isScrolled={isScrolled} />
            <HeaderSearchSlot showSearch={showScrollSearch} isScrolled={isScrolled} />

            <div className="flex items-center space-x-2">
              <DesktopNavigation
                user={user}
                isAuthenticated={isAuthenticated}
                isScrolled={isScrolled}
              />
              {isAuthenticated && (
                <UserMenu
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                  isScrolled={isScrolled}
                />
              )}
            </div>

            <MobileNavigation
              isMenuOpen={isMobileMenuOpen}
              onMenuToggle={toggleMobileMenu}
              user={user}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {showCategoryTabs && (
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            transparent={transparent}
            isScrolled={isScrolled}
          />
        )}
      </header>

      {!transparent && (
        <div className={getSpacerClassName(isScrolled, showCategoryTabs)} />
      )}
    </>
  );
}