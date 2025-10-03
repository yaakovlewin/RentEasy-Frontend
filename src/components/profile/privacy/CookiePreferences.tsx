'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Cookie, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface CookiePreferencesProps {
  userId: string;
}

interface CookieSettings {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

export function CookiePreferences({ userId }: CookiePreferencesProps) {
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    functional: true,
    analytics: true,
    advertising: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (key: keyof CookieSettings) => {
    if (key === 'essential') return;

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

  const handleAcceptAll = () => {
    setSettings({
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    });
    setSaveStatus('idle');
  };

  const handleRejectAll = () => {
    setSettings({
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
    });
    setSaveStatus('idle');
  };

  const cookieCategories = [
    {
      key: 'essential' as keyof CookieSettings,
      label: 'Essential Cookies',
      description: 'Required for the website to function properly. These cannot be disabled.',
      required: true,
      examples: 'Authentication, security, session management',
    },
    {
      key: 'functional' as keyof CookieSettings,
      label: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization like language preferences.',
      required: false,
      examples: 'Language settings, user preferences, saved searches',
    },
    {
      key: 'analytics' as keyof CookieSettings,
      label: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website to improve experience.',
      required: false,
      examples: 'Page views, user behavior, performance metrics',
    },
    {
      key: 'advertising' as keyof CookieSettings,
      label: 'Advertising Cookies',
      description: 'Used to deliver relevant advertisements and track campaign effectiveness.',
      required: false,
      examples: 'Ad targeting, conversion tracking, remarketing',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-blue-600" />
          <CardTitle>Cookie Preferences</CardTitle>
        </div>
        <CardDescription>
          Manage which cookies and tracking technologies you allow on RentEasy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAcceptAll}
            className="flex-1"
          >
            Accept All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRejectAll}
            className="flex-1"
          >
            Reject Non-Essential
          </Button>
        </div>

        <div className="space-y-4 pt-4 border-t">
          {cookieCategories.map((category) => (
            <div
              key={category.key}
              className={`rounded-lg border p-4 ${
                category.required ? 'bg-gray-50 border-gray-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={category.key}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {category.label}
                    </Label>
                    {category.required && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Examples:</strong> {category.examples}
                  </p>
                </div>
                <Switch
                  id={category.key}
                  checked={settings[category.key]}
                  onCheckedChange={() => handleToggle(category.key)}
                  disabled={category.required}
                  aria-label={category.label}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>

          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Preferences saved</span>
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
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">About Cookies</p>
                <p className="text-sm text-blue-700 mt-1">
                  Cookies are small text files stored on your device that help us provide and improve our services.
                  You can change your preferences at any time, but disabling certain cookies may affect functionality.
                </p>
                <a
                  href="/cookie-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
                >
                  Learn more about our cookie policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
