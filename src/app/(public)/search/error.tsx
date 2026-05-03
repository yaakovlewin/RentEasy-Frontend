'use client';

import { Search } from 'lucide-react';
import BaseErrorPage from '@/components/errors/BaseErrorPage';

/**
 * Search Route Error Page
 *
 * Specialized error page for search-related errors.
 * Provides contextual recovery options for property search functionality.
 */
interface SearchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SearchError({ error, reset }: SearchErrorProps) {
  return (
    <BaseErrorPage
      error={error}
      reset={reset}
      variant="search"
      Icon={Search}
      suggestions={[
        'Try refreshing the page to reload the search',
        'Simplify your search filters',
        'Check your location and date settings',
        'Try a broader search area',
        'Clear all filters and start over',
      ]}
      quickLinks={[
        { href: '/search?location=beachfront', label: '🏖️ Beachfront Homes' },
        { href: '/search?location=mountain&guests=4', label: '⛰️ Mountain Cabins' },
        { href: '/search?location=city&type=apartment', label: '🌆 City Apartments' },
        { href: '/search?available=weekend', label: '🗓️ Weekend Getaways' },
      ]}
    />
  );
}