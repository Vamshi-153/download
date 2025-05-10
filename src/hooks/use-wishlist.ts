// src/hooks/use-wishlist.ts
'use client';

import type { Product, WishlistItem } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const WISHLIST_STORAGE_KEY_PREFIX = 'nxtbazaar-wishlist-';

const getWishlistStorageKey = (): string | null => {
  if (typeof window !== 'undefined') {
    const userEmail = localStorage.getItem('userEmail');
    return userEmail ? `${WISHLIST_STORAGE_KEY_PREFIX}${userEmail}` : null;
  }
  return null;
};


export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isWishlistInitialized, setIsWishlistInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getWishlistStorageKey();
      if (storageKey) {
        const storedWishlist = localStorage.getItem(storageKey);
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        }
      }
      setIsWishlistInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isWishlistInitialized && typeof window !== 'undefined') {
      const storageKey = getWishlistStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
      }
    }
  }, [wishlistItems, isWishlistInitialized]);

  const toggleWishlistItem = useCallback((product: Product) => {
    setWishlistItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.productId === product.id);
      if (existingItemIndex > -1) {
        // Item exists, remove it
        setTimeout(() => {
          toast({
            title: `${product.name} removed from wishlist`,
            variant: 'destructive'
          });
        }, 0);
        return prevItems.filter((item) => item.productId !== product.id);
      } else {
        // Item does not exist, add it
        setTimeout(() => {
          toast({
            title: `${product.name} added to wishlist`,
          });
        }, 0);
        return [...prevItems, { productId: product.id, addedAt: Date.now() }];
      }
    });
  }, [toast]);

  const removeFromWishlist = useCallback((productId: string, productName?: string) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
    if (productName) {
        setTimeout(() => {
            toast({
                title: `${productName} removed from wishlist`,
                variant: 'destructive'
            });
        }, 0);
    }
  }, [toast]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.some((item) => item.productId === productId);
  }, [wishlistItems]);

  const getWishlistItemCount = useCallback((): number => {
    return wishlistItems.length;
  }, [wishlistItems]);
  
  const getWishlistStorageItems = useCallback((): WishlistItem[] => {
    return wishlistItems;
  }, [wishlistItems]);

  return {
    wishlistItems: getWishlistStorageItems(),
    toggleWishlistItem,
    removeFromWishlist,
    isInWishlist,
    getWishlistItemCount,
    isWishlistInitialized,
  };
}
