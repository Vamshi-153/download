// src/app/checkout/address/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAddress } from '@/hooks/use-address';
import type { Address } from '@/types';
import { AddressForm, type AddressFormValues } from '@/components/address/address-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ArrowLeft, Edit } from 'lucide-react';
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


export default function CheckoutAddressPage() {
  const { 
    addresses, 
    addAddress, 
    updateAddress,
    selectedCheckoutAddressId, 
    setSelectedCheckoutAddressId, 
    isAddressInitialized, 
  } = useAddress();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    setIsClient(true);
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail');
    setIsLoggedIn(loggedInStatus);
    if (!loggedInStatus) {
      router.push('/login?redirect=/checkout/address');
    } else if (!email) {
      router.push('/login?redirect=/checkout/address');
    }
  }, [router]);

  useEffect(() => {
    if (isAddressInitialized && addresses.length > 0 && !selectedCheckoutAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedCheckoutAddressId(defaultAddress.id);
    }
  }, [isAddressInitialized, addresses, selectedCheckoutAddressId, setSelectedCheckoutAddressId]);

  const handleAddSubmit = (data: Omit<Address, 'id' | 'userId'>) => {
    addAddress(data); 
    setIsAddDialogOpen(false);
  };
  
  const handleEditSubmit = (data: Omit<Address, 'id' | 'userId'>) => {
    if (editingAddress) {
      updateAddress({ ...editingAddress, ...data, isDefault: data.isDefault ?? editingAddress.isDefault });
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

  const handleProceedToPayment = () => {
    if (selectedCheckoutAddressId) {
      router.push('/checkout/payment');
    } else {
      alert('Please select a shipping address.');
    }
  };

  if (!isClient || !isAddressInitialized || !isLoggedIn) {
    return <div className="container mx-auto py-8 text-center">Loading address selection...</div>;
  }
  
  const getFormDefaultValues = (): Partial<AddressFormValues & { phoneNumber?: string }> => {
    if (editingAddress) {
      const { countryCode, localPhoneNumber } = parseFullPhoneNumberForForm(editingAddress.phoneNumber);
      return {
        ...editingAddress, // This will include 'country' if it exists on editingAddress
        countryCode: countryCode,
        localPhoneNumber: localPhoneNumber,
        phoneNumber: editingAddress.phoneNumber 
      };
    }
    return { isDefault: addresses.length === 0, countryCode: '+91', country: '' }; // Default for new address
  };


  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shipping Address</h1>
        <Button variant="outline" asChild>
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select or Add Shipping Address</CardTitle>
          <CardDescription>Choose where you'd like your order to be delivered.</CardDescription>
        </CardHeader>
        <CardContent>
          {addresses.length > 0 && (
            <RadioGroup value={selectedCheckoutAddressId || ''} onValueChange={setSelectedCheckoutAddressId} className="mb-6">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                {addresses.map((address) => (
                  <Label
                    key={address.id}
                    htmlFor={`address-${address.id}`}
                    className={`flex flex-col items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition-all
                                ${selectedCheckoutAddressId === address.id ? 'border-primary ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mr-3" />
                            <div className="text-sm">
                                <p className="font-medium">{address.fullName} {address.isDefault && <span className="text-xs text-primary font-normal ml-1">(Default)</span>}</p>
                                <p className="text-muted-foreground">{address.streetAddress}, {address.apartmentSuite && `${address.apartmentSuite}, `}{address.city}, {address.state} {address.zipCode}</p>
                                <p className="text-muted-foreground">{address.country}</p>
                                <p className="text-muted-foreground">{address.phoneNumber}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditDialog(address); }} className="h-7 w-7 shrink-0">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                  </Label>
                ))}
                </div>
              </ScrollArea>
            </RadioGroup>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) closeDialog(); else setIsAddDialogOpen(true);
            }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {addresses.length > 0 ? 'Add Another Address' : 'Add New Address'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                 <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Shipping Address'}</DialogTitle>
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

          {addresses.length === 0 && !isAddDialogOpen && (
            <p className="text-muted-foreground text-center my-4">
              You have no saved addresses. Please add one to continue.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button 
            size="lg" 
            onClick={handleProceedToPayment} 
            disabled={!selectedCheckoutAddressId || addresses.length === 0}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
