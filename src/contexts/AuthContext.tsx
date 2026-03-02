import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { DashboardData } from '../lib/data';
import type { Profile } from '../types/profile';

const SUPABASE_URL = import.meta.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || '';
const INACTIVITY_LIMIT = 10 * 60 * 1000;

const supabaseSingleton: SupabaseClient<Database> | null =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { storage: globalThis.sessionStorage },
      })
    : null;

interface AuthContextValue {
  supabase: SupabaseClient<Database> | null;
  user: unknown;
  data: DashboardData | null;
  profile: Profile | null;
  loading: boolean;
  isHomolog: boolean;
  isConfigured: boolean;
  setData: (data: DashboardData | null) => void;
  logout: () => Promise<void>;
  enterHomolog: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [user, setUser] = useState<unknown>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isHomolog, setIsHomolog] = useState(false);
  const [loading, setLoading] = useState(true);
  const isConfigured = supabaseSingleton !== null;
  const supabase = supabaseSingleton;

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsHomolog(false);
    setData(null);
    setProfile(null);
    setUser(null);
  }, [supabase]);

  const enterHomolog = useCallback(() => {
    setIsHomolog(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, INACTIVITY_LIMIT);
    };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [user, supabase]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      const typedSession = session as { user: { id: string } } | null;
      if (typedSession) {
        setUser(typedSession.user);
        setIsHomolog(false);
        (supabase as unknown as SupabaseClient<any>)
          .from('profiles')
          .select('id, full_name, role, access_level, created_at')
          .eq('id', typedSession.user.id)
          .single()
          .then(({ data: profileData, error }: { data: any; error: any }) => {
            if (error) {
              console.error('Failed to fetch profile:', error);
              setProfile(null);
              return;
            }
            if (!profileData) {
              setProfile(null);
              return;
            }
            setProfile({
              id: profileData.id,
              fullName: profileData.full_name ?? '',
              role: profileData.role ?? '',
              accessLevel: profileData.access_level ?? '',
              createdAt: profileData.created_at ?? '',
            });
          });
        if (!data) {
          setLoading(true);
          supabase
            .from('dashboards')
            .select('content')
            .eq('id', 'latest')
            .single()
            .then(({ data: dbData }) => {
              if (dbData?.content) setData(dbData.content);
              setLoading(false);
            });
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, data]);

  const value = useMemo(
    () => ({
      supabase,
      user,
      data,
      profile,
      loading,
      isHomolog,
      isConfigured,
      setData,
      logout,
      enterHomolog,
    }),
    [supabase, user, data, profile, loading, isHomolog, isConfigured, logout, enterHomolog],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
