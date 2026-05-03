'use client';

import { Mail } from 'lucide-react';
import { NotificationSettingsCard, NotificationToggle } from './NotificationSettingsCard';

interface EmailNotificationSettings {
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  propertyUpdates: boolean;
  accountActivity: boolean;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface EmailNotificationsProps {
  userEmail?: string;
  userId?: string;
  categories?: NotificationCategory[];
  userRole?: string;
}

const emailToggleConfig: NotificationToggle[] = [
  {
    id: 'bookingConfirmations',
    label: 'Booking Confirmations',
    description: 'Receive confirmation emails when bookings are made or updated',
    defaultValue: true,
  },
  {
    id: 'bookingReminders',
    label: 'Booking Reminders',
    description: 'Get reminders before check-in and check-out dates',
    defaultValue: true,
  },
  {
    id: 'propertyUpdates',
    label: 'Property Updates',
    description: 'Notifications about property availability and pricing changes',
    defaultValue: true,
  },
  {
    id: 'accountActivity',
    label: 'Account Activity',
    description: 'Security alerts and important account updates',
    defaultValue: false,
  },
];

export function EmailNotifications({ userEmail = 'user@example.com' }: EmailNotificationsProps) {
  const handleSave = async (settings: EmailNotificationSettings) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <NotificationSettingsCard<EmailNotificationSettings>
      title="Email Notifications"
      description="Manage your email notification preferences for booking updates and account activity"
      icon={Mail}
      iconColor="text-blue-600"
      toggles={emailToggleConfig}
      onSave={handleSave}
      customContent={
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}
