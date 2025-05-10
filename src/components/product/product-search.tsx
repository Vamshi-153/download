// src/components/product/product-search.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description?: string;
}

interface ProductSearchProps {
  className?: string;
}

// Debounce utility function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

async function fetchProducts(queryText: string): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('name', '>=', queryText), where('name', '<=', queryText + '\uf8ff'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

export function ProductSearch({ className }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setQuery(searchParams.get('query') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchSuggestionsData = async (currentQuery: string) => {
      if (currentQuery.trim().length > 1) {
        const fetchedSuggestions = await fetchProducts(currentQuery.trim());
        setSuggestions(fetchedSuggestions.slice(0, 5));
        setShowSuggestions(fetchedSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debouncedFetch = debounce(fetchSuggestionsData, 300);
    debouncedFetch(query);
  }, [query]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!query.trim()) {
      current.delete('query');
    } else {
      current.set('query', query.trim());
    }

    router.push(`/?${current.toString()}`);
  };

  const handleSuggestionClick = (productName: string) => {
    setQuery(productName);
    setShowSuggestions(false);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('query', productName.trim());
    router.push(`/?${current.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSearch} className={cn("relative flex w-full items-center space-x-2", className)}>
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
        className="flex-grow h-10"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionsRef} 
          className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map(product => (
            <li key={product.id} className="px-3 py-2 hover:bg-accent cursor-pointer text-sm" onClick={() => handleSuggestionClick(product.name)}>
              {product.name}
            </li>
          ))}
        </ul>
      )}
      <Button type="submit" size="default" aria-label="Submit search">
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
