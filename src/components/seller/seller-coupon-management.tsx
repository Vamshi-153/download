// src/components/seller/seller-coupon-management.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Coupon, CouponFormValuesInput } from '@/types';
import { SellerCouponForm, type CouponFormValues } from './seller-coupon-form';
import { fetchAllCoupons, addCouponToStore, updateCouponInStore, removeCouponFromStore } from '@/lib/data/coupon';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Added AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export function SellerCouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const loadCoupons = async () => {
    setIsLoading(true);
    const fetchedCoupons = await fetchAllCoupons();
    setCoupons(fetchedCoupons);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'nxtbazaar-coupons') loadCoupons();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOpenDialog = (couponToEdit?: Coupon) => {
    if (couponToEdit) {
      setEditingCoupon(couponToEdit);
    } else {
      setEditingCoupon(null);
    }
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: CouponFormValues) => {
    startTransition(async () => {
      try {
        const couponDataToSave = {
          ...data,
          validFrom: data.validFrom ? data.validFrom.toISOString() : undefined,
          validUntil: data.validUntil ? data.validUntil.toISOString() : undefined,
          minPurchaseAmount: data.minPurchaseAmount === 0 ? undefined : data.minPurchaseAmount, // Ensure 0 is treated as no min
        };

        if (editingCoupon) {
          await updateCouponInStore(editingCoupon.id, couponDataToSave);
          toast({ title: "Coupon Updated", description: `Coupon "${data.code}" has been updated.` });
        } else {
          await addCouponToStore(couponDataToSave);
          toast({ title: "Coupon Added", description: `Coupon "${data.code}" has been created.` });
        }
        await loadCoupons();
        setIsDialogOpen(false);
      } catch (error: any) {
        // Error is handled by the form component
        // toast({ title: "Error", description: error.message || "Failed to save coupon.", variant: "destructive" });
        console.error("Failed to save coupon:", error);
      }
    });
  };
  
  const handleDeleteCoupon = (couponId: string, couponCode: string) => {
    startTransition(async () => {
      try {
        await removeCouponFromStore(couponId);
        toast({ title: "Coupon Deleted", description: `Coupon "${couponCode}" has been removed.`, variant: "destructive" });
        await loadCoupons();
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete coupon.", variant: "destructive" });
      }
    });
  };

  const getDialogDefaultValues = (): Partial<CouponFormValuesInput> | undefined => {
    if (!editingCoupon) return { isActive: true, type: 'fixed' }; // Sensible defaults for new coupon
    return {
      ...editingCoupon,
      discountValue: editingCoupon.discountValue,
      minPurchaseAmount: editingCoupon.minPurchaseAmount,
      validFrom: editingCoupon.validFrom ? parseISO(editingCoupon.validFrom) : undefined,
      validUntil: editingCoupon.validUntil ? parseISO(editingCoupon.validUntil) : undefined,
    };
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-12 w-full" /> {/* Table Header Skeleton */}
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" /> // Table Row Skeleton
            ))}
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Coupon
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
         <ScrollArea className="max-h-[85vh] pr-6">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Update the details of your coupon.' : 'Fill in the details for your new coupon.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 pr-1">
            <SellerCouponForm
              onSubmit={handleFormSubmit}
              defaultValues={getDialogDefaultValues()}
              submitButtonText={editingCoupon ? 'Save Changes' : 'Add Coupon'}
              isPending={isPending}
            />
          </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">Min. Purchase (₹)</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">{coupon.code}</TableCell>
              <TableCell>{coupon.type.charAt(0).toUpperCase() + coupon.type.slice(1)}</TableCell>
              <TableCell className="text-right">
                {coupon.type === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue.toFixed(2)}`}
              </TableCell>
              <TableCell className="text-right">
                {coupon.minPurchaseAmount ? `₹${coupon.minPurchaseAmount.toFixed(2)}` : '-'}
              </TableCell>
              <TableCell className="text-xs">
                {coupon.validFrom ? format(parseISO(coupon.validFrom), 'MMM dd, yyyy') : 'Always'}
                {' - '}
                {coupon.validUntil ? format(parseISO(coupon.validUntil), 'MMM dd, yyyy') : 'Always'}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={coupon.isActive ? 'default' : 'outline'}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)} className="mr-2 h-8 w-8">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the coupon "{coupon.code}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id, coupon.code)} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {coupons.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                You haven't created any coupons yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
