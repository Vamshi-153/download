'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // For date formatting

// Dummy data - replace with actual fetched transaction data
const initialTransactions = [
  { id: 't201', date: new Date(2024, 5, 16), type: 'Sale', orderId: 'o101', amount: 84.98, status: 'Completed' },
  { id: 't202', date: new Date(2024, 5, 17), type: 'Sale', orderId: 'o102', amount: 120.50, status: 'Pending' },
  { id: 't203', date: new Date(2024, 5, 18), type: 'Payout', orderId: null, amount: -150.00, status: 'Completed' },
  { id: 't204', date: new Date(2024, 5, 19), type: 'Sale', orderId: 'o103', amount: 55.00, status: 'Completed' },
];

export function SellerTransactionHistory() {
  const [transactions, setTransactions] = useState(initialTransactions);
  // Add state for filtering, sorting, pagination

   const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'default'; // Teal for completed
        case 'pending':
          return 'secondary'; // Gray for pending
        case 'failed':
           return 'destructive';
        default:
          return 'outline';
      }
    };

    const getAmountClass = (amount: number) => {
       return amount > 0 ? 'text-green-600' : 'text-red-600';
     };

  return (
    <div>
      {/* Add filtering/sorting controls here */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">{tx.id}</TableCell>
              <TableCell>{format(tx.date, 'PP')}</TableCell> {/* Format date */}
              <TableCell>{tx.type}</TableCell>
              <TableCell>{tx.orderId || '-'}</TableCell>
              <TableCell className={`text-right font-medium ${getAmountClass(tx.amount)}`}>
                 {tx.amount >= 0 ? '+' : ''}₹{tx.amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
           {transactions.length === 0 && (
             <TableRow>
               <TableCell colSpan={6} className="text-center text-muted-foreground">
                 No transactions found.
               </TableCell>
             </TableRow>
           )}
        </TableBody>
      </Table>
      {/* Add pagination controls here */}
    </div>
  );
}
