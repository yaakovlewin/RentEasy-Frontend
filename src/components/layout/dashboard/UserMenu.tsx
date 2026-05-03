/**
 * @fileoverview User Menu Component
 *
 * CLIENT COMPONENT for user account dropdown menu with profile and logout actions.
 * Includes accessibility features and keyboard navigation support.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, LogOut, Home, ChevronDown, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clearAuthTokenCookies } from '@/lib/utils';
import { JWTPayload } from '@/types/auth';

interface UserMenuProps {
  user: JWTPayload;
}

interface MenuItem {
  type: 'link' | 'button';
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

interface UserInfoProps {
  displayName: string;
  email: string;
  role: 'guest' | 'owner' | 'staff' | 'admin';
}

const UserInfo = ({ displayName, email, role }: UserInfoProps) => (
  <div className="px-4 py-3 border-b border-gray-200">
    <p className="text-sm font-medium text-gray-900">{displayName}</p>
    <p className="text-xs text-gray-500">{email}</p>
    <Badge variant="outline" className="mt-1 text-xs">
      {role}
    </Badge>
  </div>
);

interface DropdownMenuItemProps {
  item: MenuItem;
  onClose: () => void;
}

const DropdownMenuItem = ({ item, onClose }: DropdownMenuItemProps) => {
  const baseClassName = 'flex items-center px-4 py-2 text-sm transition-colors';
  const variantClassName =
    item.variant === 'danger'
      ? 'text-red-600 hover:bg-red-50'
      : 'text-gray-700 hover:bg-gray-50';

  const Icon = item.icon;

  if (item.type === 'link' && item.href) {
    return (
      <Link
        href={item.href}
        className={`${baseClassName} ${variantClassName}`}
        onClick={onClose}
      >
        <Icon className="mr-3 h-4 w-4" />
        {item.label}
      </Link>
    );
  }

  if (item.type === 'button' && item.onClick) {
    return (
      <button
        onClick={() => {
          item.onClick?.();
          onClose();
        }}
        className={`w-full ${baseClassName} ${variantClassName}`}
      >
        <Icon className="mr-3 h-4 w-4" />
        {item.label}
      </button>
    );
  }

  return null;
};

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user.email.split('@')[0];

  const handleLogout = useCallback(async () => {
    try {
      clearAuthTokenCookies();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/login';
    }
  }, []);

  const menuItems: MenuItem[] = [
    { type: 'link', label: 'Home', icon: Home, href: '/' },
    { type: 'link', label: 'Profile', icon: User, href: '/profile' },
    {
      type: 'button',
      label: 'Sign Out',
      icon: LogOut,
      onClick: handleLogout,
      variant: 'danger',
    },
  ];

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        className="flex items-center space-x-2 pl-2 pr-3"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {displayName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <UserInfo
            displayName={displayName}
            email={user.email}
            role={user.role}
          />

          <div className="py-1">
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                item={item}
                onClose={closeMenu}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
