'use client';

import { Target, Mail, Shield, ExternalLink } from 'lucide-react';
import { NotificationSettingsCard, NotificationToggle } from './NotificationSettingsCard';

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

const marketingToggleConfig: NotificationToggle[] = [
  {
    id: 'promotionalEmails',
    label: 'Promotional Emails',
    description: 'Special offers, discounts, and promotional campaigns',
    defaultValue: true,
  },
  {
    id: 'travelDeals',
    label: 'Travel Deals',
    description: 'Exclusive travel deals and seasonal offers for your favorite destinations',
    defaultValue: true,
  },
  {
    id: 'partnerOffers',
    label: 'Partner Offers',
    description: 'Offers and promotions from our trusted travel partners',
    defaultValue: false,
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'Monthly newsletter with travel tips, destination guides, and platform updates',
    defaultValue: true,
  },
];

export function MarketingPreferences(props?: MarketingPreferencesProps) {
  const handleSave = async (settings: MarketingPreferencesSettings) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <NotificationSettingsCard<MarketingPreferencesSettings>
      title="Marketing Preferences"
      description="Manage your marketing communication preferences and promotional content"
      icon={Target}
      iconColor="text-pink-600"
      toggles={marketingToggleConfig}
      onSave={handleSave}
      infoSections={[
        {
          type: 'info',
          icon: Shield,
          title: 'Your Privacy Matters',
          content: (
            <>
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
            </>
          ),
        },
        {
          type: 'warning',
          icon: Shield,
          title: 'GDPR Compliance',
          content: (
            <>
              Under GDPR regulations, we will only process your personal data with your consent.
              You have the right to access, rectify, or delete your data at any time.
              Marketing communications are optional and do not affect your account functionality.
            </>
          ),
        },
      ]}
    />
  );
}
