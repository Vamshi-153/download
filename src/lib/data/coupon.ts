// src/lib/data/coupon.ts
import type { Coupon } from '@/types';
import { isAfter, isBefore, parseISO } from 'date-fns';

const COUPON_STORAGE_KEY = 'nxtbazaar-coupons';

let couponsStore: Coupon[] = [];
let isCouponsStoreInitialized = false;

const defaultCoupons: Coupon[] = [
  {
    id: 'c1',
    code: 'SAVE10',
    type: 'percentage',
    discountValue: 10,
    isActive: true,
    minPurchaseAmount: 50,
  },
  {
    id: 'c2',
    code: 'FIXED5',
    type: 'fixed',
    discountValue: 5,
    isActive: true,
    minPurchaseAmount: 20,
  },
  {
    id: 'c3',
    code: 'EXPIRED',
    type: 'percentage',
    discountValue: 15,
    isActive: true,
    validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  },
    {
    id: 'c4',
    code: 'FUTURE',
    type: 'fixed',
    discountValue: 10,
    isActive: true,
    validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2).toISOString(), // Two days from now
  },
];

function initializeCouponsStore() {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) {
    const storedCoupons = localStorage.getItem(COUPON_STORAGE_KEY);
    if (storedCoupons) {
      try {
        couponsStore = JSON.parse(storedCoupons);
      } catch (e) {
        console.error("Failed to parse coupons from localStorage, resetting to default.", e);
        couponsStore = [...defaultCoupons];
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponsStore));
      }
    } else {
      couponsStore = [...defaultCoupons];
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponsStore));
    }
    isCouponsStoreInitialized = true;
  } else if (couponsStore.length === 0 && !isCouponsStoreInitialized) {
    // Fallback for non-browser environments
    couponsStore = [...defaultCoupons];
  }
}

if (typeof window !== 'undefined') {
  initializeCouponsStore();
}

function saveCouponsToLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponsStore));
     window.dispatchEvent(new StorageEvent('storage', {
      key: COUPON_STORAGE_KEY,
      newValue: JSON.stringify(couponsStore),
      oldValue: null, 
      storageArea: localStorage,
    }));
  }
}

export async function fetchAllCoupons(): Promise<Coupon[]> {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  return [...couponsStore];
}

export async function addCouponToStore(newCouponData: Omit<Coupon, 'id'>): Promise<Coupon> {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  
  const existingCoupon = couponsStore.find(c => c.code.toUpperCase() === newCouponData.code.toUpperCase());
  if (existingCoupon) {
    throw new Error(`Coupon code "${newCouponData.code}" already exists.`);
  }

  const coupon: Coupon = {
    ...newCouponData,
    id: crypto.randomUUID(),
    code: newCouponData.code.toUpperCase(), // Ensure code is uppercase
  };
  couponsStore.push(coupon);
  saveCouponsToLocalStorage();
  return coupon;
}

export async function updateCouponInStore(couponId: string, updates: Partial<Omit<Coupon, 'id'>>): Promise<Coupon | null> {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  const couponIndex = couponsStore.findIndex(c => c.id === couponId);
  if (couponIndex === -1) {
    return null;
  }

  // If code is being updated, check for uniqueness against other coupons
  if (updates.code) {
    const newCodeUpper = updates.code.toUpperCase();
    const existingCouponWithNewCode = couponsStore.find(c => c.code.toUpperCase() === newCodeUpper && c.id !== couponId);
    if (existingCouponWithNewCode) {
        throw new Error(`Coupon code "${updates.code}" already exists.`);
    }
    updates.code = newCodeUpper;
  }


  couponsStore[couponIndex] = { ...couponsStore[couponIndex], ...updates };
  saveCouponsToLocalStorage();
  return couponsStore[couponIndex];
}

export async function removeCouponFromStore(couponId: string): Promise<boolean> {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  const initialLength = couponsStore.length;
  couponsStore = couponsStore.filter(c => c.id !== couponId);
  if (couponsStore.length < initialLength) {
    saveCouponsToLocalStorage();
    return true;
  }
  return false;
}

export async function findCouponByCode(code: string): Promise<Coupon | null> {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async
  const coupon = couponsStore.find(c => c.code.toUpperCase() === code.toUpperCase());
  return coupon || null;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ isValid: boolean; message: string; coupon?: Coupon }> {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  
  const coupon = await findCouponByCode(code);

  if (!coupon) {
    return { isValid: false, message: 'Invalid coupon code.' };
  }
  if (!coupon.isActive) {
    return { isValid: false, message: 'This coupon is currently inactive.' };
  }

  const now = new Date();
  if (coupon.validFrom && isBefore(now, parseISO(coupon.validFrom))) {
    return { isValid: false, message: 'This coupon is not yet active.' };
  }
  if (coupon.validUntil && isAfter(now, parseISO(coupon.validUntil))) {
    return { isValid: false, message: 'This coupon has expired.' };
  }

  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    return { isValid: false, message: `Minimum purchase of ₹${coupon.minPurchaseAmount.toFixed(2)} required for this coupon.` };
  }
  
  return { isValid: true, message: 'Coupon applied successfully!', coupon };
}

export function getCurrentCoupons(): Coupon[] {
  if (typeof window !== 'undefined' && !isCouponsStoreInitialized) initializeCouponsStore();
  return [...couponsStore];
}
