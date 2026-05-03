/**
 * DashboardProfile Component
 *
 * Profile management component providing inline editing functionality
 * for user profile information. Refactored to use sub-components for
 * better maintainability and adherence to Single Responsibility Principle.
 *
 * Features:
 * - Profile photo display and editing
 * - Inline editing for all profile fields
 * - Form validation with real-time feedback
 * - Optimistic updates with error rollback
 * - Account information display
 * - Responsive design with clean row-based layout
 * - Performance optimized with React.memo
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { User, Edit2, Save, X } from 'lucide-react';

import { cn, formatDate, DATE_FORMATS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { ErrorStateDisplay } from '@/components/ui/ErrorStateDisplay';

import type { DashboardProfileProps, ProfileEditingField } from '../types';
import {
  validateProfileField,
  getProfileCompletionPercentage,
  PROFILE_FIELD_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../utils';

import {
  ProfileHeader,
  ProfilePhotoSection,
  ProfileVerificationBadge,
  ProfileFieldEditor
} from '../profile';

/**
 * Dashboard Profile Component
 *
 * Provides comprehensive profile management with inline editing,
 * validation, and optimistic updates.
 */
const DashboardProfile: React.FC<DashboardProfileProps> = React.memo(({
  profileData,
  editingState,
  onEditField,
  onSaveProfile,
  onCancelEdit,
  isActive,
  isLoading = false,
  error,
  className
}) => {
  // =============================================================================
  // LOCAL STATE MANAGEMENT
  // =============================================================================

  const [tempValues, setTempValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // =============================================================================
  // MEMOIZED VALUES
  // =============================================================================

  /**
   * Profile completion percentage
   */
  const completionPercentage = useMemo(() => {
    return getProfileCompletionPercentage(profileData);
  }, [profileData]);

  /**
   * Profile display values with fallbacks
   */
  const displayValues = useMemo(() => ({
    fullName: profileData?.firstName && profileData?.lastName
      ? `${profileData.firstName} ${profileData.lastName}`
      : 'Not provided',
    email: profileData?.email || 'Not provided',
    phoneNumber: profileData?.phoneNumber || 'Not provided',
    bio: profileData?.bio || 'Not provided',
    location: profileData?.location || 'Not provided',
    memberSince: profileData?.memberSince
      ? formatDate(profileData.memberSince, DATE_FORMATS.MONTH_YEAR)
      : 'January 2024'
  }), [profileData]);

  /**
   * Verification status indicators
   */
  const verificationStatus = useMemo(() => ({
    email: profileData?.isEmailVerified ? 'Verified' : 'Not verified',
    phone: profileData?.phoneNumber
      ? (profileData?.isPhoneVerified ? 'Verified' : 'Not verified')
      : 'Not added'
  }), [profileData]);

  // =============================================================================
  // VALIDATION & FIELD MANAGEMENT
  // =============================================================================

  /**
   * Get current field value (temp or actual)
   */
  const getFieldValue = useCallback((field: string): string => {
    if (editingState.editingField === field && tempValues[field] !== undefined) {
      return tempValues[field];
    }

    switch (field) {
      case 'firstName':
        return profileData?.firstName || '';
      case 'lastName':
        return profileData?.lastName || '';
      case 'phoneNumber':
        return profileData?.phoneNumber || '';
      case 'bio':
        return profileData?.bio || '';
      case 'location':
        return profileData?.location || '';
      default:
        return '';
    }
  }, [editingState.editingField, tempValues, profileData]);

  /**
   * Validate field and update validation errors
   */
  const validateField = useCallback((field: string, value: string) => {
    const error = validateProfileField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    return !error;
  }, []);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Start editing a specific field
   */
  const handleStartEdit = useCallback((field: ProfileEditingField) => {
    if (field && field !== editingState.editingField) {
      // Initialize temp value with current field value
      const currentValue = getFieldValue(field);
      setTempValues(prev => ({ ...prev, [field]: currentValue }));

      // Clear any previous validation errors
      setValidationErrors(prev => ({ ...prev, [field]: '' }));

      onEditField(field);
    }
  }, [editingState.editingField, getFieldValue, onEditField]);

  /**
   * Cancel editing and reset temp values
   */
  const handleCancelEdit = useCallback(() => {
    if (editingState.editingField) {
      // Clear temp values and validation errors for the field being edited
      setTempValues(prev => {
        const newTempValues = { ...prev };
        delete newTempValues[editingState.editingField!];
        return newTempValues;
      });

      setValidationErrors(prev => ({
        ...prev,
        [editingState.editingField!]: ''
      }));
    }

    onCancelEdit();
  }, [editingState.editingField, onCancelEdit]);

  /**
   * Update temp value for current editing field
   */
  const handleValueChange = useCallback((value: string) => {
    if (!editingState.editingField) return;

    // Update temp value
    setTempValues(prev => ({ ...prev, [editingState.editingField!]: value }));

    // Validate on change
    validateField(editingState.editingField, value);
  }, [editingState.editingField, validateField]);

  /**
   * Save profile changes
   */
  const handleSaveField = useCallback(async () => {
    if (!editingState.editingField) return;

    const fieldValue = tempValues[editingState.editingField] || '';

    // Validate before saving
    if (!validateField(editingState.editingField, fieldValue)) {
      return;
    }

    setIsSaving(true);

    try {
      // Prepare update based on field type
      let updates: Record<string, any> = {};

      if (editingState.editingField === 'name') {
        // Handle name field specially (split into first/last)
        const nameParts = fieldValue.trim().split(' ');
        updates = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        };
      } else {
        updates = { [editingState.editingField]: fieldValue };
      }

      await onSaveProfile(updates);

      // Clear temp values and exit edit mode on success
      setTempValues(prev => {
        const newTempValues = { ...prev };
        delete newTempValues[editingState.editingField!];
        return newTempValues;
      });

      onCancelEdit();

    } catch (error) {
      // Error is handled by parent component
      console.error('Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editingState.editingField, tempValues, validateField, onSaveProfile, onCancelEdit]);

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        <div className='mb-8'>
          <div className='h-8 bg-gray-200 rounded animate-pulse mb-2' />
          <div className='h-4 bg-gray-200 rounded w-2/3 animate-pulse' />
        </div>

        {/* Profile sections skeleton */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className='space-y-4'>
            <div className='h-6 bg-gray-200 rounded animate-pulse w-1/4' />
            <div className='space-y-3'>
              {[...Array(3)].map((_, itemIndex) => (
                <div key={itemIndex} className='flex justify-between py-4 border-b'>
                  <div className='space-y-2 flex-1'>
                    <div className='h-4 bg-gray-200 rounded animate-pulse w-1/3' />
                    <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2' />
                  </div>
                  <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =============================================================================
  // ERROR STATE
  // =============================================================================

  if (error) {
    return (
      <ErrorStateDisplay
        error={error}
        title="Unable to Load Profile"
        onRetry={() => window.location.reload()}
        icon={<User className='w-16 h-16' />}
        className={className}
      />
    );
  }

  // =============================================================================
  // RENDER PROFILE
  // =============================================================================

  return (
    <FeatureErrorBoundary featureName="Dashboard Profile" level="high">
      <div className={cn('space-y-8', className)}>
        {/* Header Section */}
        <ProfileHeader
          completionPercentage={completionPercentage}
          className='mb-8'
        />

        {/* Profile Photo Section */}
        <ProfilePhotoSection
          profilePhoto={profileData?.profilePhoto}
          fullName={displayValues.fullName}
        />

        {/* Personal Information Section */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>Personal Information</h3>
          <div className='space-y-1'>

            {/* Legal Name Field */}
            <div className='py-4 border-b'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>Legal name</p>
                  <p className='text-gray-600'>
                    {displayValues.fullName}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  className='text-primary hover:text-primary/80'
                  onClick={() => handleStartEdit(editingState.editingField === 'name' ? null : 'name')}
                >
                  {editingState.editingField === 'name' ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {/* Name Editing Form */}
              {editingState.editingField === 'name' && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        First Name
                      </label>
                      <input
                        type='text'
                        value={getFieldValue('firstName')}
                        onChange={(e) => {
                          const fullName = `${e.target.value} ${getFieldValue('lastName')}`.trim();
                          handleValueChange(fullName);
                        }}
                        maxLength={PROFILE_FIELD_LIMITS.firstName}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                        placeholder='First name'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Last Name
                      </label>
                      <input
                        type='text'
                        value={getFieldValue('lastName')}
                        onChange={(e) => {
                          const fullName = `${getFieldValue('firstName')} ${e.target.value}`.trim();
                          handleValueChange(fullName);
                        }}
                        maxLength={PROFILE_FIELD_LIMITS.lastName}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                        placeholder='Last name'
                      />
                    </div>
                  </div>

                  {validationErrors.name && (
                    <p className='text-sm text-red-600 mb-4'>
                      {validationErrors.name}
                    </p>
                  )}

                  <div className='flex justify-end space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className='w-3 h-3 mr-1' />
                      Cancel
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleSaveField}
                      disabled={isSaving || !!validationErrors.name}
                    >
                      <Save className='w-3 h-3 mr-1' />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className='flex items-center justify-between py-4 border-b'>
              <div>
                <p className='font-medium text-gray-900'>Email address</p>
                <p className='text-gray-600'>{displayValues.email}</p>
              </div>
              <div className='flex items-center space-x-3'>
                <ProfileVerificationBadge
                  isVerified={!!profileData?.isEmailVerified}
                  label={verificationStatus.email}
                />
                <Button variant='ghost' className='text-primary hover:text-primary/80'>
                  Edit
                </Button>
              </div>
            </div>

            {/* Phone Field */}
            <ProfileFieldEditor
              label="Phone number"
              value={displayValues.phoneNumber}
              field="phoneNumber"
              currentValue={getFieldValue('phoneNumber')}
              editingField={editingState.editingField}
              validationError={validationErrors.phoneNumber}
              isSaving={isSaving}
              onStartEdit={handleStartEdit}
              onValueChange={handleValueChange}
              onSave={handleSaveField}
              onCancel={handleCancelEdit}
              inputType="tel"
              placeholder="Enter phone number"
              badge={verificationStatus.phone}
              maxLength={PROFILE_FIELD_LIMITS.phoneNumber}
            />

            {/* Bio Field */}
            <ProfileFieldEditor
              label="Bio"
              value={displayValues.bio}
              field="bio"
              currentValue={getFieldValue('bio')}
              editingField={editingState.editingField}
              validationError={validationErrors.bio}
              isSaving={isSaving}
              onStartEdit={handleStartEdit}
              onValueChange={handleValueChange}
              onSave={handleSaveField}
              onCancel={handleCancelEdit}
              inputType="textarea"
              placeholder="Tell others about yourself..."
              description="Visible to hosts when you book"
              maxLength={PROFILE_FIELD_LIMITS.bio}
            />

          </div>
        </div>

        {/* Account Information Section */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>Account Information</h3>
          <div className='space-y-1'>

            {/* Member Since */}
            <div className='flex items-center justify-between py-4 border-b'>
              <div>
                <p className='font-medium text-gray-900'>Member since</p>
                <p className='text-gray-600'>{displayValues.memberSince}</p>
              </div>
            </div>

            {/* Account Status */}
            <div className='flex items-center justify-between py-4 border-b'>
              <div>
                <p className='font-medium text-gray-900'>Account status</p>
                <p className='text-gray-600'>Active member</p>
              </div>
              <span className='text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full'>
                {profileData?.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>

            {/* Location Field */}
            <ProfileFieldEditor
              label="Location"
              value={displayValues.location}
              field="location"
              currentValue={getFieldValue('location')}
              editingField={editingState.editingField}
              validationError={validationErrors.location}
              isSaving={isSaving}
              onStartEdit={handleStartEdit}
              onValueChange={handleValueChange}
              onSave={handleSaveField}
              onCancel={handleCancelEdit}
              inputType="text"
              placeholder="Enter your location"
              maxLength={PROFILE_FIELD_LIMITS.location}
            />

          </div>
        </div>
      </div>
    </FeatureErrorBoundary>
  );
});

DashboardProfile.displayName = 'DashboardProfile';

export { DashboardProfile };
