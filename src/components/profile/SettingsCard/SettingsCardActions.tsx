'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveStatus } from '@/hooks/useSaveState';

export interface SettingsCardActionsProps {
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  saveStatus?: SaveStatus;
  saveButtonText?: string;
  cancelButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  showCancel?: boolean;
  disabled?: boolean;
  className?: string;
  saveButtonClassName?: string;
  cancelButtonClassName?: string;
}

/**
 * Actions component for SettingsCard compound component.
 * Displays save/cancel buttons with loading states and status indicators.
 */
export const SettingsCardActions: React.FC<SettingsCardActionsProps> = ({
  onSave,
  onCancel,
  isSaving = false,
  saveStatus = 'idle',
  saveButtonText = 'Save Changes',
  cancelButtonText = 'Cancel',
  successMessage = 'Settings saved',
  errorMessage = 'Failed to save',
  showCancel = false,
  disabled = false,
  className,
  saveButtonClassName,
  cancelButtonClassName,
}) => {
  return (
    <div className={cn('flex items-center gap-3 pt-4 border-t', className)}>
      {onSave && (
        <Button
          onClick={onSave}
          disabled={isSaving || disabled}
          className={cn('min-w-[120px]', saveButtonClassName)}
        >
          {isSaving ? 'Saving...' : saveButtonText}
        </Button>
      )}

      {showCancel && onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving || disabled}
          className={cn('min-w-[100px]', cancelButtonClassName)}
        >
          {cancelButtonText}
        </Button>
      )}

      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium" role="status" aria-live="polite">
            {successMessage}
          </span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium" role="status" aria-live="assertive">
            {errorMessage}
          </span>
        </div>
      )}
    </div>
  );
};
