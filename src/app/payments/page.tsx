// src/app/payments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, CreditCard as CreditCardIcon, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // Added import for Badge


// Dummy payment method data
const dummyPaymentMethods = [
  { id: 'pm_1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
  { id: 'pm_2', type: 'Mastercard', last4: '5555', expiry: '08/26', isDefault: false },
];

export default function PaymentsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Simulate fetching payment methods for the logged-in user
  const [paymentMethods, setPaymentMethods] = useState(dummyPaymentMethods);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedInStatus) {
      router.push('/login');
    } else {
      setIsLoggedIn(true);
      // In a real app, fetch payment methods for the logged-in user
      // setPaymentMethods(await fetchUserPaymentMethods());
    }
  }, [router]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prevMethods =>
      prevMethods.map(pm => ({ ...pm, isDefault: pm.id === id }))
    );
    toast({ title: "Default payment method updated." });
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(prevMethods => prevMethods.filter(pm => pm.id !== id));
    toast({ title: "Payment method removed.", variant: "destructive" });
  };


  if (!isLoggedIn) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p>Loading payment methods...</p></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <Button variant="outline" asChild>
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Saved Payment Methods</CardTitle>
            <Button variant="default">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Method
            </Button>
             {/* This would open a modal/form to add a new payment method */}
          </div>
          <CardDescription>Manage your credit/debit cards and other payment options.</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">You have no saved payment methods.</p>
          ) : (
            <ul className="space-y-4">
              {paymentMethods.map((pm) => (
                <li key={pm.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <CreditCardIcon className="h-8 w-8 mr-4 text-primary" />
                    <div>
                      <p className="font-semibold">{pm.type} ending in {pm.last4}</p>
                      <p className="text-sm text-muted-foreground">Expires: {pm.expiry}</p>
                    </div>
                    {pm.isDefault && (
                      <Badge variant="secondary" className="ml-3">Default</Badge>
                    )}
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    {!pm.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(pm.id)}>
                        Set as Default
                      </Button>
                    )}
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                       <Edit className="h-4 w-4" />
                       <span className="sr-only">Edit</span>
                     </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove your
                            {pm.type} ending in {pm.last4} payment method.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMethod(pm.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
