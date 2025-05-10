'use client';

import { getAuth } from 'firebase/auth';
import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2, Plus, X } from 'lucide-react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category?: string;
  createdBy?: string;
  aiHint?: string;
}

const initialFormValues: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  originalPrice: undefined,
  stock: 0,
  category: '',
  aiHint: '',
};

export function SellerProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      const fetchedProducts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure price is always a number
        return {
          id: doc.id,
          ...data,
          price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
          stock: typeof data.stock === 'number' ? data.stock : Number(data.stock) || 0,
        };
      }) as Product[];
      setProducts(fetchedProducts);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert numeric fields to numbers
    if (name === 'price' || name === 'originalPrice' || name === 'stock') {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    setFormValues(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleOpenDialog = (productToEdit?: Product) => {
    setEditingProduct(productToEdit || null);
    setFormValues(productToEdit || initialFormValues);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name.trim() || formValues.price <= 0 || formValues.stock < 0) {
      toast({ title: "Validation Error", description: "Ensure all fields are correctly filled.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          toast({ title: "Authentication Error", description: "You must be logged in to add or update products.", variant: "destructive" });
          return;
        }

        const productRef = editingProduct
          ? doc(db, 'products', editingProduct.id)
          : doc(collection(db, 'products'));

        const sanitizedData = {
          ...formValues,
          price: Number(formValues.price) || 0,
          originalPrice: formValues.originalPrice ? Number(formValues.originalPrice) : null,
          stock: Number(formValues.stock) || 0,
          category: formValues.category?.trim() || null,
          createdBy: editingProduct?.createdBy ?? currentUser.uid,
          aiHint: formValues.aiHint?.trim() || '',
        };

        await setDoc(productRef, sanitizedData, { merge: true });

        toast({
          title: editingProduct ? "Product Updated" : "Product Added",
          description: `${sanitizedData.name} has been processed.`,
        });

        fetchProducts();
        setIsDialogOpen(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Firestore Save Error: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    startTransition(async () => {
      try {
        await deleteDoc(doc(db, 'products', productId));
        toast({ title: "Product Deleted", description: `${productName} has been removed.`, variant: "destructive" });
        fetchProducts();
      } catch (error: any) {
        toast({ title: "Error", description: `Firestore Delete Error: ${error.message}`, variant: "destructive" });
      }
    });
  };



  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <ScrollArea className="max-h-[85vh] pr-6">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update the details of your product.' : 'Fill in the details for your new product.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formValues.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formValues.description || ''} 
                  onChange={handleInputChange} 
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className="text-base">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    value={formValues.originalPrice ?? ''}
                    onChange={handleInputChange}
                    placeholder="e.g., 1699"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base">Selling Price (₹) <span className="text-red-500">*</span></Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    step="0.01"
                    value={typeof formValues.price === 'number' ? formValues.price : ''} 
                    onChange={handleInputChange} 
                    required
                    className="w-full"
                    placeholder="e.g., 1499"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-base">Stock <span className="text-red-500">*</span></Label>
                  <Input 
                    id="stock" 
                    name="stock" 
                    type="number" 
                    value={typeof formValues.stock === 'number' ? formValues.stock : ''} 
                    onChange={handleInputChange} 
                    required
                    className="w-full"
                    placeholder="e.g., 25"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base">Category</Label>
                  <Input 
                    id="category" 
                    name="category" 
                    value={formValues.category || ''} 
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="e.g., Home Goods"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiHint" className="text-base">AI Hint (for primary image search, 1-2 words)</Label>
                  <Input 
                    id="aiHint" 
                    name="aiHint" 
                    value={formValues.aiHint || ''} 
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="e.g., desk lamp"
                  />
                </div>
              </div>
              
              <div className="pt-2 pb-2 text-sm text-muted-foreground">
                No reviews for this product yet.
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
                  {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    editingProduct ? 'Save Changes' : 'Add Product'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No products found. Add your first product to get started.
              </TableCell>
            </TableRow>
          ) : (
            products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-right">₹{(typeof product.price === 'number' ? product.price : 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive" 
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}