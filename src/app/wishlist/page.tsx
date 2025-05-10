// src/app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import type { Product, WishlistDisplayItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart, HeartCrack, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProductById } from '@/lib/data/product';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, getWishlistItemCount, isWishlistInitialized } = useWishlist();
  const { addToCart } = useCart();
  const [displayItems, setDisplayItems] = useState<WishlistDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedInStatus) {
      router.push('/login?redirect=/wishlist');
    }
  }, [router]);
  
  useEffect(() => {
    if (isWishlistInitialized) {
      const fetchDisplayItems = async () => {
        setIsLoading(true);
        const detailedItems: WishlistDisplayItem[] = [];
        for (const item of wishlistItems) {
          const productDetails = await fetchProductById(item.productId);
          if (productDetails) {
            detailedItems.push({ ...productDetails, addedAt: item.addedAt });
          }
        }
        detailedItems.sort((a, b) => b.addedAt - a.addedAt);
        setDisplayItems(detailedItems);
        setIsLoading(false);
      };
      fetchDisplayItems();
    }
  }, [wishlistItems, isWishlistInitialized]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const itemCount = getWishlistItemCount();

  if (!isWishlistInitialized || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Wishlist</h1>
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
                  <TableHead className="w-3/5">Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 2 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-16 w-16 rounded" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-8 inline-block" />
                        <Skeleton className="h-8 w-24 inline-block" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">
          Start adding products you love to your wishlist!
        </p>
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" /> Discover Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Wishlist ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
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
                <TableHead className="w-3/5">Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://picsum.photos/seed/placeholder-wishlist/64/64'}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                        data-ai-hint={item.dataAiHint || "wishlist product"}
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
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWishlist(item.id, item.name)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove from wishlist</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
