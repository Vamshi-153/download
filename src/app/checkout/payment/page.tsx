// src/app/checkout/payment/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAddress } from '@/hooks/use-address';
import { useCart } from '@/hooks/use-cart';
import type { Address, CartDisplayItem, Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, CheckCircle, Tag, X } from 'lucide-react';
import { fetchProductById } from '@/lib/data/product'; 
import { processPayment } from '@/services/payment'; 
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { validateCoupon } from '@/lib/data/coupon';

interface AppliedCouponDisplay {
  code: string;
  discountAmount: number; 
  originalCoupon: Coupon;
}

export default function CheckoutPaymentPage() {
  const { getSelectedCheckoutAddress, isAddressInitialized: isAddrInit, userEmail } = useAddress();
  const { cartItems, getCartItemCount, clearCart, isCartInitialized: isCartInit } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [displayItems, setDisplayItems] = useState<CartDisplayItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponDisplay, setAppliedCouponDisplay] = useState<AppliedCouponDisplay | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);


  useEffect(() => {
    setIsClient(true);
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
    if (!loggedInStatus) {
      router.push('/login?redirect=/checkout/payment');
    }
  }, [router]);

  useEffect(() => {
    if (isClient && isAddrInit) {
      const address = getSelectedCheckoutAddress();
      if (!address) {
        router.replace('/checkout/address');
      } else {
        setSelectedAddress(address);
      }
    }
  }, [isClient, isAddrInit, getSelectedCheckoutAddress, router]);

  useEffect(() => {
    if (isClient && isCartInit) {
      if (getCartItemCount() === 0 && !paymentSuccess) {
        router.replace('/cart');
        return;
      }
      const fetchDisplayItems = async () => {
        setIsLoadingProducts(true);
        const detailedItems: CartDisplayItem[] = [];
        for (const item of cartItems) {
          const productDetails = await fetchProductById(item.productId);
          if (productDetails) {
            detailedItems.push({ ...productDetails, quantity: item.quantity });
          }
        }
        setDisplayItems(detailedItems);
        setIsLoadingProducts(false);
      };
      fetchDisplayItems();
    }
  }, [isClient, isCartInit, cartItems, getCartItemCount, router, paymentSuccess]);


  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const calculateCouponDiscountValue = (): number => {
    if (!appliedCouponDisplay || !appliedCouponDisplay.originalCoupon) return 0;
    
    const coupon = appliedCouponDisplay.originalCoupon;
    if (coupon.type === 'percentage') {
      return subtotal * (coupon.discountValue / 100);
    }
    return Math.min(coupon.discountValue, subtotal); 
  };

  const couponDiscountDisplayValue = calculateCouponDiscountValue();
  const totalAmount = Math.max(0, subtotal - couponDiscountDisplayValue);

  const estimatedDeliveryDate = () => {
    const today = new Date();
    const delivery = new Date(today.setDate(today.getDate() + 5)); 
    return format(delivery, 'MMMM dd, yyyy');
  };

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
        setCouponMessage("Please enter a coupon code.");
        toast({ title: "Coupon Error", description: "Please enter a coupon code.", variant: "destructive"});
        return;
    }
    setIsApplyingCoupon(true);
    setCouponMessage(null);

    const validationResult = await validateCoupon(couponCodeInput.trim(), subtotal);

    if (validationResult.isValid && validationResult.coupon) {
        const coupon = validationResult.coupon;
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = subtotal * (coupon.discountValue / 100);
        } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        setAppliedCouponDisplay({ 
            code: coupon.code, 
            discountAmount: discountAmount, 
            originalCoupon: coupon 
        });
        setCouponMessage(null);
        toast({ title: "Coupon Applied", description: `Discount of ₹${discountAmount.toFixed(2)} applied.` });
    } else {
        setAppliedCouponDisplay(null);
        setCouponMessage(validationResult.message);
        toast({ title: "Coupon Error", description: validationResult.message, variant: "destructive" });
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponDisplay(null);
    setCouponCodeInput(''); 
    setCouponMessage(null); 
    toast({ title: "Coupon Removed", description: "The coupon discount has been removed." });
  };


  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessingPayment(true);

    try {
        const paymentResult = await processPayment(totalAmount, { method: 'phonepe', orderDetails: { items: displayItems, coupon: appliedCouponDisplay?.code } }); 
        if (paymentResult.success) {
            toast({ title: "Payment Successful!", description: `Transaction ID: ${paymentResult.transactionId}. Redirecting to PhonePe (simulation)...`});
            setTimeout(() => {
                setPaymentSuccess(true);
                clearCart(); 
            }, 2000); 
        } else {
            toast({ title: "Payment Failed", description: paymentResult.message || "Please try again with PhonePe.", variant: "destructive"});
            setIsProcessingPayment(false);
        }
    } catch (error) {
        console.error("Payment processing error:", error);
        toast({ title: "Payment Error", description: "An unexpected error occurred with PhonePe.", variant: "destructive"});
        setIsProcessingPayment(false);
    }
  };

  if (!isClient || !isLoggedIn || isLoadingProducts || !selectedAddress || (!isCartInit && !paymentSuccess) ) {
    return <div className="container mx-auto py-8 text-center">Loading payment details...</div>;
  }

  if (paymentSuccess) {
    return (
        <div className="container mx-auto py-12 text-center max-w-lg">
            <Card className="shadow-lg">
                <CardHeader>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl">Payment Successful!</CardTitle>
                    <CardDescription>Your order has been placed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-2">Thank you for your purchase, {userEmail?.split('@')[0] || 'customer'}!</p>
                    <p className="text-muted-foreground">A confirmation email has been sent to {userEmail}.</p>
                    <p className="text-muted-foreground mt-1">Estimated Delivery: <strong>{estimatedDeliveryDate()}</strong></p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/orders">View My Orders</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment</h1>
        <Button variant="outline" asChild>
          <Link href="/checkout/address">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Address
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping To</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{selectedAddress.fullName}</p>
              <p>{selectedAddress.streetAddress}</p>
              {selectedAddress.apartmentSuite && <p>{selectedAddress.apartmentSuite}</p>}
              <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
              <p>{selectedAddress.country}</p>
              {selectedAddress.phoneNumber && <p>Phone: {selectedAddress.phoneNumber}</p>}
              <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                <Link href="/checkout/address">Change address</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {displayItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="space-y-1 pt-2">
                <Label htmlFor="couponCodeInput" className="text-xs">Have a coupon?</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="couponCodeInput" 
                    placeholder="Enter coupon code" 
                    value={couponCodeInput} 
                    onChange={(e) => setCouponCodeInput(e.target.value)} 
                    className="h-9 text-sm"
                    disabled={isProcessingPayment || isApplyingCoupon || !!appliedCouponDisplay}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={handleApplyCoupon} 
                    className="h-9"
                    disabled={isProcessingPayment || isApplyingCoupon || !couponCodeInput || !!appliedCouponDisplay}
                  >
                    {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                
                {couponMessage && (
                    <p className={`text-xs mt-1 text-destructive`}>
                        {couponMessage}
                    </p>
                )}

                {appliedCouponDisplay && !couponMessage && ( 
                    <Alert className="mt-2 py-2.5 px-3 border-green-300 bg-green-50 text-green-700 [&>svg]:text-green-600">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                            <Tag className="h-4 w-4" />
                            <AlertTitle className="ml-2 mb-0 text-sm text-green-800 font-medium">
                                Coupon: {appliedCouponDisplay.code}
                            </AlertTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveCoupon}
                            className="h-7 w-7 -mr-1 text-green-600 hover:text-destructive"
                            aria-label="Remove coupon"
                            disabled={isProcessingPayment || isApplyingCoupon}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Alert>
                )}
              </div>

              {appliedCouponDisplay && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({appliedCouponDisplay.code})</span>
                  <span>-₹{couponDiscountDisplayValue.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">Estimated Delivery: {estimatedDeliveryDate()}</p>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>You will be redirected to PhonePe to complete your payment.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePaymentSubmit}>
                <CardContent className="space-y-6 py-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Image src="https://picsum.photos/seed/phonepe-logo/150/50" alt="PhonePe Logo" width={150} height={50} data-ai-hint="payment gateway logo" />
                        <p className="text-muted-foreground text-center">
                            Click the button below to proceed with your payment using PhonePe.
                        </p>
                    </div>
                     <Alert className="mt-4">
                        <Tag className="h-4 w-4" />
                        <AlertTitle>Secure Payment</AlertTitle>
                        <AlertDescription>
                            Your payment will be processed securely by PhonePe.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" className="w-full bg-[#6739B7] hover:bg-[#502B8F] text-white" disabled={isProcessingPayment || totalAmount <=0}>
                        {isProcessingPayment ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                             <path d="M12.37.03c-5.53.32-9.68 4.07-10.72 9.17-.57 2.79-.45 5.41.4 8.03.08.26.38.39.64.31.26-.08.39-.38.31-.64-.78-2.44-.9-4.88-.39-7.48.95-4.63 4.73-8.01 9.8-8.31 4.83-.28 9.06 2.66 10.3 7.04.48 1.71.5 3.4.05 5.1-.08.26.1.54.36.62.26.08.54-.1.62-.36.5-1.85.48-3.73-.02-5.58-1.32-4.76-5.89-7.99-11.35-8.29zm5.75 10.61c-.26-.08-.54.1-.62.36-.08.26.1.54.36.62.52.16.99.43 1.39.79.17.15.42.13.57-.04.15-.17.13-.42-.04-.57-.44-.4-.97-.7-1.54-.94l-.12-.02zM12 5.5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-.5-8h1v6h-1V9.5zm0-2h1v1h-1V7.5z" />
                           </svg>
                        )}
                        Pay ₹{totalAmount.toFixed(2)} with PhonePe
                    </Button>
                </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

