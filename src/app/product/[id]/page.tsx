// src/app/product/[id]/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart as ShoppingCartIcon, Heart, MessageCircle, Plus, Minus } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import type { Product, Review } from '@/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
// Remove toast import since it was causing an error

async function getProduct(id: string): Promise<Product | null> {
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) {
    return null;
  }

  return productSnap.data() as Product;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>(); 
  const id = params.id; 

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, updateQuantity, getItemQuantity, cartItems } = useCart();
  const { toggleWishlistItem, isInWishlist, isWishlistInitialized } = useWishlist();
  const router = useRouter();
  const [itemQuantityInCart, setItemQuantityInCart] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Memoized function to sync quantity from cart
  const syncCartQuantity = useCallback(() => {
    if (product && product.id) {
      const quantity = getItemQuantity(product.id);
      setItemQuantityInCart(quantity);
    }
  }, [product, getItemQuantity]);

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      setIsLoading(true);
      const fetchedProduct = await getProduct(id);
      if (!fetchedProduct) {
        notFound();
      } else {
        setProduct(fetchedProduct);
      }
      setIsLoading(false);
    };

    loadProduct();
  }, [id]); 

  // Additional function to manually force sync with global cart state
  const forceSyncWithCart = useCallback(() => {
    if (product && product.id) {
      // Get the quantity directly from the cart state
      const updatedQuantity = getItemQuantity(product.id);
      if (updatedQuantity !== itemQuantityInCart) {
        setItemQuantityInCart(updatedQuantity);
      }
    }
  }, [product, getItemQuantity, itemQuantityInCart]);

  // Run forceSyncWithCart on first render and when cart items change
  useEffect(() => {
    forceSyncWithCart();
  }, [forceSyncWithCart, cartItems]);

  // Sync cart when the component becomes visible again (e.g., after navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncCartQuantity();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncCartQuantity);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncCartQuantity);
    };
  }, [syncCartQuantity]);

  // Force sync cart when the window loads or reloads
  useEffect(() => {
    window.addEventListener('load', syncCartQuantity);
    return () => window.removeEventListener('load', syncCartQuantity);
  }, [syncCartQuantity]);

  const handleInitialAddToCart = () => {
    if (product) {
      setIsAddingToCart(true);
      addToCart(product, 1);
      // Immediately update the local state for a more responsive feel
      setItemQuantityInCart(1);
      // Success feedback without toast
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  const handleIncreaseQuantity = () => {
    if (product) {
      const newQuantity = itemQuantityInCart + 1;
      updateQuantity(product.id, newQuantity);
      // Immediately update the local state for a more responsive feel
      setItemQuantityInCart(newQuantity);
    }
  };

  const handleDecreaseQuantity = () => {
    if (product) {
      const newQuantity = Math.max(0, itemQuantityInCart - 1);
      updateQuantity(product.id, newQuantity);
      // Immediately update the local state for a more responsive feel
      setItemQuantityInCart(newQuantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      if (itemQuantityInCart === 0) {
        addToCart(product, 1);
        setItemQuantityInCart(1);
      }
      router.push('/cart');
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlistItem(product);
    }
  };

  const isProductInWishlist = product && isWishlistInitialized && isInWishlist(product.id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <Skeleton className="h-10 w-full rounded" />
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto py-12 text-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center">
        {product.category && (
          <Badge variant="outline" className="mb-2">{product.category}</Badge>
        )}
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex items-center space-x-2 text-muted-foreground my-4">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{product.rating?.toFixed(1)}</span>
          {product.reviews?.length && (
            <span>({product.reviews.length} reviews)</span>
          )}
        </div>
        <p className="text-muted-foreground">{product.description}</p>

        <div className="my-6 flex items-baseline gap-x-2">
          <span className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xl text-muted-foreground line-through">
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {itemQuantityInCart > 0 ? (
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Button variant="outline" size="icon" onClick={handleDecreaseQuantity} disabled={isAddingToCart}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg min-w-8 text-center font-medium">{itemQuantityInCart}</span>
              <Button variant="outline" size="icon" onClick={handleIncreaseQuantity} disabled={isAddingToCart}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleInitialAddToCart} disabled={isAddingToCart}>
              <ShoppingCartIcon className="mr-2 h-5 w-5" /> 
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
          )}
          <Button variant="outline" onClick={handleBuyNow} disabled={isAddingToCart}>Buy Now</Button>
          <Button 
            variant="ghost" 
            className={isProductInWishlist ? "text-destructive" : "text-muted-foreground"}
            onClick={handleToggleWishlist}
            disabled={isAddingToCart}
          >
            <Heart className={isProductInWishlist ? "fill-destructive" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
}