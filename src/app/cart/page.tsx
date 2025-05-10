// src/app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import type { Product, CartDisplayItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProductById } from '@/lib/data/product'; 

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartItemCount, isCartInitialized } = useCart();
  const [displayItems, setDisplayItems] = useState<CartDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const router = useRouter();
  const [productDetailsCache, setProductDetailsCache] = useState<Record<string, Product>>({});


  useEffect(() => {
    if (typeof window !== 'undefined') {
        setIsUserLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);

  // Effect 1: Fetch product details for items in cart that are not yet in productDetailsCache
  useEffect(() => {
    if (!isCartInitialized) return;

    const idsToFetch = cartItems
      .map(item => item.productId)
      .filter(id => !productDetailsCache[id]);

    if (idsToFetch.length > 0) {
      const fetchDetails = async () => {
        try {
          const fetchedDetailsPromises = idsToFetch.map(id => fetchProductById(id));
          const fetchedDetailsArray = (await Promise.all(fetchedDetailsPromises)).filter(Boolean) as Product[];
          
          if (fetchedDetailsArray.length > 0) {
            setProductDetailsCache(prevCache => {
              const newCacheEntries: Record<string, Product> = {};
              let hasNewEntries = false;
              fetchedDetailsArray.forEach(p => {
                if (p && (!prevCache[p.id])) { // Add if new
                  newCacheEntries[p.id] = p;
                  hasNewEntries = true;
                }
              });
              return hasNewEntries ? { ...prevCache, ...newCacheEntries } : prevCache;
            });
          }
        } catch (error) {
          console.error("Failed to fetch product details:", error);
          // Consider setting an error state to inform the user
        }
      };
      fetchDetails();
    } else if (cartItems.length === 0 && Object.keys(productDetailsCache).length > 0) {
      // Cart is empty, clear the cache if it's not already empty
      setProductDetailsCache({});
    }
  }, [cartItems, isCartInitialized]); // productDetailsCache is NOT a dependency here to prevent loops

  // Effect 2: Update displayItems and global isLoading state based on cartItems and productDetailsCache
  useEffect(() => {
    if (!isCartInitialized) {
      setIsLoading(true); // Not initialized, so consider it loading
      return;
    }

    if (cartItems.length === 0) {
      setDisplayItems([]);
      setIsLoading(false); // Cart is empty, not loading
      return;
    }

    // Determine if we are still waiting for details for any item in the cart
    const currentlyWaitingForDetails = cartItems.some(item => !productDetailsCache[item.productId]);
    setIsLoading(currentlyWaitingForDetails);

    // Always try to build displayItems with what's available in the cache
    // Product details are only added if they exist in the cache
    const newDisplayItems = cartItems
      .map(cartItem => {
        const productDetail = productDetailsCache[cartItem.productId];
        if (productDetail) { 
          return { ...productDetail, quantity: cartItem.quantity };
        }
        return null; 
      })
      .filter(Boolean) as CartDisplayItem[]; 
    
    setDisplayItems(newDisplayItems);

  }, [cartItems, productDetailsCache, isCartInitialized]);


  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantityNum = parseInt(newQuantity, 10);
    if (!isNaN(quantityNum)) {
      updateQuantity(productId, quantityNum);
    }
  };

  const handleProceedToCheckout = () => {
    if (isUserLoggedIn) {
      router.push('/checkout/address');
    } else {
      router.push('/login?redirect=/checkout/address');
    }
  };

  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = getCartItemCount();


  // Initial loading state before cart is initialized or if cart has items but displayItems are not yet ready
  if (!isCartInitialized || (isLoading && cartItems.length > 0 && displayItems.length < cartItems.length) ) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Show skeletons based on cartItems length if we are loading */}
                {Array.from({ length: cartItems.length > 0 ? cartItems.length : 2 }).map((_, index) => (
                  <TableRow key={`skeleton-init-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-16 w-16 rounded" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-3 p-6 bg-muted/50">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-48" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (itemCount === 0 && !isLoading) { // Check !isLoading here
    return (
      <div className="container mx-auto py-12 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" /> Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Remove</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Display actual items first */}
              {displayItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://picsum.photos/seed/placeholder-cart/64/64'}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                        data-ai-hint={item.dataAiHint || "product image"}
                      />
                      <div>
                        <Link href={`/product/${item.id}`} className="font-medium hover:text-primary">
                          {item.name}
                        </Link>
                        {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-20 mx-auto h-9 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Skeleton rows for items in cartItems but not yet in displayItems (details still loading) */}
              {isLoading && cartItems.length > displayItems.length && 
                Array.from({ length: cartItems.length - displayItems.length }).map((_, index) => (
                  <TableRow key={`skeleton-loading-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-16 w-16 rounded" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 bg-muted/50 space-y-4 sm:space-y-0">
          <div className="text-lg">
            Subtotal: <span className="font-bold text-xl">₹{subtotal.toFixed(2)}</span>
          </div>
          <Button size="lg" className="w-full sm:w-auto" onClick={handleProceedToCheckout} disabled={isLoading && displayItems.length < cartItems.length}>
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
