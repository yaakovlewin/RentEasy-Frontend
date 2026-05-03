'use client';

import React, { createContext, useContext, useCallback, useReducer, useEffect, useMemo } from 'react';
import { createReducer, update, appendToArray, removeFromArrayWhere, deepFreeze } from '@/lib/state';

/**
 * Functional Programming Migration - NotificationContext
 *
 * WEEK 2 - TASK B3: Migrate NotificationContext to FP
 *
 * Enhancements:
 * - Immutable state with Object.freeze
 * - createReducer from Week 1
 * - Notification history (last 50)
 * - Deduplication (prevent duplicate messages within 1s)
 * - Undo dismiss capability
 * - Configurable settings
 * - Memoized context value
 * - Selector hooks
 *
 * Team B - Dev 1 (lead), Dev 4 (types), Dev 5 (compatibility)
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message?: string;
  readonly duration?: number;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
  readonly dismissible?: boolean;
  readonly persistent?: boolean;
  readonly metadata?: Readonly<Record<string, any>>;
  readonly timestamp: number;
  readonly dismissed: boolean;
}

type NotificationState = {
  readonly notifications: readonly Notification[];
  readonly maxNotifications: number;
  readonly defaultDuration: number;
  readonly history: readonly Notification[];
};

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'dismissed'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'UNDO_DISMISS'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'CLEAR_TYPE'; payload: NotificationType }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Pick<NotificationState, 'maxNotifications' | 'defaultDuration'>> };

interface NotificationContextType {
  notifications: readonly Notification[];
  history: readonly Notification[];
  settings: {
    readonly maxNotifications: number;
    readonly defaultDuration: number;
  };
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'dismissed'>) => string;
  removeNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  undoDismiss: (id: string) => void;
  clearAll: () => void;
  clearType: (type: NotificationType) => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<Pick<NotificationState, 'maxNotifications' | 'defaultDuration'>>) => void;
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string;
  showError: (title: string, message?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string;
}

const DEFAULT_DURATION = 5000;
const MAX_NOTIFICATIONS = 5;
const MAX_HISTORY = 50;

const initialState: NotificationState = deepFreeze({
  notifications: [],
  maxNotifications: MAX_NOTIFICATIONS,
  defaultDuration: DEFAULT_DURATION,
  history: [],
});

const generateId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const isDuplicateNotification = (
  notifications: readonly Notification[],
  title: string,
  type: NotificationType,
  timestamp: number
): boolean => {
  return notifications.some(
    n => n.title === title && n.type === type && timestamp - n.timestamp < 1000
  );
};

const moveToHistory = (
  history: readonly Notification[],
  notification: Notification
): readonly Notification[] => {
  const updatedHistory = appendToArray(history, notification);
  if (updatedHistory.length > MAX_HISTORY) {
    return updatedHistory.slice(-MAX_HISTORY);
  }
  return updatedHistory;
};

const notificationReducer = createReducer<NotificationState, NotificationAction>(
  initialState,
  {
    ADD_NOTIFICATION: (state, action) => {
      const timestamp = Date.now();

      if (isDuplicateNotification(state.notifications, action.payload.title, action.payload.type, timestamp)) {
        return state;
      }

      const id = generateId();
      const newNotification: Notification = deepFreeze({
        id,
        duration: state.defaultDuration,
        dismissible: true,
        persistent: false,
        dismissed: false,
        ...action.payload,
        timestamp,
      });

      const newNotifications = appendToArray(state.notifications, newNotification);
      const limitedNotifications = newNotifications.length > state.maxNotifications
        ? newNotifications.slice(-state.maxNotifications)
        : newNotifications;

      return update(state, { notifications: limitedNotifications });
    },

    REMOVE_NOTIFICATION: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (!notification) return state;

      const newNotifications = removeFromArrayWhere(
        state.notifications,
        n => n.id === action.payload
      );
      const newHistory = moveToHistory(state.history, notification);

      return update(state, {
        notifications: newNotifications,
        history: newHistory,
      });
    },

    DISMISS_NOTIFICATION: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (!notification) return state;

      const dismissedNotification = deepFreeze({
        ...notification,
        dismissed: true,
      });

      const newNotifications = state.notifications.map(n =>
        n.id === action.payload ? dismissedNotification : n
      );
      const newHistory = moveToHistory(state.history, dismissedNotification);

      return update(state, {
        notifications: deepFreeze(newNotifications),
        history: newHistory,
      });
    },

    UNDO_DISMISS: (state, action) => {
      const historyNotification = state.history.find(n => n.id === action.payload);
      if (!historyNotification || !historyNotification.dismissed) return state;

      const restoredNotification = deepFreeze({
        ...historyNotification,
        dismissed: false,
        timestamp: Date.now(),
      });

      const newNotifications = appendToArray(state.notifications, restoredNotification);
      const newHistory = removeFromArrayWhere(state.history, n => n.id === action.payload);

      return update(state, {
        notifications: newNotifications,
        history: newHistory,
      });
    },

    CLEAR_ALL: (state) => {
      const newHistory = [...state.history, ...state.notifications].slice(-MAX_HISTORY);
      return update(state, {
        notifications: deepFreeze([]),
        history: deepFreeze(newHistory),
      });
    },

    CLEAR_TYPE: (state, action) => {
      const clearedNotifications = state.notifications.filter(n => n.type === action.payload);
      const newNotifications = removeFromArrayWhere(
        state.notifications,
        n => n.type === action.payload
      );
      const newHistory = [...state.history, ...clearedNotifications].slice(-MAX_HISTORY);

      return update(state, {
        notifications: newNotifications,
        history: deepFreeze(newHistory),
      });
    },

    CLEAR_HISTORY: (state) => {
      return update(state, { history: deepFreeze([]) });
    },

    UPDATE_SETTINGS: (state, action) => {
      return update(state, action.payload);
    },
  }
);

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'dismissed'>) => {
    const id = generateId();
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  }, []);

  const undoDismiss = useCallback((id: string) => {
    dispatch({ type: 'UNDO_DISMISS', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const clearType = useCallback((type: NotificationType) => {
    dispatch({ type: 'CLEAR_TYPE', payload: type });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const updateSettings = useCallback((settings: Partial<Pick<NotificationState, 'maxNotifications' | 'defaultDuration'>>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

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
      duration: 8000,
      persistent: true,
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
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

  useEffect(() => {
    const timers = new Map<string, NodeJS.Timeout>();

    state.notifications.forEach(notification => {
      if (notification.persistent || !notification.duration || timers.has(notification.id) || notification.dismissed) {
        return;
      }

      const elapsed = Date.now() - notification.timestamp;
      const remaining = notification.duration - elapsed;

      if (remaining <= 0) {
        removeNotification(notification.id);
      } else {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
          timers.delete(notification.id);
        }, remaining);

        timers.set(notification.id, timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, [state.notifications, removeNotification]);

  const contextValue: NotificationContextType = useMemo(() => ({
    notifications: state.notifications,
    history: state.history,
    settings: {
      maxNotifications: state.maxNotifications,
      defaultDuration: state.defaultDuration,
    },
    addNotification,
    removeNotification,
    dismissNotification,
    undoDismiss,
    clearAll,
    clearType,
    clearHistory,
    updateSettings,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [
    state.notifications,
    state.history,
    state.maxNotifications,
    state.defaultDuration,
    addNotification,
    removeNotification,
    dismissNotification,
    undoDismiss,
    clearAll,
    clearType,
    clearHistory,
    updateSettings,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function useNotificationList() {
  const { notifications } = useNotifications();
  return notifications;
}

export function useNotificationHistory() {
  const { history } = useNotifications();
  return history;
}

export function useNotificationSettings() {
  const { settings, updateSettings } = useNotifications();
  return { settings, updateSettings };
}

export function useNotificationActions() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  return {
    notifySuccess: showSuccess,
    notifyError: showError,
    notifyWarning: showWarning,
    notifyInfo: showInfo,
  };
}

export function useApiNotifications() {
  const { showError, showSuccess } = useNotifications();

  const handleApiError = useCallback((error: any, customMessage?: string) => {
    const title = customMessage || 'Request Failed';
    const message = error?.message || 'An unexpected error occurred. Please try again.';

    return showError(title, message, {
      metadata: deepFreeze({
        error: error?.toString(),
        timestamp: new Date().toISOString(),
        stack: error?.stack,
      }),
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
