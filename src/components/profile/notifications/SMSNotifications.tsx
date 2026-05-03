'use client';

import { MessageSquare, Info } from 'lucide-react';
import { NotificationSettingsCard, NotificationToggle } from './NotificationSettingsCard';

interface SMSNotificationSettings {
  urgentBookingAlerts: boolean;
  checkInReminders: boolean;
  hostMessages: boolean;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface SMSNotificationsProps {
  userPhone?: string;
  userId?: string;
  categories?: NotificationCategory[];
  userRole?: string;
}

const smsToggleConfig: NotificationToggle[] = [
  {
    id: 'urgentBookingAlerts',
    label: 'Urgent Booking Alerts',
    description: 'Critical notifications about booking changes or cancellations',
    defaultValue: true,
  },
  {
    id: 'checkInReminders',
    label: 'Check-in Reminders',
    description: 'SMS reminders before your scheduled check-in time',
    defaultValue: true,
  },
  {
    id: 'hostMessages',
    label: 'Host Messages',
    description: 'Text notifications when your host sends you a message',
    defaultValue: false,
  },
];

export function SMSNotifications({ userPhone = '+1 (555) 123-4567' }: SMSNotificationsProps) {
  const handleSave = async (settings: SMSNotificationSettings) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <NotificationSettingsCard<SMSNotificationSettings>
      title="SMS Notifications"
      description="Configure SMS text message notifications for time-sensitive updates"
      icon={MessageSquare}
      iconColor="text-green-600"
      toggles={smsToggleConfig}
      onSave={handleSave}
      infoSections={[
        {
          type: 'info',
          icon: Info,
          title: 'SMS Opt-in Notice',
          content: 'Standard messaging rates may apply. You can opt out at any time by replying STOP to any message.',
        },
      ]}
      customContent={
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone Number</p>
              <p className="text-sm text-gray-600">{userPhone}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}
