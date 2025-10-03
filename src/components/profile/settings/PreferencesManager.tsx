'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, DollarSign, Clock, Calendar, Ruler } from 'lucide-react';

interface PreferencesManagerProps {
  userId: string;
}

export function PreferencesManager({ userId }: PreferencesManagerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    measurementUnit: 'metric',
  });

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handlePreferenceChange = (field: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Regional Preferences
        </CardTitle>
        <CardDescription>Customize your regional and display preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </Label>
            <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Currency
            </Label>
            <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('currency', value)}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone
            </Label>
            <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC - Coordinated Universal Time</SelectItem>
                <SelectItem value="America/New_York">EST - Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">CST - Central Time</SelectItem>
                <SelectItem value="America/Denver">MST - Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">PST - Pacific Time</SelectItem>
                <SelectItem value="Europe/London">GMT - Greenwich Mean Time</SelectItem>
                <SelectItem value="Europe/Paris">CET - Central European Time</SelectItem>
                <SelectItem value="Asia/Tokyo">JST - Japan Standard Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Format
            </Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
            >
              <SelectTrigger id="dateFormat">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                <SelectItem value="DD MMM YYYY">DD MMM YYYY (31 Dec 2024)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurementUnit" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Measurement Units
            </Label>
            <Select
              value={preferences.measurementUnit}
              onValueChange={(value) => handlePreferenceChange('measurementUnit', value)}
            >
              <SelectTrigger id="measurementUnit">
                <SelectValue placeholder="Select measurement units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (km, kg, °C)</SelectItem>
                <SelectItem value="imperial">Imperial (mi, lb, °F)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
            {isSaving ? 'Saving Preferences...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
