// src/components/seller/seller-coupon-form.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Coupon, CouponFormValuesInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker'; // Use the new DatePicker
import { useToast } from '@/hooks/use-toast';
import { parseISO } from 'date-fns';

const couponFormSchema = z.object({
  code: z.string()
    .min(3, { message: "Coupon code must be at least 3 characters." })
    .max(50, { message: "Coupon code cannot exceed 50 characters."})
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Coupon code can only contain letters, numbers, underscores, and hyphens." })
    .transform(val => val.toUpperCase()),
  type: z.enum(['percentage', 'fixed'], { required_error: "Coupon type is required." }),
  discountValue: z.coerce.number({invalid_type_error: "Discount value must be a number."}) // Coerce to number
    .positive({ message: "Discount value must be positive." }),
  minPurchaseAmount: z.coerce.number({invalid_type_error: "Minimum purchase amount must be a number."})
    .nonnegative({ message: "Minimum purchase amount cannot be negative."})
    .optional()
    // .default(0) // RHF handles defaults better for optional numbers if we set undefined
    .transform(val => (val === 0 || val === undefined || isNaN(val)) ? undefined : val), // Ensure 0 or empty string becomes undefined for optionality
  isActive: z.boolean().default(true),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
}).refine(data => {
    if (data.type === 'percentage' && (data.discountValue <= 0 || data.discountValue > 100)) {
        return false;
    }
    return true;
}, {
    message: "Percentage discount must be between 1 and 100.",
    path: ['discountValue'],
}).refine(data => {
    if (data.validFrom && data.validUntil && data.validUntil < data.validFrom) {
        return false;
    }
    return true;
}, {
    message: "Valid 'until' date cannot be before 'from' date.",
    path: ['validUntil'],
});


export type CouponFormValues = z.infer<typeof couponFormSchema>;

interface SellerCouponFormProps {
  onSubmit: (data: CouponFormValues) => Promise<void>;
  defaultValues?: Partial<CouponFormValuesInput>;
  submitButtonText?: string;
  isPending: boolean;
}

export function SellerCouponForm({ 
    onSubmit, 
    defaultValues: rawDefaultValues, 
    submitButtonText = "Save Coupon",
    isPending
}: SellerCouponFormProps) {
  const { toast } = useToast();

  // Sanitize numeric default values to prevent NaN issues
  const getSafeNumberOrUndefined = (value: number | string | undefined): number | undefined => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };
  
  const initialDiscountValue = getSafeNumberOrUndefined(rawDefaultValues?.discountValue);
  const initialMinPurchaseAmount = getSafeNumberOrUndefined(rawDefaultValues?.minPurchaseAmount);


  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: rawDefaultValues?.code || '',
      type: rawDefaultValues?.type || 'fixed',
      discountValue: initialDiscountValue, // Will be number or undefined
      minPurchaseAmount: initialMinPurchaseAmount, // Will be number or undefined
      isActive: rawDefaultValues?.isActive ?? true,
      validFrom: rawDefaultValues?.validFrom, // Assuming these are Date objects or undefined
      validUntil: rawDefaultValues?.validUntil,
    },
  });

  const handleFormSubmit = async (values: CouponFormValues) => {
    try {
      await onSubmit(values);
    } catch (error: any) {
       toast({ title: "Error", description: error.message || "Failed to save coupon.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="SUMMER20" {...field} onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} />
              </FormControl>
              <FormDescription>Unique code for the coupon (e.g., SAVE10, BOGO50).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Type <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select coupon type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="percentage">Percentage Discount</SelectItem>
                        <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Value <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        step="0.01" 
                        placeholder={form.watch('type') === 'percentage' ? "10 (for 10%)" : "5 (for ₹5 off)"} 
                        name={field.name}
                        value={field.value === undefined ? '' : String(field.value)} // Always pass string
                        onChange={e => field.onChange(e.target.value)} // Pass string to RHF, Zod will coerce
                        onBlur={field.onBlur}
                        ref={field.ref}
                        disabled={field.disabled}
                    />
                </FormControl>
                 <FormDescription>{form.watch('type') === 'percentage' ? "Enter percentage (1-100)." : "Enter fixed amount (₹)."}</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
            control={form.control}
            name="minPurchaseAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Minimum Purchase Amount (₹)</FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g., 50 (optional)"
                        name={field.name}
                        value={field.value === undefined ? '' : String(field.value)} // Always pass string
                        onChange={e => {
                            const val = e.target.value;
                            // For optional number fields, pass undefined if empty, otherwise the string value for Zod to coerce.
                            field.onChange(val === '' ? undefined : val);
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        disabled={field.disabled}
                    />
                </FormControl>
                <FormDescription>Leave blank or 0 if no minimum purchase is required.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Valid From (Optional)</FormLabel>
                        <DatePicker
                            date={field.value}
                            onDateChange={field.onChange}
                            placeholder="Start date"
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Valid Until (Optional)</FormLabel>
                         <DatePicker
                            date={field.value}
                            onDateChange={field.onChange}
                            placeholder="End date"
                            disabled={!form.watch('validFrom')} // Optionally disable if 'from' is not set
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Activate Coupon
                </FormLabel>
                <FormDescription>
                  Uncheck to disable this coupon temporarily.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
            {isPending ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}

