import { useState } from 'react';
import { useCreateProduct } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function VendorProductForm() {
  const createProduct = useCreateProduct();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unitLabel: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      const priceInCents = BigInt(Math.round(Number(formData.price) * 100));
      
      await createProduct.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: priceInCents,
        unitLabel: formData.unitLabel.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
      });

      toast.success('Product created successfully');
      setFormData({
        name: '',
        description: '',
        price: '',
        unitLabel: '',
        imageUrl: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Fresh Organic Apples"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="99.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitLabel">Unit Label</Label>
          <Input
            id="unitLabel"
            value={formData.unitLabel}
            onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
            placeholder="e.g., lb, kg, each"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <Button
        type="submit"
        disabled={createProduct.isPending}
        className="w-full"
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
