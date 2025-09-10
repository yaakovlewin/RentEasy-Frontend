'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useAuth } from '@/contexts/AuthContext';
import { useAuthHydration } from '@/hooks/useClientHydration';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isReady: isHydrationReady } = useAuthHydration();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after hydration is complete to prevent server/client conflicts
    if (isHydrationReady && !isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, isHydrationReady, redirectTo, router]);

  // Show loading state while auth is initializing or hydration is coordinating
  if (isLoading || !isHydrationReady) {
    return (
      fallback || (
        <div className='min-h-screen flex items-center justify-center'>
          <LoadingSpinner size='lg' />
        </div>
      )
    );
  }

  // At this point, hydration is complete and auth state is stable
  if (!isAuthenticated) {
    return fallback || (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return <>{children}</>;
}

// Role-based protection
interface RoleProtectedRouteProps extends ProtectedRouteProps {
  allowedRoles: string[];
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/dashboard',
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className='min-h-screen flex items-center justify-center'>
          <LoadingSpinner size='lg' />
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return fallback || null;
  }

  return <>{children}</>;
}
