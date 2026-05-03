/**
 * ProfilePhotoSection Component
 *
 * Handles profile photo display and upload functionality.
 * Extracted from DashboardProfile for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display current profile photo or placeholder
 * - Show upload button for photo changes
 * - Display user's full name and file requirements
 */

'use client';

import React from 'react';
import { User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProfilePhotoSectionProps {
  profilePhoto?: string;
  fullName: string;
  onEditPhoto?: () => void;
  className?: string;
}

/**
 * Profile Photo Section Component
 *
 * Displays profile photo with upload/edit functionality.
 */
export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = React.memo(({
  profilePhoto,
  fullName,
  onEditPhoto,
  className
}) => {
  return (
    <div className={className}>
      <h3 className='text-lg font-semibold mb-4'>Profile Photo</h3>
      <div className='flex items-center justify-between py-4 border-b'>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <div className='w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center overflow-hidden'>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className='w-full h-full object-cover'
                />
              ) : (
                <User className='w-8 h-8 text-primary' />
              )}
            </div>
            <button className='absolute -bottom-1 -right-1 p-1 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow'>
              <Camera className='w-3 h-3 text-gray-600' />
            </button>
          </div>
          <div>
            <p className='font-medium'>
              {fullName}
            </p>
            <p className='text-sm text-gray-500'>JPG or PNG, max 5MB</p>
          </div>
        </div>
        <Button
          variant='ghost'
          className='text-primary hover:text-primary/80'
          onClick={onEditPhoto}
        >
          Edit
        </Button>
      </div>
    </div>
  );
});

ProfilePhotoSection.displayName = 'ProfilePhotoSection';
