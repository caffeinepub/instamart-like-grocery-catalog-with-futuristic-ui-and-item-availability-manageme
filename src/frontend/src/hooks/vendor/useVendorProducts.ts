import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { Product } from '../../backend';

export function useGetVendorProducts() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Product[]>({
    queryKey: ['products', 'vendor', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getProductsForVendor(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
