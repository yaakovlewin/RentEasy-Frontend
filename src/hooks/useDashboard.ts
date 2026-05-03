/**
 * @fileoverview Dashboard Utilities Hook
 *
 * Custom hook providing dashboard-related utility functions.
 */

import { useMemo } from 'react';
import { UserRole } from '@/types/auth';

export function useDashboard(userRole: UserRole, userEmail: string) {
  const displayName = useMemo(() => {
    return userEmail.split('@')[0];
  }, [userEmail]);

  const dashboardTitle = useMemo(() => {
    switch (userRole) {
      case 'admin':
        return 'Admin Dashboard';
      case 'staff':
        return 'Staff Dashboard';
      case 'owner':
        return 'Host Dashboard';
      default:
        return 'Dashboard';
    }
  }, [userRole]);

  return {
    displayName,
    dashboardTitle,
  };
}
