/**
 * Tests for LoginForm Component - TDD Baseline
 *
 * These tests establish a baseline for authentication flow testing.
 * Following TDD principles: Tests written BEFORE refactoring.
 * Tests should FAIL initially to prove they test real functionality.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';

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

describe('LoginForm', () => {
  let mockPush: jest.Mock;
  let mockRouter: any;
  let mockSearchParams: URLSearchParams;

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

    // Setup search params
    mockSearchParams = new URLSearchParams();

    // Mock next/navigation hooks
    const navigation = require('next/navigation');
    navigation.useRouter = jest.fn(() => mockRouter);
    navigation.useSearchParams = jest.fn(() => mockSearchParams);

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

  describe('TEST CASE 1: Successful Login Flow', () => {
    it('should handle successful login and redirect to dashboard', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      render(<LoginForm />);

      // Act - User enters credentials
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');

      // Assert - Form fields are populated
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('Password123!');

      // Act - User submits form
      await user.click(submitButton);

      // Assert - Login called with correct credentials
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });

      // Assert - Redirected to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during login', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValueOnce(loginPromise as any);

      render(<LoginForm />);

      // Act - Fill and submit form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Loading spinner appears
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });

      // Cleanup - Resolve promise
      resolveLogin!();
    });
  });

  describe('TEST CASE 2: Invalid Credentials', () => {
    it('should display error message when login fails with 401', async () => {
      // Arrange
      const user = userEvent.setup();
      const errorMessage = 'Invalid email or password';
      mockLogin.mockRejectedValueOnce(new Error(errorMessage));

      render(<LoginForm />);

      // Act - Submit with invalid credentials
      await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Error message displays
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Assert - User not redirected
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should clear error message when user retries', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));

      render(<LoginForm />);

      // Act - First failed attempt
      await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Error appears
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Act - User corrects and resubmits
      mockLogin.mockResolvedValueOnce(undefined);
      await user.clear(screen.getByLabelText(/email address/i));
      await user.type(screen.getByLabelText(/email address/i), 'correct@example.com');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Error clears on retry
      await waitFor(() => {
        expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('TEST CASE 3: Email Validation', () => {
    it('should validate email format with HTML5 validation', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm />);

      // Assert - Email input has correct type
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should not submit form with invalid email format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm />);

      // Act - Try to submit with invalid email
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'not-an-email');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');

      // Assert - Browser validation prevents submission
      expect(emailInput.validity.valid).toBe(false);
      expect(emailInput.validity.typeMismatch).toBe(true);
    });
  });

  describe('TEST CASE 4: Empty Fields Validation', () => {
    it('should require email field', async () => {
      // Arrange
      render(<LoginForm />);

      // Assert - Email input is required
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('required');
    });

    it('should require password field', async () => {
      // Arrange
      render(<LoginForm />);

      // Assert - Password input is required
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should not call login API with empty fields', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm />);

      // Act - Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Assert - Login not called due to HTML5 validation
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('TEST CASE 5: Loading State', () => {
    it('should disable submit button during loading', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValueOnce(loginPromise as any);

      render(<LoginForm />);

      // Act - Submit form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Assert - Button disabled during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Cleanup
      resolveLogin!();
    });

    it('should show loading spinner when isLoading is true', () => {
      // Arrange - Mock loading state from auth context
      mockAuthReturn.isLoading = true;

      // Act
      render(<LoginForm />);

      // Assert - Loading spinner visible
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show "Signing in..." text during login', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValueOnce(loginPromise as any);

      render(<LoginForm />);

      // Act - Submit form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Loading text appears
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });

      // Cleanup
      resolveLogin!();
    });
  });

  describe('TEST CASE 6: Redirect Parameter', () => {
    it('should redirect to specified URL from redirect param after login', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSearchParams.set('redirect', '/bookings');
      const navigation = require('next/navigation');
      navigation.useSearchParams = jest.fn(() => mockSearchParams);
      mockLogin.mockResolvedValueOnce(undefined);

      render(<LoginForm />);

      // Act - Complete login
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Redirected to bookings instead of dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/bookings');
      });
    });

    it('should redirect to dashboard if no redirect param provided', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      render(<LoginForm />);

      // Act - Complete login
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert - Redirected to default dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect authenticated users immediately on mount', () => {
      // Arrange - User already authenticated
      mockAuthReturn.isAuthenticated = true;
      mockAuthReturn.user = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'guest' };
      mockAuthReturn.token = 'fake-token';

      // Act
      render(<LoginForm />);

      // Assert - Shows loading state (redirecting)
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Additional User Interactions', () => {
    it('should toggle password visibility', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm />);

      // Assert - Password initially hidden
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Act - Click show password button
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button has no text
      await user.click(toggleButton);

      // Assert - Password visible
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Act - Click again to hide
      await user.click(toggleButton);

      // Assert - Password hidden again
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should populate guest credentials when guest login clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm />);

      // Act - Click guest login button
      const guestButton = screen.getByRole('button', { name: /guest/i });
      await user.click(guestButton);

      // Assert - Fields populated
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

      expect(emailInput.value).toBe('guest@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('should have link to registration page', () => {
      // Arrange
      render(<LoginForm />);

      // Assert - Sign up link exists
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toHaveAttribute('href', '/auth/register');
    });

    it('should have link to forgot password page', () => {
      // Arrange
      render(<LoginForm />);

      // Assert - Forgot password link exists
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
    });
  });
});
