/**
 * AccountSettings Component
 *
 * Manages account deletion with proper confirmation and warnings.
 * Located in the "Danger Zone" section of settings.
 */

import React, { memo, useState, useCallback } from 'react';
import {
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

// Types
export type AccountAction =
  | 'change-password'
  | 'enable-2fa'
  | 'disable-2fa'
  | 'view-sessions'
  | 'deactivate-account'
  | 'delete-account';

interface AccountSettingsProps {
  onAccountAction: (action: AccountAction, data?: any) => Promise<void>;
  loading?: boolean;
}

export const AccountSettings = memo<AccountSettingsProps>(({
  onAccountAction,
  loading = false
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (confirmationText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await onAccountAction('delete-account');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setConfirmationText('');
    }
  }, [confirmationText, onAccountAction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-1">Delete Account</h4>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. This will permanently
                delete your profile, booking history, saved properties, and all associated data.
              </p>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 mb-2">
                        <strong>This will delete:</strong>
                      </p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        <li>Your profile and personal information</li>
                        <li>All booking history and reviews</li>
                        <li>Saved properties and preferences</li>
                        <li>Messages and communication history</li>
                      </ul>
                    </div>
                    <div>
                      <Label htmlFor="confirmation" className="text-sm font-medium">
                        To confirm, type <strong>DELETE</strong> in the box below:
                      </Label>
                      <Input
                        id="confirmation"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setConfirmationText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={confirmationText !== 'DELETE' || isDeleting}
                    >
                      {isDeleting && <LoadingSpinner size="sm" className="mr-2" />}
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AccountSettings.displayName = 'AccountSettings';

export default AccountSettings;
