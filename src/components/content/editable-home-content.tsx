// src/components/content/editable-home-content.tsx
'use client';

import { useState, useEffect }from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, XCircle, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const IMAGE_URL_STORAGE_KEY = 'nxtbazaar-home-image-url';
const DEFAULT_IMAGE_URL = 'https://picsum.photos/seed/storebanner/1200/240';

interface EditableHomeContentProps {
  isSeller: boolean;
}

export function EditableHomeContent({ isSeller }: EditableHomeContentProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedImageUrl = localStorage.getItem(IMAGE_URL_STORAGE_KEY);
    const initialImageUrl = storedImageUrl || DEFAULT_IMAGE_URL;

    setImageUrl(initialImageUrl);
    setTempImageUrl(initialImageUrl); // Initialize tempImageUrl as well

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === IMAGE_URL_STORAGE_KEY) {
        const newStoredUrl = event.newValue || DEFAULT_IMAGE_URL;
        setImageUrl(newStoredUrl);
        if (!editMode) { // Only update tempImageUrl if not currently editing
          setTempImageUrl(newStoredUrl);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [editMode]);

  const handleEdit = () => {
    setTempImageUrl(imageUrl); // Ensure tempImageUrl is current when starting edit
    setEditMode(true);
  };

  const handleSave = () => {
    setImageUrl(tempImageUrl);
    if (isClient) {
      localStorage.setItem(IMAGE_URL_STORAGE_KEY, tempImageUrl);
      window.dispatchEvent(new StorageEvent('storage', { key: IMAGE_URL_STORAGE_KEY, newValue: tempImageUrl, storageArea: localStorage }));
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempImageUrl(imageUrl); // Reset temp to current saved value on cancel
    setEditMode(false);
  };

  if (!isClient) {
    return (
      <Card className="my-6 shadow-sm overflow-hidden">
        <Skeleton className="h-[240px] w-full" />
      </Card>
    );
  }

  return (
    <Card className="my-6 shadow-sm overflow-hidden">
      {editMode && isSeller ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Edit Store Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="home-image-url-editable-content" className="text-sm font-medium">Image URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="home-image-url-editable-content"
                    type="url"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-9"
                  />
                </div>
                {tempImageUrl && (
                  <div className="mt-2 rounded-md overflow-hidden border h-[160px] w-full relative bg-muted">
                    <Image
                      src={tempImageUrl}
                      alt="Preview"
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="store banner preview"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/seed/errorimg/400/160';
                        target.alt = 'Error loading image preview';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save Image
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      ) : (
        // Display mode: Image fills the card content area
        <CardContent className="p-0 relative h-[240px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Store banner"
              layout="fill"
              objectFit="cover"
              data-ai-hint="store banner image"
              onError={() => {
                if (isClient) setImageUrl(DEFAULT_IMAGE_URL);
              }}
              key={imageUrl} // Key to force re-render on src change
            />
          ) : (
             <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {isSeller && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="absolute top-3 right-3 bg-background/80 hover:bg-background"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Image
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
