'use client';

import BaseErrorPage from '@/components/errors/BaseErrorPage';

/**
 * Property Route Error Page
 *
 * Specialized error page for property-related errors.
 * Provides contextual recovery options for property functionality.
 */
interface PropertyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertyError({ error, reset }: PropertyErrorProps) {
  return (
    <BaseErrorPage
      error={error}
      reset={reset}
      variant="property"
      suggestions={[
        'Refresh the page to reload the property',
        'Check if the property URL is correct',
        'Search for similar properties',
        'Try again in a few minutes',
      ]}
      quickLinks={[
        { href: '/search?location=beachfront', label: '🏖️ Beachfront' },
        { href: '/search?location=mountain', label: '⛰️ Mountain' },
        { href: '/search?location=city', label: '🌆 City' },
      ]}
    />
  );
}