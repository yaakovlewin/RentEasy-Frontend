'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Database, Download, Trash2, Shield, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface DataPreferences {
  analytics: boolean;
  personalization: boolean;
  locationData: boolean;
  cookieConsent: boolean;
}

export function DataUsagePreferences() {
  const [preferences, setPreferences] = useState<DataPreferences>({
    analytics: true,
    personalization: true,
    locationData: false,
    cookieConsent: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleToggle = (key: keyof DataPreferences) => {
    setPreferences(prev => ({
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

  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to request data deletion? This action cannot be undone and will delete all your account data within 30 days.'
    );
    if (confirmed) {
      alert('Data deletion request submitted. You will receive a confirmation email shortly.');
    }
  };

  const dataOptions = [
    {
      key: 'analytics' as keyof DataPreferences,
      label: 'Usage Analytics',
      description: 'Help us improve RentEasy by sharing anonymous usage data and crash reports',
      icon: Database,
    },
    {
      key: 'personalization' as keyof DataPreferences,
      label: 'Personalized Recommendations',
      description: 'Use your browsing history and preferences to suggest properties you might like',
      icon: Shield,
    },
    {
      key: 'locationData' as keyof DataPreferences,
      label: 'Location Data',
      description: 'Allow RentEasy to access your location to show nearby properties',
      icon: Database,
    },
    {
      key: 'cookieConsent' as keyof DataPreferences,
      label: 'Cookie Preferences',
      description: 'Allow cookies for enhanced functionality and personalized experience',
      icon: Shield,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>Data Usage & Privacy</CardTitle>
        </div>
        <CardDescription>
          Manage how we collect and use your data in compliance with GDPR and privacy regulations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Data Collection Preferences</h4>
          {dataOptions.map((option) => {
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
                  checked={preferences[option.key]}
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

        <div className="pt-6 border-t space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Data Management</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">Download Your Data</h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Get a copy of your data in machine-readable format
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Estimated size: ~2.5 MB</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadData}
                disabled={isDownloading}
                className="w-full"
              >
                {isDownloading ? (
                  'Preparing Download...'
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Data
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-red-900">Delete Your Data</h5>
                  <p className="text-xs text-red-700 mt-1">
                    Permanently delete all your account data
                  </p>
                  <p className="text-xs text-red-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteData}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Request Data Deletion
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Your Privacy Rights</p>
                <p className="text-sm text-gray-600 mt-1">
                  We respect your privacy and comply with GDPR and international data protection regulations.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="/data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Data Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Cookie Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
