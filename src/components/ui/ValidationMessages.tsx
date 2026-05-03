'use client';

/**
 * @fileoverview ValidationMessages Component
 *
 * Reusable component for displaying validation errors and warnings.
 * Extracted from PropertyBookingCard and other components to eliminate code duplication.
 */

import React, { memo } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationMessagesProps {
  /** Array of validation messages */
  messages: string[];
  /** Message variant type */
  variant: 'error' | 'warning' | 'info';
  /** Show icon before messages */
  showIcon?: boolean;
  /** Custom title */
  title?: string;
  /** Custom CSS classes */
  className?: string;
  /** Dismissible with callback */
  onDismiss?: () => void;
}

/**
 * ValidationMessages - Consistent validation message display component
 *
 * Features:
 * - Error, warning, and info variants
 * - Optional icon and title
 * - List-based message rendering
 * - Dismissible option
 * - Performance optimized with memoization
 */
export const ValidationMessages = memo(function ValidationMessages({
  messages,
  variant,
  showIcon = false,
  title,
  className,
  onDismiss,
}: ValidationMessagesProps) {
  if (!messages || messages.length === 0) return null;

  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      title: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-700',
      title: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      title: 'text-blue-800',
      icon: AlertCircle,
      iconColor: 'text-blue-500',
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div className="mb-4">
      <div className={cn(
        'border rounded-lg p-3',
        styles.container,
        className
      )}>
        <div className={cn('flex', showIcon || title ? 'items-start gap-3' : '')}>
          {showIcon && (
            <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', styles.iconColor)} />
          )}

          <div className="flex-1">
            {title && (
              <h3 className={cn('font-medium mb-2', styles.title)}>
                {title}
              </h3>
            )}

            <ul className="list-disc list-inside space-y-1">
              {messages.map((message, index) => (
                <li key={index} className={cn(styles.text, 'text-sm')}>
                  {message}
                </li>
              ))}
            </ul>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 ml-2',
                styles.text,
                'hover:opacity-70 transition-opacity'
              )}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

ValidationMessages.displayName = 'ValidationMessages';

export default ValidationMessages;
