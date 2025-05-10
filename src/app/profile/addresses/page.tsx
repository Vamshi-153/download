// src/app/profile/addresses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAddress } from '@/hooks/use-address';
import type { Address } from '@/types';
import { AddressForm, type AddressFormValues } from '@/components/address/address-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const parseFullPhoneNumberForForm = (fullNumber?: string): { countryCode?: string, localPhoneNumber?: string } => {
  if (!fullNumber) return { countryCode: '+91', localPhoneNumber: '' }; // Default to India +91
  const knownCountryCodes = ['+91', '+1', '+44', '+61', '+49', '+81', '+33', '+86', '+55', '+27']; 
  for (const code of knownCountryCodes) {
    if (fullNumber.startsWith(code)) {
      return { countryCode: code, localPhoneNumber: fullNumber.substring(code.length) };
    }
  }
  const genericMatch = fullNumber.match(/^(\+\d{1,3})(\d+)$/);
  if (genericMatch) {
    return { countryCode: genericMatch[1], localPhoneNumber: genericMatch[2] };
  }
  return { countryCode: '+91', localPhoneNumber: fullNumber };
};


export default function AddressesPage() {
  const { addresses, addAddress, removeAddress, updateAddress, setDefaultAddress, isAddressInitialized } = useAddress();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
    if (!loggedInStatus) {
      router.push('/login?redirect=/profile/addresses');
    }
  }, [router]);

  const handleAddSubmit = (data: Omit<Address, 'id' | 'userId'>) => {
    addAddress(data); 
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = (data: Omit<Address, 'id' | 'userId'>) => {
    if (editingAddress) {
      updateAddress({ ...editingAddress, ...data });
      setEditingAddress(null);
      setIsAddDialogOpen(false);
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAddress(null);
    setIsAddDialogOpen(false);
  };

  if (!isClient || !isAddressInitialized || !isLoggedIn) {
    return <div className="container mx-auto py-8 text-center">Loading addresses...</div>;
  }

  const getFormDefaultValues = (): Partial<AddressFormValues & { phoneNumber?: string }> => {
    if (editingAddress) {
      const { countryCode, localPhoneNumber } = parseFullPhoneNumberForForm(editingAddress.phoneNumber);
      return {
        ...editingAddress, // This includes 'country'
        countryCode: countryCode,
        localPhoneNumber: localPhoneNumber,
        phoneNumber: editingAddress.phoneNumber 
      };
    }
    return { isDefault: addresses.length === 0, countryCode: '+91', country: '' }; // Default for new address
  };


  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                </Link>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) closeDialog(); else setIsAddDialogOpen(true);
            }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-6">
                <div className="pr-1 py-4">
                  <AddressForm
                    onSubmit={editingAddress ? handleEditSubmit : handleAddSubmit}
                    defaultValues={getFormDefaultValues()}
                    submitButtonText={editingAddress ? 'Save Changes' : 'Add Address'}
                    showDefaultCheckbox={true}
                  />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">You have no saved addresses.</p>
            <p className="text-sm text-muted-foreground mt-1">Add an address to speed up checkout.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {addresses.map((address) => (
            <Card key={address.id} className={`shadow-md ${address.isDefault ? 'border-primary border-2' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {address.fullName}
                    {address.isDefault && <span className="text-xs text-primary font-normal ml-2">(Default)</span>}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(address)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this address. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { removeAddress(address.id); toast({ title: 'Address Deleted', description: 'The address has been removed.', variant: 'destructive'});}} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>{address.streetAddress}</p>
                {address.apartmentSuite && <p>{address.apartmentSuite}</p>}
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
                <p>Phone: {address.phoneNumber}</p>
              </CardContent>
              {!address.isDefault && (
                <CardContent className="pt-0">
                    <Button variant="outline" size="sm" onClick={() => setDefaultAddress(address.id)}>
                        Set as Default
                    </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

