/**
 * Header Components - Enterprise-grade modular header architecture
 * 
 * This barrel export file provides clean imports for all header-related components
 * and maintains backward compatibility during the refactoring process.
 */

export { Header } from './Header';
export { HeaderLogo } from './HeaderLogo';
export { DesktopNavigation } from './DesktopNavigation';
export { MobileNavigation } from './MobileNavigation';
export { UserMenu } from './UserMenu';
export { HeaderSearchSlot } from './HeaderSearchSlot';

// Hooks
export { useHeaderScroll } from './hooks/useHeaderScroll';
export { useHeaderResponsive } from './hooks/useHeaderResponsive';

// Types
export type {
  HeaderProps,
  HeaderLogoProps,
  DesktopNavigationProps,
  MobileNavigationProps,
  UserMenuProps,
  HeaderSearchSlotProps,
} from './types';