/**
 * ProfileVerificationBadge Component
 *
 * Displays verification status badge for email, phone, etc.
 * Extracted from DashboardProfile for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display verification status
 * - Apply appropriate styling based on verification state
 * - Show verification text labels
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProfileVerificationBadgeProps {
  isVerified: boolean;
  label?: string;
  className?: string;
}

/**
 * Profile Verification Badge Component
 *
 * Shows verification status with appropriate styling.
 */
export const ProfileVerificationBadge: React.FC<ProfileVerificationBadgeProps> = React.memo(({
  isVerified,
  label,
  className
}) => {
  const displayLabel = label || (isVerified ? 'Verified' : 'Not verified');

  return (
    <span
      className={cn(
        'text-xs px-2 py-1 rounded-full',
        isVerified
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800',
        className
      )}
    >
      {displayLabel}
    </span>
  );
});

ProfileVerificationBadge.displayName = 'ProfileVerificationBadge';
