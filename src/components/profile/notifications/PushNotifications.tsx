'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationSettingsCard, NotificationToggle } from './NotificationSettingsCard';

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

const pushToggleConfig: NotificationToggle[] = [
  {
    id: 'newMessages',
    label: 'New Messages',
    description: 'Instant notifications when you receive new messages',
    defaultValue: true,
  },
  {
    id: 'bookingUpdates',
    label: 'Booking Updates',
    description: 'Real-time updates about your bookings and reservations',
    defaultValue: true,
  },
  {
    id: 'priceAlerts',
    label: 'Price Alerts',
    description: 'Notifications when prices drop for your saved properties',
    defaultValue: false,
  },
  {
    id: 'appNotifications',
    label: 'App Notifications',
    description: 'General notifications from the RentEasy application',
    defaultValue: true,
  },
];

export function PushNotifications(props?: PushNotificationsProps) {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');

  const handleSave = async (settings: PushNotificationSettings) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  const permissionGrantedSection = permissionStatus === 'granted' ? (
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
  ) : null;

  const enablePermissionSection = permissionStatus !== 'granted' ? [
    {
      type: 'info' as const,
      icon: Bell,
      title: 'Enable Browser Notifications',
      content: (
        <>
          <p className="text-sm text-purple-700 mb-3">
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
        </>
      ),
    },
  ] : [];

  return (
    <NotificationSettingsCard<PushNotificationSettings>
      title="Push Notifications"
      description="Enable browser and device push notifications for instant updates"
      icon={Bell}
      iconColor="text-purple-600"
      toggles={pushToggleConfig}
      onSave={handleSave}
      infoSections={enablePermissionSection}
      customContent={permissionGrantedSection}
      disableSave={permissionStatus !== 'granted'}
    />
  );
}
