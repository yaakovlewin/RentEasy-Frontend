'use client';

import { memo } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LocationInputActionsProps {
  value: string;
  disabled: boolean;
  loading: boolean;
  onClear: () => void;
  testId?: string;
}

const LocationInputActionsComponent = ({
  value,
  disabled,
  loading,
  onClear,
  testId,
}: LocationInputActionsProps) => {
  if (!value) return null;

  if (loading) {
    return (
      <div className="absolute top-1/2 right-3 -translate-y-1/2">
        <LoadingSpinner />
      </div>
    );
  }

  if (disabled) return null;

  return (
    <button
      type="button"
      onClick={onClear}
      className="absolute top-1/2 right-3 -translate-y-1/2 hover:text-gray-600 transition-colors"
      aria-label="Clear location"
      data-testid={`${testId}-clear`}
    >
      <X className="w-4 h-4 text-gray-400" />
    </button>
  );
};

export const LocationInputActions = memo(LocationInputActionsComponent);
LocationInputActions.displayName = 'LocationInputActions';
