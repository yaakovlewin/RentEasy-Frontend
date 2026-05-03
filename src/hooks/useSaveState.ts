import { useState, useCallback } from 'react';
import { Result } from '@/lib/api/functional';

export type SaveStatus = 'idle' | 'success' | 'error';

export interface UseSaveStateOptions {
  successDuration?: number;
  errorDuration?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export interface UseSaveStateReturn {
  isSaving: boolean;
  saveStatus: SaveStatus;
  handleSave: () => Promise<void>;
  resetStatus: () => void;
}

/**
 * Custom hook for managing save state in forms and settings components.
 * Provides consistent state management for save operations with automatic status reset.
 *
 * @param saveFunction - Async function that performs the save operation
 * @param options - Configuration options for the hook
 * @returns Object containing save state and handler
 *
 * @example
 * ```typescript
 * const { isSaving, saveStatus, handleSave } = useSaveState(async () => {
 *   await api.updatePreferences(settings);
 * });
 *
 * // In JSX
 * <Button onClick={handleSave} disabled={isSaving}>
 *   {isSaving ? 'Saving...' : 'Save Changes'}
 * </Button>
 *
 * {saveStatus === 'success' && <SuccessMessage />}
 * {saveStatus === 'error' && <ErrorMessage />}
 * ```
 */
export function useSaveState(
  saveFunction: () => Promise<void>,
  options: UseSaveStateOptions = {}
): UseSaveStateReturn {
  const {
    successDuration = 3000,
    errorDuration = 3000,
    onSuccess,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const resetStatus = useCallback(() => {
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    const result = await Result.fromPromise(saveFunction());

    Result.match({
      ok: () => {
        setSaveStatus('success');
        onSuccess?.();

        setTimeout(() => {
          setSaveStatus('idle');
        }, successDuration);
      },
      err: (error) => {
        setSaveStatus('error');
        onError?.(error);

        setTimeout(() => {
          setSaveStatus('idle');
        }, errorDuration);
      },
    })(result);

    setIsSaving(false);
  }, [saveFunction, successDuration, errorDuration, onSuccess, onError]);

  return {
    isSaving,
    saveStatus,
    handleSave,
    resetStatus,
  };
}
