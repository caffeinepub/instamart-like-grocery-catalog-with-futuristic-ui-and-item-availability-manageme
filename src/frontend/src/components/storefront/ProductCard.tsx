import type { Product } from '../../backend';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.price) / 100;
  const imageUrl = product.imageUrl || '/assets/generated/product-placeholder.dim_512x512.png';

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
            ${price.toFixed(2)}
          </span>
          {product.unitLabel && (
            <span className="text-sm text-muted-foreground">
              / {product.unitLabel}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {product.isAvailable ? (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <Package className="w-3 h-3 mr-1" />
            In Stock
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            Unavailable
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
