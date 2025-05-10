// src/components/seller/seller-home-content-editor.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const IMAGE_URL_STORAGE_KEY = 'nxtbazaar-home-image-url';
const DEFAULT_IMAGE_URL = 'https://picsum.photos/seed/storebanner/1200/240'; // Consistent with EditableHomeContent

export function SellerHomeContentEditor() {
  const [imageUrl, setImageUrl] = useState(''); // Will hold Data URL or default external URL
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedImageUrl = localStorage.getItem(IMAGE_URL_STORAGE_KEY);
    setImageUrl(storedImageUrl || DEFAULT_IMAGE_URL);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === IMAGE_URL_STORAGE_KEY) {
        setImageUrl(event.newValue || DEFAULT_IMAGE_URL);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
        event.target.value = ''; // Reset file input
        return;
      }
      // Optional: File size check (e.g., 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({ title: "File Too Large", description: `File size should not exceed ${maxSize / (1024*1024)}MB.`, variant: "destructive" });
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string); // Set Data URL to state
      };
      reader.onerror = () => {
          toast({ title: "Error Reading File", description: "Could not read the selected file.", variant: "destructive" });
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (isClient) {
      // imageUrl is now a Data URL if a file was selected, or DEFAULT_IMAGE_URL if reset.
      localStorage.setItem(IMAGE_URL_STORAGE_KEY, imageUrl);
      // Dispatch storage event to notify other components/tabs
      window.dispatchEvent(new StorageEvent('storage', { key: IMAGE_URL_STORAGE_KEY, newValue: imageUrl, storageArea: localStorage }));
      toast({
        title: "Homepage Image Saved",
        description: "Your changes to the homepage image have been saved.",
      });
    }
  };

  const handleResetToDefault = () => {
    setImageUrl(DEFAULT_IMAGE_URL); // Reset to the external default URL
    // Clear the file input
    const fileInput = document.getElementById('homeImageFile') as HTMLInputElement | null;
    if (fileInput) {
        fileInput.value = "";
    }
    if (isClient) {
      localStorage.setItem(IMAGE_URL_STORAGE_KEY, DEFAULT_IMAGE_URL);
      window.dispatchEvent(new StorageEvent('storage', { key: IMAGE_URL_STORAGE_KEY, newValue: DEFAULT_IMAGE_URL, storageArea: localStorage }));
      toast({
        title: "Image Reset",
        description: "Homepage image has been reset to default.",
        variant: "destructive"
      });
    }
  };
  
  if (!isClient) {
      return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" /> {/* Label for Image URL */}
            <Skeleton className="h-10 w-full" /> {/* Input for Image URL */}
            <Skeleton className="h-40 w-full" /> {/* Image Preview */}
            <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-32" /> {/* Reset Button */}
                <Skeleton className="h-10 w-32" /> {/* Save Button */}
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-6">
        <div>
            <Label htmlFor="homeImageFile" className="text-base font-semibold">Featured Image</Label>
            <p className="text-sm text-muted-foreground mb-2">Select an image from your device (Recommended aspect ratio around 5:1, e.g., 1200x240px).</p>
            <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                    id="homeImageFile"
                    type="file"
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="h-10"
                />
            </div>
            {imageUrl && (
            <div className="mt-3 rounded-md overflow-hidden border aspect-[5/1] max-h-[150px] w-full relative bg-muted">
                <Image 
                    src={imageUrl} 
                    alt="Homepage Image Preview" 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint="homepage banner preview"
                    onError={(e) => {
                        // If the Data URL is broken or the default external URL fails
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/errorbanner/1200/240'; 
                        (e.target as HTMLImageElement).alt = 'Error loading image preview';
                    }}
                    key={imageUrl} // Key to force re-render if URL changes
                />
            </div>
            )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
        <Button variant="outline" onClick={handleResetToDefault}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset to Default
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Homepage Image
        </Button>
      </div>
    </div>
  );
}
