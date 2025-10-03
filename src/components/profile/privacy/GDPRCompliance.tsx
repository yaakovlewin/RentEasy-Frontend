'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface GDPRComplianceProps {
  userId: string;
}

interface DataRequest {
  id: string;
  type: 'export' | 'deletion' | 'portability';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
}

export function GDPRCompliance({ userId }: GDPRComplianceProps) {
  const [requests, setRequests] = useState<DataRequest[]>([
    {
      id: '1',
      type: 'export',
      status: 'completed',
      requestedAt: '2024-01-10',
      completedAt: '2024-01-11',
    },
  ]);

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleDataExport = async () => {
    setIsProcessing('export');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newRequest: DataRequest = {
        id: Date.now().toString(),
        type: 'export',
        status: 'processing',
        requestedAt: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [newRequest, ...prev]);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDataPortability = async () => {
    setIsProcessing('portability');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newRequest: DataRequest = {
        id: Date.now().toString(),
        type: 'portability',
        status: 'processing',
        requestedAt: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [newRequest, ...prev]);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDataDeletion = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to request account deletion? This action cannot be undone. All your data will be permanently deleted within 30 days.'
    );

    if (!confirmed) return;

    setIsProcessing('deletion');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newRequest: DataRequest = {
        id: Date.now().toString(),
        type: 'deletion',
        status: 'pending',
        requestedAt: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [newRequest, ...prev]);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: DataRequest['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const getRequestTypeLabel = (type: DataRequest['type']) => {
    switch (type) {
      case 'export':
        return 'Data Export';
      case 'portability':
        return 'Data Portability';
      case 'deletion':
        return 'Account Deletion';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>GDPR Compliance & Data Rights</CardTitle>
        </div>
        <CardDescription>
          Exercise your data protection rights under GDPR and international privacy laws
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">Right to Access</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Request a copy of all personal data we hold about you
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDataExport}
              disabled={isProcessing === 'export'}
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {isProcessing === 'export' ? (
                'Processing...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900">Data Portability</h4>
                <p className="text-xs text-green-700 mt-1">
                  Receive your data in a structured, machine-readable format
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDataPortability}
              disabled={isProcessing === 'portability'}
              className="w-full border-green-300 text-green-700 hover:bg-green-100"
            >
              {isProcessing === 'portability' ? (
                'Processing...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Request Portability
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900">Right to Erasure</h4>
                <p className="text-xs text-red-700 mt-1">
                  Request deletion of your account and all associated data
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDataDeletion}
              disabled={isProcessing === 'deletion'}
              className="w-full"
            >
              {isProcessing === 'deletion' ? (
                'Processing...'
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Deletion
                </>
              )}
            </Button>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="pt-4 border-t space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Recent Requests</h4>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                      {request.type === 'export' && <FileText className="h-5 w-5 text-gray-600" />}
                      {request.type === 'portability' && <Download className="h-5 w-5 text-gray-600" />}
                      {request.type === 'deletion' && <Trash2 className="h-5 w-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getRequestTypeLabel(request.type)}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-gray-600">
                        Requested: {formatDate(request.requestedAt)}
                        {request.completedAt && ` • Completed: ${formatDate(request.completedAt)}`}
                      </p>
                    </div>
                  </div>
                  {request.status === 'completed' && request.type !== 'deletion' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Your GDPR Rights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Right to Access:</strong> Request copies of your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Right to Rectification:</strong> Request correction of inaccurate data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Right to Erasure:</strong> Request deletion of your data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Right to Data Portability:</strong> Receive your data in a portable format</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Right to Object:</strong> Object to processing of your personal data</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              For questions about your rights or to exercise them, contact our Data Protection Officer at privacy@renteasy.com
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
