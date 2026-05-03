/**
 * ProfileHeader Component
 *
 * Displays profile completion percentage and welcome message.
 * Extracted from DashboardProfile for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display profile completion percentage
 * - Show completion progress message
 * - Provide visual feedback for profile completeness
 */

'use client';

import React from 'react';

export interface ProfileHeaderProps {
  completionPercentage: number;
  className?: string;
}

/**
 * Profile Header Component
 *
 * Shows profile completion status with percentage and encouragement message.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(({
  completionPercentage,
  className
}) => {
  return (
    <div className={className}>
      <h2 className='text-2xl font-bold mb-2'>Profile Settings</h2>
      <p className='text-gray-600 mb-4'>
        Manage your personal information and account settings
      </p>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <p className='text-sm text-blue-800'>
          <strong>Profile {completionPercentage}% complete</strong> -
          Complete your profile to improve your booking experience
        </p>
      </div>
    </div>
  );
});

ProfileHeader.displayName = 'ProfileHeader';
