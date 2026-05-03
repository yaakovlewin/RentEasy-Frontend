/**
 * useSearchProperties Hook
 *
 * Custom hook for managing property search data fetching with security validation.
 * Handles URL parameter parsing, validation, sanitization, and API calls.
 *
 * Features:
 * - Secure URL parameter parsing with XSS/SQL injection protection
 * - Backend-compatible validation (matches Zod schema)
 * - Automatic search execution on parameter changes
 * - Loading and error state management
 * - Manual re-fetch capability
 * - Optional security event logging
 */

import { useState, useCallback, useEffect } from 'react';
import { propertiesAPI, type Property } from '@/lib/api';
import { captureError, ErrorSeverity, ErrorCategory } from '@/lib/error-monitoring';
import { validateSearchParams, initSecurityLogging } from '@/lib/utils/inputValidation';
import { Option, Result } from '@/lib/api/functional';

// Initialize security logging for validation layer
initSecurityLogging(captureError);

/**
 * Hook return type
 */
export interface UseSearchPropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
}

/**
 * useSearchProperties Hook
 *
 * @param searchParams - Optional URLSearchParams object from useSearchParams()
 * @returns Object containing properties, loading state, error, and fetchProperties function
 */
export function useSearchProperties(searchParams?: URLSearchParams): UseSearchPropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Extract raw parameters from URL using Option monad
    const rawParams = {
      location: Option.toUndefined(Option.fromNullable(searchParams?.get('location'))),
      checkIn: Option.toUndefined(Option.fromNullable(searchParams?.get('checkIn'))),
      checkOut: Option.toUndefined(Option.fromNullable(searchParams?.get('checkOut'))),
      // Support both "adults" and "guests" for backward compatibility
      adults: Option.toUndefined(Option.fromNullable(searchParams?.get('adults'))),
      guests: Option.toUndefined(Option.fromNullable(searchParams?.get('guests'))),
    };

    // Validate and sanitize all parameters (matches backend Zod schema)
    const validatedParams = validateSearchParams(rawParams);

    // Call API with Result monad for error handling
    const result = await Result.fromPromise(
      propertiesAPI.search(validatedParams)
    );

    Result.match({
      ok: (response) => {
        const propertiesArray = response.data || [];
        setProperties(propertiesArray);
        setLoading(false);
      },
      err: (err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
        setError(errorMessage);

        // Enterprise error monitoring
        captureError(
          err instanceof Error ? err : new Error(errorMessage),
          ErrorSeverity.HIGH,
          ErrorCategory.API,
          {
            operation: 'search-properties',
            params: {
              location: searchParams?.get('location'),
              checkIn: searchParams?.get('checkIn'),
              checkOut: searchParams?.get('checkOut'),
              guests: searchParams?.get('guests') || searchParams?.get('adults'),
            },
          }
        );
        setLoading(false);
      },
    })(result);
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    fetchProperties,
  };
}
