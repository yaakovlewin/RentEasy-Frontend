'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useNotifications, Notification, NotificationType } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

// Icon mapping for different notification types
const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

// Color schemes for different notification types
const NOTIFICATION_STYLES: Record<NotificationType, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

// Icon colors for different notification types
const ICON_COLORS: Record<NotificationType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const IconComponent = NOTIFICATION_ICONS[notification.type];
  
  const handleDismiss = () => {
    onDismiss(notification.id);
  };

  const handleActionClick = () => {
    if (notification.action?.onClick) {
      notification.action.onClick();
      // Auto-dismiss after action unless persistent
      if (!notification.persistent) {
        handleDismiss();
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative flex items-start p-4 rounded-lg border shadow-lg max-w-sm w-full',
        'backdrop-blur-sm transition-all duration-200',
        NOTIFICATION_STYLES[notification.type]
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-3">
        <IconComponent 
          className={cn('w-5 h-5', ICON_COLORS[notification.type])} 
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="text-sm font-medium leading-5">
          {notification.title}
        </div>
        
        {/* Message */}
        {notification.message && (
          <div className="mt-1 text-sm opacity-90 leading-4">
            {notification.message}
          </div>
        )}

        {/* Action Button */}
        {notification.action && (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleActionClick}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-md transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                notification.type === 'success' && 'bg-green-100 hover:bg-green-200 text-green-700 focus:ring-green-500',
                notification.type === 'error' && 'bg-red-100 hover:bg-red-200 text-red-700 focus:ring-red-500',
                notification.type === 'warning' && 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 focus:ring-yellow-500',
                notification.type === 'info' && 'bg-blue-100 hover:bg-blue-200 text-blue-700 focus:ring-blue-500'
              )}
            >
              {notification.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {notification.dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 ml-3 p-1 rounded-md transition-colors',
            'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1',
            notification.type === 'success' && 'focus:ring-green-500',
            notification.type === 'error' && 'focus:ring-red-500',
            notification.type === 'warning' && 'focus:ring-yellow-500',
            notification.type === 'info' && 'focus:ring-blue-500'
          )}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      )}

      {/* Progress bar for timed notifications */}
      {!notification.persistent && notification.duration && notification.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 rounded-b-lg overflow-hidden"
        >
          <motion.div
            className={cn(
              'h-full',
              notification.type === 'success' && 'bg-green-400',
              notification.type === 'error' && 'bg-red-400',
              notification.type === 'warning' && 'bg-yellow-400',
              notification.type === 'info' && 'bg-blue-400'
            )}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ 
              duration: notification.duration / 1000, 
              ease: 'linear' 
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export function NotificationContainer({ 
  position = 'top-right',
  className 
}: NotificationContainerProps) {
  const { notifications, removeNotification } = useNotifications();

  // Position-based styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
      default:
        return 'fixed top-4 right-4 z-50';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn(getPositionStyles(), className)}>
      <div className="flex flex-col space-y-3 max-w-sm">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NotificationContainer;