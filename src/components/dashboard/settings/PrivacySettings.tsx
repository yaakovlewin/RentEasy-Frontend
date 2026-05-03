/**
 * PrivacySettings Component
 *
 * Manages all privacy and visibility settings including profile visibility,
 * activity status, messages, booking history, and wishlist sharing.
 */

import React, { memo, useMemo } from 'react';
import {
  Shield,
  Eye,
  Globe,
  MessageSquare,
  User,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

// Types
export interface PrivacySettings {
  profileVisibility: boolean;
  activityStatus: boolean;
  allowMessages: boolean;
  showBookingHistory: boolean;
  shareWishlist: boolean;
}

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onUpdate: (settings: Partial<PrivacySettings>) => void;
  loading?: boolean;
}

export const PrivacySettings = memo<PrivacySettingsProps>(({
  settings,
  onUpdate,
  loading = false
}) => {
  const privacyOptions = useMemo(() => [
    {
      id: 'profileVisibility',
      icon: Eye,
      title: 'Profile Visibility',
      description: 'Show your profile information to hosts and other users',
      enabled: settings.profileVisibility,
      warning: false
    },
    {
      id: 'activityStatus',
      icon: Globe,
      title: 'Activity Status',
      description: 'Show when you\'re online or recently active',
      enabled: settings.activityStatus,
      warning: false
    },
    {
      id: 'allowMessages',
      icon: MessageSquare,
      title: 'Allow Messages',
      description: 'Let hosts and other users send you direct messages',
      enabled: settings.allowMessages,
      warning: false
    },
    {
      id: 'showBookingHistory',
      icon: User,
      title: 'Show Booking History',
      description: 'Display your past bookings and reviews on your profile',
      enabled: settings.showBookingHistory,
      warning: false
    },
    {
      id: 'shareWishlist',
      icon: Eye,
      title: 'Share Wishlist',
      description: 'Allow others to see your saved properties and favorites',
      enabled: settings.shareWishlist,
      warning: false
    }
  ], [settings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy & Visibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {privacyOptions.map(({ id, icon: Icon, title, description, enabled, warning }) => (
          <div key={id} className="flex items-center justify-between py-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{title}</p>
                  {warning && (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-6">{description}</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => onUpdate({ [id]: checked })}
              disabled={loading}
              aria-label={`Toggle ${title}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

PrivacySettings.displayName = 'PrivacySettings';

export default PrivacySettings;
