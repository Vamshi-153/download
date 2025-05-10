'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useEffect, useState, useCallback } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateCartItemQuantity, removeFromCart } = useCart();
  const { toggleWishlistItem, isInWishlist, isWishlistInitialized } = useWishlist();
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(0);

  // Function to sync with global cart state
  const syncWithCart = useCallback(() => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    setLocalQuantity(quantity);
  }, [cartItems, product.id]);

  // Sync local state with global cart state
  useEffect(() => {
    syncWithCart();
  }, [syncWithCart]);

  // Re-sync when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithCart();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncWithCart);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncWithCart);
    };
  }, [syncWithCart]);

  const handleAddToCart = () => {
    setIsCartUpdating(true);
    addToCart(product, 1);
    setLocalQuantity(1); // Immediately update local state
    setTimeout(() => setIsCartUpdating(false), 300);
  };

  const handleIncreaseQuantity = () => {
    setIsCartUpdating(true);
    const newQuantity = localQuantity + 1;
    updateCartItemQuantity(product.id, newQuantity);
    setLocalQuantity(newQuantity); // Immediately update local state
    setTimeout(() => setIsCartUpdating(false), 300);
  };

  const handleDecreaseQuantity = () => {
    setIsCartUpdating(true);
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      updateCartItemQuantity(product.id, newQuantity);
      setLocalQuantity(newQuantity); // Immediately update local state
    } else {
      removeFromCart(product.id);
      setLocalQuantity(0); // Immediately update local state
    }
    setTimeout(() => setIsCartUpdating(false), 300);
  };

  const price = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
  const originalPrice = typeof product.originalPrice === 'number' && !isNaN(product.originalPrice) ? product.originalPrice : null;
  const rating = typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating : null;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <CardHeader className="p-4">
        <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors text-lg font-bold">
          {product.name}
        </Link>
        {product.category && <Badge variant="secondary" className="mt-2">{product.category}</Badge>}
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        {product.description && (
          <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </CardDescription>
        )}
        {rating !== null && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-baseline gap-x-2">
          <span className="text-xl font-bold text-primary">₹{price.toFixed(2)}</span>
          {originalPrice !== null && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {localQuantity === 0 ? (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddToCart}
            disabled={isCartUpdating}
            className="transition-all duration-200 ease-in-out"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        ) : (
          <div className={`flex items-center gap-x-2 transition-all duration-200 ${isCartUpdating ? 'opacity-70' : 'opacity-100'}`}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDecreaseQuantity}
              disabled={isCartUpdating}
              className="p-2 h-8 w-8 flex items-center justify-center"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-base font-bold w-6 text-center">{localQuantity}</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleIncreaseQuantity}
              disabled={isCartUpdating}
              className="p-2 h-8 w-8 flex items-center justify-center"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}