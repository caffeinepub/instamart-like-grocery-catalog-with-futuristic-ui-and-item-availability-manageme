import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../../hooks/cart/useCart';
import { useCheckout } from '../../hooks/orders/useCheckout';
import { useGetAllProducts } from '../../hooks/useQueries';
import { formatINR } from '../../utils/currency';
import { toast } from 'sonner';
import OrderConfirmationPanel from './OrderConfirmationPanel';
import type { OrderConfirmation } from '../../backend';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { mutate: checkout, isPending } = useCheckout();
  const { refetch: refetchProducts } = useGetAllProducts();
  const [paymentMethod, setPaymentMethod] = useState<string>('online');
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  const handleCheckout = async () => {
    // Last-moment availability check
    const { data: currentProducts } = await refetchProducts();
    
    if (currentProducts) {
      const unavailableItems = items.filter(item => {
        const currentProduct = currentProducts.find(p => p.id === item.product.id);
        return !currentProduct || !currentProduct.isAvailable;
      });

      if (unavailableItems.length > 0) {
        const itemNames = unavailableItems.map(item => item.product.name).join(', ');
        toast.error(`The following items are no longer available: ${itemNames}. Please remove them from your cart.`);
        return;
      }
    }

    const cartItems: Array<[bigint, bigint]> = items.map(item => [
      item.product.id,
      BigInt(item.quantity)
    ]);

    checkout(
      { cartItems, paymentMethod },
      {
        onSuccess: (confirmation) => {
          setOrderConfirmation(confirmation);
          clearCart();
        },
        onError: (error) => {
          toast.error(error.message || 'Checkout failed. Please try again.');
        },
      }
    );
  };

  const handleCloseSheet = () => {
    setOrderConfirmation(null);
    onOpenChange(false);
  };

  if (orderConfirmation) {
    return (
      <Sheet open={open} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-full sm:max-w-lg">
          <OrderConfirmationPanel 
            confirmation={orderConfirmation}
            onClose={handleCloseSheet}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 ? 'Your cart is empty' : `${items.length} item(s) in your cart`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button onClick={() => onOpenChange(false)}>
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.product.id.toString()} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.imageUrl || '/assets/generated/product-placeholder.dim_512x512.png'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                      <p className="text-sm text-primary font-semibold">
                        {formatINR(item.product.price)}
                        {item.product.unitLabel && (
                          <span className="text-muted-foreground font-normal">
                            {' '}/ {item.product.unitLabel}
                          </span>
                        )}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      Online Payment
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatINR(getTotal())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(getTotal())}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isPending || items.length === 0}
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Online
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
