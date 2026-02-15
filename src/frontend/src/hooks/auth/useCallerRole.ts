import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { ExtendedRole } from '../../backend';

export function useCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<ExtendedRole>({
    queryKey: ['callerRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return ExtendedRole.guest;
      return actor.getCallerRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const isAuthenticated = !!identity;
  const role = query.data || ExtendedRole.guest;

  return {
    role,
    isAdmin: role === ExtendedRole.admin,
    isVendor: role === ExtendedRole.vendor,
    isCustomer: role === ExtendedRole.customer,
    isGuest: role === ExtendedRole.guest,
    isAuthenticated,
    isLoading: query.isLoading,
  };
}
