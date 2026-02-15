import type { Product } from '../../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../hooks/cart/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || '/assets/generated/product-placeholder.dim_512x512.png';
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const result = addToCart(product, 1);
    
    if (result.success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.error || 'Failed to add item to cart');
    }
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-neon-sm ${!product.isAvailable ? 'opacity-60' : ''}`}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            {formatINR(product.price)}
          </span>
          {product.unitLabel && (
            <span className="text-sm text-muted-foreground">
              / {product.unitLabel}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        {product.isAvailable ? (
          <>
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <Package className="w-3 h-3 mr-1" />
              In Stock
            </Badge>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="ml-auto"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
          </>
        ) : (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            Unavailable
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
