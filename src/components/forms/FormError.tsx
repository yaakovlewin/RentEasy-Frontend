/**
 * FormError Component
 *
 * Displays error messages with consistent styling and accessibility support.
 * Now uses the shared ValidationMessages component for consistency.
 */

import React from 'react';
import { ValidationMessages } from '@/components/ui/ValidationMessages';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  id?: string;
  message: string | string[];
  variant?: 'inline' | 'banner';
  onDismiss?: () => void;
  className?: string;
}

/**
 * Normalizes message input into a clean array of non-empty strings
 */
const normalizeMessage = (message: string | string[]): string[] => {
  if (Array.isArray(message)) {
    return message.filter(m => m && m.trim().length > 0);
  }
  return message && message.trim().length > 0 ? [message] : [];
};

const FormError: React.FC<FormErrorProps> = ({
  id,
  message,
  variant = 'inline',
  onDismiss,
  className
}) => {
  const errors = normalizeMessage(message);

  if (errors.length === 0) {
    return null;
  }

  const showIcon = variant === 'banner';

  return (
    <div id={id} role="alert" aria-live="assertive" className={cn(variant === 'inline' && 'mt-1', className)}>
      <ValidationMessages
        messages={errors}
        variant="error"
        showIcon={showIcon}
        onDismiss={onDismiss}
      />
    </div>
  );
};

export default FormError;
