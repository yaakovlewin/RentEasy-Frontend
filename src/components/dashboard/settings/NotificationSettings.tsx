/**
 * NotificationSettings Component
 *
 * Manages all notification preferences including email, push, SMS,
 * marketing, booking updates, security alerts, and weekly digest settings.
 */

import React, { memo, useMemo } from 'react';
import {
  Bell,
  Mail,
  Phone,
  Shield,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Types
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  bookingUpdates: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: Partial<NotificationSettings>) => void;
  loading?: boolean;
}

export const NotificationSettings = memo<NotificationSettingsProps>(({
  settings,
  onUpdate,
  loading = false
}) => {
  const notificationOptions = useMemo(() => [
    {
      id: 'emailNotifications',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Booking confirmations, cancellations, and important updates',
      enabled: settings.emailNotifications,
      recommended: true
    },
    {
      id: 'pushNotifications',
      icon: Bell,
      title: 'Push Notifications',
      description: 'Real-time alerts on your mobile device',
      enabled: settings.pushNotifications,
      recommended: true
    },
    {
      id: 'smsNotifications',
      icon: Phone,
      title: 'SMS Notifications',
      description: 'Urgent booking updates via text message',
      enabled: settings.smsNotifications,
      recommended: false
    },
    {
      id: 'bookingUpdates',
      icon: Bell,
      title: 'Booking Updates',
      description: 'Status changes, check-in reminders, and host messages',
      enabled: settings.bookingUpdates,
      recommended: true
    },
    {
      id: 'securityAlerts',
      icon: Shield,
      title: 'Security Alerts',
      description: 'Login attempts, password changes, and suspicious activity',
      enabled: settings.securityAlerts,
      recommended: true
    },
    {
      id: 'marketingEmails',
      icon: MessageSquare,
      title: 'Marketing Emails',
      description: 'Special offers, promotions, and travel inspiration',
      enabled: settings.marketingEmails,
      recommended: false
    },
    {
      id: 'weeklyDigest',
      icon: Mail,
      title: 'Weekly Digest',
      description: 'Summary of your activity, new recommendations, and updates',
      enabled: settings.weeklyDigest,
      recommended: false
    }
  ], [settings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationOptions.map(({ id, icon: Icon, title, description, enabled, recommended }) => (
          <div key={id} className="flex items-center justify-between py-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{title}</p>
                  {recommended && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Recommended
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-6">{description}</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => onUpdate({ [id]: checked })}
              disabled={loading}
              aria-label={`Toggle ${title}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

NotificationSettings.displayName = 'NotificationSettings';

export default NotificationSettings;
