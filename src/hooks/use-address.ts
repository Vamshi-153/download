// src/hooks/use-address.ts
'use client';

import type { Address } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const getAddressStorageKey = (userEmail: string | null) => userEmail ? `nxtbazaar-addresses-${userEmail}` : null;
const SELECTED_CHECKOUT_ADDRESS_ID_KEY = 'nxtbazaar-selected-checkout-address-id';

export function useAddress() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedCheckoutAddressId, setSelectedCheckoutAddressId] = useState<string | null>(null);
  const [isAddressInitialized, setIsAddressInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      setUserEmail(email);

      if (email) {
        const storageKey = getAddressStorageKey(email);
        if (storageKey) {
          const storedAddresses = localStorage.getItem(storageKey);
          if (storedAddresses) {
            setAddresses(JSON.parse(storedAddresses));
          }
        }
      }
      
      const storedSelectedId = sessionStorage.getItem(SELECTED_CHECKOUT_ADDRESS_ID_KEY);
      if (storedSelectedId) {
        setSelectedCheckoutAddressId(storedSelectedId);
      }
      setIsAddressInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isAddressInitialized && typeof window !== 'undefined' && userEmail) {
      const storageKey = getAddressStorageKey(userEmail);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(addresses));
      }
    }
  }, [addresses, userEmail, isAddressInitialized]);

  useEffect(() => {
    if (isAddressInitialized && typeof window !== 'undefined') {
      if (selectedCheckoutAddressId) {
        sessionStorage.setItem(SELECTED_CHECKOUT_ADDRESS_ID_KEY, selectedCheckoutAddressId);
      } else {
        sessionStorage.removeItem(SELECTED_CHECKOUT_ADDRESS_ID_KEY);
      }
    }
  }, [selectedCheckoutAddressId, isAddressInitialized]);

  const getAddresses = useCallback(() => {
    return addresses;
  }, [addresses]);

  const addAddress = useCallback((newAddressData: Omit<Address, 'id' | 'userId'>) => {
    if (!userEmail) {
      toast({ title: "Error", description: "User not logged in.", variant: "destructive" });
      return;
    }
    if (typeof newAddressData.phoneNumber === 'undefined') {
        toast({ title: "Error", description: "Phone number is required.", variant: "destructive"});
        return;
    }
    if (typeof newAddressData.country === 'undefined' || !newAddressData.country.trim()) {
      toast({ title: "Error", description: "Country is required.", variant: "destructive"});
      return;
    }

    const newAddress: Address = {
      ...newAddressData, // This now includes 'country' from the form
      id: crypto.randomUUID(),
      isDefault: newAddressData.isDefault ?? addresses.length === 0,
    };

    setAddresses(prev => {
        let updatedAddresses;
        if (newAddress.isDefault) {
            updatedAddresses = [newAddress, ...prev.map(addr => ({ ...addr, isDefault: false }))];
        } else {
            updatedAddresses = [...prev, newAddress];
        }
        if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
            updatedAddresses[0].isDefault = true;
        }
        return updatedAddresses;
    });
    toast({ title: "Address Added", description: "New address has been saved." });
  }, [userEmail, toast, addresses.length]);

  const removeAddress = useCallback((addressId: string) => {
    setAddresses(prev => {
      const updatedAddresses = prev.filter(addr => addr.id !== addressId);
      if (updatedAddresses.length > 0 && prev.find(a => a.id === addressId)?.isDefault) {
        if (!updatedAddresses.some(a => a.isDefault)) { 
             updatedAddresses[0].isDefault = true; 
        }
      }
      return updatedAddresses;
    });
    if (selectedCheckoutAddressId === addressId) {
      setSelectedCheckoutAddressId(null);
    }
  }, [selectedCheckoutAddressId]);

  const updateAddress = useCallback((updatedAddress: Address) => {
     if (typeof updatedAddress.phoneNumber === 'undefined') {
        toast({ title: "Error", description: "Phone number is required for update.", variant: "destructive"});
        return;
    }
    if (typeof updatedAddress.country === 'undefined' || !updatedAddress.country.trim()) {
        toast({ title: "Error", description: "Country is required for update.", variant: "destructive"});
        return;
    }
    setAddresses(prev => prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : (updatedAddress.isDefault ? {...addr, isDefault: false} : addr) ));
    toast({ title: "Address Updated" });
  }, [toast]);
  
  const setDefaultAddress = useCallback((addressId: string) => {
     setAddresses(prev => prev.map(addr => ({
         ...addr,
         isDefault: addr.id === addressId
     })));
     toast({ title: "Default address updated." });
  }, [toast]);

  const getSelectedCheckoutAddress = useCallback((): Address | undefined => {
    if (!selectedCheckoutAddressId) return undefined;
    return addresses.find(addr => addr.id === selectedCheckoutAddressId);
  }, [addresses, selectedCheckoutAddressId]);

  const clearSelectedCheckoutAddress = useCallback(() => {
    setSelectedCheckoutAddressId(null);
  }, []);

  return {
    addresses,
    getAddresses,
    addAddress,
    removeAddress,
    updateAddress,
    setDefaultAddress,
    selectedCheckoutAddressId,
    setSelectedCheckoutAddressId,
    getSelectedCheckoutAddress,
    clearSelectedCheckoutAddress,
    isAddressInitialized,
    userEmail,
  };
}

