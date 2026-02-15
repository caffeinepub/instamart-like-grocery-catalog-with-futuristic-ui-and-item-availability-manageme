import { useState } from 'react';
import { useGetVendorProducts } from '../../hooks/vendor/useVendorProducts';
import { useDeleteProduct, useToggleAvailability } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../admin/ConfirmDialog';

export default function VendorProductTable() {
  const { data: products, isLoading, error } = useGetVendorProducts();
  const deleteProduct = useDeleteProduct();
  const toggleAvailability = useToggleAvailability();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<bigint | null>(null);

  const handleToggleAvailability = async (id: bigint) => {
    try {
      await toggleAvailability.mutateAsync(id);
      toast.success('Product availability updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    }
  };

  const handleDeleteClick = (id: bigint) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct.mutateAsync(productToDelete);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load products</span>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No products yet. Add your first product to get started!</p>
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
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id.toString()}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
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
                  ${(Number(product.price) / 100).toFixed(2)}
                  {product.unitLabel && (
                    <span className="text-muted-foreground text-sm">
                      {' '}/ {product.unitLabel}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.isAvailable}
                    onCheckedChange={() => handleToggleAvailability(product.id)}
                    disabled={toggleAvailability.isPending}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(product.id)}
                    disabled={deleteProduct.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        isLoading={deleteProduct.isPending}
      />
    </>
  );
}
