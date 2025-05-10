// src/components/address/address-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Address } from '@/types';
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
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const addressSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  streetAddress: z.string().min(5, { message: "Street address is required." }),
  apartmentSuite: z.string().optional(),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State/Province is required." }),
  zipCode: z.string()
    .min(3, { message: "Zip code must be at least 3 characters." })
    .max(20, { message: "Zip code cannot exceed 20 characters."})
    .regex(/^[a-zA-Z0-9\s-]*$/, { message: "Invalid characters in zip code."}),
  country: z.string().min(2, { message: "Country is required." }),
  countryCode: z.string().min(2, {message: "Please select a country code."}).max(5, {message: "Invalid country code."}),
  localPhoneNumber: z.string()
    .min(5, { message: "Phone number must be at least 5 digits." })
    .max(15, { message: "Phone number is too long."})
    .regex(/^\d+$/, { message: "Phone number must contain only digits."}),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (data: Omit<Address, 'id' | 'userId'>) => void; // Country is now part of form data
  defaultValues?: Partial<AddressFormValues & { phoneNumber?: string }>;
  submitButtonText?: string;
  showDefaultCheckbox?: boolean;
}

const commonCountryCodes = [
  { value: '+91', label: 'India (+91)' },
  { value: '+1', label: 'USA (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+61', label: 'Australia (+61)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+81', label: 'Japan (+81)' },
  { value: '+33', label: 'France (+33)' },
  { value: '+86', label: 'China (+86)' },
  { value: '+55', label: 'Brazil (+55)' },
  { value: '+27', label: 'South Africa (+27)' },
];

const defaultPhoneCountryCode = '+91'; // India

const parseFullPhoneNumber = (fullNumber?: string): { countryCode?: string, localPhoneNumber?: string } => {
  if (!fullNumber) return { countryCode: defaultPhoneCountryCode, localPhoneNumber: '' }; 
  
  for (const codeObj of commonCountryCodes) {
    if (fullNumber.startsWith(codeObj.value)) {
      return { countryCode: codeObj.value, localPhoneNumber: fullNumber.substring(codeObj.value.length) };
    }
  }
  const firstPlusMatch = fullNumber.match(/^(\+\d{1,3})(\d+)$/);
  if (firstPlusMatch) {
    return { countryCode: firstPlusMatch[1], localPhoneNumber: firstPlusMatch[2]};
  }

  return { countryCode: defaultPhoneCountryCode, localPhoneNumber: fullNumber };
};


export function AddressForm({ 
    onSubmit, 
    defaultValues: rawDefaultValues, 
    submitButtonText = "Save Address",
    showDefaultCheckbox = true 
}: AddressFormProps) {

  const parsedPhone = parseFullPhoneNumber(rawDefaultValues?.phoneNumber);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: rawDefaultValues?.fullName || '',
      streetAddress: rawDefaultValues?.streetAddress || '',
      apartmentSuite: rawDefaultValues?.apartmentSuite || '',
      city: rawDefaultValues?.city || '',
      state: rawDefaultValues?.state || '',
      zipCode: rawDefaultValues?.zipCode || '',
      country: rawDefaultValues?.country || '', // Default for new country field
      countryCode: rawDefaultValues?.countryCode || parsedPhone.countryCode || defaultPhoneCountryCode,
      localPhoneNumber: rawDefaultValues?.localPhoneNumber || parsedPhone.localPhoneNumber || '',
      isDefault: rawDefaultValues?.isDefault || false,
    },
  });

  const handleFormSubmit = (values: AddressFormValues) => {
    const { countryCode, localPhoneNumber, ...restOfValues } = values; // 'country' is in restOfValues
    const fullPhoneNumber = `${countryCode}${localPhoneNumber}`;
    onSubmit({ ...restOfValues, phoneNumber: fullPhoneNumber });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apartmentSuite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apartment, suite, etc. (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Apt 4B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Anytown" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl>
                  <Input placeholder="CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip / Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="90210 or A1B 2C3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
                <FormItem className="md:col-span-1">
                <FormLabel>Country Code</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select code" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {commonCountryCodes.map(code => (
                        <SelectItem key={code.value} value={code.value}>{code.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="localPhoneNumber"
            render={({ field }) => (
                <FormItem className="md:col-span-2">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="5551234567" {...field} />
                </FormControl>
                <FormDescription>Used for delivery updates.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {showDefaultCheckbox && (
            <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel>
                    Set as default shipping address
                    </FormLabel>
                </div>
                </FormItem>
            )}
            />
        )}
        <Button type="submit" className="w-full md:w-auto">{submitButtonText}</Button>
      </form>
    </Form>
  );
}

