'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, Shield, X, CheckCircle, Lock, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityAlert {
  id: string;
  type: 'login_failed' | 'new_device' | 'password_changed' | 'suspicious';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
}

interface SecurityAlertsProps {
  userId?: string;
}

export function SecurityAlerts({ userId }: SecurityAlertsProps = {}) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'login_failed',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      severity: 'critical',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'new_device',
      message: 'New device login detected: iPhone 15 Pro from New York, USA',
      severity: 'warning',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'password_changed',
      message: 'Your password was successfully changed',
      severity: 'info',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
    {
      id: '4',
      type: 'suspicious',
      message: 'Unusual login pattern detected from an unfamiliar location',
      severity: 'warning',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true,
    },
  ]);

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'login_failed':
        return X;
      case 'new_device':
        return Smartphone;
      case 'password_changed':
        return Lock;
      case 'suspicious':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getSeverityConfig = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-100 text-red-700 border-red-200',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        };
    }
  };

  const handleMarkAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const handleDismiss = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to dismiss this security alert?'
    );

    if (!confirmed) return;

    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setAlerts((prev) =>
      prev.map((alert) => ({ ...alert, read: true }))
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const unreadCount = alerts.filter((alert) => !alert.read).length;
  const criticalCount = alerts.filter(
    (alert) => alert.severity === 'critical' && !alert.read
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Important security notifications and warnings for your account
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {criticalCount > 0 && (
          <div className="mb-4 rounded-lg border-2 border-red-500 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  Critical Security Alert
                </p>
                <p className="mt-1 text-sm text-red-700">
                  You have {criticalCount} critical security{' '}
                  {criticalCount === 1 ? 'alert' : 'alerts'} that require immediate
                  attention. Please review and take action.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => {
            const severityConfig = getSeverityConfig(alert.severity);
            const AlertIcon = getAlertIcon(alert.type);

            return (
              <div
                key={alert.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  alert.read ? 'bg-gray-50 border-gray-200' : severityConfig.bgColor + ' ' + severityConfig.borderColor,
                  !alert.read && 'border-l-4'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                    alert.read ? 'bg-gray-200' : severityConfig.bgColor
                  )}>
                    <AlertIcon className={cn(
                      'h-5 w-5',
                      alert.read ? 'text-gray-500' : severityConfig.iconColor
                    )} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs capitalize',
                              alert.read ? 'bg-gray-100 text-gray-600 border-gray-200' : severityConfig.badgeColor
                            )}
                          >
                            {alert.severity}
                          </Badge>
                          {!alert.read && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          'mt-2 text-sm',
                          alert.read ? 'text-gray-600' : 'text-gray-900'
                        )}>
                          {alert.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {!alert.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="h-8 px-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(alert.id)}
                          className="h-8 px-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {alert.type === 'login_failed' && !alert.read && (
                      <div className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                        Recommended action: Change your password immediately if you don't recognize this activity.
                      </div>
                    )}

                    {alert.type === 'new_device' && !alert.read && (
                      <div className="rounded-md bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
                        Recommended action: Review your active sessions and end any unrecognized devices.
                      </div>
                    )}

                    {alert.type === 'suspicious' && !alert.read && (
                      <div className="rounded-md bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
                        Recommended action: Enable two-factor authentication for additional security.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm font-medium text-gray-900">
                No security alerts
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Your account is secure with no recent security events
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
