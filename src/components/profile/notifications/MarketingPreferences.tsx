'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle2, AlertCircle, Mail, Shield, ExternalLink } from 'lucide-react';

interface MarketingPreferencesSettings {
  promotionalEmails: boolean;
  travelDeals: boolean;
  partnerOffers: boolean;
  newsletter: boolean;
}

interface MarketingPreferencesProps {
  userId?: string;
  userRole?: string;
}

export function MarketingPreferences(props?: MarketingPreferencesProps) {
  const [settings, setSettings] = useState<MarketingPreferencesSettings>({
    promotionalEmails: true,
    travelDeals: true,
    partnerOffers: false,
    newsletter: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (key: keyof MarketingPreferencesSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveStatus('idle');
  };

  const handleUnsubscribeAll = () => {
    setSettings({
      promotionalEmails: false,
      travelDeals: false,
      partnerOffers: false,
      newsletter: false,
    });
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

  const marketingOptions = [
    {
      key: 'promotionalEmails' as keyof MarketingPreferencesSettings,
      label: 'Promotional Emails',
      description: 'Special offers, discounts, and promotional campaigns',
    },
    {
      key: 'travelDeals' as keyof MarketingPreferencesSettings,
      label: 'Travel Deals',
      description: 'Exclusive travel deals and seasonal offers for your favorite destinations',
    },
    {
      key: 'partnerOffers' as keyof MarketingPreferencesSettings,
      label: 'Partner Offers',
      description: 'Offers and promotions from our trusted travel partners',
    },
    {
      key: 'newsletter' as keyof MarketingPreferencesSettings,
      label: 'Newsletter',
      description: 'Monthly newsletter with travel tips, destination guides, and platform updates',
    },
  ];

  const allDisabled = Object.values(settings).every(value => !value);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-pink-600" />
          <CardTitle>Marketing Preferences</CardTitle>
        </div>
        <CardDescription>
          Manage your marketing communication preferences and promotional content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Your Privacy Matters</p>
              <p className="text-sm text-blue-700 mt-1">
                We respect your privacy and will only send you marketing communications you have opted into.
                You can change these preferences at any time. View our{' '}
                <button
                  onClick={() => {}}
                  className="underline font-medium hover:text-blue-800"
                  aria-label="View privacy policy"
                >
                  Privacy Policy
                  <ExternalLink className="h-3 w-3 inline ml-1" />
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {marketingOptions.map((option) => (
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

        {!allDisabled && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Unsubscribe from All</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Opt out of all marketing communications at once
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUnsubscribeAll}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                Unsubscribe All
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">GDPR Compliance</p>
              <p className="text-sm text-amber-700 mt-1">
                Under GDPR regulations, we will only process your personal data with your consent.
                You have the right to access, rectify, or delete your data at any time.
                Marketing communications are optional and do not affect your account functionality.
              </p>
            </div>
          </div>
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
