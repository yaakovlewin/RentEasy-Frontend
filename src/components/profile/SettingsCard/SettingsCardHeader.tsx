'use client';

import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface SettingsCardHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  headerAction?: React.ReactNode;
  className?: string;
}

/**
 * Header component for SettingsCard compound component.
 * Displays title, optional description, optional icon, and optional header action.
 */
export const SettingsCardHeader: React.FC<SettingsCardHeaderProps> = ({
  title,
  description,
  icon: Icon,
  headerAction,
  className,
}) => {
  return (
    <CardHeader className={className}>
      {headerAction ? (
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction}
        </div>
      ) : (
        <>
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </>
      )}
    </CardHeader>
  );
};
