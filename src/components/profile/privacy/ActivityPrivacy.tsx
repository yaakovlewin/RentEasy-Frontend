'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Activity, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActivityPrivacyProps {
  userId: string;
  userRole: string;
}

interface ActivitySettings {
  showWishlist: boolean;
  showReviews: boolean;
  showBookings: boolean;
  showSearchHistory: boolean;
  showPropertyViews: boolean;
  showSocialSharing: boolean;
}

export function ActivityPrivacy({ userId, userRole }: ActivityPrivacyProps) {
  const [settings, setSettings] = useState<ActivitySettings>({
    showWishlist: true,
    showReviews: true,
    showBookings: false,
    showSearchHistory: false,
    showPropertyViews: false,
    showSocialSharing: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (key: keyof ActivitySettings) => {
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

  const activityOptions = [
    {
      key: 'showWishlist' as keyof ActivitySettings,
      label: 'Wishlist',
      description: 'Show your saved properties and favorites on your profile',
      icon: Eye,
    },
    {
      key: 'showReviews' as keyof ActivitySettings,
      label: 'Reviews',
      description: 'Display reviews you have written about properties and hosts',
      icon: Eye,
    },
    {
      key: 'showBookings' as keyof ActivitySettings,
      label: 'Booking History',
      description: 'Show your past and current bookings on your profile',
      icon: EyeOff,
    },
    {
      key: 'showSearchHistory' as keyof ActivitySettings,
      label: 'Search History',
      description: 'Allow others to see your recent property searches',
      icon: EyeOff,
    },
    {
      key: 'showPropertyViews' as keyof ActivitySettings,
      label: 'Property Views',
      description: 'Show which properties you have recently viewed',
      icon: EyeOff,
    },
    {
      key: 'showSocialSharing' as keyof ActivitySettings,
      label: 'Social Sharing',
      description: 'Allow sharing of your activities on social media platforms',
      icon: Eye,
    },
  ];

  const visibleCount = Object.values(settings).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <CardTitle>Activity Privacy</CardTitle>
        </div>
        <CardDescription>
          Control which activities and interactions are visible to others. {visibleCount} of {activityOptions.length} activities visible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {activityOptions.map((option) => {
            const Icon = settings[option.key] ? Eye : EyeOff;
            return (
              <div
                key={option.key}
                className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex gap-3 flex-1">
                  <Icon className={`h-5 w-5 mt-0.5 ${settings[option.key] ? 'text-blue-600' : 'text-gray-400'}`} />
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
                />
              </div>
            );
          })}
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

        <div className="pt-4 border-t">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Activity Visibility</p>
                <p className="text-sm text-gray-600 mt-1">
                  These settings control what other users can see about your activity on RentEasy.
                  Your private information is always protected, and you can change these settings at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {userRole === 'owner' && (
          <div className="pt-4 border-t">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Property Owner Settings</p>
                  <p className="text-sm text-blue-700 mt-1">
                    As a property owner, your reviews and property-related activities are visible by default
                    to help build trust with potential guests. You can still control personal activity visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
