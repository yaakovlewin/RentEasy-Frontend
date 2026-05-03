/**
 * @fileoverview Search Bar Component
 *
 * CLIENT COMPONENT for dashboard search functionality with role-based placeholders.
 */

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface SearchBarProps {
  userRole: UserRole;
  className?: string;
  isMobile?: boolean;
}

const getSearchPlaceholder = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Search system...';
    case 'staff':
      return 'Search properties...';
    default:
      return 'Search bookings...';
  }
};

export function SearchBar({ userRole, className = '', isMobile = false }: SearchBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
          isSearchFocused ? 'text-blue-500' : 'text-gray-400'
        } transition-colors`}
      />
      <input
        type="text"
        placeholder={isMobile ? 'Search...' : getSearchPlaceholder(userRole)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />
    </div>
  );
}
