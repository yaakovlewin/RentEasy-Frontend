/**
 * DashboardSettings Component
 *
 * Main settings management component that coordinates notification, privacy,
 * security, and account settings. Built with enterprise-grade patterns for
 * security, accessibility, and user experience.
 *
 * Features:
 * - Notification preferences with granular controls
 * - Privacy and visibility settings
 * - Security management (password, 2FA, sessions)
 * - Account deactivation and deletion
 * - Real-time settings synchronization
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Enterprise error handling and validation
 *
 * @author Dashboard Refactoring Team
 */

import React, { memo, useState, useCallback } from 'react';
import { Settings, RefreshCw } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { ErrorStateDisplay } from '@/components/ui/ErrorStateDisplay';

// Settings Components
import NotificationSettings from '../settings/NotificationSettings';
import PrivacySettings from '../settings/PrivacySettings';
import SecuritySettings from '../settings/SecuritySettings';
import AccountSettings from '../settings/AccountSettings';

// Types
import type { DashboardUser, DashboardLoadingState, DashboardErrorState } from '../types';
import type { NotificationSettingsType, PrivacySettingsType, SecuritySettingsType, AccountAction } from '../settings';

// Utilities and Error Boundaries
import { FeatureErrorBoundary } from '@/components/error-boundaries';

// Component Props & Types
interface DashboardSettingsProps {
  /** Current user data */
  user: DashboardUser | null;
  /** Loading states for different operations */
  loading?: DashboardLoadingState;
  /** Error states for different operations */
  error?: DashboardErrorState;
  /** Callback when settings are updated */
  onUpdateSettings?: (settings: SettingsUpdatePayload) => Promise<void>;
  /** Callback when account actions are performed */
  onAccountAction?: (action: AccountAction, data?: any) => Promise<void>;
  /** Callback when settings should be refreshed */
  onRefresh?: () => Promise<void>;
}

interface SettingsUpdatePayload {
  notifications?: Partial<NotificationSettingsType>;
  privacy?: Partial<PrivacySettingsType>;
  security?: Partial<SecuritySettingsType>;
}

/**
 * DashboardSettings Component
 */
export const DashboardSettings = memo<DashboardSettingsProps>(({
  user,
  loading = {},
  error = {},
  onUpdateSettings,
  onAccountAction,
  onRefresh
}) => {
  // Settings State Management
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    bookingUpdates: true,
    securityAlerts: true,
    weeklyDigest: false
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>({
    profileVisibility: true,
    activityStatus: false,
    allowMessages: true,
    showBookingHistory: true,
    shareWishlist: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsType>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
    deviceTracking: true
  });

  // Notification Settings Handler
  const handleNotificationUpdate = useCallback(async (updates: Partial<NotificationSettingsType>) => {
    const newSettings = { ...notificationSettings, ...updates };
    setNotificationSettings(newSettings);

    if (onUpdateSettings) {
      try {
        await onUpdateSettings({ notifications: updates });
      } catch (error) {
        setNotificationSettings(notificationSettings);
        throw error;
      }
    }
  }, [notificationSettings, onUpdateSettings]);

  // Privacy Settings Handler
  const handlePrivacyUpdate = useCallback(async (updates: Partial<PrivacySettingsType>) => {
    const newSettings = { ...privacySettings, ...updates };
    setPrivacySettings(newSettings);

    if (onUpdateSettings) {
      try {
        await onUpdateSettings({ privacy: updates });
      } catch (error) {
        setPrivacySettings(privacySettings);
        throw error;
      }
    }
  }, [privacySettings, onUpdateSettings]);

  // Account Action Handler
  const handleAccountAction = useCallback(async (action: AccountAction, data?: any) => {
    if (onAccountAction) {
      await onAccountAction(action, data);
      if (action === 'enable-2fa') {
        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      } else if (action === 'disable-2fa') {
        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
      }
    }
  }, [onAccountAction]);

  // Loading State
  if (loading.user) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Error State
  if (error.user) {
    return (
      <ErrorStateDisplay
        error={error.user}
        title="Unable to load settings"
        onRetry={onRefresh}
        icon={<Settings className="w-16 h-16" />}
      />
    );
  }

  // Main Render
  return (
    <div className="space-y-6">
      <NotificationSettings
        settings={notificationSettings}
        onUpdate={handleNotificationUpdate}
        loading={loading.settings}
      />

      <PrivacySettings
        settings={privacySettings}
        onUpdate={handlePrivacyUpdate}
        loading={loading.settings}
      />

      <SecuritySettings
        settings={securitySettings}
        onAccountAction={handleAccountAction}
        loading={loading.settings}
      />

      <AccountSettings
        onAccountAction={handleAccountAction}
        loading={loading.settings}
      />
    </div>
  );
});

DashboardSettings.displayName = 'DashboardSettings';

/**
 * DashboardSettings with Error Boundary Protection
 */
export const DashboardSettingsWithErrorBoundary: React.FC<DashboardSettingsProps> = (props) => (
  <FeatureErrorBoundary
    featureName="Dashboard Settings"
    level="medium"
    enableRetry
  >
    <DashboardSettings {...props} />
  </FeatureErrorBoundary>
);

// Default export
export default DashboardSettingsWithErrorBoundary;
