import { useQuery } from '@tanstack/react-query';
import type { GetToken } from '../api/client';
import { getGoals } from '../api/goals';

export const goalKeys = {
  all: ['goals'] as const,
  byProduct: (product: string, periodFrom: string) => [...goalKeys.all, product, periodFrom] as const,
};

export function useGoals(getToken: GetToken, product: string, periodFrom: string) {
  const query = useQuery({
    queryKey: goalKeys.byProduct(product, periodFrom),
    queryFn: () => getGoals(getToken, product, periodFrom),
    enabled: !!product && !!periodFrom,
    refetchOnWindowFocus: false,
  });

  let error: string | null = null;
  if (query.error) {
    error = query.error instanceof Error ? query.error.message : 'Failed to load goals';
  }

  return {
    goals: query.data ?? [],
    loading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
