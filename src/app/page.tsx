'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';
import { ProductSearch } from '@/components/product/product-search';
import { ProductFilter } from '@/components/product/product-filter';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X, Menu as MenuIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EditableHomeContent } from '@/components/content/editable-home-content';
import type { Product } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

async function fetchProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const querySnapshot = await getDocs(productsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

async function fetchAllCategories(): Promise<string[]> {
  const categoriesRef = collection(db, 'categories'); 
  const querySnapshot = await getDocs(categoriesRef);
  return querySnapshot.docs.map(doc => doc.id);
}

export default function Home() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false); 
  const [isSeller, setIsSeller] = useState(false);
  const [isClientForSellerCheck, setIsClientForSellerCheck] = useState(false);

  const loadProductsAndCategories = useCallback(async () => {
    setIsLoading(true);
    
    const fetchedProducts = await fetchProducts();
    const fetchedCategories = await fetchAllCategories();
    
    setProducts(fetchedProducts);
    setAllCategories(fetchedCategories);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsClientForSellerCheck(true);
    const sellerStatus = localStorage.getItem('isSeller') === 'true';
    setIsSeller(sellerStatus);
  }, []);

  useEffect(() => {
    loadProductsAndCategories();
  }, [searchParams, loadProductsAndCategories]);

  // Listen for product changes from localStorage (e.g., from seller dashboard)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nxtbazaar-all-products') {
        console.log('Product data changed in storage, reloading products...');
        loadProductsAndCategories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadProductsAndCategories]);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <MenuIcon className="h-4 w-4" />
                  <span className="sr-only">Product Categories</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Browse Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => console.log("All Products selected")}>All Products</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("Hot Deals selected")}>Hot Deals</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("Flat 50% selected")}>Flat 50%</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("BOGO selected")}>BOGO</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0 h-10 px-3"
            >
                {showFilters ? <X className="mr-2 h-4 w-4" /> : <SlidersHorizontal className="mr-2 h-4 w-4" />}
                Filters
            </Button>
        </div>
        <div className="w-full md:flex-grow md:max-w-xl lg:max-w-2xl">
          <ProductSearch />
        </div>
      </div>

      {isClientForSellerCheck && <EditableHomeContent isSeller={isSeller} />}

      <div className="flex flex-row gap-6 items-start">
        <div
          className={cn(
            "sticky top-24 transition-all duration-300 ease-in-out", 
            "md:w-72 lg:w-80 shrink-0", 
            showFilters ? "block w-full md:w-72 lg:w-80" : "hidden md:block md:w-0 md:opacity-0 md:invisible", 
            showFilters && "md:opacity-100 md:visible"
          )}
          style={{
            width: showFilters ? undefined : '0px',
            marginRight: showFilters ? undefined : '-1.5rem', 
            overflow: showFilters ? 'visible' : 'hidden',
          }}
        >
          {isClientForSellerCheck && <ProductFilter categories={allCategories} />}
        </div>

        <section className={cn(
          "flex-grow transition-all duration-300 ease-in-out w-full",
        )}>
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({length: 8}).map((_, idx) => (
                    <div key={idx} className="border rounded-lg p-4 shadow-sm bg-card">
                        <Skeleton className="h-48 w-full rounded mb-2" />
                        <Skeleton className="h-6 w-3/4 rounded mb-1" />
                        <Skeleton className="h-4 w-1/2 rounded mb-2" />
                        <div className="flex justify-between items-center mt-3">
                            <Skeleton className="h-8 w-1/4 rounded" />
                            <Skeleton className="h-8 w-1/3 rounded" />
                        </div>
                    </div>
                ))}
             </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center col-span-full">
                 <SlidersHorizontal className="w-12 h-12 text-muted-foreground mb-4" />
                 <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                 <p className="text-muted-foreground">
                   Try adjusting your filters or search term.
                 </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
