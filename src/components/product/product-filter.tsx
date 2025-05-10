// src/components/product/product-filter.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductFilterProps {
  maxPriceDefault?: number;
  className?: string;
}

export function ProductFilter({ maxPriceDefault = 1000, className }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceDefault]);

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    const categoryCollection = collection(db, 'categories');
    const querySnapshot = await getDocs(categoryCollection);
    setCategories(querySnapshot.docs.map(doc => doc.id));
    setIsLoadingCategories(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    setSelectedCategories(params.getAll('category') || []);
    setPriceRange([
      Number(params.get('minPrice')) || 0,
      Number(params.get('maxPrice')) || maxPriceDefault,
    ]);
  }, [searchParams, maxPriceDefault]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, category] : prev.filter(c => c !== category)
    );
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  const applyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.delete('category');
    selectedCategories.forEach(category => current.append('category', category));

    if (priceRange[0] > 0) {
      current.set('minPrice', priceRange[0].toString());
    } else {
      current.delete('minPrice');
    }

    if (priceRange[1] < maxPriceDefault) {
      current.set('maxPrice', priceRange[1].toString());
    } else {
      current.delete('maxPrice');
    }

    const searchQuery = searchParams.get('query');
    if (searchQuery) {
      current.set('query', searchQuery);
    } else {
      current.delete('query');
    }

    const query = current.toString() ? `?${current.toString()}` : '';
    router.push(`/${query}`, { scroll: false });
  };

  const clearFilters = () => {
    const current = new URLSearchParams();
    const searchQuery = searchParams.get('query');
    if (searchQuery) {
      current.set('query', searchQuery);
    }

    router.push(searchQuery ? `/?${current.toString()}` : '/', { scroll: false });
    setSelectedCategories([]);
    setPriceRange([0, maxPriceDefault]);
  };

  return (
    <div className={`p-4 border rounded-lg bg-card shadow-sm h-full flex flex-col ${className}`}>
      <h3 className="text-lg font-semibold mb-4 px-1">Filters</h3>
      <div className="space-y-6 flex-grow">
        <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
          <AccordionItem value="category">
            <AccordionTrigger className="text-sm px-1">Category</AccordionTrigger>
            <AccordionContent className="px-1">
              {isLoadingCategories ? (
                <Skeleton className="h-5 w-full" />
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-filter-${category.replace(/\s+/g, '-')}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      />
                      <Label htmlFor={`category-filter-${category.replace(/\s+/g, '-')}`} className="font-normal cursor-pointer text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger className="text-sm px-1">Price Range</AccordionTrigger>
            <AccordionContent className="px-1">
              <Slider
                min={0}
                max={maxPriceDefault}
                step={10}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mt-2 mb-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex flex-col space-y-2 pt-4 border-t mt-auto">
        <Button onClick={applyFilters} size="sm">Apply Filters</Button>
        <Button variant="ghost" onClick={clearFilters} size="sm">Clear Filters</Button>
      </div>
    </div>
  );
}
