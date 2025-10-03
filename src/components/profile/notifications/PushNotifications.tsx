'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, AlertCircle, Smartphone, Chrome } from 'lucide-react';

interface PushNotificationSettings {
  newMessages: boolean;
  bookingUpdates: boolean;
  priceAlerts: boolean;
  appNotifications: boolean;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface PushNotificationsProps {
  userId?: string;
  categories?: NotificationCategory[];
  userRole?: string;
}

export function PushNotifications(props?: PushNotificationsProps) {
  const [settings, setSettings] = useState<PushNotificationSettings>({
    newMessages: true,
    bookingUpdates: true,
    priceAlerts: false,
    appNotifications: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');

  const handleToggle = (key: keyof PushNotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
      } catch (error) {
        setPermissionStatus('denied');
      }
    }
  };

  const notificationOptions = [
    {
      key: 'newMessages' as keyof PushNotificationSettings,
      label: 'New Messages',
      description: 'Instant notifications when you receive new messages',
    },
    {
      key: 'bookingUpdates' as keyof PushNotificationSettings,
      label: 'Booking Updates',
      description: 'Real-time updates about your bookings and reservations',
    },
    {
      key: 'priceAlerts' as keyof PushNotificationSettings,
      label: 'Price Alerts',
      description: 'Notifications when prices drop for your saved properties',
    },
    {
      key: 'appNotifications' as keyof PushNotificationSettings,
      label: 'App Notifications',
      description: 'General notifications from the RentEasy application',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-600" />
          <CardTitle>Push Notifications</CardTitle>
        </div>
        <CardDescription>
          Enable browser and device push notifications for instant updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionStatus !== 'granted' && (
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">
                  Enable Browser Notifications
                </p>
                <p className="text-sm text-purple-700 mt-1 mb-3">
                  Allow RentEasy to send you push notifications to stay updated on your bookings and messages.
                </p>
                <Button
                  onClick={requestPermission}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              </div>
            </div>
          </div>
        )}

        {permissionStatus === 'granted' && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Chrome className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Browser</p>
                    <p className="text-sm text-gray-600">Chrome on Windows</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <Label
                  htmlFor={option.key}
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {option.label}
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
              <Switch
                id={option.key}
                checked={settings[option.key]}
                onCheckedChange={() => handleToggle(option.key)}
                disabled={permissionStatus !== 'granted'}
                aria-label={option.label}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || permissionStatus !== 'granted'}
            className="min-w-[120px]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Settings saved</span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Failed to save</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
