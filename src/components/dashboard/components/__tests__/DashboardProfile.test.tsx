/**
 * DashboardProfile Component Tests
 *
 * Comprehensive test suite for the DashboardProfile component following
 * TDD methodology and React Testing Library best practices.
 *
 * Test Coverage:
 * - Profile information display
 * - Inline field editing with validation
 * - Profile photo upload and display
 * - Save/cancel operations
 * - Form validation and error messages
 * - Loading and saving states
 * - Profile completion percentage
 * - Verification status indicators
 * - Error handling and recovery
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardProfile } from '../DashboardProfile';
import type { DashboardProfileProps, ProfileData, ProfileEditingField } from '../../types';

// =============================================================================
// TEST DATA & MOCKS
// =============================================================================

const mockProfileData: ProfileData = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-123-4567',
  bio: 'Avid traveler and photography enthusiast',
  location: 'San Francisco, CA',
  profilePhoto: '/images/profile.jpg',
  isEmailVerified: true,
  isPhoneVerified: true,
  memberSince: new Date('2024-01-15'),
};

const mockIncompleteProfileData: ProfileData = {
  id: 'user-2',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phoneNumber: '',
  bio: '',
  location: '',
  profilePhoto: '',
  isEmailVerified: false,
  isPhoneVerified: false,
  memberSince: new Date('2025-01-01'),
};

const mockEditingState = {
  editingField: null as ProfileEditingField | null,
  tempValue: '',
  isSaving: false,
  validationErrors: {},
};

const mockOnEditField = jest.fn();
const mockOnSaveProfile = jest.fn();
const mockOnCancelEdit = jest.fn();

// Default props for testing
const defaultProps: DashboardProfileProps = {
  profileData: mockProfileData,
  editingState: mockEditingState,
  onEditField: mockOnEditField,
  onSaveProfile: mockOnSaveProfile,
  onCancelEdit: mockOnCancelEdit,
  isActive: true,
  isLoading: false,
  error: null,
};

// =============================================================================
// TEST SUITE: DashboardProfile
// =============================================================================

describe('DashboardProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // TEST CASE 1: Profile Display
  // ===========================================================================

  describe('Profile Display', () => {
    it('should render profile information correctly', () => {
      render(<DashboardProfile {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
      expect(screen.getByText('Avid traveler and photography enthusiast')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });

    it('should show member since date', () => {
      render(<DashboardProfile {...defaultProps} />);

      expect(screen.getByText(/Member since/i)).toBeInTheDocument();
      expect(screen.getByText(/January 2024/i)).toBeInTheDocument();
    });

    it('should display profile photo when available', () => {
      render(<DashboardProfile {...defaultProps} />);

      const profileImage = screen.getByAltText(/John Doe/i);
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute('src', expect.stringContaining('profile.jpg'));
    });

    it('should show placeholder when profile photo not available', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, profilePhoto: '' },
      };

      render(<DashboardProfile {...props} />);

      const placeholder = screen.getByTestId('profile-photo-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('should display verification status for email', () => {
      render(<DashboardProfile {...defaultProps} />);

      expect(screen.getByText(/Verified/i)).toBeInTheDocument();
    });

    it('should display not verified status when email not verified', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, isEmailVerified: false },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByText(/Not verified/i)).toBeInTheDocument();
    });

    it('should show Not provided for missing optional fields', () => {
      render(<DashboardProfile {...defaultProps} profileData={mockIncompleteProfileData} />);

      expect(screen.getAllByText(/Not provided/i)).toHaveLength(3);
    });
  });

  // ===========================================================================
  // TEST CASE 2: Profile Completion
  // ===========================================================================

  describe('Profile Completion', () => {
    it('should display profile completion percentage', () => {
      render(<DashboardProfile {...defaultProps} />);

      expect(screen.getByText(/Profile Completion/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });

    it('should show lower completion percentage for incomplete profile', () => {
      render(<DashboardProfile {...defaultProps} profileData={mockIncompleteProfileData} />);

      expect(screen.getByText(/Profile Completion/i)).toBeInTheDocument();
      expect(screen.queryByText(/100%/i)).not.toBeInTheDocument();
    });

    it('should display completion progress bar', () => {
      render(<DashboardProfile {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  // ===========================================================================
  // TEST CASE 3: Inline Editing
  // ===========================================================================

  describe('Inline Field Editing', () => {
    it('should show edit button for editable fields', () => {
      render(<DashboardProfile {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should call onEditField when edit button clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardProfile {...defaultProps} />);

      const firstEditButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(firstEditButton);

      expect(mockOnEditField).toHaveBeenCalled();
    });

    it('should show input field when field is being edited', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: mockProfileData.bio || '',
        },
      };

      render(<DashboardProfile {...props} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Avid traveler and photography enthusiast');
    });

    it('should show save and cancel buttons when editing', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: mockProfileData.bio || '',
        },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should call onSaveProfile when save button clicked', async () => {
      const user = userEvent.setup();

      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: 'Updated bio text',
        },
      };

      render(<DashboardProfile {...props} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSaveProfile).toHaveBeenCalledWith({
          bio: 'Updated bio text',
        });
      });
    });

    it('should call onCancelEdit when cancel button clicked', async () => {
      const user = userEvent.setup();

      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: mockProfileData.bio || '',
        },
      };

      render(<DashboardProfile {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancelEdit).toHaveBeenCalled();
    });

    it('should not call onSaveProfile when field value unchanged', async () => {
      const user = userEvent.setup();

      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: mockProfileData.bio || '',
        },
      };

      render(<DashboardProfile {...props} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(mockOnSaveProfile).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TEST CASE 4: Form Validation
  // ===========================================================================

  describe('Form Validation', () => {
    it('should display validation error for invalid email', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'email' as ProfileEditingField,
          tempValue: 'invalid-email',
          validationErrors: { email: 'Please enter a valid email address' },
        },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    it('should display validation error for invalid phone number', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'phoneNumber' as ProfileEditingField,
          tempValue: '123',
          validationErrors: { phoneNumber: 'Please enter a valid phone number' },
        },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
    });

    it('should disable save button when validation errors exist', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'email' as ProfileEditingField,
          tempValue: 'invalid-email',
          validationErrors: { email: 'Invalid email' },
        },
      };

      render(<DashboardProfile {...props} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show character count for bio field', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: 'Short bio',
        },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByText(/9 \/ 500/i)).toBeInTheDocument();
    });

    it('should prevent bio exceeding character limit', () => {
      const longBio = 'a'.repeat(501);

      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: longBio,
          validationErrors: { bio: 'Bio cannot exceed 500 characters' },
        },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByText(/Bio cannot exceed 500 characters/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 5: Profile Photo Upload
  // ===========================================================================

  describe('Profile Photo Upload', () => {
    it('should show upload photo button', () => {
      render(<DashboardProfile {...defaultProps} />);

      expect(screen.getByRole('button', { name: /change photo/i })).toBeInTheDocument();
    });

    it('should trigger file input when upload button clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardProfile {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /change photo/i });
      await user.click(uploadButton);

      const fileInput = screen.getByLabelText(/upload photo/i, { selector: 'input' });
      expect(fileInput).toBeInTheDocument();
    });

    it('should validate file type on photo upload', async () => {
      const user = userEvent.setup();

      render(<DashboardProfile {...defaultProps} />);

      const fileInput = screen.getByLabelText(/upload photo/i, { selector: 'input' });
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });

      await user.upload(fileInput, invalidFile);

      await waitFor(() => {
        expect(screen.getByText(/Please upload a valid image file/i)).toBeInTheDocument();
      });
    });

    it('should validate file size on photo upload', async () => {
      const user = userEvent.setup();

      render(<DashboardProfile {...defaultProps} />);

      const fileInput = screen.getByLabelText(/upload photo/i, { selector: 'input' });
      const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/File size must be less than 5MB/i)).toBeInTheDocument();
      });
    });

    it('should show preview of uploaded photo', async () => {
      const user = userEvent.setup();

      render(<DashboardProfile {...defaultProps} />);

      const fileInput = screen.getByLabelText(/upload photo/i, { selector: 'input' });
      const validFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, validFile);

      await waitFor(() => {
        const preview = screen.getByTestId('photo-preview');
        expect(preview).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 6: Loading and Saving States
  // ===========================================================================

  describe('Loading and Saving States', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<DashboardProfile {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show saving indicator when isSaving is true', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          isSaving: true,
        },
      };

      render(<DashboardProfile {...props} />);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('should disable all edit buttons while saving', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          isSaving: true,
        },
      };

      render(<DashboardProfile {...props} />);

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      editButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should show success message after successful save', async () => {
      const user = userEvent.setup();

      mockOnSaveProfile.mockResolvedValueOnce(undefined);

      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: 'New bio text',
        },
      };

      render(<DashboardProfile {...props} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 7: Error Handling
  // ===========================================================================

  describe('Error Handling', () => {
    it('should display error message when error prop provided', () => {
      const error = new Error('Failed to load profile');

      render(<DashboardProfile {...defaultProps} error={error} />);

      expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
    });

    it('should show retry button when error occurs', () => {
      const error = new Error('Failed to load profile');

      render(<DashboardProfile {...defaultProps} error={error} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should display error message when save fails', async () => {
      const user = userEvent.setup();

      mockOnSaveProfile.mockRejectedValueOnce(new Error('Failed to update profile'));

      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: 'New bio',
        },
      };

      render(<DashboardProfile {...props} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 8: Accessibility
  // ===========================================================================

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'bio' as ProfileEditingField,
          tempValue: mockProfileData.bio || '',
        },
      };

      render(<DashboardProfile {...props} />);

      const bioInput = screen.getByRole('textbox');
      expect(bioInput).toHaveAccessibleName();
    });

    it('should have proper ARIA labels for buttons', () => {
      render(<DashboardProfile {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      editButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should announce validation errors to screen readers', () => {
      const props = {
        ...defaultProps,
        editingState: {
          ...mockEditingState,
          editingField: 'email' as ProfileEditingField,
          validationErrors: { email: 'Invalid email address' },
        },
      };

      render(<DashboardProfile {...props} />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/Invalid email address/i);
    });

    it('should have proper focus management when editing', async () => {
      const user = userEvent.setup();

      render(<DashboardProfile {...defaultProps} />);

      const firstEditButton = screen.getAllByRole('button', { name: /edit/i })[0];
      await user.click(firstEditButton);

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
      });
    });
  });
});
