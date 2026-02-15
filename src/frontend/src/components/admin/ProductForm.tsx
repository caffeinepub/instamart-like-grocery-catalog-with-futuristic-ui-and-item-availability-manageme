import { useState } from 'react';
import { useCreateProduct } from '../../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price greater than 0');
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        price: BigInt(Math.round(priceNum * 100)),
        unitLabel: unitLabel.trim() || null,
        imageUrl: imageUrl.trim() || null,
      });
      
      toast.success('Product created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setUnitLabel('');
      setImageUrl('');
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fresh Organic Apples"
            disabled={createProduct.isPending}
            required
          />
        </div>
        
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the product"
            disabled={createProduct.isPending}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="9.99"
            disabled={createProduct.isPending}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unitLabel">Unit Label</Label>
          <Input
            id="unitLabel"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            placeholder="e.g., kg, lb, pack"
            disabled={createProduct.isPending}
          />
        </div>
        
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={createProduct.isPending}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use default placeholder
          </p>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={createProduct.isPending}
        className="w-full sm:w-auto"
      >
        {createProduct.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Product'
        )}
      </Button>
    </form>
  );
}
