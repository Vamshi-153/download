// src/types/index.ts

export interface Review {
  id: string;
  author: string;
  rating: number; // e.g., 1-5
  comment: string;
  date: string; // ISO date string
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // Current selling price
  originalPrice?: number; // Optional original price for showing discounts
  imageUrls: string[]; // Changed from imageUrl: string
  videoUrls?: string[]; // Added for video URLs
  category?: string;
  rating?: number; // Average rating
  stock?: number;
  dataAiHint?: string; // Associated with the primary image (imageUrls[0])
  reviews?: Review[];
}

export interface ProductFilterOptions {
    query?: string | string[]; // Can be string from URL or array if multiple queries allowed
    category?: string | string[];
    minPrice?: string | number;
    maxPrice?: string | number;
    sortBy?: string;
    limit?: string | number;
    offset?: string | number;
}


export interface CartStorageItem {
  productId: string;
  quantity: number;
}

// Used for displaying items in the cart, combining product details with quantity
export interface CartDisplayItem extends Product {
  quantity: number;
}

export interface Address {
  id: string; // UUID
  userId?: string; // Not strictly needed if namespacing by email in localStorage
  fullName: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string; // Made mandatory
  isDefault?: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: number; // Timestamp for sorting or other features
}

export interface WishlistDisplayItem extends Product {
  addedAt: number;
}

export interface Coupon {
  id: string;
  code: string; // e.g., "SUMMER20"
  type: 'percentage' | 'fixed';
  discountValue: number; // If percentage, 1-100. If fixed, the amount.
  minPurchaseAmount?: number; // Optional minimum cart subtotal
  isActive: boolean;
  validFrom?: string; // ISO date string
  validUntil?: string; // ISO date string
  // usageLimit?: number; // Future: Total times coupon can be used
  // usedCount?: number; // Future: Times coupon has been used
}

// Used for the coupon form, dates are handled as Date objects
export interface CouponFormValuesInput {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number | string; // String initially from form input
  minPurchaseAmount?: number | string; // String initially
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
}
