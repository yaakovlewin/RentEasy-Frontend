/**
 * @fileoverview Notification Button Component
 *
 * CLIENT COMPONENT for displaying notifications with badge count.
 */

'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationButtonProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationButton({ count = 0, onClick }: NotificationButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      aria-label="Notifications"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
