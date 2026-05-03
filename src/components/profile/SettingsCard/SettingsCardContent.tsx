'use client';

import React from 'react';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SettingsCardContentProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Content component for SettingsCard compound component.
 * Wraps content with consistent spacing and styling.
 */
export const SettingsCardContent: React.FC<SettingsCardContentProps> = ({
  children,
  className,
  spacing = 'lg',
}) => {
  const spacingClasses = {
    none: '',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <CardContent className={cn(spacingClasses[spacing], className)}>
      {children}
    </CardContent>
  );
};
