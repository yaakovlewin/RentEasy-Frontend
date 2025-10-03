'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Unlink, CheckCircle, XCircle, Info } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  connected: boolean;
  lastConnected?: string;
  scopes: string[];
  description: string;
}

export function ThirdPartyIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google',
      name: 'Google',
      connected: true,
      lastConnected: '2024-01-15',
      scopes: ['email', 'profile'],
      description: 'Sign in with your Google account and sync your calendar',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      connected: false,
      scopes: ['email', 'public_profile'],
      description: 'Connect with Facebook to share your experiences',
    },
    {
      id: 'apple',
      name: 'Apple',
      connected: false,
      scopes: ['email', 'name'],
      description: 'Use your Apple ID for secure authentication',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      connected: true,
      lastConnected: '2024-02-01',
      scopes: ['payment_methods', 'transactions'],
      description: 'Secure payment processing for bookings',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      connected: false,
      scopes: ['payment'],
      description: 'Alternative payment method for your convenience',
    },
    {
      id: 'calendar',
      name: 'Calendar Sync',
      connected: true,
      lastConnected: '2024-01-20',
      scopes: ['calendar_read', 'calendar_write'],
      description: 'Sync your bookings with your personal calendar',
    },
  ]);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setProcessingId(id);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIntegrations(prev =>
        prev.map(integration => {
          if (integration.id === id) {
            return {
              ...integration,
              connected: !integration.connected,
              lastConnected: !integration.connected
                ? new Date().toISOString().split('T')[0]
                : integration.lastConnected,
            };
          }
          return integration;
        })
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-600" />
          <CardTitle>Third-Party Integrations</CardTitle>
        </div>
        <CardDescription>
          Manage connected apps and services. {connectedCount} of {integrations.length} integrations connected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {integrations.map((integration) => {
            const isProcessing = processingId === integration.id;

            return (
              <div
                key={integration.id}
                className={`rounded-lg border p-4 transition-colors ${
                  integration.connected
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200">
                      {integration.connected ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {integration.name}
                        </h4>
                        <Badge
                          variant={integration.connected ? 'default' : 'outline'}
                          className={
                            integration.connected
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : ''
                          }
                        >
                          {integration.connected ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {integration.description}
                      </p>
                      {integration.connected && integration.lastConnected && (
                        <p className="text-xs text-gray-500">
                          Last connected: {formatDate(integration.lastConnected)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {integration.scopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="outline"
                            className="text-xs px-2 py-0"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggle(integration.id)}
                    disabled={isProcessing}
                    className="min-w-[100px]"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : integration.connected ? (
                      <>
                        <Unlink className="h-4 w-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">About Integrations</p>
                <p className="text-sm text-blue-700 mt-1">
                  Connected services can access specific information based on the permissions you grant.
                  You can revoke access at any time by disconnecting the integration.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Security & Permissions</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>All integrations use secure OAuth 2.0 authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Your credentials are never shared with third parties</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>You can revoke access at any time without affecting your RentEasy account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Each integration only accesses the specific data you authorize</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
