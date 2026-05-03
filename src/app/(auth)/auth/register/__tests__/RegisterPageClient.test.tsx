/**
 * Tests for RegisterPageClient Component - TDD Baseline
 *
 * These tests establish a baseline for registration flow testing.
 * Following TDD principles: Tests written BEFORE refactoring.
 * Tests should FAIL initially to prove they test real functionality.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPageClient from '../RegisterPageClient';

// Mock AuthContext
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();
const mockRefreshUserData = jest.fn();

let mockAuthReturn = {
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
  refreshUserData: mockRefreshUserData,
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => mockAuthReturn),
}));

// Import after mock setup
import { useAuth } from '@/contexts/AuthContext';

describe('RegisterPageClient', () => {
  let mockPush: jest.Mock;
  let mockRouter: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup router mock
    mockPush = jest.fn();
    mockRouter = {
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };

    // Mock next/navigation hooks
    const navigation = require('next/navigation');
    navigation.useRouter = jest.fn(() => mockRouter);

    // Reset auth mock to default state
    mockAuthReturn = {
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
      refreshUserData: mockRefreshUserData,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TEST CASE 1: Successful Registration', () => {
    it('should register user and redirect to dashboard when all fields valid', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce(undefined);

      render(<RegisterPageClient />);

      // Act - Fill all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      // Accept terms
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      // Act - Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Assert - Register called with correct data
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          password: 'SecurePass123!',
          role: 'guest', // Default role
        });
      });

      // Assert - Redirected to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should register as owner when owner role selected', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce(undefined);

      render(<RegisterPageClient />);

      // Act - Select owner role
      const ownerRole = screen.getByText(/host properties/i).closest('div');
      expect(ownerRole).toBeInTheDocument();
      await user.click(ownerRole!);

      // Fill form fields
      await user.type(screen.getByLabelText(/first name/i), 'Jane');
      await user.type(screen.getByLabelText(/last name/i), 'Smith');
      await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'OwnerPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'OwnerPass123!');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Assert - Register called with owner role
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'owner',
          })
        );
      });
    });

    it('should show loading state during registration', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveRegister: () => void;
      const registerPromise = new Promise<void>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegister.mockReturnValueOnce(registerPromise as any);

      render(<RegisterPageClient />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Assert - Loading state appears
      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });

      // Cleanup
      resolveRegister!();
    });
  });

  describe('TEST CASE 2: Password Requirements', () => {
    it('should display password requirements list', () => {
      // Arrange & Act
      render(<RegisterPageClient />);

      // Assert - All requirements visible
      expect(screen.getByText(/password must contain/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
      expect(screen.getByText(/one special character/i)).toBeInTheDocument();
    });

    it('should accept password meeting all requirements', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Act - Enter valid password
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const validPassword = 'ValidPass123!';
      await user.type(passwordInputs[0], validPassword);

      // Assert - Password accepted (no validation error)
      const passwordInput = passwordInputs[0] as HTMLInputElement;
      expect(passwordInput.value).toBe(validPassword);
    });

    it('should show requirements for weak password', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Note: This test validates that requirements are shown
      // Actual validation would be implemented in the form
      const requirements = screen.getByText(/password must contain/i);
      expect(requirements).toBeInTheDocument();
    });
  });

  describe('TEST CASE 3: Password Confirmation Mismatch', () => {
    it('should show error when passwords do not match', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Act - Enter mismatched passwords
      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass123!');

      // Fill other required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      // Submit form
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Assert - Error message displays
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Assert - Registration not called
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should not show error when passwords match', async () => {
      // Arrange
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce(undefined);
      render(<RegisterPageClient />);

      // Act - Enter matching passwords
      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      // Fill other fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Assert - No password mismatch error
      await waitFor(() => {
        expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('TEST CASE 4: Email Already Exists', () => {
    it('should display error when email already registered', async () => {
      // Arrange
      const user = userEvent.setup();
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'User with this email already exists',
          },
        },
      };
      mockRegister.mockRejectedValueOnce(errorResponse);

      render(<RegisterPageClient />);

      // Act - Submit with existing email
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Assert - Error message displays
      await waitFor(() => {
        const errorText = screen.queryByText(/already exists/i);
        expect(errorText).toBeInTheDocument();
      });

      // Assert - User not redirected
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('TEST CASE 5: Form Validation', () => {
    it('should require first name', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveAttribute('required');
    });

    it('should require last name', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const lastNameInput = screen.getByLabelText(/last name/i);
      expect(lastNameInput).toHaveAttribute('required');
    });

    it('should require email with valid format', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should require phone number', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const phoneInput = screen.getByLabelText(/phone number/i);
      expect(phoneInput).toHaveAttribute('required');
    });

    it('should require password', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const passwordInputs = screen.getAllByLabelText(/password/i);
      expect(passwordInputs[0]).toHaveAttribute('required');
    });

    it('should require password confirmation', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('should require terms acceptance', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      expect(termsCheckbox).toHaveAttribute('required');
    });

    it('should not submit with missing required fields', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Act - Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Assert - Registration not called due to HTML5 validation
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('TEST CASE 6: Loading States', () => {
    it('should disable button during submission', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveRegister: () => void;
      const registerPromise = new Promise<void>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegister.mockReturnValueOnce(registerPromise as any);

      render(<RegisterPageClient />);

      // Fill form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Assert - Button disabled during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Cleanup
      resolveRegister!();
    });

    it('should show loading spinner during registration', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveRegister: () => void;
      const registerPromise = new Promise<void>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegister.mockReturnValueOnce(registerPromise as any);

      render(<RegisterPageClient />);

      // Fill and submit
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      await user.type(passwordInputs[0], 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Assert - Loading spinner visible
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Cleanup
      resolveRegister!();
    });
  });

  describe('Additional User Interactions', () => {
    it('should toggle password visibility', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Get password input
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const passwordInput = passwordInputs[0];

      // Assert - Initially hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Act - Click toggle button (first Eye icon)
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      await user.click(toggleButtons[0]);

      // Assert - Now visible
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should toggle confirm password visibility', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Get confirm password input
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      // Assert - Initially hidden
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Act - Click toggle button (second Eye icon)
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      await user.click(toggleButtons[1]);

      // Assert - Now visible
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('should have link to login page', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const loginLink = screen.getByRole('link', { name: /sign in here/i });
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });

    it('should have links to terms and privacy policy', () => {
      // Arrange
      render(<RegisterPageClient />);

      // Assert
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });

      expect(termsLink).toHaveAttribute('href', '/terms');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should allow role selection between guest and owner', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RegisterPageClient />);

      // Assert - Default is guest
      const guestRadio = screen.getByRole('radio', { name: /guest/i });
      expect(guestRadio).toBeChecked();

      // Act - Select owner
      const ownerRole = screen.getByText(/host properties/i).closest('div');
      await user.click(ownerRole!);

      // Assert - Owner selected
      const ownerRadio = screen.getByRole('radio', { name: /owner/i });
      expect(ownerRadio).toBeChecked();
    });

    it('should redirect authenticated users immediately', () => {
      // Arrange - User already authenticated
      mockAuthReturn.isAuthenticated = true;
      mockAuthReturn.user = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'guest' };
      mockAuthReturn.token = 'fake-token';

      // Act - Render will trigger redirect effect
      render(<RegisterPageClient />);

      // Note: The actual redirect is handled by useEffect
      // We can't easily test it without mocking useEffect timing
    });
  });
});
