'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Trash2, User, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfilePhotoManagerProps {
  userId: string;
  currentPhoto?: string;
}

export function ProfilePhotoManager({ userId, currentPhoto }: ProfilePhotoManagerProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhoto);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    setTimeout(() => {
      setPhotoUrl(previewUrl);
      setPreviewUrl(undefined);
      setIsUploading(false);
    }, 1000);
  };

  const handleRemove = () => {
    setPhotoUrl(undefined);
    setPreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPhoto = previewUrl || photoUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Photo
        </CardTitle>
        <CardDescription>Upload a profile photo to personalize your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            {previewUrl && (
              <Badge variant="default" className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                Preview
              </Badge>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Photo Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Maximum file size: 5MB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Supported formats: JPG, PNG, WebP
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Recommended: Square image (1:1 ratio)
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  Use a clear, recent photo
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!previewUrl ? (
                <>
                  <Button
                    variant="default"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  {photoUrl && (
                    <Button
                      variant="destructive"
                      onClick={handleRemove}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Photo
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isUploading ? 'Saving...' : 'Save Photo'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelPreview}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
