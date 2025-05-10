// src/hooks/use-cart.ts
'use client';

import type { Product, CartStorageItem } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const CART_STORAGE_KEY = 'nxtbazaar-cart';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartStorageItem[]>([]);
  const [isCartInitialized, setIsCartInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse cart from localStorage:", e);
          setCartItems([]);
        }
      }
      setIsCartInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isCartInitialized && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY, newValue: JSON.stringify(cartItems) }));
    }
  }, [cartItems, isCartInitialized]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { productId: product.id, quantity }];
      }
    });
    toast({
      title: `${product.name} added to cart`,
      description: `Quantity: ${quantity}`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
    toast({
      title: 'Item removed from cart',
      variant: 'destructive',
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, newQuantityInput: number) => {
    setCartItems((prevItems) => {
      const newQuantity = Math.max(0, newQuantityInput);

      const updatedItems = prevItems
        .map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
        .filter(item => item.quantity > 0);

      return updatedItems;
    });
  }, []);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const hasItemsInCart = useCallback(() => {
    return cartItems.length > 0;
  }, [cartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: 'Cart cleared',
    });
  }, [toast]);

  const getItemQuantity = useCallback((productId: string): number => {
    const item = cartItems.find(cartItem => cartItem.productId === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartItemCount,
    hasItemsInCart,
    clearCart,
    isCartInitialized,
    getItemQuantity,
  };
}

