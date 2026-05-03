'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, LucideIcon } from 'lucide-react';
import { useSaveState } from '@/hooks/useSaveState';

export interface NotificationToggle {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

export interface NotificationInfoSection {
  type: 'info' | 'warning' | 'success';
  icon?: LucideIcon;
  title?: string;
  content: ReactNode;
}

export interface NotificationSettingsCardProps<T extends Record<string, boolean | string>> {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  toggles: NotificationToggle[];
  onSave: (settings: T) => Promise<void>;
  infoSections?: NotificationInfoSection[];
  extraActions?: ReactNode;
  customContent?: ReactNode;
  customToggles?: ReactNode;
  disableSave?: boolean;
  initialSettings?: T;
  onSettingsChange?: (settings: T) => void;
}

export function NotificationSettingsCard<T extends Record<string, boolean | string>>({
  title,
  description,
  icon: Icon,
  iconColor,
  toggles,
  onSave,
  infoSections = [],
  extraActions,
  customContent,
  customToggles,
  disableSave = false,
  initialSettings,
  onSettingsChange,
}: NotificationSettingsCardProps<T>) {
  const defaultSettings = initialSettings || (toggles.reduce((acc, toggle) => {
    acc[toggle.id] = toggle.defaultValue;
    return acc;
  }, {} as Record<string, boolean>) as T);

  const [settings, setSettings] = useState<T>(defaultSettings);

  const { isSaving, saveStatus, handleSave, resetStatus } = useSaveState(async () => {
    await onSave(settings);
  });

  const handleToggle = (toggleId: string) => {
    const newSettings = {
      ...settings,
      [toggleId]: !settings[toggleId],
    };
    setSettings(newSettings as T);
    resetStatus();
    onSettingsChange?.(newSettings as T);
  };

  const updateSettings = (updates: Partial<T>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings as T);
    resetStatus();
    onSettingsChange?.(newSettings as T);
  };

  const getInfoSectionStyles = (type: NotificationInfoSection['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getIconColor = (type: NotificationInfoSection['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-amber-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {infoSections.map((section, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${getInfoSectionStyles(section.type)}`}
          >
            <div className="flex gap-3">
              {section.icon && (
                <section.icon
                  className={`h-5 w-5 flex-shrink-0 mt-0.5 ${getIconColor(section.type)}`}
                />
              )}
              <div className="flex-1">
                {section.title && (
                  <p className={`text-sm font-medium mb-1 ${getIconColor(section.type).replace('text-', 'text-').replace('-600', '-900')}`}>
                    {section.title}
                  </p>
                )}
                <div className={`text-sm ${getIconColor(section.type).replace('-600', '-700')}`}>
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {customContent}

        {customToggles ? (
          customToggles
        ) : (
          <div className="space-y-4">
            {toggles.map((toggle) => (
              <div
                key={toggle.id}
                className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <Label
                    htmlFor={toggle.id}
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {toggle.label}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{toggle.description}</p>
                </div>
                <Switch
                  id={toggle.id}
                  checked={settings[toggle.id as keyof T] as boolean}
                  onCheckedChange={() => handleToggle(toggle.id)}
                  disabled={disableSave}
                  aria-label={toggle.label}
                />
              </div>
            ))}
          </div>
        )}

        {extraActions}

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || disableSave}
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
