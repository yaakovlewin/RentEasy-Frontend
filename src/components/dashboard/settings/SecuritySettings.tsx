/**
 * SecuritySettings Component
 *
 * Manages security settings including password changes, two-factor authentication,
 * and login activity monitoring.
 */

import React, { memo, useState, useMemo, useCallback } from 'react';
import {
  Shield,
  Key,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Types
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  deviceTracking: boolean;
}

export type AccountAction =
  | 'change-password'
  | 'enable-2fa'
  | 'disable-2fa'
  | 'view-sessions'
  | 'deactivate-account'
  | 'delete-account';

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onAccountAction: (action: AccountAction, data?: any) => Promise<void>;
  loading?: boolean;
}

export const SecuritySettings = memo<SecuritySettingsProps>(({
  settings,
  onAccountAction,
  loading = false
}) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);

  const securityItems = useMemo(() => [
    {
      id: 'password',
      icon: Key,
      title: 'Password',
      description: 'Last updated 3 months ago',
      action: 'change-password' as AccountAction,
      actionLabel: 'Change Password',
      status: 'success',
      loading: isChangingPassword
    },
    {
      id: '2fa',
      icon: Smartphone,
      title: 'Two-Factor Authentication',
      description: settings.twoFactorEnabled
        ? 'Extra security is enabled for your account'
        : 'Not enabled - Add extra security to your account',
      action: settings.twoFactorEnabled ? 'disable-2fa' as AccountAction : 'enable-2fa' as AccountAction,
      actionLabel: settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA',
      status: settings.twoFactorEnabled ? 'success' : 'warning',
      loading: isEnabling2FA
    },
    {
      id: 'sessions',
      icon: Monitor,
      title: 'Login Activity',
      description: 'View and manage your recent login sessions',
      action: 'view-sessions' as AccountAction,
      actionLabel: 'View Activity',
      status: 'neutral',
      loading: false
    }
  ], [settings.twoFactorEnabled, isChangingPassword, isEnabling2FA]);

  const handleSecurityAction = useCallback(async (action: AccountAction) => {
    switch (action) {
      case 'change-password':
        setIsChangingPassword(true);
        break;
      case 'enable-2fa':
      case 'disable-2fa':
        setIsEnabling2FA(true);
        break;
    }

    try {
      await onAccountAction(action);
    } finally {
      setIsChangingPassword(false);
      setIsEnabling2FA(false);
    }
  }, [onAccountAction]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'error': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIconColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {securityItems.map(({ id, icon: Icon, title, description, action, actionLabel, status, loading: itemLoading }) => (
          <div key={id} className={`flex items-center justify-between p-4 rounded-lg ${getStatusColor(status)}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                <Icon className={`w-5 h-5 ${getStatusIconColor(status)}`} />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleSecurityAction(action)}
              disabled={loading || itemLoading}
            >
              {itemLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {actionLabel}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

SecuritySettings.displayName = 'SecuritySettings';

export default SecuritySettings;
