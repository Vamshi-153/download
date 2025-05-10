'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // For date formatting

// Dummy data - replace with actual fetched order data for the seller
const initialOrders = [
  { id: 'o101', date: new Date(2024, 5, 15, 10, 30), customer: 'Alice B.', total: 84.98, status: 'Shipped', items: [{ name: 'Seller Product A', qty: 1 }, { name: 'Another Item', qty: 1 }] },
  { id: 'o102', date: new Date(2024, 5, 16, 14, 0), customer: 'Bob C.', total: 120.50, status: 'Processing', items: [{ name: 'Seller Product B', qty: 1 }] },
  { id: 'o103', date: new Date(2024, 5, 17, 9, 15), customer: 'Charlie D.', total: 55.00, status: 'Delivered', items: [{ name: 'Seller Product A', qty: 1 }] },
];

export function SellerOrderHistory() {
  const [orders, setOrders] = useState(initialOrders);
  // Add state for filtering, sorting, pagination

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'default'; // Use primary color (Teal)
      case 'processing':
        return 'secondary'; // Use secondary color (Light Gray)
      case 'delivered':
        return 'outline'; // Outline variant
       case 'cancelled':
         return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      {/* Add filtering/sorting controls here */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
             <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{format(order.date, 'PPp')}</TableCell> {/* Format date */}
              <TableCell>{order.customer}</TableCell>
              <TableCell>
                  {order.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
              </TableCell>
              <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Add pagination controls here */}
    </div>
  );
}
