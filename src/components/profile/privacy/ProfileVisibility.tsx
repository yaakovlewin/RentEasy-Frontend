'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Lock, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface VisibilitySettings {
  publicProfile: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showBookingHistory: boolean;
  visibilityLevel: 'everyone' | 'registered' | 'private';
}

export function ProfileVisibility() {
  const [settings, setSettings] = useState<VisibilitySettings>({
    publicProfile: true,
    showEmail: false,
    showPhone: false,
    showBookingHistory: true,
    visibilityLevel: 'registered',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (key: keyof Omit<VisibilitySettings, 'visibilityLevel'>) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveStatus('idle');
  };

  const handleVisibilityLevelChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      visibilityLevel: value as 'everyone' | 'registered' | 'private',
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

  const visibilityOptions = [
    {
      key: 'publicProfile' as keyof Omit<VisibilitySettings, 'visibilityLevel'>,
      label: 'Public Profile',
      description: 'Make your profile visible to others on RentEasy',
      icon: Globe,
    },
    {
      key: 'showEmail' as keyof Omit<VisibilitySettings, 'visibilityLevel'>,
      label: 'Show Email Address',
      description: 'Display your email address on your public profile',
      icon: Eye,
    },
    {
      key: 'showPhone' as keyof Omit<VisibilitySettings, 'visibilityLevel'>,
      label: 'Show Phone Number',
      description: 'Display your phone number on your public profile',
      icon: Eye,
    },
    {
      key: 'showBookingHistory' as keyof Omit<VisibilitySettings, 'visibilityLevel'>,
      label: 'Show Booking History',
      description: 'Display your past bookings and reviews on your profile',
      icon: Eye,
    },
  ];

  const getVisibilityIcon = () => {
    switch (settings.visibilityLevel) {
      case 'everyone':
        return <Globe className="h-5 w-5 text-green-600" />;
      case 'registered':
        return <Eye className="h-5 w-5 text-blue-600" />;
      case 'private':
        return <Lock className="h-5 w-5 text-gray-600" />;
      default:
        return <EyeOff className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getVisibilityIcon()}
          <CardTitle>Profile Visibility</CardTitle>
        </div>
        <CardDescription>
          Control who can see your profile information and activity on RentEasy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="visibility-level" className="text-sm font-medium text-gray-900">
              Profile Visibility Level
            </Label>
            <p className="text-sm text-gray-600 mb-2">
              Choose who can view your profile information
            </p>
            <Select
              value={settings.visibilityLevel}
              onValueChange={handleVisibilityLevelChange}
            >
              <SelectTrigger id="visibility-level" className="w-full">
                <SelectValue placeholder="Select visibility level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Everyone</div>
                      <div className="text-xs text-gray-600">Anyone can view your profile</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="registered">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Registered Users Only</div>
                      <div className="text-xs text-gray-600">Only RentEasy members can view</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Only Me</div>
                      <div className="text-xs text-gray-600">Keep your profile private</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Profile Information</h4>
            <div className="space-y-4">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.key}
                    className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex gap-3 flex-1">
                      <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
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
                    </div>
                    <Switch
                      id={option.key}
                      checked={settings[option.key]}
                      onCheckedChange={() => handleToggle(option.key)}
                      aria-label={option.label}
                      disabled={!settings.publicProfile && option.key !== 'publicProfile'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {!settings.publicProfile && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Private Profile</p>
                <p className="text-sm text-blue-700 mt-1">
                  Your profile is currently private. Enable &quot;Public Profile&quot; to allow others to see your information.
                </p>
              </div>
            </div>
          </div>
        )}

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
