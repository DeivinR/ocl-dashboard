import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';
import type { DashboardData } from '../../lib/data';

export const dashboardKeys = {
  all: ['dashboard'] as const,
};

export const useDashboardData = (supabase: SupabaseClient<Database> | null, enabled = true) => {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.from('dashboards').select('content').eq('id', 'latest').single();
      if (error) throw error;
      return data?.content ?? null;
    },
    enabled: enabled && !!supabase,
  });
};

export const useUpdateDashboard = (supabase: SupabaseClient<Database> | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DashboardData) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase.from('dashboards').upsert({ id: 'latest', content: data });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardKeys.all, data);
    },
  });
};
