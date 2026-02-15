import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Package } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import type { OrderConfirmation } from '../../backend';

interface OrderConfirmationPanelProps {
  confirmation: OrderConfirmation;
  onClose: () => void;
}

export default function OrderConfirmationPanel({ confirmation, onClose }: OrderConfirmationPanelProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="text-center space-y-4 pt-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground">
              {confirmation.message}
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono font-semibold">#{confirmation.orderId.toString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{formatDate(confirmation.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium capitalize">{confirmation.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize text-warning">{confirmation.status}</span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Order Items
          </h3>
          <div className="space-y-3">
            {confirmation.items.map((item) => (
              <div key={item.id.toString()} className="flex gap-3 text-sm">
                <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                  <img
                    src={item.imageUrl || '/assets/generated/product-placeholder.dim_512x512.png'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-muted-foreground">
                    Qty: {item.quantity.toString()} × {formatINR(item.price)}
                  </p>
                </div>
                <div className="font-semibold text-right">
                  {formatINR(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-primary">{formatINR(confirmation.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          className="w-full"
          size="lg"
          onClick={onClose}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
