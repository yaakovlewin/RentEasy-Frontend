'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Monitor, MapPin, Calendar, Download, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginActivity {
  id: string;
  timestamp: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

interface LoginActivityLogProps {
  userId: string;
  limit?: number;
}

export function LoginActivityLog({ userId, limit = 10 }: LoginActivityLogProps) {
  const [activities] = useState<LoginActivity[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      location: 'New York, USA',
      ipAddress: '192.168.1.1',
      status: 'success',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      device: 'iPhone 15 Pro',
      deviceType: 'mobile',
      browser: 'Safari 17.2',
      location: 'New York, USA',
      ipAddress: '192.168.1.2',
      status: 'success',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      location: 'Boston, USA',
      ipAddress: '192.168.2.1',
      status: 'failed',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      device: 'iPad Air',
      deviceType: 'tablet',
      browser: 'Safari 17.1',
      location: 'San Francisco, USA',
      ipAddress: '192.168.3.1',
      status: 'success',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Firefox 121.0',
      location: 'Chicago, USA',
      ipAddress: '192.168.4.1',
      status: 'success',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      device: 'Android Phone',
      deviceType: 'mobile',
      browser: 'Chrome Mobile 120.0',
      location: 'Los Angeles, USA',
      ipAddress: '192.168.5.1',
      status: 'failed',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Safari 17.2',
      location: 'Seattle, USA',
      ipAddress: '192.168.6.1',
      status: 'success',
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      device: 'iPad Pro',
      deviceType: 'tablet',
      browser: 'Safari 17.1',
      location: 'Miami, USA',
      ipAddress: '192.168.7.1',
      status: 'success',
    },
  ]);

  const [isExporting, setIsExporting] = useState(false);

  const displayedActivities = activities.slice(0, limit);

  const getDeviceIcon = (deviceType: LoginActivity['deviceType']) => {
    switch (deviceType) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const csvContent = [
      ['Date & Time', 'Device', 'Browser', 'Location', 'IP Address', 'Status'].join(','),
      ...activities.map((activity) =>
        [
          formatDate(activity.timestamp),
          activity.device,
          activity.browser,
          activity.location,
          activity.ipAddress,
          activity.status,
        ]
          .map((field) => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-activity-${userId}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relativeTime = '';
    if (diffMins < 1) {
      relativeTime = 'Just now';
    } else if (diffMins < 60) {
      relativeTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      relativeTime = formatDate(timestamp);
    }

    return {
      relative: relativeTime,
      absolute: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Login Activity
            </CardTitle>
            <CardDescription>
              Review your recent login history and device activity
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedActivities.map((activity) => {
            const DeviceIcon = getDeviceIcon(activity.deviceType);
            const timestamp = formatTimestamp(activity.timestamp);

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                  activity.status === 'failed' && 'border-red-200 bg-red-50'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                  activity.status === 'success' ? 'bg-gray-100' : 'bg-red-100'
                )}>
                  <DeviceIcon className={cn(
                    'h-5 w-5',
                    activity.status === 'success' ? 'text-gray-600' : 'text-red-600'
                  )} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{activity.device}</p>
                        <Badge
                          variant={activity.status === 'success' ? 'outline' : 'destructive'}
                          className={cn(
                            'text-xs',
                            activity.status === 'success' && 'bg-green-50 text-green-700 border-green-200'
                          )}
                        >
                          {activity.status === 'success' ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Success
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Failed
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{activity.browser}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {timestamp.relative}
                      </p>
                      <p className="text-xs text-gray-500">{timestamp.absolute}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{activity.location}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="font-mono text-xs">{activity.ipAddress}</span>
                  </div>

                  {activity.status === 'failed' && (
                    <div className="mt-2 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                      Failed login attempt detected. If this wasn't you, please change your password immediately.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {displayedActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">No login activity found</p>
            </div>
          )}
        </div>

        {activities.length > limit && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {limit} of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
