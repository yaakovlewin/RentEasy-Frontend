'use client';

import { Settings } from 'lucide-react';
import BaseErrorPage from '@/components/errors/BaseErrorPage';

/**
 * Dashboard Route Error Page
 *
 * Specialized error page for dashboard-related errors.
 * Provides contextual recovery options for dashboard functionality.
 */
interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <BaseErrorPage
      error={error}
      reset={reset}
      variant="dashboard"
      Icon={Settings}
      suggestions={[
        'Try refreshing the page',
        'Check your internet connection',
        'Clear your browser cache',
        'Try logging out and back in',
      ]}
      quickLinks={[
        { href: '/search', label: 'Search Properties' },
        { href: '/host', label: 'Host Center' },
      ]}
    />
  );
}