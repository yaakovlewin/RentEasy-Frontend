'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Upload,
  CreditCard,
  User,
} from 'lucide-react';

interface VerificationManagerProps {
  userId: string;
  userRole: string;
}

type VerificationStatus = 'verified' | 'pending' | 'not-verified';

export function VerificationManager({ userId, userRole }: VerificationManagerProps) {
  const [emailVerified, setEmailVerified] = useState<VerificationStatus>('verified');
  const [phoneVerified, setPhoneVerified] = useState<VerificationStatus>('not-verified');
  const [idVerified, setIdVerified] = useState<VerificationStatus>('not-verified');
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const idFileRef = useRef<HTMLInputElement>(null);
  const selfieFileRef = useRef<HTMLInputElement>(null);

  const handleVerify = async (type: string) => {
    setIsVerifying(type);
    setTimeout(() => {
      if (type === 'email') setEmailVerified('verified');
      if (type === 'phone') setPhoneVerified('pending');
      if (type === 'id') setIdVerified('pending');
      setIsVerifying(null);
    }, 1500);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-amber-600 text-white">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'not-verified':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Verified
          </Badge>
        );
    }
  };

  const isHost = userRole === 'owner' || userRole === 'host';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Verification
          </CardTitle>
          <CardDescription>Verify your identity to increase trust and unlock additional features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Email Verification</h4>
                  <p className="text-sm text-muted-foreground">Verify your email address</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(emailVerified)}
                {emailVerified === 'not-verified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify('email')}
                    disabled={isVerifying === 'email'}
                  >
                    {isVerifying === 'email' ? 'Sending...' : 'Verify'}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Phone Verification</h4>
                  <p className="text-sm text-muted-foreground">Verify your phone number</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(phoneVerified)}
                {phoneVerified === 'not-verified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify('phone')}
                    disabled={isVerifying === 'phone'}
                  >
                    {isVerifying === 'phone' ? 'Sending...' : 'Verify'}
                  </Button>
                )}
              </div>
            </div>

            {isHost && (
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Identity Verification</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Required for hosts to list properties
                    </p>
                    {idVerified === 'not-verified' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            ref={idFileRef}
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => idFileRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload ID
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            ref={selfieFileRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selfieFileRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Upload Selfie
                          </Button>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleVerify('id')}
                          disabled={isVerifying === 'id'}
                        >
                          {isVerifying === 'id' ? 'Submitting...' : 'Submit for Review'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">{getStatusBadge(idVerified)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Verification Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Increased Trust</h4>
                <p className="text-sm text-muted-foreground">
                  Verified accounts receive higher booking rates and better reviews
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Priority Support</h4>
                <p className="text-sm text-muted-foreground">
                  Get faster response times from our support team
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Enhanced Security</h4>
                <p className="text-sm text-muted-foreground">
                  Protect your account with additional verification layers
                </p>
              </div>
            </li>
            {isHost && (
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">List Properties</h4>
                  <p className="text-sm text-muted-foreground">
                    Identity verification is required to list properties as a host
                  </p>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
