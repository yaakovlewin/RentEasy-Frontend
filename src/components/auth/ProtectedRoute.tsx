'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthHydration } from '@/hooks/useClientHydration';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const DefaultLoadingFallback = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <LoadingSpinner size='lg' />
  </div>
);

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isReady: isHydrationReady } = useAuthHydration();
  const router = useRouter();

  const shouldRedirect = useMemo(
    () => isHydrationReady && !isLoading && !isAuthenticated,
    [isHydrationReady, isLoading, isAuthenticated]
  );

  useEffect(() => {
    if (shouldRedirect) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (isLoading || !isHydrationReady) {
    return fallback || <DefaultLoadingFallback />;
  }

  if (!isAuthenticated) {
    return fallback || <DefaultLoadingFallback />;
  }

  return <>{children}</>;
}

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
  const { isReady: isHydrationReady } = useAuthHydration();
  const router = useRouter();

  const hasAccess = useMemo(
    () => user && allowedRoles.includes(user.role),
    [user, allowedRoles]
  );

  const shouldRedirect = useMemo(
    () => isHydrationReady && !isLoading && isAuthenticated && user && !hasAccess,
    [isHydrationReady, isLoading, isAuthenticated, user, hasAccess]
  );

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (isLoading || !isHydrationReady) {
    return fallback || <DefaultLoadingFallback />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}
