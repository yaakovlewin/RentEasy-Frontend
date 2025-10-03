/**
 * ProfileActivityFeed Component - User activity timeline
 *
 * Displays a timeline of recent user activities including bookings,
 * reviews, property updates, and profile changes.
 *
 * Features:
 * - Activity type icons with color coding
 * - Relative timestamps
 * - Scrollable activity list
 * - Empty state handling
 * - View all activities link
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimeAgo } from '@/lib/utils';
import { Calendar, Star, Home, User, CheckCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'booking' | 'review' | 'property' | 'profile';
  description: string;
  timestamp: string;
}

interface ProfileActivityFeedProps {
  userId: string;
  limit?: number;
}

export function ProfileActivityFeed({ userId, limit = 10 }: ProfileActivityFeedProps) {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'booking',
      description: 'Completed booking at Sunset Villa',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'review',
      description: 'Posted a review for Ocean View Apartment',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'property',
      description: 'Added new property: Mountain Retreat',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'profile',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'booking',
      description: 'Confirmed booking at Lakeside Cabin',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ].slice(0, limit);

  const getActivityIcon = (type: Activity['type']) => {
    const iconProps = { className: 'w-5 h-5' };

    switch (type) {
      case 'booking':
        return <Calendar {...iconProps} className="w-5 h-5 text-blue-600" />;
      case 'review':
        return <Star {...iconProps} className="w-5 h-5 text-yellow-600" />;
      case 'property':
        return <Home {...iconProps} className="w-5 h-5 text-green-600" />;
      case 'profile':
        return <User {...iconProps} className="w-5 h-5 text-purple-600" />;
      default:
        return <CheckCircle {...iconProps} className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-50';
      case 'review':
        return 'bg-yellow-50';
      case 'property':
        return 'bg-green-50';
      case 'profile':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No activity yet</h3>
            <p className="text-sm text-gray-500">
              Your recent activities will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <a
          href="/profile/activity"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityBgColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              {index < activities.length - 1 && (
                <div className="absolute left-[34px] mt-12 w-px h-8 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
