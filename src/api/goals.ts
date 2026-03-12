import { createAuthFetch, type GetToken } from './client';
import type { Goal } from '../interfaces/goal';

export async function getGoals(getToken: GetToken, product: string, periodFrom: string): Promise<Goal[]> {
  const params = new URLSearchParams({ product, periodFrom });
  const res = await createAuthFetch(getToken)(`/goals?${params}`);
  return res.json();
}
