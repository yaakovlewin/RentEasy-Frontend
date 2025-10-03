'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, MapPin, Clock, LogOut, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

interface SessionManagerProps {
  userId?: string;
}

export function SessionManager({ userId }: SessionManagerProps = {}) {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      location: 'New York, USA',
      ipAddress: '192.168.1.1',
      lastActive: new Date().toISOString(),
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      deviceType: 'mobile',
      browser: 'Safari 17.2',
      location: 'New York, USA',
      ipAddress: '192.168.1.2',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      current: false,
    },
    {
      id: '3',
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      location: 'Boston, USA',
      ipAddress: '192.168.2.1',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      current: false,
    },
    {
      id: '4',
      device: 'iPad Air',
      deviceType: 'tablet',
      browser: 'Safari 17.1',
      location: 'San Francisco, USA',
      ipAddress: '192.168.3.1',
      lastActive: new Date(Date.now() - 172800000).toISOString(),
      current: false,
    },
  ]);

  const [endingSession, setEndingSession] = useState<string | null>(null);

  const getDeviceIcon = (deviceType: Session['deviceType']) => {
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

  const handleEndSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);

    if (session?.current) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to end this session? The user will need to log in again on this device.'
    );

    if (!confirmed) return;

    setEndingSession(sessionId);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setEndingSession(null);
  };

  const handleEndAllOtherSessions = async () => {
    const otherSessionsCount = sessions.filter((s) => !s.current).length;

    if (otherSessionsCount === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to end all ${otherSessionsCount} other session(s)? You will need to log in again on those devices.`
    );

    if (!confirmed) return;

    setEndingSession('all');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSessions((prev) => prev.filter((s) => s.current));
    setEndingSession(null);
  };

  const getLastActiveText = (lastActive: string) => {
    const now = Date.now();
    const lastActiveTime = new Date(lastActive).getTime();
    const diffMs = now - lastActiveTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const otherSessionsCount = sessions.filter((s) => !s.current).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions across different devices
            </CardDescription>
          </div>
          {otherSessionsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndAllOtherSessions}
              disabled={endingSession === 'all'}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {endingSession === 'all' ? 'Ending...' : 'End All Other Sessions'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);
            const isEnding = endingSession === session.id || endingSession === 'all';

            return (
              <div
                key={session.id}
                className="flex items-start justify-between rounded-lg border p-4 transition-opacity"
                style={{ opacity: isEnding ? 0.5 : 1 }}
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <DeviceIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3.5 w-3.5" />
                        <span>{session.browser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{session.location}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-mono text-xs">{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{getLastActiveText(session.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEndSession(session.id)}
                    disabled={isEnding}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isEnding ? 'Ending...' : 'End Session'}
                  </Button>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">No active sessions found</p>
            </div>
          )}
        </div>

        {sessions.length > 1 && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Security Tip</p>
                <p className="mt-1 text-blue-700">
                  If you see a session you don't recognize, end it immediately and change your password.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
