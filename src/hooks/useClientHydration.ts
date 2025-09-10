/**
 * Client Hydration Hook
 * 
 * Prevents hydration mismatches between server and client rendering
 * Especially important for auth state coordination
 */

import { useEffect, useState } from 'react';

/**
 * Hook to track when client-side hydration is complete
 * 
 * Prevents flash of incorrect content during server/client coordination
 * Essential for auth flows where server and client may have different states initially
 * 
 * @returns boolean - true when client hydration is complete
 */
export function useClientHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This only runs on the client after hydration
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook for coordinated auth hydration
 * 
 * Provides both hydration status and auth coordination timing
 * Prevents auth-related redirect loops during SSR/client hydration
 * 
 * @returns object with hydration and coordination status
 */
export function useAuthHydration() {
  const isHydrated = useClientHydration();
  const [isAuthCoordinated, setIsAuthCoordinated] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      // Small delay to allow auth context to stabilize
      const coordinationTimer = setTimeout(() => {
        setIsAuthCoordinated(true);
      }, 150); // Slightly longer than ProtectedRoute delay

      return () => clearTimeout(coordinationTimer);
    }
  }, [isHydrated]);

  return {
    isHydrated,
    isAuthCoordinated,
    isReady: isHydrated && isAuthCoordinated
  };
}