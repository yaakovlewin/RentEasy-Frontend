'use client';

import { useState } from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NotificationSettingsCard } from './NotificationSettingsCard';

interface ScheduleSettings {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  deliveryFrequency: 'instant' | 'daily' | 'weekly';
  doNotDisturb: boolean;
}

interface NotificationScheduleProps {
  userId?: string;
}

const frequencyOptions = [
  {
    value: 'instant' as const,
    label: 'Instant',
    description: 'Receive notifications immediately',
  },
  {
    value: 'daily' as const,
    label: 'Daily Digest',
    description: 'One summary email per day at 9:00 AM',
  },
  {
    value: 'weekly' as const,
    label: 'Weekly Digest',
    description: 'One summary email per week on Monday',
  },
];

export function NotificationSchedule(props?: NotificationScheduleProps) {
  const [timezone] = useState('America/New_York (EST)');
  const [localSettings, setLocalSettings] = useState<ScheduleSettings>({
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    deliveryFrequency: 'instant',
    doNotDisturb: false,
  });

  const handleSave = async (settings: ScheduleSettings) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleToggle = (key: keyof Pick<ScheduleSettings, 'quietHoursEnabled' | 'doNotDisturb'>) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimeChange = (field: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFrequencyChange = (frequency: 'instant' | 'daily' | 'weekly') => {
    setLocalSettings(prev => ({
      ...prev,
      deliveryFrequency: frequency,
    }));
  };

  return (
    <NotificationSettingsCard<ScheduleSettings>
      title="Notification Schedule"
      description="Control when and how often you receive notifications"
      icon={Calendar}
      iconColor="text-orange-600"
      toggles={[]}
      onSave={handleSave}
      initialSettings={localSettings}
      onSettingsChange={setLocalSettings}
      customContent={
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Timezone</p>
              <p className="text-sm text-gray-600">{timezone}</p>
            </div>
          </div>
        </div>
      }
      customToggles={
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 pb-4 border-b">
            <div className="flex-1">
              <Label
                htmlFor="doNotDisturb"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                Do Not Disturb
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Temporarily pause all non-critical notifications
              </p>
            </div>
            <Switch
              id="doNotDisturb"
              checked={localSettings.doNotDisturb}
              onCheckedChange={() => handleToggle('doNotDisturb')}
              aria-label="Do Not Disturb"
            />
          </div>

          <div className="pb-4 border-b">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <Label
                  htmlFor="quietHoursEnabled"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Quiet Hours
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Mute non-urgent notifications during specific hours
                </p>
              </div>
              <Switch
                id="quietHoursEnabled"
                checked={localSettings.quietHoursEnabled}
                onCheckedChange={() => handleToggle('quietHoursEnabled')}
                aria-label="Enable Quiet Hours"
              />
            </div>

            {localSettings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <Label htmlFor="quietHoursStart" className="text-sm font-medium text-gray-700 mb-2 block">
                    <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                    Start Time
                  </Label>
                  <input
                    id="quietHoursStart"
                    type="time"
                    value={localSettings.quietHoursStart}
                    onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Quiet hours start time"
                  />
                </div>
                <div>
                  <Label htmlFor="quietHoursEnd" className="text-sm font-medium text-gray-700 mb-2 block">
                    <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                    End Time
                  </Label>
                  <input
                    id="quietHoursEnd"
                    type="time"
                    value={localSettings.quietHoursEnd}
                    onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Quiet hours end time"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Delivery Frequency
            </Label>
            <div className="space-y-3">
              {frequencyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    localSettings.deliveryFrequency === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryFrequency"
                    value={option.value}
                    checked={localSettings.deliveryFrequency === option.value}
                    onChange={() => handleFrequencyChange(option.value)}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    aria-label={option.label}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
