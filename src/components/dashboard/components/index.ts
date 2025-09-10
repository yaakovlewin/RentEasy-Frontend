/**
 * Dashboard Components - Barrel Exports
 * 
 * Clean, organized exports for all dashboard components.
 * Provides a single import point for consuming components.
 */

// Export core dashboard components
export { DashboardNavigation } from './DashboardNavigation';
export { DashboardProfile } from './DashboardProfile';
export { DashboardBookings } from './DashboardBookings';

// Export enhanced dashboard components
export { DashboardFavorites, DashboardFavoritesWithErrorBoundary } from './DashboardFavorites';
export { DashboardSettings, DashboardSettingsWithErrorBoundary } from './DashboardSettings';

// Additional components will be exported here as they are created:
// export { DashboardStats } from './DashboardStats';