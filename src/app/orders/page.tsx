// src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Dummy order data - replace with actual data fetching
const dummyOrders = [
  { id: 'ORD001', date: new Date(2024, 0, 15), total: 79.98, status: 'Delivered', items: ['Minimalist Desk Lamp', 'Organic Cotton T-Shirt'] },
  { id: 'ORD002', date: new Date(2024, 1, 2), total: 199.99, status: 'Shipped', items: ['Noise-Cancelling Headphones'] },
  { id: 'ORD003', date: new Date(2024, 1, 20), total: 24.99, status: 'Processing', items: ['Stainless Steel Water Bottle'] },
];

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';


const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
  switch (status) {
    case 'Delivered':
      return 'default'; // Greenish or primary
    case 'Shipped':
      return 'secondary'; // Bluish or informative
    case 'Processing':
      return 'outline'; // Yellowish or warning
    case 'Cancelled':
      return 'destructive'; // Reddish or error
    default:
      return 'secondary';
  }
};


export default function OrdersPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  // Simulate fetching orders for the logged-in user
  const [orders, setOrders] = useState(dummyOrders);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail');
    setIsLoggedIn(loggedInStatus);
    setUserEmail(email);


    if (!loggedInStatus) {
      router.push('/login');
    } else {
      // In a real app, fetch orders for 'email'
      // setOrders(await fetchUserOrders(email));
    }
  }, [router]);


  if (!isLoggedIn) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p>Loading orders...</p></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button variant="outline" asChild>
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">You have no orders yet.</p>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{format(order.date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.items.join(', ')}</TableCell>
                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(order.status as OrderStatus)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
