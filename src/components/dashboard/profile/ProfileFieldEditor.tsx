/**
 * ProfileFieldEditor Component
 *
 * Reusable inline field editor for profile fields.
 * Extracted from DashboardProfile for Single Responsibility Principle.
 *
 * Responsibilities:
 * - Display field value with edit button
 * - Show inline editing form when editing
 * - Handle save/cancel operations
 * - Display validation errors
 * - Show character count for limited fields
 */

'use client';

import React from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProfileEditingField } from '../../types';

export interface ProfileFieldEditorProps {
  label: string;
  value: string;
  field: string;
  currentValue: string;
  editingField: ProfileEditingField;
  validationError?: string;
  isSaving: boolean;
  onStartEdit: (field: ProfileEditingField) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  inputType?: 'text' | 'tel' | 'textarea';
  placeholder?: string;
  description?: string;
  badge?: string;
  maxLength?: number;
}

/**
 * Profile Field Editor Component
 *
 * Provides inline editing functionality for profile fields.
 */
export const ProfileFieldEditor: React.FC<ProfileFieldEditorProps> = React.memo(({
  label,
  value,
  field,
  currentValue,
  editingField,
  validationError,
  isSaving,
  onStartEdit,
  onValueChange,
  onSave,
  onCancel,
  inputType = 'text',
  placeholder,
  description,
  badge,
  maxLength
}) => {
  const isEditing = editingField === field;

  return (
    <div className='py-4 border-b'>
      <div className='flex items-start justify-between'>
        <div className='flex-1 mr-4'>
          <p className='font-medium text-gray-900'>{label}</p>
          <p className='text-gray-600 text-sm leading-relaxed'>
            {value}
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          {badge && (
            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
              {badge}
            </span>
          )}
          <Button
            variant='ghost'
            className='text-primary hover:text-primary/80 mt-1'
            onClick={() => onStartEdit(isEditing ? null : field as ProfileEditingField)}
          >
            {isEditing ? 'Cancel' : (value !== 'Not provided' ? 'Edit' : 'Add')}
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {label}
              </label>
              {inputType === 'textarea' ? (
                <textarea
                  rows={4}
                  value={currentValue}
                  onChange={(e) => onValueChange(e.target.value)}
                  maxLength={maxLength}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none'
                  placeholder={placeholder}
                />
              ) : (
                <input
                  type={inputType}
                  value={currentValue}
                  onChange={(e) => onValueChange(e.target.value)}
                  maxLength={maxLength}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                  placeholder={placeholder}
                />
              )}
              {description && (
                <p className='text-xs text-gray-500 mt-1'>{description}</p>
              )}
              {maxLength && (
                <p className='text-xs text-gray-400 mt-1'>
                  {currentValue.length}/{maxLength} characters
                </p>
              )}
            </div>

            {validationError && (
              <p className='text-sm text-red-600'>
                {validationError}
              </p>
            )}

            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={onCancel}
                disabled={isSaving}
              >
                <X className='w-3 h-3 mr-1' />
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={onSave}
                disabled={isSaving || !!validationError}
              >
                <Save className='w-3 h-3 mr-1' />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProfileFieldEditor.displayName = 'ProfileFieldEditor';
