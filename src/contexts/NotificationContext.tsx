'use client';

import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react';

// Notification types for different use cases
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Notification object structure
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 = never auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  persistent?: boolean; // prevents auto-dismiss
  metadata?: Record<string, any>; // for analytics or debugging
  timestamp: number;
}

// Notification state management
interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  defaultDuration: number;
}

// Action types for reducer
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'CLEAR_TYPE'; payload: NotificationType };

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  clearType: (type: NotificationType) => void;
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string;
  showError: (title: string, message?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string;
}

// Default configuration
const DEFAULT_DURATION = 5000; // 5 seconds
const MAX_NOTIFICATIONS = 5;

// Initial state
const initialState: NotificationState = {
  notifications: [],
  maxNotifications: MAX_NOTIFICATIONS,
  defaultDuration: DEFAULT_DURATION,
};

// Reducer for notification state management
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotifications = [action.payload, ...state.notifications];
      
      // Limit number of notifications and remove oldest if exceeding limit
      if (newNotifications.length > state.maxNotifications) {
        return {
          ...state,
          notifications: newNotifications.slice(0, state.maxNotifications),
        };
      }
      
      return {
        ...state,
        notifications: newNotifications,
      };
    }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
      };
      
    case 'CLEAR_TYPE':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.type !== action.payload),
      };
      
    default:
      return state;
  }
}

// Context creation
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add notification with deduplication
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    // Check for duplicate notifications (same title and type within 1 second)
    const now = Date.now();
    const isDuplicate = state.notifications.some(n => 
      n.title === notification.title && 
      n.type === notification.type &&
      now - n.timestamp < 1000
    );

    if (isDuplicate) {
      // Return existing notification ID instead of creating duplicate
      const existing = state.notifications.find(n => 
        n.title === notification.title && n.type === notification.type
      );
      return existing?.id || '';
    }

    const id = generateId();
    const newNotification: Notification = {
      id,
      duration: state.defaultDuration,
      dismissible: true,
      persistent: false,
      ...notification,
      timestamp: now,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    return id;
  }, [generateId, state.notifications, state.defaultDuration]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Clear notifications of specific type
  const clearType = useCallback((type: NotificationType) => {
    dispatch({ type: 'CLEAR_TYPE', payload: type });
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      persistent: true, // Errors should be manually dismissed
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000, // Medium duration for warnings
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  // Auto-dismiss notifications based on duration
  useEffect(() => {
    const timers = new Map<string, NodeJS.Timeout>();

    state.notifications.forEach(notification => {
      // Skip if persistent, no duration, or already has timer
      if (notification.persistent || !notification.duration || timers.has(notification.id)) {
        return;
      }

      // Calculate remaining time for auto-dismiss
      const elapsed = Date.now() - notification.timestamp;
      const remaining = notification.duration - elapsed;

      if (remaining <= 0) {
        // Should have been dismissed already
        removeNotification(notification.id);
      } else {
        // Set timer for auto-dismiss
        const timer = setTimeout(() => {
          removeNotification(notification.id);
          timers.delete(notification.id);
        }, remaining);
        
        timers.set(notification.id, timer);
      }
    });

    // Cleanup function
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, [state.notifications, removeNotification]);

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
    clearType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience hooks for specific notification types
export function useNotificationActions() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  return {
    notifySuccess: showSuccess,
    notifyError: showError,
    notifyWarning: showWarning,
    notifyInfo: showInfo,
  };
}

// Hook for handling API errors
export function useApiNotifications() {
  const { showError, showSuccess } = useNotifications();
  
  const handleApiError = useCallback((error: any, customMessage?: string) => {
    const title = customMessage || 'Request Failed';
    const message = error?.message || 'An unexpected error occurred. Please try again.';
    
    return showError(title, message, {
      metadata: {
        error: error?.toString(),
        timestamp: new Date().toISOString(),
        stack: error?.stack,
      },
    });
  }, [showError]);

  const handleApiSuccess = useCallback((message: string, details?: string) => {
    return showSuccess(message, details);
  }, [showSuccess]);

  return {
    handleApiError,
    handleApiSuccess,
  };
}

export default NotificationContext;