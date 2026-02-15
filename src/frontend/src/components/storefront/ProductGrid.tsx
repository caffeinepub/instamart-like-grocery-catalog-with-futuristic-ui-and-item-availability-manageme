import { useState } from 'react';
import { useGetAllProducts, useGetAvailableProducts } from '../../hooks/useQueries';
import { useCallerRole } from '../../hooks/auth/useCallerRole';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertCircle } from 'lucide-react';

export default function ProductGrid() {
  const { isAdmin } = useCallerRole();
  const [showAll, setShowAll] = useState(false);
  
  const availableQuery = useGetAvailableProducts();
  const allQuery = useGetAllProducts();
  
  const query = showAll && isAdmin ? allQuery : availableQuery;
  const { data: products, isLoading, error } = query;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          {isAdmin && <Skeleton className="h-10 w-64" />}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Browse Products</h2>
          <p className="text-muted-foreground mt-1">
            {products?.length || 0} {showAll ? 'total' : 'available'} products
          </p>
        </div>
        
        {isAdmin && (
          <Tabs value={showAll ? 'all' : 'available'} onValueChange={(v) => setShowAll(v === 'all')}>
            <TabsList>
              <TabsTrigger value="available">Available Only</TabsTrigger>
              <TabsTrigger value="all">All Products</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {!products || products.length === 0 ? (
        <div className="glass-panel rounded-lg p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products available</h3>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Add your first product using the admin panel above.' 
              : 'Check back soon for new products!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id.toString()} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
