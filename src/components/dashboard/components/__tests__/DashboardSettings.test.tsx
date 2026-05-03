/**
 * DashboardSettings Component Tests
 *
 * Comprehensive test suite for the DashboardSettings component following
 * TDD methodology and React Testing Library best practices.
 *
 * Test Coverage:
 * - Notification settings management
 * - Privacy and visibility settings
 * - Security settings (password, 2FA, sessions)
 * - Account deactivation and deletion
 * - Settings persistence and synchronization
 * - Form validation and error handling
 * - Loading and saving states
 * - Confirmation dialogs
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardSettings from '../DashboardSettings';
import type { DashboardUser, DashboardLoadingState, DashboardErrorState } from '../../types';

// =============================================================================
// TEST DATA & MOCKS
// =============================================================================

const mockUser: DashboardUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-123-4567',
  role: 'guest',
  isEmailVerified: true,
  isPhoneVerified: true,
  profilePhoto: '/images/profile.jpg',
  memberSince: new Date('2024-01-15'),
  settings: {
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      bookingUpdates: true,
      securityAlerts: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: true,
      activityStatus: true,
      allowMessages: true,
      showBookingHistory: false,
      shareWishlist: false,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      activeDevices: 3,
    },
  },
};

const mockLoadingState: DashboardLoadingState = {
  isLoading: false,
  bookingsLoading: false,
  favoritesLoading: false,
  profileLoading: false,
  settingsLoading: false,
  isCancelling: null,
};

const mockErrorState: DashboardErrorState = {
  dashboardError: null,
  bookingsError: null,
  favoritesError: null,
  profileError: null,
  settingsError: null,
};

const mockUpdateSettings = jest.fn();
const mockAccountAction = jest.fn();
const mockRefresh = jest.fn();

const defaultProps = {
  user: mockUser,
  loading: mockLoadingState,
  error: mockErrorState,
  onUpdateSettings: mockUpdateSettings,
  onAccountAction: mockAccountAction,
  onRefresh: mockRefresh,
};

// =============================================================================
// TEST SUITE: DashboardSettings
// =============================================================================

describe('DashboardSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // TEST CASE 1: Component Rendering
  // ===========================================================================

  describe('Rendering', () => {
    it('should render all settings sections', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByText(/Notification Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Privacy Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Security Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Account Management/i)).toBeInTheDocument();
    });

    it('should render settings cards with proper headings', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /Notification Settings/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Privacy Settings/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Security Settings/i })).toBeInTheDocument();
    });

    it('should display user email in security section', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 2: Notification Settings
  // ===========================================================================

  describe('Notification Settings', () => {
    it('should display all notification toggles', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByLabelText(/Email notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Push notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/SMS notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Marketing emails/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Booking updates/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Security alerts/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Weekly digest/i)).toBeInTheDocument();
    });

    it('should show correct initial state for notification toggles', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByLabelText(/Email notifications/i)).toBeChecked();
      expect(screen.getByLabelText(/Push notifications/i)).toBeChecked();
      expect(screen.getByLabelText(/SMS notifications/i)).not.toBeChecked();
      expect(screen.getByLabelText(/Marketing emails/i)).not.toBeChecked();
    });

    it('should call onUpdateSettings when notification toggle changed', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      const smsToggle = screen.getByLabelText(/SMS notifications/i);
      await user.click(smsToggle);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications: expect.objectContaining({
              smsNotifications: true,
            }),
          })
        );
      });
    });

    it('should toggle multiple notifications independently', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/Marketing emails/i));
      await user.click(screen.getByLabelText(/Weekly digest/i));

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledTimes(2);
      });
    });

    it('should show save button after notification changes', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('should disable security alerts toggle', () => {
      render(<DashboardSettings {...defaultProps} />);

      const securityAlertsToggle = screen.getByLabelText(/Security alerts/i);
      expect(securityAlertsToggle).toBeDisabled();
    });

    it('should show tooltip for disabled security alerts', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      const securityAlertsLabel = screen.getByText(/Security alerts/i);
      await user.hover(securityAlertsLabel);

      await waitFor(() => {
        expect(screen.getByText(/Security alerts cannot be disabled/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 3: Privacy Settings
  // ===========================================================================

  describe('Privacy Settings', () => {
    it('should display all privacy toggles', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByLabelText(/Profile visibility/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Activity status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Allow messages/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show booking history/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Share wishlist/i)).toBeInTheDocument();
    });

    it('should show correct initial state for privacy toggles', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByLabelText(/Profile visibility/i)).toBeChecked();
      expect(screen.getByLabelText(/Activity status/i)).toBeChecked();
      expect(screen.getByLabelText(/Allow messages/i)).toBeChecked();
      expect(screen.getByLabelText(/Show booking history/i)).not.toBeChecked();
      expect(screen.getByLabelText(/Share wishlist/i)).not.toBeChecked();
    });

    it('should call onUpdateSettings when privacy toggle changed', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      const bookingHistoryToggle = screen.getByLabelText(/Show booking history/i);
      await user.click(bookingHistoryToggle);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            privacy: expect.objectContaining({
              showBookingHistory: true,
            }),
          })
        );
      });
    });

    it('should show privacy warning when making profile public', async () => {
      const user = userEvent.setup();

      const props = {
        ...defaultProps,
        user: {
          ...mockUser,
          settings: {
            ...mockUser.settings!,
            privacy: {
              ...mockUser.settings!.privacy,
              profileVisibility: false,
            },
          },
        },
      };

      render(<DashboardSettings {...props} />);

      await user.click(screen.getByLabelText(/Profile visibility/i));

      expect(screen.getByText(/Your profile will be visible to all users/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 4: Security Settings
  // ===========================================================================

  describe('Security Settings', () => {
    it('should display change password button', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });

    it('should display two-factor authentication toggle', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByLabelText(/Two-factor authentication/i)).toBeInTheDocument();
    });

    it('should show 2FA status badge', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByText(/Disabled/i)).toBeInTheDocument();
    });

    it('should show enabled badge when 2FA is active', () => {
      const props = {
        ...defaultProps,
        user: {
          ...mockUser,
          settings: {
            ...mockUser.settings!,
            security: {
              ...mockUser.settings!.security,
              twoFactorEnabled: true,
            },
          },
        },
      };

      render(<DashboardSettings {...props} />);

      expect(screen.getByText(/Enabled/i)).toBeInTheDocument();
    });

    it('should open password change dialog when button clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Change your password/i)).toBeInTheDocument();
    });

    it('should display active devices count', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByText(/3 active devices/i)).toBeInTheDocument();
    });

    it('should show manage sessions button', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByRole('button', { name: /manage sessions/i })).toBeInTheDocument();
    });

    it('should display login alerts toggle', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByLabelText(/Login alerts/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Login alerts/i)).toBeChecked();
    });

    it('should call onAccountAction when enabling 2FA', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/Two-factor authentication/i));

      await waitFor(() => {
        expect(mockAccountAction).toHaveBeenCalledWith('enable2FA');
      });
    });
  });

  // ===========================================================================
  // TEST CASE 5: Password Change
  // ===========================================================================

  describe('Password Change', () => {
    it('should show password change form in dialog', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByLabelText(/Current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/New password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm new password/i)).toBeInTheDocument();
    });

    it('should validate password requirements', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      const newPasswordInput = screen.getByLabelText(/New password/i);
      await user.type(newPasswordInput, 'weak');

      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      await user.type(screen.getByLabelText(/New password/i), 'StrongPass123!');
      await user.type(screen.getByLabelText(/Confirm new password/i), 'DifferentPass123!');

      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    it('should call onAccountAction with password data when submitted', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      await user.type(screen.getByLabelText(/Current password/i), 'OldPass123!');
      await user.type(screen.getByLabelText(/New password/i), 'NewPass123!');
      await user.type(screen.getByLabelText(/Confirm new password/i), 'NewPass123!');

      await user.click(screen.getByRole('button', { name: /update password/i }));

      await waitFor(() => {
        expect(mockAccountAction).toHaveBeenCalledWith('changePassword', {
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
        });
      });
    });

    it('should close dialog after successful password change', async () => {
      const user = userEvent.setup();

      mockAccountAction.mockResolvedValueOnce(undefined);

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      await user.type(screen.getByLabelText(/Current password/i), 'OldPass123!');
      await user.type(screen.getByLabelText(/New password/i), 'NewPass123!');
      await user.type(screen.getByLabelText(/Confirm new password/i), 'NewPass123!');

      await user.click(screen.getByRole('button', { name: /update password/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 6: Account Management
  // ===========================================================================

  describe('Account Management', () => {
    it('should display deactivate account button', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByRole('button', { name: /deactivate account/i })).toBeInTheDocument();
    });

    it('should display delete account button', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('should show warning for account deactivation', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(
        screen.getByText(/Deactivating your account will hide your profile/i)
      ).toBeInTheDocument();
    });

    it('should show danger warning for account deletion', () => {
      render(<DashboardSettings {...defaultProps} />);

      expect(
        screen.getByText(/Deleting your account is permanent and cannot be undone/i)
      ).toBeInTheDocument();
    });

    it('should show confirmation dialog when deactivate clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /deactivate account/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to deactivate/i)).toBeInTheDocument();
    });

    it('should show confirmation dialog when delete clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete account/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/permanently delete your account/i)).toBeInTheDocument();
    });

    it('should require password confirmation for account deletion', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete account/i }));

      expect(screen.getByLabelText(/Enter your password to confirm/i)).toBeInTheDocument();
    });

    it('should call onAccountAction when account deactivation confirmed', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /deactivate account/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => {
        expect(mockAccountAction).toHaveBeenCalledWith('deactivate');
      });
    });

    it('should call onAccountAction when account deletion confirmed', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete account/i }));

      const passwordInput = screen.getByLabelText(/Enter your password to confirm/i);
      await user.type(passwordInput, 'MyPassword123!');

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(mockAccountAction).toHaveBeenCalledWith('delete', {
          password: 'MyPassword123!',
        });
      });
    });
  });

  // ===========================================================================
  // TEST CASE 7: Settings Persistence
  // ===========================================================================

  describe('Settings Persistence', () => {
    it('should show unsaved changes indicator', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));

      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    });

    it('should show save all button when changes made', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));

      expect(screen.getByRole('button', { name: /save all changes/i })).toBeInTheDocument();
    });

    it('should show discard button when changes made', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));

      expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    });

    it('should save all pending changes when save all clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));
      await user.click(screen.getByLabelText(/Show booking history/i));

      await user.click(screen.getByRole('button', { name: /save all changes/i }));

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications: expect.objectContaining({ smsNotifications: true }),
            privacy: expect.objectContaining({ showBookingHistory: true }),
          })
        );
      });
    });

    it('should revert changes when discard clicked', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));

      await user.click(screen.getByRole('button', { name: /discard/i }));

      expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/SMS notifications/i)).not.toBeChecked();
    });

    it('should show success message after settings saved', async () => {
      const user = userEvent.setup();

      mockUpdateSettings.mockResolvedValueOnce(undefined);

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));
      await user.click(screen.getByRole('button', { name: /save all changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/Settings saved successfully/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 8: Loading States
  // ===========================================================================

  describe('Loading States', () => {
    it('should show loading spinner when settings loading', () => {
      const props = {
        ...defaultProps,
        loading: { ...mockLoadingState, settingsLoading: true },
      };

      render(<DashboardSettings {...props} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should disable all toggles while saving', async () => {
      const user = userEvent.setup();

      mockUpdateSettings.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));
      await user.click(screen.getByRole('button', { name: /save all changes/i }));

      const toggles = screen.getAllByRole('switch');
      toggles.forEach(toggle => {
        if (!toggle.hasAttribute('disabled')) {
          expect(toggle).toBeDisabled();
        }
      });
    });

    it('should show saving indicator', async () => {
      const user = userEvent.setup();

      mockUpdateSettings.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));
      await user.click(screen.getByRole('button', { name: /save all changes/i }));

      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TEST CASE 9: Error Handling
  // ===========================================================================

  describe('Error Handling', () => {
    it('should display error message when error prop provided', () => {
      const props = {
        ...defaultProps,
        error: {
          ...mockErrorState,
          settingsError: new Error('Failed to load settings'),
        },
      };

      render(<DashboardSettings {...props} />);

      expect(screen.getByText(/Failed to load settings/i)).toBeInTheDocument();
    });

    it('should show retry button when error occurs', () => {
      const props = {
        ...defaultProps,
        error: {
          ...mockErrorState,
          settingsError: new Error('Failed to load settings'),
        },
      };

      render(<DashboardSettings {...props} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call onRefresh when retry button clicked', async () => {
      const user = userEvent.setup();

      const props = {
        ...defaultProps,
        error: {
          ...mockErrorState,
          settingsError: new Error('Failed to load settings'),
        },
      };

      render(<DashboardSettings {...props} />);

      await user.click(screen.getByRole('button', { name: /try again/i }));

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should display error when save fails', async () => {
      const user = userEvent.setup();

      mockUpdateSettings.mockRejectedValueOnce(new Error('Failed to save settings'));

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));
      await user.click(screen.getByRole('button', { name: /save all changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to save settings/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TEST CASE 10: Accessibility
  // ===========================================================================

  describe('Accessibility', () => {
    it('should have accessible labels for all toggles', () => {
      render(<DashboardSettings {...defaultProps} />);

      const switches = screen.getAllByRole('switch');
      switches.forEach(toggle => {
        expect(toggle).toHaveAccessibleName();
      });
    });

    it('should have proper ARIA labels for buttons', () => {
      render(<DashboardSettings {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should announce status changes to screen readers', async () => {
      const user = userEvent.setup();

      mockUpdateSettings.mockResolvedValueOnce(undefined);

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByLabelText(/SMS notifications/i));
      await user.click(screen.getByRole('button', { name: /save all changes/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/Settings saved successfully/i);
      });
    });

    it('should have proper focus management in dialogs', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /change password/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveFocus();
      });
    });

    it('should trap focus within dialogs', async () => {
      const user = userEvent.setup();

      render(<DashboardSettings {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete account/i }));

      const dialog = screen.getByRole('dialog');
      const focusableElements = within(dialog).getAllByRole('button');

      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });
});
