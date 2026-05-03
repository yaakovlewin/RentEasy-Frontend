'use client';

import BaseErrorPage from '@/components/errors/BaseErrorPage';

/**
 * App-Level Error Page
 *
 * Handles errors that occur within the main application layout.
 * This catches errors in pages and components, but not in the root layout itself.
 *
 * Note: This must be a Client Component as it uses error and reset functions.
 */
interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return <BaseErrorPage error={error} reset={reset} variant="default" />;
}