import { useState } from 'react';
import { useGetAllProducts, useDeleteProduct, useToggleAvailability } from '../../hooks/useQueries';
import type { Product } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmDialog from './ConfirmDialog';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductTable() {
  const { data: products, isLoading, error } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();
  const toggleAvailability = useToggleAvailability();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
      console.error(error);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await toggleAvailability.mutateAsync(product.id);
      toast.success(
        product.isAvailable 
          ? 'Product marked as unavailable' 
          : 'Product marked as available'
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="glass-panel rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No products yet. Create your first product above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const price = Number(product.price) / 100;
              return (
                <TableRow key={product.id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.imageUrl || '/assets/generated/product-placeholder.dim_512x512.png'}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      ${price.toFixed(2)}
                      {product.unitLabel && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {product.unitLabel}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(product)}
                        disabled={toggleAvailability.isPending}
                      />
                      <Badge 
                        variant={product.isAvailable ? 'default' : 'secondary'}
                        className={product.isAvailable ? 'bg-success/10 text-success border-success/30' : ''}
                      >
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(product)}
                      disabled={deleteProduct.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteProduct.isPending}
      />
    </>
  );
}
