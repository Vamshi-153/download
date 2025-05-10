// src/components/layout/contact-us-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactUsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SUPPORT_EMAIL = 'nxtbazaar.care@gmail.com';

export function ContactUsDialog({ isOpen, onOpenChange }: ContactUsDialogProps) {
  const { toast } = useToast();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
      toast({
        title: 'Email Copied!',
        description: `${SUPPORT_EMAIL} copied to clipboard.`,
      });
    }).catch(err => {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy email to clipboard.',
        variant: 'destructive',
      });
      console.error('Failed to copy email: ', err);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" /> Contact Us
          </DialogTitle>
          <DialogDescription>
            Have questions or need assistance? We're here to help!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-1">
            For any queries, please send an email to:
          </p>
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <p className="text-sm font-medium text-foreground break-all">{SUPPORT_EMAIL}</p>
            <Button variant="ghost" size="icon" onClick={handleCopyEmail} aria-label="Copy email address">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Our support team will get back to you as soon as possible.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
