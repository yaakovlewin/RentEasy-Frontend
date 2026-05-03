import { useState } from 'react';
import { Result } from '@/lib/api/functional';

/**
 * Custom hook for form submission with loading and error state management
 *
 * Eliminates duplicate try-catch-finally patterns across forms
 * Provides consistent loading and error handling for all forms
 *
 * @example
 * ```typescript
 * const { isLoading, error, handleSubmit, clearError } = useFormSubmit(async () => {
 *   await api.auth.login(email, password);
 *   router.push('/dashboard');
 * });
 *
 * <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
 *   {error && <div>{error}</div>}
 *   <button disabled={isLoading}>Submit</button>
 * </form>
 * ```
 */
export const useFormSubmit = <T = void>(
  onSubmit: (data?: T) => Promise<void>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data?: T) => {
    setIsLoading(true);
    setError(null);

    const result = await Result.fromPromise(onSubmit(data));

    Result.match({
      ok: () => {
        setIsLoading(false);
      },
      err: (err) => {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      },
    })(result);
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    handleSubmit,
    clearError,
  };
};
