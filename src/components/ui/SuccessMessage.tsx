/**
 * SuccessMessage Component
 *
 * Displays success messages with optional auto-dismiss and close button.
 * Provides consistent success messaging across the application.
 *
 * Features:
 * - Success icon display
 * - Auto-dismiss functionality
 * - Manual close button
 * - Accessibility compliant
 * - Customizable styling
 */

import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface SuccessMessageProps {
  /** Success message to display */
  message?: string | null;
  /** Callback when message is dismissed */
  onDismiss?: () => void;
  /** Auto-dismiss after delay (ms). Set to 0 to disable */
  autoDismissDelay?: number;
  /** Additional className for container */
  className?: string;
  /** Show close button */
  showCloseButton?: boolean;
}

/**
 * Success Message Component
 *
 * Displays success messages with optional auto-dismiss
 *
 * @example
 * <SuccessMessage
 *   message="Settings saved successfully"
 *   onDismiss={() => clearSuccess()}
 *   autoDismissDelay={5000}
 * />
 */
export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onDismiss,
  autoDismissDelay = 5000,
  className,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (message && autoDismissDelay > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [message, autoDismissDelay, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 mb-4 bg-green-50 border border-green-200 rounded-lg',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Success Icon */}
      <CheckCircle
        className="w-5 h-5 text-green-600 flex-shrink-0"
        aria-hidden="true"
      />

      {/* Success Message */}
      <p className="text-sm text-green-800 flex-1">
        {message}
      </p>

      {/* Close Button */}
      {showCloseButton && onDismiss && (
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

SuccessMessage.displayName = 'SuccessMessage';
