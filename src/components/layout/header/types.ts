/**
 * TypeScript interfaces for Header components
 * Provides comprehensive type safety for the modular header architecture
 */

import { User } from '@/contexts/AuthContext';

export interface HeaderProps {
  /** Whether the header should have a transparent background */
  transparent?: boolean;
  /** Whether to show category tabs for property filtering */
  showCategoryTabs?: boolean;
  /** Whether to show the scroll search bar */
  showScrollSearch?: boolean;
}

export interface HeaderLogoProps {
  /** Whether the header is in transparent mode */
  transparent?: boolean;
  /** Whether the header is scrolled */
  isScrolled?: boolean;
}

export interface DesktopNavigationProps {
  /** Current authenticated user */
  user?: User;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether the header is scrolled */
  isScrolled?: boolean;
}

export interface MobileNavigationProps {
  /** Whether the mobile menu is open */
  isMenuOpen: boolean;
  /** Handler for menu open/close state */
  onMenuToggle: (isOpen: boolean) => void;
  /** Current authenticated user */
  user?: User;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Logout handler */
  onLogout: () => Promise<void>;
}

export interface UserMenuProps {
  /** Current authenticated user */
  user?: User;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Logout handler */
  onLogout: () => Promise<void>;
  /** Whether the header is scrolled */
  isScrolled?: boolean;
}

export interface HeaderSearchSlotProps {
  /** Whether to show the search slot */
  showSearch?: boolean;
  /** Whether the header is scrolled */
  isScrolled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface UseHeaderScrollReturn {
  /** Current scroll position */
  scrollPosition: number;
  /** Whether the page is scrolled past threshold */
  isScrolled: boolean;
}

export interface UseHeaderResponsiveReturn {
  /** Whether mobile menu is open */
  isMobileMenuOpen: boolean;
  /** Whether mobile search is open */
  isMobileSearchOpen: boolean;
  /** Toggle mobile menu */
  toggleMobileMenu: () => void;
  /** Toggle mobile search */
  toggleMobileSearch: () => void;
  /** Close all mobile overlays */
  closeAllMobile: () => void;
}