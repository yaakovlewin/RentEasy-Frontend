'use client';

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  Heart,
  Info,
  Mail,
  MessageSquare,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

// Notification types
type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'message'
  | 'booking'
  | 'favorite'
  | 'review';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Notification item component
const notificationVariants = cva(
  'relative flex items-start gap-3 p-4 border-b border-gray-100 transition-all duration-200 hover:bg-gray-50',
  {
    variants: {
      read: {
        true: 'opacity-70',
        false: 'opacity-100',
      },
    },
    defaultVariants: {
      read: false,
    },
  }
);

interface NotificationItemProps extends VariantProps<typeof notificationVariants> {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (notification: Notification) => void;
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onAction,
  className,
}) => {
  const { id, type, title, message, timestamp, read, actionUrl, actionLabel } = notification;

  const typeConfig = {
    info: {
      icon: <Info className='w-5 h-5 text-blue-500' />,
      bgColor: 'bg-blue-100',
    },
    success: {
      icon: <Check className='w-5 h-5 text-green-500' />,
      bgColor: 'bg-green-100',
    },
    warning: {
      icon: <AlertTriangle className='w-5 h-5 text-yellow-500' />,
      bgColor: 'bg-yellow-100',
    },
    error: {
      icon: <AlertCircle className='w-5 h-5 text-red-500' />,
      bgColor: 'bg-red-100',
    },
    message: {
      icon: <MessageSquare className='w-5 h-5 text-purple-500' />,
      bgColor: 'bg-purple-100',
    },
    booking: {
      icon: <Calendar className='w-5 h-5 text-blue-500' />,
      bgColor: 'bg-blue-100',
    },
    favorite: {
      icon: <Heart className='w-5 h-5 text-red-500' />,
      bgColor: 'bg-red-100',
    },
    review: {
      icon: <MessageSquare className='w-5 h-5 text-green-500' />,
      bgColor: 'bg-green-100',
    },
  };

  const config = typeConfig[type];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={cn(notificationVariants({ read }), className)}>
      {/* Unread indicator */}
      {!read && (
        <div className='absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full' />
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          config.bgColor
        )}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between mb-1'>
          <h4
            className={cn('font-medium text-sm truncate', read ? 'text-gray-600' : 'text-gray-900')}
          >
            {title}
          </h4>

          <div className='flex items-center gap-1 ml-2'>
            <span className='text-xs text-gray-500 whitespace-nowrap'>
              {formatTimeAgo(timestamp)}
            </span>

            {onDelete && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all'
                aria-label='Delete notification'
              >
                <X className='w-3 h-3' />
              </button>
            )}
          </div>
        </div>

        <p className={cn('text-sm leading-relaxed mb-2', read ? 'text-gray-500' : 'text-gray-700')}>
          {message}
        </p>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          {!read && onMarkRead && (
            <button
              onClick={() => onMarkRead(id)}
              className='text-xs text-primary hover:text-primary/80 font-medium'
            >
              Mark as read
            </button>
          )}

          {actionUrl && actionLabel && (
            <button
              onClick={() => onAction?.(notification)}
              className='text-xs text-primary hover:text-primary/80 font-medium'
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification dropdown/panel
interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  onAction?: (notification: Notification) => void;
  maxHeight?: number;
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
  onAction,
  maxHeight = 400,
  className,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Bell className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='font-medium text-gray-900 mb-2'>No notifications</h3>
        <p className='text-sm text-gray-500'>
          You're all caught up! We'll notify you of any updates.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className='p-4 border-b border-gray-100 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-gray-900'>
            Notifications
            {unreadCount > 0 && (
              <span className='ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full'>
                {unreadCount}
              </span>
            )}
          </h3>

          <div className='flex items-center gap-2'>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className='text-sm text-primary hover:text-primary/80 font-medium'
              >
                Mark all read
              </button>
            )}

            {onClearAll && (
              <button onClick={onClearAll} className='text-sm text-gray-500 hover:text-gray-700'>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className='overflow-y-auto' style={{ maxHeight: `${maxHeight}px` }}>
        <div className='group'>
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
              onAction={onAction}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Notification bell icon with badge
interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  showBadge?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onClick,
  className,
  showBadge = true,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus-smooth',
        className
      )}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell className='w-5 h-5 text-gray-600' />

      {showBadge && count > 0 && (
        <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium'>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// Notification hook for managing state
export const useNotifications = (initialNotifications: Notification[] = []) => {
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications);

  const addNotification = React.useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev]);
      return newNotification.id;
    },
    []
  );

  const markAsRead = React.useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = React.useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};

// Toast-style notification component
interface ToastNotificationProps {
  notification: Notification;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  autoClose = true,
  duration = 5000,
  className,
}) => {
  const { type, title, message } = notification;

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const typeConfig = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    message: 'bg-purple-50 border-purple-200 text-purple-900',
    booking: 'bg-blue-50 border-blue-200 text-blue-900',
    favorite: 'bg-red-50 border-red-200 text-red-900',
    review: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm max-w-md animate-slide-in-right',
        typeConfig[type],
        className
      )}
    >
      <div className='flex-1'>
        <h4 className='font-medium text-sm mb-1'>{title}</h4>
        <p className='text-sm opacity-90 leading-relaxed'>{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className='p-1 rounded-lg hover:bg-black/5 transition-colors'
          aria-label='Close notification'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
};

export type { Notification, NotificationType };
