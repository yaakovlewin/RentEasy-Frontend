/**
 * Role-based dashboard skeleton registry
 * Implements Dependency Inversion Principle - depends on abstractions not concrete implementations
 */

import { lazy, ComponentType } from 'react';
import type { UserRole } from '@/types/auth';

/**
 * Strategy pattern for role-specific skeletons
 * Components are lazy-loaded for optimal code splitting
 */
export const RoleSkeletonRegistry: Record<UserRole, ComponentType> = {
  admin: lazy(() =>
    import('./AdminDashboardSkeleton').then((m) => ({ default: m.AdminDashboardSkeleton }))
  ),
  staff: lazy(() =>
    import('./StaffDashboardSkeleton').then((m) => ({ default: m.StaffDashboardSkeleton }))
  ),
  owner: lazy(() =>
    import('./OwnerDashboardSkeleton').then((m) => ({ default: m.OwnerDashboardSkeleton }))
  ),
  guest: lazy(() =>
    import('./GuestDashboardSkeleton').then((m) => ({ default: m.GuestDashboardSkeleton }))
  ),
};

/**
 * Role display names mapping
 * Pure constant lookup table (referentially transparent)
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'admin',
  staff: 'staff',
  owner: 'host',
  guest: 'user',
} as const;

/**
 * Get display name for user role
 * Pure function with referential transparency
 */
export const getRoleDisplayName = (role: UserRole): string => ROLE_DISPLAY_NAMES[role];

// Export individual skeletons for direct use
export { AdminDashboardSkeleton } from './AdminDashboardSkeleton';
export { StaffDashboardSkeleton } from './StaffDashboardSkeleton';
export { OwnerDashboardSkeleton } from './OwnerDashboardSkeleton';
export { GuestDashboardSkeleton } from './GuestDashboardSkeleton';
