/**
 * Dashboard Hooks - Barrel Exports
 * 
 * Clean, organized exports for all dashboard custom hooks.
 * Provides a single import point for consuming components.
 */

// Export core dashboard data hook
export { 
  useDashboardData,
  useDashboardUser,
  useDashboardLoading,
  useDashboardErrors
} from './useDashboardData';

// Additional hooks will be exported here as they are created:
// export { useBookingHistory } from './useBookingHistory';
// export { useFavoritesManager } from './useFavoritesManager'; 
// export { useProfileEditor } from './useProfileEditor';
// export { useNotificationSettings } from './useNotificationSettings';