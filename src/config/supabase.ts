import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (supabaseInstance) return supabaseInstance;

  if (SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: globalThis.sessionStorage,
        flowType: 'pkce',
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
};
