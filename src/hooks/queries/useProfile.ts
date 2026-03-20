import { useQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../config/database.types';
import type { Profile } from '../../types/profile';

export const profileKeys = {
  all: ['profile'] as const,
  byId: (userId: string) => [...profileKeys.all, userId] as const,
};

export const useProfile = (supabase: SupabaseClient<Database> | null, userId: string | null, enabled = true) => {
  return useQuery({
    queryKey: userId ? profileKeys.byId(userId) : [...profileKeys.all, 'null'],
    queryFn: async () => {
      if (!supabase || !userId) throw new Error('Missing supabase or userId');
      const { data: profileData, error }: { data: any; error: any } = await supabase
        .from('profiles')
        .select('id, full_name, role, access_level, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!profileData) return null;

      return {
        id: profileData.id,
        fullName: profileData.full_name ?? '',
        role: profileData.role ?? '',
        accessLevel: profileData.access_level ?? '',
        createdAt: profileData.created_at ?? '',
      } as Profile;
    },
    enabled: enabled && !!supabase && !!userId,
  });
};
