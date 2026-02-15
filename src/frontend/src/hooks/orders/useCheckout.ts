import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { OrderConfirmation } from '../../backend';

interface CheckoutData {
  cartItems: Array<[bigint, bigint]>;
  paymentMethod: string;
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<OrderConfirmation, Error, CheckoutData>({
    mutationFn: async ({ cartItems, paymentMethod }) => {
      if (!actor) throw new Error('Actor not available');
      
      if (cartItems.length === 0) {
        throw new Error('Cart is empty. Add items to your cart before checkout.');
      }

      return actor.checkout(cartItems, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
