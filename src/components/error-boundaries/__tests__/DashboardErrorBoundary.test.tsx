/**
 * DashboardErrorBoundary Tests
 *
 * Comprehensive test suite for dashboard-specific error boundary.
 * Tests role-based error handling, dashboard recovery, and user-specific fallbacks.
 */

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { DashboardErrorBoundary } from '../DashboardErrorBoundary';

const ThrowError = ({ shouldThrow, message = 'Dashboard error' }: { shouldThrow: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Dashboard content loaded</div>;
};

describe('DashboardErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe('Error Catching', () => {
    it('should catch errors from dashboard components', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/dashboard error/i)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={false} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText('Dashboard content loaded')).toBeInTheDocument();
    });
  });

  describe('Role-Based Error Messages', () => {
    it('should show admin-specific error message', () => {
      render(
        <DashboardErrorBoundary userRole="admin">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/system administrators have been notified/i)).toBeInTheDocument();
    });

    it('should show staff-specific error message', () => {
      render(
        <DashboardErrorBoundary userRole="staff">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/staff dashboard/i)).toBeInTheDocument();
    });

    it('should show owner-specific error message', () => {
      render(
        <DashboardErrorBoundary userRole="owner">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/host dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/property data is safe/i)).toBeInTheDocument();
    });

    it('should show guest-specific error message', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Role-Based Navigation', () => {
    it('should show admin dashboard link for admin', () => {
      render(
        <DashboardErrorBoundary userRole="admin">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      const dashboardLink = screen.getByRole('link', { name: /return to dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard');
    });

    it('should show admin dashboard link for staff', () => {
      render(
        <DashboardErrorBoundary userRole="staff">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      const dashboardLink = screen.getByRole('link', { name: /return to dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard');
    });

    it('should show host dashboard link for owner', () => {
      render(
        <DashboardErrorBoundary userRole="owner">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      const dashboardLink = screen.getByRole('link', { name: /return to dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/host/dashboard');
    });

    it('should show default dashboard link for guest', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      const dashboardLink = screen.getByRole('link', { name: /return to dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Recovery Actions', () => {
    it('should show Try Again button', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should show Reset Error State button', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /reset error state/i })).toBeInTheDocument();
    });

    it('should show Go Home link', () => {
      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      process.env.NODE_ENV = 'development';

      render(
        <DashboardErrorBoundary userRole="guest">
          <ThrowError shouldThrow={true} message="Dev dashboard error" />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/error details/i)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log dashboard errors with user role', () => {
      render(
        <DashboardErrorBoundary userRole="admin">
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom dashboard error</div>;

      render(
        <DashboardErrorBoundary userRole="guest" fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText('Custom dashboard error')).toBeInTheDocument();
    });
  });
});
