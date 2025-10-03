'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

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

export function EmailNotifications({ userEmail = 'user@example.com' }: EmailNotificationsProps) {
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    bookingConfirmations: true,
    bookingReminders: true,
    propertyUpdates: true,
    accountActivity: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (key: keyof EmailNotificationSettings) => {
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
      key: 'bookingConfirmations' as keyof EmailNotificationSettings,
      label: 'Booking Confirmations',
      description: 'Receive confirmation emails when bookings are made or updated',
    },
    {
      key: 'bookingReminders' as keyof EmailNotificationSettings,
      label: 'Booking Reminders',
      description: 'Get reminders before check-in and check-out dates',
    },
    {
      key: 'propertyUpdates' as keyof EmailNotificationSettings,
      label: 'Property Updates',
      description: 'Notifications about property availability and pricing changes',
    },
    {
      key: 'accountActivity' as keyof EmailNotificationSettings,
      label: 'Account Activity',
      description: 'Security alerts and important account updates',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <CardTitle>Email Notifications</CardTitle>
        </div>
        <CardDescription>
          Manage your email notification preferences for booking updates and account activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
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
