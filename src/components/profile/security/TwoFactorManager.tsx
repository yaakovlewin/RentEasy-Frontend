'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key, Copy, QrCode, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type TwoFactorMethod = 'authenticator' | 'sms';

interface TwoFactorManagerProps {
  userId?: string;
}

export function TwoFactorManager({ userId }: TwoFactorManagerProps = {}) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>('authenticator');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const qrCodePlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';

  const generateBackupCodes = async () => {
    setIsGeneratingCodes(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    setBackupCodes(codes);
    setIsGeneratingCodes(false);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  const handleCopyAllCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedCode('all');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      const confirmed = window.confirm(
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
      );

      if (!confirmed) return;

      await new Promise((resolve) => setTimeout(resolve, 500));
      setIs2FAEnabled(false);
      setShowSetup(false);
      setBackupCodes([]);
    } else {
      setShowSetup(true);
      await generateBackupCodes();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (verificationCode.length === 6) {
      setIs2FAEnabled(true);
      setShowSetup(false);
      setVerificationCode('');
    } else {
      setError('Invalid verification code. Please try again.');
    }

    setIsVerifying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">Two-Factor Authentication</p>
              {is2FAEnabled && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Enabled
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {is2FAEnabled
                ? 'Your account is protected with 2FA'
                : 'Enhance your account security'}
            </p>
          </div>
          <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
        </div>

        {showSetup && !is2FAEnabled && (
          <div className="space-y-6 border-t pt-6">
            <div>
              <Label className="text-base font-medium">Choose Authentication Method</Label>
              <div className="mt-3 grid gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('authenticator')}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                    selectedMethod === 'authenticator'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Smartphone className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-gray-500">
                      Use an app like Google Authenticator or Authy
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('sms')}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                    selectedMethod === 'sms'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Key className="h-5 w-5" />
                  <div>
                    <p className="font-medium">SMS Authentication</p>
                    <p className="text-sm text-gray-500">
                      Receive codes via text message
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {selectedMethod === 'authenticator' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Scan QR Code</Label>
                  <p className="mt-1 text-sm text-gray-500">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="mt-3 flex justify-center rounded-lg border bg-white p-4">
                    <div className="relative">
                      <img
                        src={qrCodePlaceholder}
                        alt="QR Code"
                        className="h-48 w-48"
                      />
                      <QrCode className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Manual Entry</Label>
                  <p className="mt-1 text-sm text-gray-500">
                    Or enter this code manually in your app
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-sm">
                      JBSWY3DPEHPK3PXP
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode('JBSWY3DPEHPK3PXP')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'sms' && (
              <div>
                <Label className="text-base font-medium">Phone Number</Label>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your phone number to receive verification codes
                </p>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                />
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Enter Verification Code</Label>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
                <Input
                  id="verification-code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="mt-2 text-center text-lg tracking-wider"
                  disabled={isVerifying}
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isVerifying || verificationCode.length !== 6}>
                {isVerifying ? 'Verifying...' : 'Verify and Enable 2FA'}
              </Button>
            </form>
          </div>
        )}

        {backupCodes.length > 0 && (
          <div className="space-y-4 border-t pt-6">
            <div>
              <Label className="text-base font-medium">Backup Codes</Label>
              <p className="mt-1 text-sm text-gray-500">
                Save these codes in a secure place. Each code can only be used once.
              </p>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-white px-3 py-2"
                  >
                    <code className="font-mono text-sm">{code}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(code)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedCode === code ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyAllCodes}
                className="flex-1"
              >
                {copiedCode === 'all' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All Codes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={generateBackupCodes}
                disabled={isGeneratingCodes}
              >
                {isGeneratingCodes ? 'Generating...' : 'Regenerate Codes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
