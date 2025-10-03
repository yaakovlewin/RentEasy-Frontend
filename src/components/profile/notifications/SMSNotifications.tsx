'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle2, AlertCircle, Info } from 'lucide-react';

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

export function SMSNotifications({ userPhone = '+1 (555) 123-4567' }: SMSNotificationsProps) {
  const [settings, setSettings] = useState<SMSNotificationSettings>({
    urgentBookingAlerts: true,
    checkInReminders: true,
    hostMessages: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (key: keyof SMSNotificationSettings) => {
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

  const notificationOptions = [
    {
      key: 'urgentBookingAlerts' as keyof SMSNotificationSettings,
      label: 'Urgent Booking Alerts',
      description: 'Critical notifications about booking changes or cancellations',
    },
    {
      key: 'checkInReminders' as keyof SMSNotificationSettings,
      label: 'Check-in Reminders',
      description: 'SMS reminders before your scheduled check-in time',
    },
    {
      key: 'hostMessages' as keyof SMSNotificationSettings,
      label: 'Host Messages',
      description: 'Text notifications when your host sends you a message',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          <CardTitle>SMS Notifications</CardTitle>
        </div>
        <CardDescription>
          Configure SMS text message notifications for time-sensitive updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">SMS Opt-in Notice</p>
              <p className="text-sm text-blue-700 mt-1">
                Standard messaging rates may apply. You can opt out at any time by replying STOP to any message.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone Number</p>
              <p className="text-sm text-gray-600">{userPhone}</p>
            </div>
          </div>
        </div>

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
                aria-label={option.label}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
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
