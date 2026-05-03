'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { SettingsCardHeader } from './SettingsCardHeader';
import { SettingsCardContent } from './SettingsCardContent';
import { SettingsCardActions } from './SettingsCardActions';

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

interface SettingsCardComponent extends React.FC<SettingsCardProps> {
  Header: typeof SettingsCardHeader;
  Content: typeof SettingsCardContent;
  Actions: typeof SettingsCardActions;
}

/**
 * Compound component for settings/manager card layouts.
 * Provides a consistent structure for Card, Header, Content, and Actions.
 *
 * @example
 * ```tsx
 * <SettingsCard>
 *   <SettingsCard.Header
 *     title="Security Settings"
 *     description="Manage your account security"
 *     icon={Shield}
 *   />
 *   <SettingsCard.Content>
 *     {children}
 *   </SettingsCard.Content>
 *   <SettingsCard.Actions
 *     onSave={handleSave}
 *     onCancel={handleCancel}
 *     isSaving={isSaving}
 *     saveStatus={saveStatus}
 *   />
 * </SettingsCard>
 * ```
 */
export const SettingsCard: SettingsCardComponent = ({ children, className }) => {
  return <Card className={className}>{children}</Card>;
};

SettingsCard.Header = SettingsCardHeader;
SettingsCard.Content = SettingsCardContent;
SettingsCard.Actions = SettingsCardActions;
