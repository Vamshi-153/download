// src/lib/data/product.ts
import type { Product, ProductFilterOptions, Review } from '@/types';
import { db } from '@/firebase/firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const productCollectionRef = collection(db, 'products');

export async function fetchProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(productCollectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
        return null;
    }

    return productSnap.data() as Product;
}

export async function addProductToStore(newProductData: Omit<Product, 'id'>): Promise<Product> {
    const newProductRef = doc(productCollectionRef);
    await setDoc(newProductRef, newProductData);
    
    return { id: newProductRef.id, ...newProductData };
}

export async function updateProductInStore(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
        return null;
    }

    await setDoc(productRef, updates, { merge: true });
    
    return { id: productId, ...updates };
}

export async function removeProductFromStore(productId: string): Promise<boolean> {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    
    return true;
}
