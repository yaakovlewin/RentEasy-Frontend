/**
 * ProfileStatsWidget Component - User statistics display
 *
 * Displays key user statistics in a responsive grid layout.
 * Statistics vary based on user role (guest vs owner).
 *
 * Features:
 * - Role-based stat display
 * - Color-coded stat cards
 * - Icon indicators
 * - Responsive grid layout
 * - Mock data calculations
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Home, DollarSign, Calendar, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

interface ProfileStatsWidgetProps {
  userId: string;
  userRole: string;
}

export function ProfileStatsWidget({ userId, userRole }: ProfileStatsWidgetProps) {
  const guestStats: StatItem[] = [
    {
      label: 'Total Bookings',
      value: '12',
      icon: Calendar,
      color: 'blue'
    },
    {
      label: 'Total Spent',
      value: formatCurrency(8450),
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Nights Stayed',
      value: '48',
      icon: Home,
      color: 'purple'
    },
    {
      label: 'Reviews Given',
      value: '8',
      icon: Star,
      color: 'yellow'
    },
  ];

  const ownerStats: StatItem[] = [
    {
      label: 'Properties',
      value: '3',
      icon: Home,
      color: 'blue'
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(24500),
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Bookings',
      value: '67',
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Avg Rating',
      value: '4.8',
      icon: Star,
      color: 'yellow'
    },
  ];

  const stats = userRole === 'guest' ? guestStats : ownerStats;

  const getColorClasses = (color: StatItem['color']) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        text: 'text-blue-700',
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        text: 'text-green-700',
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        text: 'text-purple-700',
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
        text: 'text-yellow-700',
      },
    };

    return colorMap[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;

        return (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
